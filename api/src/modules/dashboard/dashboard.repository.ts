import { db } from '@/core/database/prisma.client'
import { StatusUsulan } from '@prisma/client'

const ACTIVE_STATUSES: StatusUsulan[] = [
  'Diajukan',
  'VerifikasiAP',
  'VerifikasiAM',
  'QualityControl',
  'ApprovalKabid',
  'ApprovalKepalaBadan',
]

export const dashboardRepository = {
  // ─── Enterprise Dashboard ────────────────────────────────────────────────

  countAll: () =>
    db.usulanLayanan.count({ where: { deletedAt: null } }),

  countByStatus: async () => {
    const rows = await db.usulanLayanan.groupBy({
      by: ['status'],
      _count: { _all: true },
      where: { deletedAt: null },
    })
    const map: Record<string, number> = {}
    for (const r of rows) map[r.status] = r._count._all
    return map
  },

  countByTahap: async () => {
    const rows = await db.usulanLayanan.groupBy({
      by: ['tahapSaatIni'],
      _count: { _all: true },
      where: { deletedAt: null },
    })
    const map: Record<string, number> = {}
    for (const r of rows) map[String(r.tahapSaatIni)] = r._count._all
    return map
  },

  slaSummary: async () => {
    const total = await db.slaTracker.count()
    const overdue = await db.slaTracker.count({
      where: { selesaiAt: null, slaHabisAt: { lt: new Date() } },
    })
    const selesai = await db.slaTracker.count({
      where: { selesaiAt: { not: null } },
    })
    return { total, overdue, selesai }
  },

  recentUsulan: () =>
    db.usulanLayanan.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        asn: { select: { nama: true, nipBaru: true } },
        jenisLayanan: { select: { nama: true } },
      },
    }),

  trendPerDay: async (days: number) => {
    const since = new Date()
    since.setDate(since.getDate() - days)
    const rows = await db.usulanLayanan.groupBy({
      by: ['createdAt'],
      _count: { _all: true },
      where: { createdAt: { gte: since } },
    })
    const map: Record<string, number> = {}
    for (const r of rows) {
      const key = r.createdAt.toISOString().slice(0, 10)
      map[key] = (map[key] ?? 0) + r._count._all
    }
    return map
  },

  // ─── Role-Based Dashboard (existing pages) ───────────────────────────────

  ringkasan: async (unitOrganisasiId?: string) => {
    const unitId = unitOrganisasiId ? BigInt(unitOrganisasiId) : undefined
    const baseWhere = unitId
      ? { unitOrganisasiId: unitId, deletedAt: null as null }
      : { deletedAt: null as null }
    const slaRelWhere = unitId
      ? { usulanLayanan: { unitOrganisasiId: unitId, deletedAt: null as null } }
      : {}

    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const [
      totalDraft,
      totalDalamProses,
      totalSelesai,
      totalDikembalikan,
      totalBatal,
      totalSlaWarning,
      totalSlaOverdue,
    ] = await Promise.all([
      db.usulanLayanan.count({ where: { ...baseWhere, status: 'Draft' } }),
      db.usulanLayanan.count({ where: { ...baseWhere, status: { in: ACTIVE_STATUSES } } }),
      db.usulanLayanan.count({ where: { ...baseWhere, status: 'Selesai' } }),
      db.usulanLayanan.count({ where: { ...baseWhere, status: 'Dikembalikan' } }),
      db.usulanLayanan.count({ where: { ...baseWhere, status: 'Ditolak' } }),
      db.slaTracker.count({
        where: { ...slaRelWhere, selesaiAt: null, slaHabisAt: { gte: now, lte: tomorrow } },
      }),
      db.slaTracker.count({
        where: { ...slaRelWhere, selesaiAt: null, slaHabisAt: { lt: now } },
      }),
    ])

    return {
      totalDraft,
      totalDalamProses,
      totalSelesai,
      totalDikembalikan,
      totalBatal,
      totalSlaWarning,
      totalSlaOverdue,
    }
  },

  perJenisLayanan: async () => {
    // No orderBy on _count to avoid Prisma type union issues — sort in JS
    const rows = await db.usulanLayanan.groupBy({
      by: ['jenisLayananId'],
      _count: { _all: true },
      where: { deletedAt: null },
    })

    rows.sort((a, b) => b._count._all - a._count._all)

    const jenisIds = rows.map((r) => r.jenisLayananId)
    const jenisList = await db.refJenisLayanan.findMany({
      where: { id: { in: jenisIds } },
      select: { id: true, nama: true },
    })
    const jenisMap = new Map(jenisList.map((j) => [j.id.toString(), j.nama]))

    return rows.map((r) => ({
      jenisLayananId: r.jenisLayananId.toString(),
      jenisLayanan: { nama: jenisMap.get(r.jenisLayananId.toString()) ?? 'Tanpa Jenis' },
      total: r._count._all,
    }))
  },

  antrianPerTahap: () =>
    db.usulanLayanan.groupBy({
      by: ['tahapSaatIni'],
      _count: { _all: true },
      where: { deletedAt: null, status: { in: ACTIVE_STATUSES } },
    }),

  laporanHarian: () =>
    db.laporanHarian.findMany({
      orderBy: { tanggalLaporan: 'asc' },
      take: 14,
      select: {
        tanggalLaporan: true,
        usulanMasuk: true,
        usulanSelesai: true,
        usulanDikembalikan: true,
        melampauiSla: true,
      },
    }),

  aktivitas: () =>
    db.usulanWorkflowLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        aksi: true,
        catatan: true,
        createdAt: true,
        usulanLayanan: { select: { nomorUsulan: true } },
        dilakukanOleh: { select: { namaLengkap: true } },
      },
    }),

  // ─── Analytics ───────────────────────────────────────────────────────────

  slaTrend: async (days: number) => {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const rows = await db.slaTracker.findMany({
      where: { masukTahap: { gte: since } },
      select: { masukTahap: true, statusSla: true },
    })

    const map: Record<string, Record<string, number>> = {}
    for (const r of rows) {
      const date = r.masukTahap.toISOString().slice(0, 10)
      if (!map[date]) map[date] = {}
      map[date][r.statusSla] = (map[date][r.statusSla] ?? 0) + 1
    }

    return Object.entries(map).flatMap(([tanggal, statuses]) =>
      Object.entries(statuses).map(([statusSla, total]) => ({ tanggal, statusSla, total })),
    )
  },

  throughput: async (days: number) => {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const [masukRows, selesaiRows] = await Promise.all([
      db.usulanLayanan.findMany({
        where: { tanggalUsulan: { gte: since }, deletedAt: null },
        select: { tanggalUsulan: true },
      }),
      db.usulanLayanan.findMany({
        where: { tglSelesai: { gte: since }, status: 'Selesai', deletedAt: null },
        select: { tglSelesai: true },
      }),
    ])

    const masukMap: Record<string, number> = {}
    for (const r of masukRows) {
      const key = r.tanggalUsulan.toISOString().slice(0, 10)
      masukMap[key] = (masukMap[key] ?? 0) + 1
    }

    const selesaiMap: Record<string, number> = {}
    for (const r of selesaiRows) {
      if (!r.tglSelesai) continue
      const key = r.tglSelesai.toISOString().slice(0, 10)
      selesaiMap[key] = (selesaiMap[key] ?? 0) + 1
    }

    const allDates = new Set([...Object.keys(masukMap), ...Object.keys(selesaiMap)])
    return Array.from(allDates)
      .sort()
      .map((tanggal) => ({ tanggal, masuk: masukMap[tanggal] ?? 0, selesai: selesaiMap[tanggal] ?? 0 }))
  },

  bottleneck: async () => {
    const rows = await db.slaTracker.findMany({
      where: { selesaiAt: null },
      select: { tahapSaat: true, masukTahap: true },
    })

    const now = new Date()
    const grouped: Record<string, { total: number; totalJam: number }> = {}

    for (const r of rows) {
      const tahap = r.tahapSaat
      const jam = (now.getTime() - r.masukTahap.getTime()) / (1000 * 60 * 60)
      if (!grouped[tahap]) grouped[tahap] = { total: 0, totalJam: 0 }
      grouped[tahap].total++
      grouped[tahap].totalJam += jam
    }

    return Object.entries(grouped).map(([tahap, { total, totalJam }]) => ({
      tahap,
      total,
      rataJamMenunggu: total > 0 ? Math.round(totalJam / total) : null,
    }))
  },

  rankingOpd: async (limit: number) => {
    // No orderBy on _count to avoid Prisma type union issues — sort in JS
    const rows = await db.usulanLayanan.groupBy({
      by: ['unitOrganisasiId'],
      _count: { _all: true },
      where: { deletedAt: null },
    })

    rows.sort((a, b) => b._count._all - a._count._all)
    const topRows = rows.slice(0, limit)

    const unitIds = topRows.map((r) => r.unitOrganisasiId)
    const units = await db.refUnitOrganisasi.findMany({
      where: { id: { in: unitIds } },
      select: { id: true, nama: true },
    })
    const unitMap = new Map(units.map((u) => [u.id.toString(), u.nama]))

    const now = new Date()

    return Promise.all(
      topRows.map(async (r) => {
        const [selesai, dikembalikan, overdue] = await Promise.all([
          db.usulanLayanan.count({
            where: { unitOrganisasiId: r.unitOrganisasiId, status: 'Selesai', deletedAt: null },
          }),
          db.usulanLayanan.count({
            where: { unitOrganisasiId: r.unitOrganisasiId, status: 'Dikembalikan', deletedAt: null },
          }),
          db.slaTracker.count({
            where: {
              selesaiAt: null,
              slaHabisAt: { lt: now },
              usulanLayanan: { unitOrganisasiId: r.unitOrganisasiId, deletedAt: null },
            },
          }),
        ])

        return {
          unitOrganisasiId: r.unitOrganisasiId.toString(),
          unitOrganisasi: unitMap.get(r.unitOrganisasiId.toString()) ?? 'Tanpa Unit',
          totalUsulan: r._count._all,
          totalSelesai: selesai,
          totalDikembalikan: dikembalikan,
          totalOverdue: overdue,
        }
      }),
    )
  },
}
