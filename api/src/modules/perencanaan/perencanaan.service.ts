import { Prisma } from '@prisma/client'
import { db } from '@/core/database/prisma.client'
import { AppError } from '@/core/errors/app-error'
import { buildMeta, getPaginationParams } from '@/core/http/pagination.helper'
import type { CreatePerencanaanDto, UpdatePerencanaanDto } from './dto/perencanaan.dto'

const parseBigInt = (id: string): bigint => {
  try {
    return BigInt(id)
  } catch {
    throw new AppError('Data tidak ditemukan', 404)
  }
}

const auditLog = async (
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
      entityType: 'PerencanaanPensiun',
      entityId,
      newValues,
    },
  })
}

export const perencanaanService = {
  async list(query: { page?: unknown; limit?: unknown; tahunBup?: unknown; sudahDiproses?: unknown }) {
    const { page, limit, skip } = getPaginationParams(query)
    const where: Prisma.PerencanaanPensiunWhereInput = {}

    if (query.tahunBup) where.tahunBup = Number(query.tahunBup)
    if (typeof query.sudahDiproses === 'string') where.sudahDiproses = query.sudahDiproses === 'true'
    if (typeof query.sudahDiproses === 'boolean') where.sudahDiproses = query.sudahDiproses

    const [data, total] = await Promise.all([
      db.perencanaanPensiun.findMany({
        where,
        skip,
        take: limit,
        include: { asn: { select: { id: true, nipBaru: true, nama: true, unitOrganisasiId: true } } },
        orderBy: { tanggalBup: 'asc' },
      }),
      db.perencanaanPensiun.count({ where }),
    ])

    return { data, meta: buildMeta(total, page, limit) }
  },

  async detail(id: string) {
    const item = await db.perencanaanPensiun.findUnique({
      where: { id: parseBigInt(id) },
      include: { asn: { select: { id: true, nipBaru: true, nama: true, unitOrganisasiId: true, golonganId: true } } },
    })
    if (!item) throw new AppError('Data tidak ditemukan', 404)
    return item
  },

  async create(dto: CreatePerencanaanDto, actor: Express.Request['user']) {
    const existing = await db.perencanaanPensiun.findUnique({ where: { asnId: dto.asnId } })
    if (existing) throw new AppError('ASN sudah memiliki perencanaan pensiun', 409)

    const result = await db.perencanaanPensiun.create({ data: dto })
    await auditLog(actor, 'CREATE_PERENCANAAN', result.id.toString(), { asnId: dto.asnId.toString() })
    return result
  },

  async update(id: string, dto: UpdatePerencanaanDto, actor: Express.Request['user']) {
    const perencanaanId = parseBigInt(id)
    const existing = await db.perencanaanPensiun.findUnique({ where: { id: perencanaanId } })
    if (!existing) throw new AppError('Data tidak ditemukan', 404)

    if (dto.asnId && dto.asnId !== existing.asnId) {
      const duplicate = await db.perencanaanPensiun.findUnique({ where: { asnId: dto.asnId } })
      if (duplicate) throw new AppError('ASN sudah memiliki perencanaan pensiun', 409)
    }

    const result = await db.perencanaanPensiun.update({ where: { id: perencanaanId }, data: dto })
    await auditLog(actor, 'UPDATE_PERENCANAAN', id, { asnId: result.asnId.toString() })
    return result
  },

  async remove(id: string, actor: Express.Request['user']) {
    const perencanaanId = parseBigInt(id)
    const existing = await db.perencanaanPensiun.findUnique({ where: { id: perencanaanId } })
    if (!existing) throw new AppError('Data tidak ditemukan', 404)

    await db.perencanaanPensiun.delete({ where: { id: perencanaanId } })
    await auditLog(actor, 'DELETE_PERENCANAAN', id)
  },

  async tandaiSelesai(id: string, actor: Express.Request['user']) {
    const perencanaanId = parseBigInt(id)
    const existing = await db.perencanaanPensiun.findUnique({ where: { id: perencanaanId } })
    if (!existing) throw new AppError('Data tidak ditemukan', 404)

    const result = await db.perencanaanPensiun.update({
      where: { id: perencanaanId },
      data: { sudahDiproses: true },
    })
    await auditLog(actor, 'SELESAI_PERENCANAAN', id, { asnId: result.asnId.toString() })
    return result
  },
}
