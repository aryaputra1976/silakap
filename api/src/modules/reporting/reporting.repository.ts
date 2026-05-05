import { db } from '@/core/database/prisma.client'
import { StatusUsulan } from '@prisma/client'

export const reportingRepository = {
  async summaryRange(start: Date, end: Date) {
    const where = {
      deletedAt: null,
      createdAt: { gte: start, lt: end },
    }

    const total = await db.usulanLayanan.count({ where })

    const byStatusRows = await db.usulanLayanan.groupBy({
      by: ['status'],
      _count: { _all: true },
      where,
    })

    const byStatus: Record<string, number> = {}
    for (const r of byStatusRows) {
      byStatus[r.status] = r._count._all
    }

    const byTahapRows = await db.usulanLayanan.groupBy({
      by: ['tahapSaatIni'],
      _count: { _all: true },
      where,
    })

    const byTahap: Record<string, number> = {}
    for (const r of byTahapRows) {
      byTahap[String(r.tahapSaatIni)] = r._count._all
    }

    const slaTotal = await db.slaTracker.count({
      where: { createdAt: { gte: start, lt: end } },
    })

    const slaOverdue = await db.slaTracker.count({
      where: {
        createdAt: { gte: start, lt: end },
        selesaiAt: null,
        slaHabisAt: { lt: new Date() },
      },
    })

    const slaSelesai = await db.slaTracker.count({
      where: {
        createdAt: { gte: start, lt: end },
        selesaiAt: { not: null },
      },
    })

    const list = await db.usulanLayanan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        asn: { select: { nama: true, nipBaru: true } },
        jenisLayanan: { select: { nama: true } },
      },
    })

    return {
      total,
      byStatus,
      byTahap,
      sla: { total: slaTotal, overdue: slaOverdue, selesai: slaSelesai },
      list,
    }
  },
}