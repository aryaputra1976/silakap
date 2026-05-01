// instrument MUST be the first import so Sentry captures all errors
import './instrument'
import './register-paths'
import * as Sentry from '@sentry/node'
import { env } from '@/core/config/env'
import { db } from '@/core/database/prisma.client'
import { logger } from '@/core/logger/logger'
import { app } from './app'

async function bootstrap(): Promise<void> {
  await db.$connect()
  logger.info('Database connected')

  // process.env.PORT di-inject otomatis oleh Hostinger Node.js manager
  const port = process.env.PORT ?? env.PORT

  const server = app.listen(port, () => {
    logger.info(`SILAKAP API berjalan di port ${port} [${env.NODE_ENV}]`)
  })

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Menerima ${signal}, mematikan server`)
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
