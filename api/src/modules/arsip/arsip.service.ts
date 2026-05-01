import { Prisma } from '@prisma/client'
import { db } from '@/core/database/prisma.client'
import { AppError } from '@/core/errors/app-error'
import { buildMeta, getPaginationParams } from '@/core/http/pagination.helper'
import type { ArsipkanDto } from './dto/arsip.dto'

const parseBigInt = (id: string): bigint => {
  try {
    return BigInt(id)
  } catch {
    throw new AppError('Data tidak ditemukan', 404)
  }
}

export const arsipService = {
  async list(query: { page?: unknown; limit?: unknown; search?: unknown; dateFrom?: unknown; dateTo?: unknown }) {
    const { page, limit, skip } = getPaginationParams(query)
    const where: Prisma.ArsipUsulanWhereInput = {}

    if (typeof query.search === 'string' && query.search.trim()) {
      const search = query.search.trim()
      where.usulanLayanan = {
        OR: [
          { nomorUsulan: { contains: search } },
          { asn: { nama: { contains: search } } },
          { asn: { nipBaru: { contains: search } } },
        ],
      }
    }
    if (typeof query.dateFrom === 'string' || typeof query.dateTo === 'string') {
      where.createdAt = {}
      if (typeof query.dateFrom === 'string' && query.dateFrom) where.createdAt.gte = new Date(query.dateFrom)
      if (typeof query.dateTo === 'string' && query.dateTo) where.createdAt.lte = new Date(query.dateTo)
    }

    const [data, total] = await Promise.all([
      db.arsipUsulan.findMany({
        where,
        skip,
        take: limit,
        include: {
          usulanLayanan: { select: { id: true, nomorUsulan: true, status: true, jenisLayananId: true } },
          diarsipkanOleh: { select: { namaLengkap: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.arsipUsulan.count({ where }),
    ])

    return { data, meta: buildMeta(total, page, limit) }
  },

  async detail(id: string) {
    const item = await db.arsipUsulan.findUnique({
      where: { id: parseBigInt(id) },
      include: {
        usulanLayanan: {
          include: {
            asn: { select: { id: true, nama: true, nipBaru: true } },
            jenisLayanan: true,
          },
        },
        diarsipkanOleh: { select: { id: true, namaLengkap: true } },
      },
    })
    if (!item) throw new AppError('Data tidak ditemukan', 404)
    return item
  },

  async arsipkan(dto: ArsipkanDto, actor: Express.Request['user']) {
    const usulan = await db.usulanLayanan.findUnique({
      where: { id: dto.usulanLayananId },
      include: { asn: true, jenisLayanan: true },
    })
    if (!usulan) throw new AppError('Usulan tidak ditemukan', 404)
    if (!['Selesai', 'Ditolak'].includes(usulan.status)) {
      throw new AppError('Hanya usulan berstatus Selesai atau Batal yang dapat diarsipkan', 422)
    }

    const dataSnapshot: Prisma.InputJsonObject = {
      nomorUsulan: usulan.nomorUsulan,
      status: usulan.status,
      tahapSaatIni: usulan.tahapSaatIni,
      tanggalUsulan: usulan.tanggalUsulan.toISOString(),
      tglSelesai: usulan.tglSelesai?.toISOString() ?? null,
      asnNama: usulan.asn.nama,
      asnNip: usulan.asn.nipBaru,
      jenisLayanan: usulan.jenisLayanan.nama,
    }

    const arsip = await db.arsipUsulan.create({
      data: {
        usulanLayananId: dto.usulanLayananId,
        alasanArsip: dto.alasanArsip,
        diarsipkanOlehId: actor?.id,
        dataSnapshot,
      },
    })

    await db.auditLog.create({
      data: {
        userId: actor?.id,
        userNama: actor?.namaLengkap,
        action: 'ARSIPKAN_USULAN',
        entityType: 'ArsipUsulan',
        entityId: arsip.id.toString(),
        newValues: { usulanLayananId: dto.usulanLayananId },
      },
    })

    return arsip
  },
}
