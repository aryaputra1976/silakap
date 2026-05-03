import { db } from '@/core/database/prisma.client'

export const workflowQueryService = {
  history(usulanId: string) {
    return db.usulanWorkflowLog.findMany({
      where: { usulanLayananId: usulanId },
      include: {
        dilakukanOleh: {
          select: {
            id: true,
            namaLengkap: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })
  },

  slaStatus(usulanId: string) {
    return db.slaTracker.findMany({
      where: { usulanId },
      orderBy: { masukTahap: 'asc' },
    })
  },

  revisi(usulanId: string) {
    return db.usulanRevisi.findMany({
      where: { usulanId },
      include: {
        dikembalikanOleh: {
          select: {
            id: true,
            namaLengkap: true,
          },
        },
        resubmitOleh: {
          select: {
            id: true,
            namaLengkap: true,
          },
        },
      },
      orderBy: { nomorRevisi: 'asc' },
    })
  },
}