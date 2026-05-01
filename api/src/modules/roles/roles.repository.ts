import { Prisma } from '@prisma/client'
import { db } from '@/core/database/prisma.client'
import type { CreateRoleDto } from './dto/create-role.dto'
import type { UpdateRoleDto } from './dto/update-role.dto'

export const rolesRepository = {
  findMany(where: Prisma.RoleWhereInput, skip: number, take: number) {
    return db.role.findMany({ where, skip, take, orderBy: { nama: 'asc' } })
  },

  count(where: Prisma.RoleWhereInput) {
    return db.role.count({ where })
  },

  findById(id: bigint) {
    return db.role.findFirst({ where: { id, deletedAt: null } })
  },

  findByName(nama: string, exceptId?: bigint) {
    return db.role.findFirst({
      where: { nama, deletedAt: null, ...(exceptId ? { NOT: { id: exceptId } } : {}) },
    })
  },

  create(dto: CreateRoleDto) {
    return db.role.create({ data: dto })
  },

  update(id: bigint, dto: UpdateRoleDto) {
    return db.role.update({ where: { id }, data: dto })
  },

  softDelete(id: bigint) {
    return db.role.update({ where: { id }, data: { deletedAt: new Date() } })
  },

  permissions(roleId: bigint) {
    return db.rolePermission.findMany({
      where: { roleId },
      orderBy: [{ module: 'asc' }, { permission: 'asc' }],
    })
  },
}
