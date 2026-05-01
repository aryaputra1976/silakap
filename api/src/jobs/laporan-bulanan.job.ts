import { generateLaporanBulanan } from '@/modules/laporan/laporan.generator'

export async function jalankanLaporanBulanan(): Promise<void> {
  const now = new Date()
  const bulanLalu = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  await generateLaporanBulanan(bulanLalu.getFullYear(), bulanLalu.getMonth() + 1)
}
