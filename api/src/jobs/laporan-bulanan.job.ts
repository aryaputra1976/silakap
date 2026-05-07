import { generateLaporanBulanan } from '@/modules/laporan/laporan.generator'
import { logger } from '@/core/logger/logger'

export async function jalankanLaporanBulanan(): Promise<void> {
  const startMs = Date.now()
  const now = new Date()
  const bulanLalu = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const tahun = bulanLalu.getFullYear()
  const bulan = bulanLalu.getMonth() + 1
  logger.info('job:start', { job: 'laporan-bulanan', tahun, bulan })
  await generateLaporanBulanan(tahun, bulan)
  logger.info('job:done', { job: 'laporan-bulanan', durationMs: Date.now() - startMs, tahun, bulan })
}
