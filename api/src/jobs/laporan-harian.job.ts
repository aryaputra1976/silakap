import { generateLaporanHarian } from '@/modules/laporan/laporan.generator'
import { logger } from '@/core/logger/logger'

export async function jalankanLaporanHarian(): Promise<void> {
  const startMs = Date.now()
  const tanggal = new Date()
  logger.info('job:start', { job: 'laporan-harian', tanggal: tanggal.toISOString().slice(0, 10) })
  await generateLaporanHarian(tanggal)
  logger.info('job:done', { job: 'laporan-harian', durationMs: Date.now() - startMs })
}
