import { randomBytes, randomUUID } from 'crypto'
import { Prisma, type Role, type User } from '@prisma/client'
import { db } from '@/core/database/prisma.client'
import { AppError } from '@/core/errors/app-error'
import { buildMeta, getPaginationParams } from '@/core/http/pagination.helper'
import { hashPassword } from '@/core/security/password.helper'
import type { CreateUserDto } from './dto/create-user.dto'
import type { ResetPasswordResponseDto, UserResponseDto } from './dto/user-response.dto'
import type { UpdateUserDto } from './dto/update-user.dto'
import type { UserListQuery } from './types/users.types'
import { usersRepository } from './users.repository'

type UserWithRole = User & { role: Role }

const toResponse = (user: UserWithRole): UserResponseDto => ({
  id: user.id,
  username: user.username,
  namaLengkap: user.namaLengkap,
  email: user.email,
  nomorHp: user.nomorHp,
  unitOrganisasiId: user.unitOrganisasiId,
  asnId: user.asnId,
  roleId: user.roleId.toString(),
  roleNama: user.role.nama,
  isActive: user.isActive,
  mustChangePassword: user.mustChangePassword,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})

const randomPassword = (): string => `Sila${randomBytes(6).toString('base64url')}A1!`

const audit = async (
  actor: Express.Request['user'],
  action: string,
  entityId: string,
  newValues?: Prisma.InputJsonValue,
  oldValues?: Prisma.InputJsonValue,
): Promise<void> => {
  await db.auditLog.create({
    data: {
      userId: actor?.id,
      userNama: actor?.namaLengkap,
      action,
      entityType: 'User',
      entityId,
      oldValues,
      newValues,
    },
  })
}

export const usersService = {
  async list(query: UserListQuery) {
    const { page, limit, skip } = getPaginationParams(query)
    const where: Prisma.UserWhereInput = { deletedAt: null }

    if (typeof query.roleId === 'string' && query.roleId) {
      where.roleId = BigInt(query.roleId)
    }
    if (typeof query.unitOrganisasiId === 'string' && query.unitOrganisasiId) {
      where.unitOrganisasiId = query.unitOrganisasiId
    }
    if (typeof query.isActive === 'string') {
      where.isActive = query.isActive === 'true'
    }
    if (typeof query.isActive === 'boolean') {
      where.isActive = query.isActive
    }
    if (typeof query.search === 'string' && query.search.trim()) {
      const search = query.search.trim()
      where.OR = [
        { username: { contains: search } },
        { namaLengkap: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const [items, total] = await Promise.all([
      usersRepository.findMany(where, skip, limit),
      usersRepository.count(where),
    ])

    return {
      data: items.map(toResponse),
      meta: buildMeta(total, page, limit),
    }
  },

  async detail(id: string): Promise<UserResponseDto> {
    const user = await usersRepository.findById(id)
    if (!user) throw new AppError('Data tidak ditemukan', 404)
    return toResponse(user)
  },

  async create(dto: CreateUserDto, actor: Express.Request['user']): Promise<UserResponseDto> {
    const existing = await usersRepository.findExisting(dto.username, dto.email)
    if (existing?.username === dto.username) throw new AppError('Username sudah terdaftar', 409)
    if (existing?.email === dto.email) throw new AppError('Email sudah terdaftar', 409)

    const role = await db.role.findFirst({ where: { id: dto.roleId, deletedAt: null } })
    if (!role) throw new AppError('Role tidak ditemukan', 404)

    const passwordHash = await hashPassword(dto.password ?? randomPassword())
    const user = await usersRepository.create(randomUUID(), dto, passwordHash)
    await db.userPasswordHistory.create({ data: { userId: user.id, passwordHash } })
    await audit(actor, 'CREATE_USER', user.id, {
      username: user.username,
      email: user.email,
      roleId: user.roleId.toString(),
    })

    return toResponse(user)
  },

  async update(id: string, dto: UpdateUserDto, actor: Express.Request['user']): Promise<UserResponseDto> {
    const current = await usersRepository.findById(id)
    if (!current) throw new AppError('Data tidak ditemukan', 404)

    if (dto.email && dto.email !== current.email) {
      const duplicateEmail = await db.user.findFirst({
        where: { email: dto.email, deletedAt: null, NOT: { id } },
      })
      if (duplicateEmail) throw new AppError('Email sudah terdaftar', 409)
    }

    if (dto.roleId) {
      const role = await db.role.findFirst({ where: { id: dto.roleId, deletedAt: null } })
      if (!role) throw new AppError('Role tidak ditemukan', 404)
    }

    const oldValues = {
      namaLengkap: current.namaLengkap,
      email: current.email,
      nomorHp: current.nomorHp,
      unitOrganisasiId: current.unitOrganisasiId,
      asnId: current.asnId,
      roleId: current.roleId.toString(),
      isActive: current.isActive,
    }
    const user = await usersRepository.update(id, dto)
    await audit(actor, 'UPDATE_USER', id, {
      namaLengkap: user.namaLengkap,
      email: user.email,
      roleId: user.roleId.toString(),
      isActive: user.isActive,
    }, oldValues)

    return toResponse(user)
  },

  async remove(id: string, actor: Express.Request['user']): Promise<void> {
    const current = await usersRepository.findById(id)
    if (!current) throw new AppError('Data tidak ditemukan', 404)
    if (actor?.id === id) throw new AppError('Anda tidak dapat menghapus akun sendiri', 422)

    await db.$transaction([
      db.user.update({
        where: { id },
        data: { deletedAt: new Date(), isActive: false },
      }),
      db.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ])
    await audit(actor, 'DELETE_USER', id)
  },

  async resetPassword(
    id: string,
    actor: Express.Request['user'],
  ): Promise<ResetPasswordResponseDto> {
    const current = await usersRepository.findById(id)
    if (!current) throw new AppError('Data tidak ditemukan', 404)

    const temporaryPassword = randomPassword()
    const passwordHash = await hashPassword(temporaryPassword)
    await db.$transaction([
      db.user.update({
        where: { id },
        data: { passwordHash, mustChangePassword: true, passwordChangedAt: new Date() },
      }),
      db.userPasswordHistory.create({ data: { userId: id, passwordHash } }),
      db.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ])
    await audit(actor, 'RESET_PASSWORD', id)

    return { temporaryPassword }
  },

  async unlock(id: string, actor: Express.Request['user']): Promise<UserResponseDto> {
    const current = await usersRepository.findById(id)
    if (!current) throw new AppError('Data tidak ditemukan', 404)

    const user = await usersRepository.unlock(id)
    await audit(actor, 'UNLOCK_USER', id)
    return toResponse(user)
  },
}
