import { Prisma } from '@prisma/client'
import { db } from '@/core/database/prisma.client'
import { AppError } from '@/core/errors/app-error'
import { buildMeta, getPaginationParams } from '@/core/http/pagination.helper'
import { generateLaporanBulanan, generateLaporanHarian } from './laporan.generator'

const parseBigInt = (id: string): bigint => {
  try {
    return BigInt(id)
  } catch {
    throw new AppError('Data tidak ditemukan', 404)
  }
}

export const laporanService = {
  async listHarian(query: { page?: unknown; limit?: unknown; dateFrom?: unknown; dateTo?: unknown }) {
    const { page, limit, skip } = getPaginationParams(query)
    const where: Prisma.LaporanHarianWhereInput = {}

    if (typeof query.dateFrom === 'string' || typeof query.dateTo === 'string') {
      where.tanggalLaporan = {}
      if (typeof query.dateFrom === 'string' && query.dateFrom) where.tanggalLaporan.gte = new Date(query.dateFrom)
      if (typeof query.dateTo === 'string' && query.dateTo) where.tanggalLaporan.lte = new Date(query.dateTo)
    }

    const [data, total] = await Promise.all([
      db.laporanHarian.findMany({ where, skip, take: limit, orderBy: { tanggalLaporan: 'desc' } }),
      db.laporanHarian.count({ where }),
    ])

    return { data, meta: buildMeta(total, page, limit) }
  },

  async detailHarian(id: string) {
    const item = await db.laporanHarian.findUnique({ where: { id: parseBigInt(id) } })
    if (!item) throw new AppError('Data tidak ditemukan', 404)
    return item
  },

  async listBulanan(query: { page?: unknown; limit?: unknown; tahun?: unknown; bulan?: unknown }) {
    const { page, limit, skip } = getPaginationParams(query)
    const where: Prisma.LaporanBulananWhereInput = {}

    if (query.tahun) where.tahun = Number(query.tahun)
    if (query.bulan) where.bulan = Number(query.bulan)

    const [data, total] = await Promise.all([
      db.laporanBulanan.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }],
      }),
      db.laporanBulanan.count({ where }),
    ])

    return { data, meta: buildMeta(total, page, limit) }
  },

  async detailBulanan(id: string) {
    const item = await db.laporanBulanan.findUnique({ where: { id: parseBigInt(id) } })
    if (!item) throw new AppError('Data tidak ditemukan', 404)
    return item
  },

  generateHarian(tanggal?: string) {
    const date = tanggal ? new Date(tanggal) : new Date()
    return generateLaporanHarian(date)
  },

  generateBulanan(tahun?: number, bulan?: number) {
    const now = new Date()
    return generateLaporanBulanan(tahun ?? now.getFullYear(), bulan ?? now.getMonth() + 1)
  },
}
