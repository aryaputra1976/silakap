import { randomUUID } from 'crypto'
import type { User, Role } from '@prisma/client'
import { db } from '@/core/database/prisma.client'
import { AppError } from '@/core/errors/app-error'
import { env } from '@/core/config/env'
import { logger } from '@/core/logger/logger'
import { comparePassword, hashPassword, isPasswordInHistory } from '@/core/security/password.helper'
import { signAccessToken, signRefreshToken, verifyRefreshToken, signEmailVerificationToken, verifyEmailVerificationToken } from '@/core/security/jwt.helper'
import { ROLES } from '@/shared/constants'
import type { AuthUserResponseDto, LoginResponseDto, RefreshResponseDto } from './dto/auth-response.dto'
import type { RegisterDto } from './dto/register.dto'

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
  unitOrganisasiId: user.unitOrganisasiId?.toString(),
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

  // Batasi sesi aktif per user — revoke token terlama jika melebihi limit
  if (env.MAX_SESSIONS_PER_USER > 0) {
    const activeSessions = await db.refreshToken.findMany({
      where: { userId: user.id, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    })

    if (activeSessions.length >= env.MAX_SESSIONS_PER_USER) {
      const toRevoke = activeSessions.slice(0, activeSessions.length - env.MAX_SESSIONS_PER_USER + 1)
      await db.refreshToken.updateMany({
        where: { id: { in: toRevoke.map((s) => s.id) } },
        data: { revokedAt: new Date() },
      })
      if (user.email) {
        void sendSessionRevokedNotification(
          { id: user.id, namaLengkap: user.namaLengkap, email: user.email },
          toRevoke.length,
        )
      }
    }
  }

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

const sendPostRegisterEmails = async (
  userId: string,
  namaLengkap: string,
  email: string,
  nip: string,
  unitNama: string,
): Promise<void> => {
  try {
    const { emailService, emailTemplates } = await import('@/modules/email')

    // 1. Kirim link verifikasi email ke pendaftar
    const verificationToken = signEmailVerificationToken(userId, email)
    const verificationUrl = `${env.APP_URL}/verify-email?token=${verificationToken}`
    const verifyTemplate = emailTemplates.emailVerification({ namaLengkap, verificationUrl })
    await emailService.send(verifyTemplate, email)

    // 2. Kirim notifikasi ke semua Admin_Sistem yang punya email
    const admins = await db.user.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        role: { nama: ROLES.ADMIN_SISTEM, deletedAt: null },
        email: { not: '' },
      },
      select: { email: true, namaLengkap: true },
    })

    const activationUrl = `${env.APP_URL}/admin/users?isActive=false`
    await Promise.allSettled(
      admins.map((admin) => {
        const template = emailTemplates.adminNewRegistration({
          namaAdmin: admin.namaLengkap,
          namaPendaftar: namaLengkap,
          nip,
          unitNama,
          emailPendaftar: email,
          activationUrl,
        })
        return emailService.send(template, admin.email!)
      }),
    )
  } catch (err) {
    logger.error('Gagal mengirim email pasca registrasi', { userId, err })
  }
}

const parseUserAgent = (ua?: string): string => {
  if (!ua) return 'Perangkat tidak dikenal'
  if (/mobile/i.test(ua)) {
    if (/android/i.test(ua)) return 'Android'
    if (/iphone|ipad/i.test(ua)) return 'iOS'
    return 'Perangkat Mobile'
  }
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) return 'Chrome'
  if (/firefox/i.test(ua)) return 'Firefox'
  if (/safari/i.test(ua)) return 'Safari'
  if (/edg/i.test(ua)) return 'Edge'
  return 'Browser Desktop'
}

const sendLoginFromNewIpNotification = async (
  user: { id: string; namaLengkap: string; email: string },
  ipAddress: string,
  userAgent?: string,
): Promise<void> => {
  try {
    const { emailService, emailTemplates } = await import('@/modules/email')
    const waktu = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Makassar', dateStyle: 'full', timeStyle: 'short' })
    const template = emailTemplates.loginFromNewIp({
      namaLengkap: user.namaLengkap,
      ipAddress,
      browser: parseUserAgent(userAgent),
      waktu,
      changePasswordUrl: `${env.APP_URL}/change-password`,
    })
    await emailService.send(template, user.email)
  } catch (err) {
    logger.error('Gagal kirim notifikasi login IP baru', { userId: user.id, err })
  }
}

const sendAccountLockedNotification = async (
  user: { id: string; namaLengkap: string; email: string },
): Promise<void> => {
  try {
    const { emailService, emailTemplates } = await import('@/modules/email')
    const template = emailTemplates.accountLocked({
      namaLengkap: user.namaLengkap,
      maxAttempts: env.MAX_LOGIN_ATTEMPTS,
      lockDurationMinutes: env.LOCK_DURATION_MINUTES,
    })
    await emailService.send(template, user.email)
  } catch (err) {
    logger.error('Gagal kirim notifikasi akun terkunci', { userId: user.id, err })
  }
}

const sendSessionRevokedNotification = async (
  user: { id: string; namaLengkap: string; email: string },
  revokedCount: number,
): Promise<void> => {
  try {
    const { emailService, emailTemplates } = await import('@/modules/email')
    const template = emailTemplates.sessionRevoked({
      namaLengkap: user.namaLengkap,
      revokedCount,
      changePasswordUrl: `${env.APP_URL}/change-password`,
    })
    await emailService.send(template, user.email)
  } catch (err) {
    logger.error('Gagal kirim notifikasi sesi di-revoke', { userId: user.id, err })
  }
}

export const authService = {
  unitOrganisasi() {
    return db.refUnitOrganisasi.findMany({
      where: {
        OR: [
          { level: { in: [2, 3] } },
          { isOpd: true },
        ],
      },
      select: {
        id: true,
        nama: true,
        idAtasan: true,
        level: true,
        isOpd: true,
      },
      orderBy: [{ level: 'asc' }, { nama: 'asc' }],
    })
  },

  async asnByNip(nip: string) {
    if (!/^\d{18}$/.test(nip)) throw new AppError('NIP harus terdiri dari 18 digit', 422)

    const asn = await db.asn.findFirst({
      where: { nipBaru: nip, deletedAt: null, statusPegawai: 'Aktif' },
      select: {
        id: true,
        nipBaru: true,
        nama: true,
        email: true,
        nomorHp: true,
        unitOrganisasiId: true,
        unitOrganisasi: { select: { id: true, nama: true } },
      },
    })

    if (!asn) throw new AppError('Data ASN aktif dengan NIP ini tidak ditemukan', 404)

    return asn
  },

  async register(dto: RegisterDto, ipAddress?: string, userAgent?: string) {
    const asn = await db.asn.findFirst({
      where: { nipBaru: dto.nip, deletedAt: null, statusPegawai: 'Aktif' },
      select: { id: true, nama: true },
    })
    if (!asn) throw new AppError('Data ASN aktif dengan NIP ini tidak ditemukan', 404)

    const unitOrganisasiId = BigInt(dto.unitOrganisasiId)
    const unit = await db.refUnitOrganisasi.findUnique({ where: { id: unitOrganisasiId } })
    if (!unit) throw new AppError('Unit organisasi tidak ditemukan', 404)

    const role = await db.role.findFirst({ where: { nama: ROLES.PENGELOLA_OPD, deletedAt: null } })
    if (!role) throw new AppError('Role default operator belum tersedia', 500)

    const existing = await db.user.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { username: dto.nip },
          { email: dto.email },
          { asnId: asn.id },
        ],
      },
    })

    if (existing?.username === dto.nip || existing?.asnId === asn.id) {
      throw new AppError('NIP sudah terdaftar', 409)
    }
    if (existing?.email === dto.email) throw new AppError('Email sudah terdaftar', 409)

    const passwordHash = await hashPassword(dto.password)
    const user = await db.$transaction(async (tx) => {
      const registeredUser = await tx.user.create({
        data: {
          id: randomUUID(),
          username: dto.nip,
          passwordHash,
          namaLengkap: asn.nama,
          email: dto.email,
          nomorHp: dto.nomorHp,
          unitOrganisasiId,
          asnId: asn.id,
          roleId: role.id,
          isActive: false,
          mustChangePassword: false,
          passwordChangedAt: new Date(),
        },
        include: { role: true },
      })

      await tx.userPasswordHistory.create({ data: { userId: registeredUser.id, passwordHash } })
      await tx.auditLog.create({
        data: {
          userId: registeredUser.id,
          userNama: registeredUser.namaLengkap,
          action: 'REGISTER_USER',
          entityType: 'User',
          entityId: registeredUser.id,
          ipAddress,
          userAgent,
          newValues: {
            username: registeredUser.username,
            email: registeredUser.email,
            roleId: registeredUser.roleId.toString(),
            unitOrganisasiId: registeredUser.unitOrganisasiId?.toString() ?? null,
            isActive: registeredUser.isActive,
          },
        },
      })

      return registeredUser
    })

    // Fire-and-forget: kirim verifikasi email ke pendaftar + notifikasi ke semua admin
    void sendPostRegisterEmails(user.id, user.namaLengkap, user.email, user.username, unit.nama)

    return {
      id: user.id,
      username: user.username,
      namaLengkap: user.namaLengkap,
      email: user.email,
      nomorHp: user.nomorHp,
      roleNama: user.role.nama,
      unitOrganisasiId: user.unitOrganisasiId?.toString() ?? null,
      isActive: user.isActive,
    }
  },

  async verifyEmail(token: string): Promise<{ alreadyVerified: boolean }> {
    const { userId, email } = verifyEmailVerificationToken(token)

    const user = await db.user.findFirst({
      where: { id: userId, email, deletedAt: null },
    })
    if (!user) throw new AppError('Link verifikasi tidak valid atau sudah kadaluarsa', 400)
    if (user.emailVerifiedAt) return { alreadyVerified: true }

    await db.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date() },
    })

    await db.auditLog.create({
      data: {
        userId: user.id,
        userNama: user.namaLengkap,
        action: 'VERIFY_EMAIL',
        entityType: 'User',
        entityId: user.id,
      },
    })

    return { alreadyVerified: false }
  },

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
      const justLocked = attempts >= env.MAX_LOGIN_ATTEMPTS
      await db.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: attempts,
          lockedAt: justLocked ? new Date() : null,
        },
      })

      if (justLocked && user.email) {
        void sendAccountLockedNotification({ id: user.id, namaLengkap: user.namaLengkap, email: user.email })
      }

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

    // Deteksi login dari IP baru — bandingkan dengan sesi terakhir
    if (ipAddress && updatedUser.email) {
      const lastToken = await db.refreshToken.findFirst({
        where: { userId: updatedUser.id },
        orderBy: { createdAt: 'desc' },
        skip: 1, // skip token yang baru saja dibuat di issueTokens
        select: { ipAddress: true },
      })
      if (lastToken && lastToken.ipAddress && lastToken.ipAddress !== ipAddress) {
        void sendLoginFromNewIpNotification(
          { id: updatedUser.id, namaLengkap: updatedUser.namaLengkap, email: updatedUser.email },
          ipAddress,
          userAgent,
        )
      }
    }

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
