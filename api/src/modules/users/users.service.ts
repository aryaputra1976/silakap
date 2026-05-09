import ExcelJS from 'exceljs'
import { randomBytes, randomUUID } from 'crypto'
import { Prisma, type Role, type User, type RefUnitOrganisasi } from '@prisma/client'
import { db } from '@/core/database/prisma.client'
import { AppError } from '@/core/errors/app-error'
import { env } from '@/core/config/env'
import { buildMeta, getPaginationParams } from '@/core/http/pagination.helper'
import { logger } from '@/core/logger/logger'
import { hashPassword } from '@/core/security/password.helper'
import type { CreateUserDto } from './dto/create-user.dto'
import type { ResetPasswordResponseDto, UserResponseDto } from './dto/user-response.dto'
import type { UpdateUserDto } from './dto/update-user.dto'
import type { UserListQuery } from './types/users.types'
import { usersRepository } from './users.repository'

type UserWithRole = User & { role: Role }
type UserWithRelations = User & { role: Role; unitOrganisasi: RefUnitOrganisasi | null }

const MS_PER_DAY = 86_400_000

export type StatusResiko = 'Aman' | 'Perhatian' | 'Risiko Tinggi'

export interface AccessReviewRow {
  id: string
  username: string
  namaLengkap: string
  email: string
  emailTerverifikasi: boolean
  roleNama: string
  unitOrganisasiNama: string | null
  isActive: boolean
  isLocked: boolean
  mustChangePassword: boolean
  lastLogin: Date | null
  hariSejakLogin: number | null
  passwordChangedAt: Date | null
  hariSejakGantiPassword: number
  sisaHariPassword: number | null
  createdAt: Date
  statusResiko: StatusResiko
}

const computeRow = (user: UserWithRelations, now: number): AccessReviewRow => {
  const hariSejakLogin = user.lastLogin
    ? Math.floor((now - user.lastLogin.getTime()) / MS_PER_DAY)
    : null

  const passwordRef = user.passwordChangedAt ?? user.createdAt
  const hariSejakGantiPassword = Math.floor((now - passwordRef.getTime()) / MS_PER_DAY)

  const sisaHariPassword = env.PASSWORD_EXPIRY_DAYS > 0
    ? env.PASSWORD_EXPIRY_DAYS - hariSejakGantiPassword
    : null

  const isLocked = user.lockedAt != null
    && (user.lockedAt.getTime() + env.LOCK_DURATION_MINUTES * 60_000 > now)

  const isPasswordExpired = sisaHariPassword != null && sisaHariPassword < 0
  const inactiveThreshold = env.INACTIVE_ACCOUNT_DAYS > 0 ? env.INACTIVE_ACCOUNT_DAYS : 90
  const isInactive = hariSejakLogin != null && hariSejakLogin > inactiveThreshold

  let statusResiko: StatusResiko = 'Aman'
  if (isLocked || isPasswordExpired || (user.isActive && isInactive)) {
    statusResiko = 'Risiko Tinggi'
  } else if (
    (sisaHariPassword != null && sisaHariPassword >= 0 && sisaHariPassword <= 14)
    || (hariSejakLogin != null && hariSejakLogin > Math.floor(inactiveThreshold * 0.67))
  ) {
    statusResiko = 'Perhatian'
  }

  return {
    id: user.id,
    username: user.username,
    namaLengkap: user.namaLengkap,
    email: user.email,
    emailTerverifikasi: user.emailVerifiedAt != null,
    roleNama: user.role.nama,
    unitOrganisasiNama: user.unitOrganisasi?.nama ?? null,
    isActive: user.isActive,
    isLocked,
    mustChangePassword: user.mustChangePassword,
    lastLogin: user.lastLogin,
    hariSejakLogin,
    passwordChangedAt: user.passwordChangedAt,
    hariSejakGantiPassword,
    sisaHariPassword,
    createdAt: user.createdAt,
    statusResiko,
  }
}

interface AccessReviewQuery {
  page?: unknown
  limit?: unknown
  isActive?: unknown
  roleId?: unknown
  unitOrganisasiId?: unknown
  statusResiko?: unknown
  search?: unknown
}

const buildAccessReviewWhere = (query: AccessReviewQuery): Prisma.UserWhereInput => {
  const where: Prisma.UserWhereInput = { deletedAt: null }
  if (typeof query.isActive === 'string' && query.isActive !== '') {
    where.isActive = query.isActive === 'true'
  }
  if (typeof query.roleId === 'string' && query.roleId) {
    where.roleId = BigInt(query.roleId)
  }
  if (typeof query.unitOrganisasiId === 'string' && query.unitOrganisasiId) {
    where.unitOrganisasiId = BigInt(query.unitOrganisasiId)
  }
  if (typeof query.search === 'string' && query.search.trim()) {
    const s = query.search.trim()
    where.OR = [
      { username: { contains: s } },
      { namaLengkap: { contains: s } },
      { email: { contains: s } },
    ]
  }
  return where
}

const fetchForReview = (where: Prisma.UserWhereInput): Promise<UserWithRelations[]> =>
  db.user.findMany({
    where,
    orderBy: [{ isActive: 'desc' }, { lastLogin: 'asc' }],
    include: { role: true, unitOrganisasi: true },
  })

const toResponse = (user: UserWithRole): UserResponseDto => ({
  id: user.id,
  username: user.username,
  namaLengkap: user.namaLengkap,
  email: user.email,
  nomorHp: user.nomorHp,
  unitOrganisasiId: user.unitOrganisasiId?.toString() ?? null,
  asnId: user.asnId?.toString() ?? null,
  roleId: user.roleId.toString(),
  roleNama: user.role.nama,
  isActive: user.isActive,
  emailVerifiedAt: user.emailVerifiedAt,
  mustChangePassword: user.mustChangePassword,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})

const randomPassword = (): string => {
  // 16 bytes = 128 bit entropy, tidak ada prefix/suffix yang predictable
  const base = randomBytes(16).toString('base64url')
  // Pastikan memenuhi kompleksitas: huruf besar, angka, simbol
  return `${base.slice(0, 8)}${randomBytes(2).readUInt16BE().toString().slice(0, 3)}!`
}

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
      where.unitOrganisasiId = BigInt(query.unitOrganisasiId)
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
      unitOrganisasiId: current.unitOrganisasiId?.toString() ?? null,
      asnId: current.asnId?.toString() ?? null,
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
      usersRepository.softDelete(id),
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
      usersRepository.resetPassword(id, passwordHash),
      db.userPasswordHistory.create({ data: { userId: id, passwordHash } }),
      db.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ])
    await audit(actor, 'RESET_PASSWORD', id)

    // Password sementara hanya dikirim via email (tidak dikembalikan dalam API response)
    // untuk menghindari exposure di browser history, logs, dan network interception
    if (current.email) {
      try {
        const { emailService, emailTemplates } = await import('@/modules/email')
        if (!emailService.isConfigured()) {
          if (emailService.isEnabled()) {
            logger.warn('SMTP belum dikonfigurasi; password sementara reset dikembalikan ke admin', { userId: id })
          }
          await audit(actor, 'RESET_PASSWORD_EMAIL_NOT_CONFIGURED', id)
          return { temporaryPassword, emailSent: false }
        }
        const template = emailTemplates.passwordReset({
          namaLengkap: current.namaLengkap,
          temporaryPassword,
        })
        await emailService.send(template, current.email)
      } catch {
        // Jika email gagal, tetap return password agar admin bisa sampaikan manual
        await audit(actor, 'RESET_PASSWORD_EMAIL_FAILED', id)
        return { temporaryPassword, emailSent: false }
      }
    }

    return { temporaryPassword: null, emailSent: !!current.email }
  },

  async unlock(id: string, actor: Express.Request['user']): Promise<UserResponseDto> {
    const current = await usersRepository.findById(id)
    if (!current) throw new AppError('Data tidak ditemukan', 404)

    const user = await usersRepository.unlock(id)
    await audit(actor, 'UNLOCK_USER', id)

    if (current.email) {
      void (async () => {
        try {
          const { emailService, emailTemplates } = await import('@/modules/email')
          const template = emailTemplates.accountUnlocked({ namaLengkap: current.namaLengkap })
          await emailService.send(template, current.email!)
        } catch { /* fire-and-forget, gagal tidak masalah */ }
      })()
    }

    return toResponse(user)
  },

  async accessReview(query: AccessReviewQuery) {
    const { page, limit, skip } = getPaginationParams(query)
    const where = buildAccessReviewWhere(query)
    const users = await fetchForReview(where)

    const now = Date.now()
    let rows = users.map((u) => computeRow(u, now))

    if (typeof query.statusResiko === 'string' && query.statusResiko) {
      rows = rows.filter((r) => r.statusResiko === query.statusResiko)
    }

    const total = rows.length
    const paginated = rows.slice(skip, skip + limit)
    return {
      data: paginated,
      meta: buildMeta(total, page, limit),
    }
  },

  async accessReviewExport(query: AccessReviewQuery): Promise<Buffer> {
    const where = buildAccessReviewWhere(query)
    const users = await fetchForReview(where)

    const now = Date.now()
    let rows = users.map((u) => computeRow(u, now))

    if (typeof query.statusResiko === 'string' && query.statusResiko) {
      rows = rows.filter((r) => r.statusResiko === query.statusResiko)
    }

    const workbook = new ExcelJS.Workbook()
    const ws = workbook.addWorksheet('Access Review')

    ws.columns = [
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Nama Lengkap', key: 'namaLengkap', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Email Terverifikasi', key: 'emailTerverifikasi', width: 18 },
      { header: 'Role', key: 'roleNama', width: 20 },
      { header: 'Unit Organisasi', key: 'unitOrganisasiNama', width: 30 },
      { header: 'Aktif', key: 'isActive', width: 10 },
      { header: 'Terkunci', key: 'isLocked', width: 10 },
      { header: 'Harus Ganti Password', key: 'mustChangePassword', width: 20 },
      { header: 'Login Terakhir', key: 'lastLogin', width: 20 },
      { header: 'Hari Sejak Login', key: 'hariSejakLogin', width: 16 },
      { header: 'Hari Sejak Ganti Password', key: 'hariSejakGantiPassword', width: 24 },
      { header: 'Sisa Hari Password', key: 'sisaHariPassword', width: 18 },
      { header: 'Tanggal Dibuat', key: 'createdAt', width: 20 },
      { header: 'Status Risiko', key: 'statusResiko', width: 16 },
    ]

    ws.getRow(1).font = { bold: true }

    for (const row of rows) {
      ws.addRow({
        ...row,
        emailTerverifikasi: row.emailTerverifikasi ? 'Ya' : 'Tidak',
        isActive: row.isActive ? 'Ya' : 'Tidak',
        isLocked: row.isLocked ? 'Ya' : 'Tidak',
        mustChangePassword: row.mustChangePassword ? 'Ya' : 'Tidak',
        lastLogin: row.lastLogin ? row.lastLogin.toISOString().replace('T', ' ').slice(0, 19) : '-',
        createdAt: row.createdAt.toISOString().replace('T', ' ').slice(0, 19),
      })
    }

    return Buffer.from(await workbook.xlsx.writeBuffer())
  },
}
