// instrument MUST be the first import so Sentry captures all errors
import './instrument'
import './register-paths'
import * as Sentry from '@sentry/node'
import { env } from '@/core/config/env'
import { auditEnv } from '@/core/config/env-audit'
import { db } from '@/core/database/prisma.client'
import { logger } from '@/core/logger/logger'
import { app } from './app'
import { jalankanSlaChecker } from '@/jobs/sla-checker.job'
import { jalankanInactiveAccountDisable } from '@/jobs/inactive-account.job'

async function bootstrap(): Promise<void> {
  // Tampilkan hasil audit konfigurasi saat startup
  const envAudit = auditEnv()
  for (const item of envAudit.items) {
    if (item.status === 'critical') logger.error(`[ENV] ${item.key}: ${item.message}`)
    else if (item.status === 'warning') logger.warn(`[ENV] ${item.key}: ${item.message}`)
  }
  logger.info('env-audit selesai', { status: envAudit.status, totalItem: envAudit.items.length })

  await db.$connect()
  logger.info('Database connected')

  // process.env.PORT di-inject otomatis oleh Hostinger Node.js manager
  const port = process.env.PORT ?? env.PORT

  const server = app.listen(port, () => {
    logger.info(`SILAKAP API berjalan di port ${port} [${env.NODE_ENV}]`)
  })

  // Cegah Slowloris attack — client yang kirim header sangat lambat
  server.keepAliveTimeout = 65_000
  server.headersTimeout = 66_000

  const SLA_INTERVAL_MS = 60 * 60 * 1000 // setiap 1 jam
  const slaCron = setInterval(async () => {
    try {
      await jalankanSlaChecker()
    } catch (err) {
      logger.error('SLA checker gagal', { err })
    }
  }, SLA_INTERVAL_MS)

  // Jalankan sekali saat startup, lalu setiap 24 jam
  const INACTIVE_INTERVAL_MS = 24 * 60 * 60 * 1000
  void jalankanInactiveAccountDisable()
  const inactiveCron = setInterval(async () => {
    try {
      await jalankanInactiveAccountDisable()
    } catch (err) {
      logger.error('Inactive account job gagal', { err })
    }
  }, INACTIVE_INTERVAL_MS)

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Menerima ${signal}, mematikan server`)
    clearInterval(slaCron)
    clearInterval(inactiveCron)
    server.close(async () => {
      await db.$disconnect()
      logger.info('Database disconnected')
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10_000).unref()
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'))
  process.on('SIGINT', () => void shutdown('SIGINT'))
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error })
    Sentry.captureException(error)
    void shutdown('uncaughtException')
  })
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason })
    Sentry.captureException(reason)
  })
}

bootstrap().catch(async (error: unknown) => {
  logger.error('Gagal menjalankan server', { error })
  await db.$disconnect()
  process.exit(1)
})
