import { db } from '@/core/database/prisma.client'

export const notificationEngine = {
  async notifyNextRole(roleName: string, message: string) {
    const users = await db.user.findMany({
      where: {
        role: { nama: roleName },
        isActive: true,
      },
      select: { id: true },
    })

    if (users.length === 0) return

    await db.notifikasi.createMany({
      data: users.map((u) => ({
        userId: u.id,
        type: 'INFO',
        judul: 'Notifikasi Sistem',
        isi: message,
        link: null,
        isRead: false,
      })),
    })
  },

  async notifyUser(userId: string, message: string) {
    await db.notifikasi.create({
      data: {
        userId,
        type: 'INFO',
        judul: 'Notifikasi Sistem',
        isi: message,
        link: null,
        isRead: false,
      },
    })
  },
}