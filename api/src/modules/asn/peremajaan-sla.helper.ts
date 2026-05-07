const DAY_MS = 24 * 60 * 60 * 1000

export const getPeremajaanSlaHari = (jenisPerubahan: string, dataBaru?: unknown): number => {
  const keys = dataBaru && typeof dataBaru === 'object' ? Object.keys(dataBaru as Record<string, unknown>) : []
  if (keys.some((key) => ['kontakAlamat', 'nomorHp', 'email', 'emailGov', 'alamat'].includes(key))) return 2
  if (jenisPerubahan === 'Pendidikan' || jenisPerubahan === 'Data Keluarga') return 3
  return 5
}

export const getPeremajaanNamaLayanan = (jenisPerubahan: string, dataBaru?: unknown): string => {
  const keys = dataBaru && typeof dataBaru === 'object' ? Object.keys(dataBaru as Record<string, unknown>) : []
  if (jenisPerubahan === 'Pendidikan') return 'Update ijazah / gelar'
  if (jenisPerubahan === 'Data Keluarga') return 'Data keluarga'
  if (jenisPerubahan === 'Jabatan') return 'Riwayat jabatan'
  if (jenisPerubahan === 'Golongan') return 'Golongan / pangkat'
  if (keys.some((key) => ['kontakAlamat', 'nomorHp', 'email', 'emailGov', 'alamat'].includes(key))) return 'Kontak & alamat'
  if (keys.includes('nama')) return 'Perubahan nama'
  return jenisPerubahan || 'Peremajaan ASN'
}

export const getPeremajaanSlaStatus = (createdAt: Date, totalSla: number, now = new Date()) => {
  const hariKe = Math.max(1, Math.ceil((now.getTime() - createdAt.getTime()) / DAY_MS))
  const statusSla = hariKe > totalSla ? 'Overdue' : hariKe >= totalSla ? 'Warning' : 'OK'
  return { hariKe, totalSla, statusSla: statusSla as 'OK' | 'Warning' | 'Overdue' }
}

export const isPeremajaanDalamSla = (createdAt: Date, selesaiAt: Date | null, jenisPerubahan: string, dataBaru?: unknown) => {
  if (!selesaiAt) return false
  const totalSla = getPeremajaanSlaHari(jenisPerubahan, dataBaru)
  const elapsedHari = Math.ceil((selesaiAt.getTime() - createdAt.getTime()) / DAY_MS)
  return elapsedHari <= totalSla
}
