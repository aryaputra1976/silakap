import { Prisma } from '@prisma/client'
import { db } from '@/core/database/prisma.client'

export const dashboardService = {
  async ringkasan(_userRoleName: string, unitOrganisasiId?: string) {
    const where: Prisma.UsulanLayananWhereInput = unitOrganisasiId
      ? { unitOrganisasiId, deletedAt: null }
      : { deletedAt: null }

    const [
      totalDraft,
      totalDalamProses,
      totalSelesai,
      totalDikembalikan,
      totalBatal,
      totalSlaWarning,
      totalSlaOverdue,
    ] = await Promise.all([
      db.usulanLayanan.count({ where: { ...where, status: 'Draft' } }),
      db.usulanLayanan.count({
        where: {
          ...where,
          status: { in: ['Diajukan', 'VerifikasiAP', 'VerifikasiAM', 'QualityControl', 'ApprovalKabid', 'ApprovalKepalaBadan'] },
        },
      }),
      db.usulanLayanan.count({ where: { ...where, status: 'Selesai' } }),
      db.usulanLayanan.count({ where: { ...where, status: 'Dikembalikan' } }),
      db.usulanLayanan.count({ where: { ...where, status: 'Ditolak' } }),
      db.slaTracker.count({
        where: { selesaiAt: null, statusSla: 'Warning', usulanLayanan: where },
      }),
      db.slaTracker.count({
        where: { selesaiAt: null, statusSla: 'Overdue', usulanLayanan: where },
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

  async perJenisLayanan() {
    const grouped = await db.usulanLayanan.groupBy({
      by: ['jenisLayananId'],
      where: { deletedAt: null },
      _count: { _all: true },
      orderBy: { jenisLayananId: 'asc' },
    })
    const layanan = await db.refJenisLayanan.findMany({
      where: { id: { in: grouped.map((item) => item.jenisLayananId) } },
      select: { id: true, kode: true, nama: true },
    })
    const layananMap = new Map(layanan.map((item) => [item.id.toString(), item]))

    return grouped.map((item) => ({
      jenisLayananId: item.jenisLayananId,
      jenisLayanan: layananMap.get(item.jenisLayananId.toString()) ?? null,
      total: item._count._all,
    }))
  },

  antrianPerTahap() {
    return db.usulanLayanan.groupBy({
      by: ['tahapSaatIni'],
      where: {
        deletedAt: null,
        status: { in: ['Diajukan', 'VerifikasiAP', 'VerifikasiAM', 'QualityControl', 'ApprovalKabid', 'ApprovalKepalaBadan'] },
      },
      _count: { _all: true },
      orderBy: { tahapSaatIni: 'asc' },
    })
  },

  laporanHarianTerakhir() {
    return db.laporanHarian.findMany({
      take: 7,
      orderBy: { tanggalLaporan: 'desc' },
    })
  },

  aktivitasTerkini() {
    return db.usulanWorkflowLog.findMany({
      take: 20,
      include: {
        usulanLayanan: { select: { nomorUsulan: true } },
        dilakukanOleh: { select: { namaLengkap: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  slaTrend(days = 14) {
    const safeDays = Math.min(Math.max(Number(days) || 14, 1), 90)
    return db.$queryRaw`
      SELECT
        DATE(st.createdAt) AS tanggal,
        st.status_sla AS statusSla,
        COUNT(*) AS total
      FROM sla_tracker st
      WHERE st.createdAt >= DATE_SUB(CURDATE(), INTERVAL ${safeDays} DAY)
      GROUP BY DATE(st.createdAt), st.status_sla
      ORDER BY tanggal ASC
    `
  },

  throughput(days = 30) {
    const safeDays = Math.min(Math.max(Number(days) || 30, 1), 180)
    return db.$queryRaw`
      SELECT
        d.tanggal,
        SUM(d.masuk) AS masuk,
        SUM(d.selesai) AS selesai
      FROM (
        SELECT DATE(tanggalUsulan) AS tanggal, COUNT(*) AS masuk, 0 AS selesai
        FROM usulan_layanan
        WHERE deleted_at IS NULL
          AND tanggalUsulan >= DATE_SUB(CURDATE(), INTERVAL ${safeDays} DAY)
        GROUP BY DATE(tanggalUsulan)
        UNION ALL
        SELECT DATE(tgl_selesai) AS tanggal, 0 AS masuk, COUNT(*) AS selesai
        FROM usulan_layanan
        WHERE deleted_at IS NULL
          AND tgl_selesai IS NOT NULL
          AND tgl_selesai >= DATE_SUB(CURDATE(), INTERVAL ${safeDays} DAY)
        GROUP BY DATE(tgl_selesai)
      ) d
      GROUP BY d.tanggal
      ORDER BY d.tanggal ASC
    `
  },

  bottleneck() {
    return db.$queryRaw`
      SELECT
        COALESCE(tahap_saat_ini, 'Diajukan') AS tahap,
        COUNT(*) AS total,
        AVG(TIMESTAMPDIFF(HOUR, updatedAt, NOW())) AS rataJamMenunggu
      FROM usulan_layanan
      WHERE deleted_at IS NULL
        AND status IN ('Diajukan','VerifikasiAP','VerifikasiAM','QualityControl','ApprovalKabid','ApprovalKepalaBadan')
      GROUP BY COALESCE(tahap_saat_ini, 'Diajukan')
      ORDER BY total DESC
    `
  },

  rankingOpd(limit = 10) {
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50)
    return db.$queryRaw`
      SELECT
        u.id AS unitOrganisasiId,
        u.nama AS unitOrganisasi,
        COUNT(l.id) AS totalUsulan,
        SUM(CASE WHEN l.status = 'Selesai' THEN 1 ELSE 0 END) AS totalSelesai,
        SUM(CASE WHEN l.status = 'Dikembalikan' THEN 1 ELSE 0 END) AS totalDikembalikan,
        SUM(CASE WHEN st.status_sla = 'Overdue' THEN 1 ELSE 0 END) AS totalOverdue
      FROM ref_unit_organisasi u
      LEFT JOIN usulan_layanan l ON l.unitOrganisasiId = u.id AND l.deleted_at IS NULL
      LEFT JOIN sla_tracker st ON st.usulanId = l.id
      WHERE u.is_opd = true
      GROUP BY u.id, u.nama
      ORDER BY totalUsulan DESC
      LIMIT ${safeLimit}
    `
  },
}
