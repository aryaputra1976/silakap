import { Prisma } from '@prisma/client'
import * as XLSX from 'xlsx'
import { db } from '@/core/database/prisma.client'
import { AppError } from '@/core/errors/app-error'
import { buildMeta, getPaginationParams } from '@/core/http/pagination.helper'

interface AuditQuery {
  page?: unknown
  limit?: unknown
  userId?: unknown
  action?: unknown
  entityType?: unknown
  dateFrom?: unknown
  dateTo?: unknown
  search?: unknown
}

const buildWhere = (query: AuditQuery): Prisma.AuditLogWhereInput => {
  const where: Prisma.AuditLogWhereInput = {}

  if (typeof query.userId === 'string' && query.userId) where.userId = query.userId
  if (typeof query.action === 'string' && query.action) where.action = query.action
  if (typeof query.entityType === 'string' && query.entityType) where.entityType = query.entityType
  if (typeof query.search === 'string' && query.search.trim()) {
    const search = query.search.trim()
    where.OR = [
      { userNama: { contains: search } },
      { action: { contains: search } },
      { entityType: { contains: search } },
      { entityId: { contains: search } },
    ]
  }
  if (typeof query.dateFrom === 'string' || typeof query.dateTo === 'string') {
    where.createdAt = {}
    if (typeof query.dateFrom === 'string' && query.dateFrom) where.createdAt.gte = new Date(query.dateFrom)
    if (typeof query.dateTo === 'string' && query.dateTo) where.createdAt.lte = new Date(query.dateTo)
  }

  return where
}

export const auditService = {
  async list(query: AuditQuery) {
    const { page, limit, skip } = getPaginationParams(query)
    const where = buildWhere(query)
    const [data, total] = await Promise.all([
      db.auditLog.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      db.auditLog.count({ where }),
    ])
    return { data, meta: buildMeta(total, page, limit) }
  },

  async detail(id: string) {
    const audit = await db.auditLog.findUnique({ where: { id: BigInt(id) } })
    if (!audit) throw new AppError('Data tidak ditemukan', 404)
    return audit
  },

  async export(query: AuditQuery): Promise<Buffer> {
    const data = await db.auditLog.findMany({
      where: buildWhere(query),
      take: 1000,
      orderBy: { createdAt: 'desc' },
    })
    const sheet = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        id: item.id.toString(),
        userId: item.userId,
        userNama: item.userNama,
        action: item.action,
        entityType: item.entityType,
        entityId: item.entityId,
        ipAddress: item.ipAddress,
        createdAt: item.createdAt.toISOString(),
      })),
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, sheet, 'Audit')
    return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' }) as Buffer
  },
}
