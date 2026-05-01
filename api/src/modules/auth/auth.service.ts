import type { User, Role } from '@prisma/client'
import { db } from '@/core/database/prisma.client'
import { AppError } from '@/core/errors/app-error'
import { env } from '@/core/config/env'
import { comparePassword, hashPassword, isPasswordInHistory } from '@/core/security/password.helper'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/core/security/jwt.helper'
import type { AuthUserResponseDto, LoginResponseDto, RefreshResponseDto } from './dto/auth-response.dto'

type UserWithRole = User & { role: Role }

const dummyPasswordHash = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8PkrkJ8AHJA1i3WjiU0B5LIoPJB9KC'

const parseDurationMs = (duration: string): number => {
  const match = /^(\d+)([smhd])$/.exec(duration.trim())
  if (!match) return 7 * 24 * 60 * 60 * 1000

  const amount = Number(match[1])
  const unit = match[2]
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }

  return amount * multipliers[unit]
}

const refreshExpiresAt = (): Date => new Date(Date.now() + parseDurationMs(env.JWT_REFRESH_EXPIRES_IN))

const toAuthUser = (user: UserWithRole): AuthUserResponseDto => ({
  id: user.id,
  username: user.username,
  namaLengkap: user.namaLengkap,
  email: user.email,
  role: {
    id: user.roleId.toString(),
    nama: user.role.nama,
  },
  unitOrganisasiId: user.unitOrganisasiId ?? undefined,
  mustChangePassword: user.mustChangePassword,
})

const issueTokens = async (
  user: UserWithRole,
  ipAddress?: string,
  userAgent?: string,
): Promise<RefreshResponseDto> => {
  const accessToken = signAccessToken({
    userId: user.id,
    roleId: user.roleId.toString(),
    roleName: user.role.nama,
  })
  const refreshToken = signRefreshToken({ userId: user.id })

  await db.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshExpiresAt(),
      ipAddress,
      userAgent,
    },
  })

  return { accessToken, refreshToken }
}

export const authService = {
  async login(
    username: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResponseDto> {
    const user = await db.user.findFirst({
      where: { username, deletedAt: null, isActive: true },
      include: { role: true },
    })

    if (!user) {
      await comparePassword(password, dummyPasswordHash)
      throw new AppError('Username atau password salah', 401)
    }

    if (user.role.deletedAt) throw new AppError('Username atau password salah', 401)

    if (user.lockedAt) {
      const unlockAt = new Date(user.lockedAt.getTime() + env.LOCK_DURATION_MINUTES * 60 * 1000)
      if (unlockAt.getTime() > Date.now()) {
        const minutes = Math.ceil((unlockAt.getTime() - Date.now()) / 60000)
        throw new AppError(`Akun Anda terkunci. Coba lagi dalam ${minutes} menit.`, 423)
      }
    }

    const passwordValid = await comparePassword(password, user.passwordHash)
    if (!passwordValid) {
      const attempts = user.loginAttempts + 1
      await db.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: attempts,
          lockedAt: attempts >= env.MAX_LOGIN_ATTEMPTS ? new Date() : null,
        },
      })

      throw new AppError('Username atau password salah', 401)
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockedAt: null, lastLogin: new Date() },
      include: { role: true },
    })

    const tokens = await issueTokens(updatedUser, ipAddress, userAgent)

    await db.auditLog.create({
      data: {
        userId: updatedUser.id,
        userNama: updatedUser.namaLengkap,
        action: 'LOGIN',
        entityType: 'User',
        entityId: updatedUser.id,
        ipAddress,
        userAgent,
      },
    })

    return { ...tokens, user: toAuthUser(updatedUser) }
  },

  async refreshToken(token: string, ipAddress?: string, userAgent?: string): Promise<RefreshResponseDto> {
    const storedToken = await db.refreshToken.findFirst({
      where: { token, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: { include: { role: true } } },
    })

    if (!storedToken) throw new AppError('Sesi tidak valid, silakan login kembali', 401)

    const payload = verifyRefreshToken(token)
    if (!payload.userId || payload.userId !== storedToken.userId) {
      throw new AppError('Sesi tidak valid, silakan login kembali', 401)
    }

    const user = storedToken.user
    if (!user.isActive || user.deletedAt || user.role.deletedAt) {
      throw new AppError('Sesi tidak valid, silakan login kembali', 401)
    }

    await db.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    })

    return issueTokens(user, ipAddress, userAgent)
  },

  async logout(userId: string, refreshToken: string): Promise<void> {
    await db.refreshToken.updateMany({
      where: { userId, token: refreshToken, revokedAt: null },
      data: { revokedAt: new Date() },
    })

    await db.auditLog.create({
      data: {
        userId,
        action: 'LOGOUT',
        entityType: 'User',
        entityId: userId,
      },
    })
  },

  async changePassword(userId: string, passwordLama: string, passwordBaru: string): Promise<void> {
    const user = await db.user.findFirst({
      where: { id: userId, deletedAt: null, isActive: true },
      include: {
        role: true,
        passwordHistories: {
          orderBy: { createdAt: 'desc' },
          take: env.PASSWORD_HISTORY_COUNT,
        },
      },
    })

    if (!user) throw new AppError('Data tidak ditemukan', 404)

    const passwordValid = await comparePassword(passwordLama, user.passwordHash)
    if (!passwordValid) throw new AppError('Password lama salah', 401)

    const histories = [user.passwordHash, ...user.passwordHistories.map((history) => history.passwordHash)]
    if (await isPasswordInHistory(passwordBaru, histories)) {
      throw new AppError('Password baru tidak boleh sama dengan password sebelumnya', 422)
    }

    const passwordHash = await hashPassword(passwordBaru)

    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          passwordChangedAt: new Date(),
          mustChangePassword: false,
        },
      }),
      db.userPasswordHistory.create({
        data: { userId: user.id, passwordHash },
      }),
      db.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      db.auditLog.create({
        data: {
          userId: user.id,
          userNama: user.namaLengkap,
          action: 'CHANGE_PASSWORD',
          entityType: 'User',
          entityId: user.id,
        },
      }),
    ])
  },

  async me(userId: string): Promise<AuthUserResponseDto> {
    const user = await db.user.findFirst({
      where: { id: userId, deletedAt: null, isActive: true },
      include: { role: true },
    })

    if (!user || user.role.deletedAt) throw new AppError('Data tidak ditemukan', 404)

    return toAuthUser(user)
  },
}
