import { Prisma } from '@prisma/client'
import { db } from '@/core/database/prisma.client'
import type { CreateUserDto } from './dto/create-user.dto'
import type { UpdateUserDto } from './dto/update-user.dto'

export const usersRepository = {
  findMany(where: Prisma.UserWhereInput, skip: number, take: number) {
    return db.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { role: true },
    })
  },

  count(where: Prisma.UserWhereInput) {
    return db.user.count({ where })
  },

  findById(id: string) {
    return db.user.findFirst({
      where: { id, deletedAt: null },
      include: { role: true, unitOrganisasi: true, asn: true },
    })
  },

  findExisting(username: string, email: string) {
    return db.user.findFirst({
      where: { deletedAt: null, OR: [{ username }, { email }] },
    })
  },

  create(id: string, dto: CreateUserDto, passwordHash: string) {
    return db.user.create({
      data: {
        id,
        username: dto.username,
        passwordHash,
        namaLengkap: dto.namaLengkap,
        email: dto.email,
        nomorHp: dto.nomorHp,
        unitOrganisasiId: dto.unitOrganisasiId,
        asnId: dto.asnId,
        roleId: dto.roleId,
        isActive: dto.isActive,
        mustChangePassword: true,
      },
      include: { role: true },
    })
  },

  update(id: string, dto: UpdateUserDto) {
    return db.user.update({
      where: { id },
      data: dto,
      include: { role: true },
    })
  },

  softDelete(id: string) {
    return db.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    })
  },

  resetPassword(id: string, passwordHash: string) {
    return db.user.update({
      where: { id },
      data: { passwordHash, mustChangePassword: true, passwordChangedAt: new Date() },
    })
  },

  unlock(id: string) {
    return db.user.update({
      where: { id },
      data: { lockedAt: null, loginAttempts: 0 },
      include: { role: true },
    })
  },
}
