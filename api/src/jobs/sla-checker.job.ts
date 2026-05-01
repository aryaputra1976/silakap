import { db } from '@/core/database/prisma.client'
import { ROLES } from '@/shared/constants'
import { notifikasiService } from '@/modules/notifikasi'

export async function jalankanSlaChecker(): Promise<{ warning: number; overdue: number }> {
  const now = new Date()
  const warningThreshold = new Date(now.getTime() + 4 * 60 * 60 * 1000)

  const [warnings, overdues] = await Promise.all([
    db.slaTracker.updateMany({
      where: { statusSla: 'OK', slaHabisAt: { lte: warningThreshold }, selesaiAt: null },
      data: { statusSla: 'Warning' },
    }),
    db.slaTracker.updateMany({
      where: { statusSla: { in: ['OK', 'Warning'] }, slaHabisAt: { lt: now }, selesaiAt: null },
      data: { statusSla: 'Overdue' },
    }),
  ])

  if (overdues.count > 0) {
    await notifikasiService.sendToRole(ROLES.KABID, {
      type: 'SLA_OVERDUE',
      judul: 'SLA Terlampaui',
      isi: `${overdues.count} berkas melampaui batas waktu SLA`,
      link: '/dashboard',
    })
  }

  return { warning: warnings.count, overdue: overdues.count }
}
