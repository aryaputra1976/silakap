import { db } from '@/core/database/prisma.client'

const startOfDay = (date: Date): Date => {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

const endOfDay = (date: Date): Date => {
  const value = new Date(date)
  value.setHours(23, 59, 59, 999)
  return value
}

export async function generateLaporanHarian(tanggal: Date) {
  const start = startOfDay(tanggal)
  const end = endOfDay(tanggal)

  const [masuk, selesai, dikembalikan, melampaui] = await Promise.all([
    db.usulanLayanan.count({ where: { createdAt: { gte: start, lte: end }, deletedAt: null } }),
    db.usulanLayanan.count({ where: { tglSelesai: { gte: start, lte: end }, deletedAt: null } }),
    db.usulanLayanan.count({ where: { status: 'Dikembalikan', updatedAt: { gte: start, lte: end }, deletedAt: null } }),
    db.slaTracker.count({ where: { statusSla: 'Overdue', updatedAt: { gte: start, lte: end } } }),
  ])

  return db.laporanHarian.upsert({
    where: { tanggalLaporan: start },
    create: {
      tanggalLaporan: start,
      usulanMasuk: masuk,
      usulanSelesai: selesai,
      usulanDikembalikan: dikembalikan,
      melampauiSla: melampaui,
      generatedAt: new Date(),
      sentAt: new Date(),
    },
    update: {
      usulanMasuk: masuk,
      usulanSelesai: selesai,
      usulanDikembalikan: dikembalikan,
      melampauiSla: melampaui,
      generatedAt: new Date(),
      sentAt: new Date(),
    },
  })
}

export async function generateLaporanBulanan(tahun: number, bulan: number) {
  const start = new Date(tahun, bulan - 1, 1)
  const end = new Date(tahun, bulan, 0, 23, 59, 59, 999)

  const [selesai, melampaui, totalTracker] = await Promise.all([
    db.usulanLayanan.count({ where: { status: 'Selesai', tglSelesai: { gte: start, lte: end }, deletedAt: null } }),
    db.slaTracker.count({ where: { statusSla: 'Overdue', updatedAt: { gte: start, lte: end } } }),
    db.slaTracker.count({ where: { updatedAt: { gte: start, lte: end } } }),
  ])
  const capaiSlaPercent = totalTracker > 0 ? ((totalTracker - melampaui) / totalTracker) * 100 : null

  return db.laporanBulanan.upsert({
    where: { uk_tahun_bulan: { tahun, bulan } },
    create: {
      tahun,
      bulan,
      totalLayananSelesai: selesai,
      melampauiSlaCount: melampaui,
      capaiSlaPercent,
      generatedAt: new Date(),
      sentAt: new Date(),
    },
    update: {
      totalLayananSelesai: selesai,
      melampauiSlaCount: melampaui,
      capaiSlaPercent,
      generatedAt: new Date(),
      sentAt: new Date(),
    },
  })
}
