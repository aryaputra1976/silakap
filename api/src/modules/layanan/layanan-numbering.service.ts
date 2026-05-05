import { db } from '@/core/database/prisma.client'

export const layananNumberingService = {
  async generate(): Promise<string> {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')

    const start = new Date(year, now.getMonth(), 1)
    const end = new Date(year, now.getMonth() + 1, 1)

    const count = await db.usulanLayanan.count({
      where: {
        createdAt: {
          gte: start,
          lt: end,
        },
      },
    })

    return `USL/${year}/${month}/${String(count + 1).padStart(5, '0')}`
  },
}