import { logger } from '@/core/logger/logger'
import { perencanaanService } from '@/modules/perencanaan/perencanaan.service'

export async function jalankanPensiunReminder(): Promise<{ created: number; notified: number }> {
  const startMs = Date.now()
  logger.info('job:start', { job: 'pensiun-reminder' })
  const result = await perencanaanService.scanBupHarian()
  logger.info('job:done', { job: 'pensiun-reminder', durationMs: Date.now() - startMs, ...result })
  return result
}

export async function jalankanPensiunCleanup(): Promise<{ cleaned: number }> {
  const startMs = Date.now()
  logger.info('job:start', { job: 'pensiun-cleanup' })
  const result = await perencanaanService.cleanupStaleDrafts()
  logger.info('job:done', { job: 'pensiun-cleanup', durationMs: Date.now() - startMs, ...result })
  return result
}
