import { db } from '@/core/database/prisma.client'

export async function checkSlaOverdue() {
  const now = new Date()

  await db.slaTracker.updateMany({
    where: {
      selesaiAt: null,
      slaHabisAt: { lt: now },
    },
    data: {
      statusSla: 'Overdue',
    },
  })
}