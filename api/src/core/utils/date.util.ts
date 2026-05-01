export const hitungMasaKerja = (tmtPns: Date): { tahun: number; bulan: number } => {
  const now = new Date()
  let tahun = now.getFullYear() - tmtPns.getFullYear()
  let bulan = now.getMonth() - tmtPns.getMonth()

  if (now.getDate() < tmtPns.getDate()) bulan -= 1
  if (bulan < 0) {
    tahun -= 1
    bulan += 12
  }

  return { tahun: Math.max(tahun, 0), bulan: Math.max(bulan, 0) }
}

export const hitungBup = (tanggalLahir: Date, bupUsia: number): Date => {
  const bup = new Date(tanggalLahir)
  bup.setFullYear(bup.getFullYear() + bupUsia)
  return bup
}

export const formatTanggal = (date: Date): string =>
  new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)

export const isOverdue = (slaHabisAt: Date): boolean => slaHabisAt.getTime() < Date.now()
