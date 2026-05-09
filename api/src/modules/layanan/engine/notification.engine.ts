import type { TahapUsulan } from '@prisma/client'
import { notifikasiService } from '@/modules/notifikasi'
import { roleByTahap } from '@/modules/workflow/workflow.service'

export const notificationEngine = {
  async notifyNextRole(tahap: TahapUsulan | null, message: string) {
    if (!tahap) return

    const roleName = roleByTahap[tahap]
    await notifikasiService.sendToRole(roleName, {
      type: 'WORKFLOW',
      judul: 'Notifikasi Workflow SILAKAP',
      isi: message,
      link: '/layanan',
    })
  },

  async notifyUser(userId: string, message: string) {
    await notifikasiService.sendToUser(userId, {
      type: 'WORKFLOW',
      judul: 'Notifikasi Workflow SILAKAP',
      isi: message,
      link: '/layanan',
    })
  },
}
