import { generateLaporanHarian } from '@/modules/laporan/laporan.generator'

export async function jalankanLaporanHarian(): Promise<void> {
  await generateLaporanHarian(new Date())
}
