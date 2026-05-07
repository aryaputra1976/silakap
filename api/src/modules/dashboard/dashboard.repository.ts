import { db } from '@/core/database/prisma.client'
import { Prisma, StatusUsulan } from '@prisma/client'
import {
  getPeremajaanNamaLayanan,
  getPeremajaanSlaHari,
  getPeremajaanSlaStatus,
  isPeremajaanDalamSla,
} from '@/modules/asn/peremajaan-sla.helper'

const ACTIVE_STATUSES: StatusUsulan[] = [
  'Diajukan',
  'VerifikasiAP',
  'VerifikasiAM',
  'QualityControl',
  'ApprovalKabid',
  'ApprovalKepalaBadan',
]

const DAY_MS = 24 * 60 * 60 * 1000

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

  // ─── Pimpinan BKD Dashboard ─────────────────────────────────────────────

  pimpinan: async () => {
    const now = new Date()
    const bulanIniStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const bulanIniEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    const [
      totalBulanIni,
      peremajaanBulanIni,
      eskalasiMenunggu,
      selesaiBulanIni,
      selesaiDalamSla,
      waktuSelesai,
      volumeRows,
      peremajaanVolumeRows,
      peremajaanSelesaiRows,
      antrianMenunggu,
      antrianDiproses,
      slaKritis,
      peremajaanPendingRows,
    ] = await Promise.all([
      db.usulanLayanan.count({
        where: { tanggalUsulan: { gte: bulanIniStart, lt: bulanIniEnd }, deletedAt: null },
      }),
      db.asnPeremajaan.count({
        where: { createdAt: { gte: bulanIniStart, lt: bulanIniEnd } },
      }),
      db.usulanLayanan.count({
        where: { status: { in: ['ApprovalKabid', 'ApprovalKepalaBadan'] }, deletedAt: null },
      }),
      db.usulanLayanan.count({
        where: { status: 'Selesai', tglSelesai: { gte: bulanIniStart, lt: bulanIniEnd }, deletedAt: null },
      }),
      db.slaTracker.count({ where: { selesaiAt: { not: null }, statusSla: { not: 'Overdue' } } }),
      db.usulanLayanan.findMany({
        where: { status: 'Selesai', tglSelesai: { not: null }, deletedAt: null },
        select: { tanggalUsulan: true, tglSelesai: true },
        take: 200,
        orderBy: { tglSelesai: 'desc' },
      }),
      db.usulanLayanan.groupBy({
        by: ['jenisLayananId'],
        _count: { _all: true },
        where: { tanggalUsulan: { gte: bulanIniStart, lt: bulanIniEnd }, deletedAt: null },
      }),
      db.asnPeremajaan.groupBy({
        by: ['jenisPerubahan'],
        _count: { _all: true },
        where: { createdAt: { gte: bulanIniStart, lt: bulanIniEnd } },
      }),
      db.asnPeremajaan.findMany({
        where: {
          OR: [
            { approvedAt: { gte: bulanIniStart, lt: bulanIniEnd } },
            { rejectedAt: { gte: bulanIniStart, lt: bulanIniEnd } },
          ],
        },
        select: {
          createdAt: true,
          approvedAt: true,
          rejectedAt: true,
          jenisPerubahan: true,
          dataBaru: true,
          disetujuiOlehId: true,
          disetujuiOleh: { select: { namaLengkap: true } },
        },
      }),
      db.usulanLayanan.count({ where: { status: 'Diajukan', deletedAt: null } }),
      db.usulanLayanan.count({
        where: { status: { in: ['VerifikasiAP', 'VerifikasiAM', 'QualityControl'] }, deletedAt: null },
      }),
      db.slaTracker.count({ where: { selesaiAt: null, slaHabisAt: { lt: now } } }),
      db.asnPeremajaan.findMany({
        where: { statusApproval: 'Pending' },
        select: { createdAt: true, jenisPerubahan: true, dataBaru: true },
      }),
    ])

    const peremajaanSelesaiBulanIni = peremajaanSelesaiRows.length
    const peremajaanSelesaiDalamSla = peremajaanSelesaiRows.filter((item) =>
      isPeremajaanDalamSla(
        item.createdAt,
        item.approvedAt ?? item.rejectedAt,
        item.jenisPerubahan,
        item.dataBaru,
      ),
    ).length
    const totalSelesaiGabungan = selesaiBulanIni + peremajaanSelesaiBulanIni
    const selesaiDalamSlaGabungan = selesaiDalamSla + peremajaanSelesaiDalamSla
    const slaCompliancePercent =
      totalSelesaiGabungan > 0 ? Math.round((selesaiDalamSlaGabungan / totalSelesaiGabungan) * 100) : 0

    let avgWaktuSelesaiHari = 0
    const peremajaanWaktuSelesaiMs = peremajaanSelesaiRows
      .map((item) => {
        const selesaiAt = item.approvedAt ?? item.rejectedAt
        return selesaiAt ? selesaiAt.getTime() - item.createdAt.getTime() : 0
      })
      .filter((value) => value > 0)
    if (waktuSelesai.length + peremajaanWaktuSelesaiMs.length > 0) {
      const totalMsLayanan = waktuSelesai.reduce((acc, u) => {
        if (!u.tglSelesai) return acc
        return acc + (u.tglSelesai.getTime() - u.tanggalUsulan.getTime())
      }, 0)
      const totalMsPeremajaan = peremajaanWaktuSelesaiMs.reduce((acc, value) => acc + value, 0)
      avgWaktuSelesaiHari =
        Math.round(((totalMsLayanan + totalMsPeremajaan) / (waktuSelesai.length + peremajaanWaktuSelesaiMs.length) / DAY_MS) * 10) / 10
    }

    volumeRows.sort((a, b) => b._count._all - a._count._all)
    const jenisIds = volumeRows.map((r) => r.jenisLayananId)
    const jenisList = await db.refJenisLayanan.findMany({
      where: { id: { in: jenisIds } },
      select: { id: true, nama: true },
    })
    const jenisMap = new Map(jenisList.map((j) => [j.id.toString(), j.nama]))
    const volumeMap = new Map<string, number>()
    for (const r of volumeRows) {
      const nama = jenisMap.get(r.jenisLayananId.toString()) ?? 'Lainnya'
      volumeMap.set(nama, (volumeMap.get(nama) ?? 0) + r._count._all)
    }
    for (const r of peremajaanVolumeRows) {
      const nama = getPeremajaanNamaLayanan(r.jenisPerubahan)
      volumeMap.set(nama, (volumeMap.get(nama) ?? 0) + r._count._all)
    }
    const volumePerLayanan = Array.from(volumeMap.entries())
      .map(([nama, total]) => ({ nama, total }))
      .sort((a, b) => b.total - a.total)

    // SLA compliance per operator: dari workflow log yang aksi=selesai
    const operatorLogs = await db.usulanWorkflowLog.findMany({
      where: { aksi: 'selesai', dilakukanOlehId: { not: null } },
      select: {
        dilakukanOlehId: true,
        dilakukanOleh: { select: { namaLengkap: true } },
        usulanLayanan: {
          select: {
            slaTracker: { select: { statusSla: true }, orderBy: { masukTahap: 'desc' }, take: 1 },
          },
        },
      },
      take: 500,
      orderBy: { createdAt: 'desc' },
    })

    const opMap: Record<string, { nama: string; total: number; tepat: number }> = {}
    for (const log of operatorLogs) {
      const id = log.dilakukanOlehId?.toString() ?? ''
      const nama = log.dilakukanOleh?.namaLengkap ?? ''
      if (!id || !nama) continue
      if (!opMap[id]) opMap[id] = { nama, total: 0, tepat: 0 }
      opMap[id].total++
      const lastSla = log.usulanLayanan.slaTracker[0]?.statusSla
      if (lastSla && lastSla !== 'Overdue') opMap[id].tepat++
    }
    for (const item of peremajaanSelesaiRows) {
      const id = item.disetujuiOlehId ?? ''
      const nama = item.disetujuiOleh?.namaLengkap ?? ''
      if (!id || !nama) continue
      if (!opMap[id]) opMap[id] = { nama, total: 0, tepat: 0 }
      opMap[id].total++
      if (isPeremajaanDalamSla(item.createdAt, item.approvedAt ?? item.rejectedAt, item.jenisPerubahan, item.dataBaru)) {
        opMap[id].tepat++
      }
    }
    const kepatuhanPerOperator = Object.values(opMap)
      .map((o) => ({ nama: o.nama, persen: o.total > 0 ? Math.round((o.tepat / o.total) * 100) : 0 }))
      .slice(0, 5)

    const peremajaanSlaKritis = peremajaanPendingRows.filter((item) => {
      const totalSla = getPeremajaanSlaHari(item.jenisPerubahan, item.dataBaru)
      const sla = getPeremajaanSlaStatus(item.createdAt, totalSla, now)
      return sla.statusSla !== 'OK'
    }).length

    return {
      totalBulanIni: totalBulanIni + peremajaanBulanIni,
      slaCompliancePercent,
      avgWaktuSelesaiHari,
      eskalasiMenunggu,
      volumePerLayanan,
      kepatuhanPerOperator,
      antrianStatus: {
        menunggu: antrianMenunggu + peremajaanPendingRows.length,
        diproses: antrianDiproses,
        slaKritis: slaKritis + peremajaanSlaKritis,
      },
    }
  },

  // ─── Operator BKD KPI ────────────────────────────────────────────────────

  operatorKpi: async (tahap: string) => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

    const statusMap: Record<string, StatusUsulan[]> = {
      AP: ['Diajukan'],
      AM: ['VerifikasiAP'],
      AD: ['VerifikasiAM'],
      Kabid: ['QualityControl'],
      KepalaBadan: ['ApprovalKabid'],
    }

    const prosesMap: Record<string, StatusUsulan[]> = {
      AP: ['VerifikasiAP'],
      AM: ['VerifikasiAM'],
      AD: ['QualityControl'],
      Kabid: ['ApprovalKabid'],
      KepalaBadan: ['ApprovalKepalaBadan'],
    }

    const menungguStatus = statusMap[tahap] ?? ['Diajukan']
    const diprosesStatus = prosesMap[tahap] ?? ['VerifikasiAP']

    const [
      menungguVerifikasi,
      sedangDiproses,
      mendekatiSla,
      selesaiHariIni,
      peremajaanPendingRows,
      peremajaanSelesaiHariIni,
    ] = await Promise.all([
      db.usulanLayanan.count({ where: { status: { in: menungguStatus }, deletedAt: null } }),
      db.usulanLayanan.count({ where: { status: { in: diprosesStatus }, deletedAt: null } }),
      db.slaTracker.count({ where: { selesaiAt: null, statusSla: 'Warning' } }),
      db.usulanLayanan.count({
        where: { status: 'Selesai', tglSelesai: { gte: todayStart, lt: todayEnd }, deletedAt: null },
      }),
      tahap === 'AD'
        ? db.asnPeremajaan.findMany({
            where: { statusApproval: 'Pending' },
            select: { createdAt: true, jenisPerubahan: true, dataBaru: true },
          })
        : Promise.resolve([]),
      tahap === 'AD'
        ? db.asnPeremajaan.count({
            where: {
              OR: [
                { approvedAt: { gte: todayStart, lt: todayEnd } },
                { rejectedAt: { gte: todayStart, lt: todayEnd } },
              ],
            },
          })
        : Promise.resolve(0),
    ])

    const peremajaanMendekatiSla = peremajaanPendingRows.filter((item) => {
      const totalSla = getPeremajaanSlaHari(item.jenisPerubahan, item.dataBaru)
      return getPeremajaanSlaStatus(item.createdAt, totalSla, now).statusSla !== 'OK'
    }).length

    return {
      menungguVerifikasi: menungguVerifikasi + peremajaanPendingRows.length,
      sedangDiproses,
      mendekatiSla: mendekatiSla + peremajaanMendekatiSla,
      selesaiHariIni: selesaiHariIni + peremajaanSelesaiHariIni,
    }
  },

  // ─── Antrian Detail ──────────────────────────────────────────────────────

  antrianDetail: async (params: {
    jenisLayananId?: string
    unitOrganisasiId?: string
    urutan?: string
    page: number
    limit: number
  }) => {
    const { jenisLayananId, unitOrganisasiId, urutan, page, limit } = params
    const now = new Date()
    const orderDir = urutan === 'terbaru' ? ('desc' as const) : ('asc' as const)

    const baseWhere = {
      deletedAt: null as null,
      status: { in: ACTIVE_STATUSES },
      ...(jenisLayananId ? { jenisLayananId: BigInt(jenisLayananId) } : {}),
      ...(unitOrganisasiId ? { unitOrganisasiId: BigInt(unitOrganisasiId) } : {}),
    }

    const [rows, peremajaanRows] = await Promise.all([
      db.usulanLayanan.findMany({
        where: baseWhere,
        orderBy: { tanggalUsulan: orderDir },
        include: {
          asn: { select: { nama: true } },
          jenisLayanan: { select: { nama: true } },
          unitOrganisasi: { select: { nama: true } },
          slaTracker: {
            where: { selesaiAt: null },
            orderBy: { masukTahap: 'desc' as const },
            take: 1,
          },
        },
      }),
      jenisLayananId
        ? Promise.resolve([])
        : db.asnPeremajaan.findMany({
            where: {
              statusApproval: 'Pending',
              ...(unitOrganisasiId
                ? { asn: { is: { unitOrganisasiId: BigInt(unitOrganisasiId) } } }
                : {}),
            },
            orderBy: { createdAt: orderDir },
            include: {
              asn: {
                select: {
                  nama: true,
                  unitOrganisasi: { select: { nama: true } },
                },
              },
            },
          }),
    ])

    const layananData = rows.map((r) => {
      const tracker = r.slaTracker[0] ?? null
      let sla = null
      if (tracker) {
        const msElapsed = now.getTime() - tracker.masukTahap.getTime()
        const hariKe = Math.max(1, Math.ceil(msElapsed / (1000 * 60 * 60 * 24)))
        sla = {
          hariKe,
          totalSla: tracker.slaHari,
          statusSla: tracker.statusSla as 'OK' | 'Warning' | 'Overdue',
        }
      }
      return {
        id: r.id.toString(),
        source: 'layanan' as const,
        detailHref: `/layanan/${r.id.toString()}`,
        nomorUsulan: r.nomorUsulan,
        asn: { nama: r.asn?.nama ?? '-' },
        jenisLayanan: { nama: r.jenisLayanan?.nama ?? '-' },
        unitOrganisasi: { singkatan: r.unitOrganisasi?.nama ?? '-' },
        tanggalUsulan: r.tanggalUsulan.toISOString().slice(0, 10),
        status: r.status,
        sla,
      }
    })

    const peremajaanData = peremajaanRows.map((r) => {
      const totalSla = getPeremajaanSlaHari(r.jenisPerubahan, r.dataBaru)
      return {
        id: `peremajaan-${r.id.toString()}`,
        source: 'peremajaan' as const,
        detailHref: '/asn/peremajaan',
        nomorUsulan: `PRM-${r.id.toString()}`,
        asn: { nama: r.asn?.nama ?? '-' },
        jenisLayanan: { nama: getPeremajaanNamaLayanan(r.jenisPerubahan, r.dataBaru) },
        unitOrganisasi: { singkatan: r.asn?.unitOrganisasi?.nama ?? '-' },
        tanggalUsulan: r.createdAt.toISOString().slice(0, 10),
        status: 'Diajukan',
        sla: getPeremajaanSlaStatus(r.createdAt, totalSla, now),
      }
    })

    const sortedData = [...layananData, ...peremajaanData].sort((a, b) => {
      const left = new Date(a.tanggalUsulan).getTime()
      const right = new Date(b.tanggalUsulan).getTime()
      return orderDir === 'desc' ? right - left : left - right
    })
    const total = sortedData.length
    const data = sortedData.slice((page - 1) * limit, page * limit)

    return { total, page, limit, data }
  },

  eskalasiPeremajaan: async () => {
    const now = new Date()
    const rows = await db.asnPeremajaan.findMany({
      where: { statusApproval: 'Pending' },
      select: {
        id: true,
        createdAt: true,
        jenisPerubahan: true,
        dataBaru: true,
        asn: { select: { id: true, nama: true, nipBaru: true, unitOrganisasi: { select: { nama: true } } } },
      },
      orderBy: { createdAt: 'asc' },
    })

    const assignmentRows = rows.length > 0
      ? await db.$queryRaw<Array<{ id: bigint; ditugaskanKepadaId: string | null; namaLengkap: string | null }>>`
          SELECT p.id, p.ditugaskan_kepada_id AS ditugaskanKepadaId, u.namaLengkap
          FROM asn_peremajaan p
          LEFT JOIN user u ON u.id = p.ditugaskan_kepada_id
          WHERE p.id IN (${Prisma.join(rows.map((r) => r.id))})
        `
      : []

    const assignMap = new Map(assignmentRows.map((r) => [r.id.toString(), r]))

    return rows
      .map((r) => {
        const totalSla = getPeremajaanSlaHari(r.jenisPerubahan, r.dataBaru)
        const sla = getPeremajaanSlaStatus(r.createdAt, totalSla, now)
        if (sla.statusSla === 'OK') return null
        const assign = assignMap.get(r.id.toString())
        return {
          id: r.id.toString(),
          namaAsn: r.asn?.nama ?? '-',
          nipBaru: r.asn?.nipBaru ?? '-',
          unitOrganisasi: r.asn?.unitOrganisasi?.nama ?? '-',
          namaLayanan: getPeremajaanNamaLayanan(r.jenisPerubahan, r.dataBaru),
          tanggalPengajuan: r.createdAt.toISOString().slice(0, 10),
          hariKe: sla.hariKe,
          totalSla: sla.totalSla,
          statusSla: sla.statusSla,
          operator: assign?.ditugaskanKepadaId ? assign.namaLengkap ?? '-' : null,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => {
        if (a.statusSla === 'Overdue' && b.statusSla !== 'Overdue') return -1
        if (b.statusSla === 'Overdue' && a.statusSla !== 'Overdue') return 1
        return b.hariKe - a.hariKe
      })
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
