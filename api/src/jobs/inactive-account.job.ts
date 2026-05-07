import { db } from '@/core/database/prisma.client'
import { env } from '@/core/config/env'
import { logger } from '@/core/logger/logger'
import { ROLES } from '@/shared/constants'

export async function jalankanInactiveAccountDisable(): Promise<{ disabled: number }> {
  const startMs = Date.now()
  logger.info('job:start', { job: 'inactive-account' })

  if (env.INACTIVE_ACCOUNT_DAYS === 0) {
    logger.info('job:done', { job: 'inactive-account', durationMs: 0, disabled: 0, skipped: 'INACTIVE_ACCOUNT_DAYS=0' })
    return { disabled: 0 }
  }

  const cutoff = new Date(Date.now() - env.INACTIVE_ACCOUNT_DAYS * 86_400_000)

  // Cari user aktif yang tidak login melebihi batas hari — kecuali Admin_Sistem
  const inactive = await db.user.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      role: { nama: { not: ROLES.ADMIN_SISTEM }, deletedAt: null },
      OR: [
        { lastLogin: { lt: cutoff } },
        // User yang belum pernah login sama sekali: gunakan createdAt sebagai referensi
        { lastLogin: null, createdAt: { lt: cutoff } },
      ],
    },
    select: { id: true, namaLengkap: true, username: true },
  })

  if (inactive.length === 0) {
    const result = { disabled: 0 }
    logger.info('job:done', { job: 'inactive-account', durationMs: Date.now() - startMs, ...result })
    return result
  }

  const ids = inactive.map((u) => u.id)

  // Disable akun + revoke semua sesi aktif + catat audit log
  await db.$transaction(async (tx) => {
    await tx.user.updateMany({ where: { id: { in: ids } }, data: { isActive: false } })
    await tx.refreshToken.updateMany({
      where: { userId: { in: ids }, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    for (const user of inactive) {
      await tx.auditLog.create({
        data: {
          userId: user.id,
          userNama: user.namaLengkap,
          action: 'AUTO_DISABLE_INACTIVE',
          entityType: 'User',
          entityId: user.id,
          newValues: {
            reason: `Tidak aktif selama lebih dari ${env.INACTIVE_ACCOUNT_DAYS} hari`,
            isActive: false,
          },
        },
      })
    }
  })

  const result = { disabled: inactive.length }
  logger.info('job:done', { job: 'inactive-account', durationMs: Date.now() - startMs, ...result })
  return result
}
