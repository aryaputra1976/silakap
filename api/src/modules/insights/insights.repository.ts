import { db } from '@/core/database/prisma.client'

export const insightsRepository = {
  activeUsulan() {
    return db.usulanLayanan.findMany({
      where: {
        deletedAt: null,
        status: {
          in: [
            'Diajukan',
            'VerifikasiAP',
            'VerifikasiAM',
            'QualityControl',
            'ApprovalKabid',
            'ApprovalKepalaBadan',
          ],
        },
      },
      include: {
        asn: { select: { nama: true, nipBaru: true } },
        jenisLayanan: { select: { nama: true } },
        slaTracker: {
          where: { selesaiAt: null },
          orderBy: { masukTahap: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'asc' },
    })
  },

  overdueSla() {
    return db.slaTracker.findMany({
      where: {
        selesaiAt: null,
        slaHabisAt: { lt: new Date() },
      },
      include: {
        usulanLayanan: {
          include: {
            asn: { select: { nama: true, nipBaru: true } },
            jenisLayanan: { select: { nama: true } },
          },
        },
      },
      orderBy: { slaHabisAt: 'asc' },
    })
  },

  workloadByTahap() {
    return db.usulanLayanan.groupBy({
      by: ['tahapSaatIni'],
      where: {
        deletedAt: null,
        status: {
          in: [
            'Diajukan',
            'VerifikasiAP',
            'VerifikasiAM',
            'QualityControl',
            'ApprovalKabid',
            'ApprovalKepalaBadan',
          ],
        },
      },
      _count: { _all: true },
    })
  },
}