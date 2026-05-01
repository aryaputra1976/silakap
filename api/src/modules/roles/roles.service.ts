import { Prisma, type Role, type RolePermission } from '@prisma/client'
import { db } from '@/core/database/prisma.client'
import { AppError } from '@/core/errors/app-error'
import { buildMeta, getPaginationParams } from '@/core/http/pagination.helper'
import type { CreateRoleDto } from './dto/create-role.dto'
import type { RolePermissionResponseDto, RoleResponseDto } from './dto/role-response.dto'
import type { SetRolePermissionsDto } from './dto/role-permissions.dto'
import type { UpdateRoleDto } from './dto/update-role.dto'
import type { RoleListQuery } from './types/roles.types'
import { rolesRepository } from './roles.repository'

const toResponse = (role: Role): RoleResponseDto => ({
  id: role.id.toString(),
  nama: role.nama,
  deskripsi: role.deskripsi,
  createdAt: role.createdAt,
  updatedAt: role.updatedAt,
})

const toPermissionResponse = (permission: RolePermission): RolePermissionResponseDto => ({
  id: permission.id.toString(),
  module: permission.module,
  permission: permission.permission,
})

const parseId = (id: string): bigint => {
  try {
    return BigInt(id)
  } catch {
    throw new AppError('Data tidak ditemukan', 404)
  }
}

const audit = async (
  actor: Express.Request['user'],
  action: string,
  entityId: string,
  newValues?: Prisma.InputJsonValue,
): Promise<void> => {
  await db.auditLog.create({
    data: {
      userId: actor?.id,
      userNama: actor?.namaLengkap,
      action,
      entityType: 'Role',
      entityId,
      newValues,
    },
  })
}

export const rolesService = {
  async list(query: RoleListQuery) {
    const { page, limit, skip } = getPaginationParams(query)
    const where: Prisma.RoleWhereInput = { deletedAt: null }

    if (typeof query.search === 'string' && query.search.trim()) {
      const search = query.search.trim()
      where.OR = [{ nama: { contains: search } }, { deskripsi: { contains: search } }]
    }

    const [items, total] = await Promise.all([
      rolesRepository.findMany(where, skip, limit),
      rolesRepository.count(where),
    ])

    return {
      data: items.map(toResponse),
      meta: buildMeta(total, page, limit),
    }
  },

  async create(dto: CreateRoleDto, actor: Express.Request['user']): Promise<RoleResponseDto> {
    const duplicate = await rolesRepository.findByName(dto.nama)
    if (duplicate) throw new AppError('Role sudah terdaftar', 409)

    const role = await rolesRepository.create(dto)
    await audit(actor, 'CREATE_ROLE', role.id.toString(), {
      nama: role.nama,
      deskripsi: role.deskripsi,
    })

    return toResponse(role)
  },

  async update(id: string, dto: UpdateRoleDto, actor: Express.Request['user']): Promise<RoleResponseDto> {
    const roleId = parseId(id)
    const current = await rolesRepository.findById(roleId)
    if (!current) throw new AppError('Data tidak ditemukan', 404)

    if (dto.nama && dto.nama !== current.nama) {
      const duplicate = await rolesRepository.findByName(dto.nama, roleId)
      if (duplicate) throw new AppError('Role sudah terdaftar', 409)
    }

    const role = await rolesRepository.update(roleId, dto)
    await audit(actor, 'UPDATE_ROLE', role.id.toString(), {
      nama: role.nama,
      deskripsi: role.deskripsi,
    })

    return toResponse(role)
  },

  async remove(id: string, actor: Express.Request['user']): Promise<void> {
    const roleId = parseId(id)
    const current = await rolesRepository.findById(roleId)
    if (!current) throw new AppError('Data tidak ditemukan', 404)

    const activeUsers = await db.user.count({ where: { roleId, deletedAt: null } })
    if (activeUsers > 0) throw new AppError('Role masih digunakan oleh user aktif', 409)

    await rolesRepository.softDelete(roleId)
    await audit(actor, 'DELETE_ROLE', id)
  },

  async permissions(id: string): Promise<RolePermissionResponseDto[]> {
    const roleId = parseId(id)
    const current = await rolesRepository.findById(roleId)
    if (!current) throw new AppError('Data tidak ditemukan', 404)

    const permissions = await rolesRepository.permissions(roleId)
    return permissions.map(toPermissionResponse)
  },

  async setPermissions(
    id: string,
    dto: SetRolePermissionsDto,
    actor: Express.Request['user'],
  ): Promise<RolePermissionResponseDto[]> {
    const roleId = parseId(id)
    const current = await rolesRepository.findById(roleId)
    if (!current) throw new AppError('Data tidak ditemukan', 404)

    const uniquePermissions = Array.from(
      new Map(
        dto.permissions.map((permission) => [
          `${permission.module ?? ''}:${permission.permission}`,
          permission,
        ]),
      ).values(),
    )

    await db.$transaction([
      db.rolePermission.deleteMany({ where: { roleId } }),
      ...uniquePermissions.map((permission) =>
        db.rolePermission.create({
          data: {
            roleId,
            module: permission.module ?? null,
            permission: permission.permission,
          },
        }),
      ),
    ])

    await audit(actor, 'SET_ROLE_PERMISSIONS', id, {
      permissions: uniquePermissions.map((permission) => ({
        module: permission.module ?? null,
        permission: permission.permission,
      })),
    })

    return this.permissions(id)
  },
}
