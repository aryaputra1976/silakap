import { db } from '@/core/database/prisma.client'
import { ROLES } from '@/shared/constants'
import { notifikasiService } from '@/modules/notifikasi'
import { logger } from '@/core/logger/logger'

export async function jalankanPensiunReminder(): Promise<{ count: number }> {
  const startMs = Date.now()
  logger.info('job:start', { job: 'pensiun-reminder' })
  const tigaPuluhHari = new Date()
  tigaPuluhHari.setDate(tigaPuluhHari.getDate() + 30)

  const approaching = await db.perencanaanPensiun.findMany({
    where: { tanggalBup: { lte: tigaPuluhHari }, sudahDiproses: false },
    include: { asn: { select: { nama: true, nipBaru: true } } },
  })

  if (approaching.length > 0) {
    const namaList = approaching
      .slice(0, 5)
      .map((item) => item.asn.nama)
      .join(', ')
    const isi = `${approaching.length} ASN akan memasuki BUP dalam 30 hari: ${namaList}${approaching.length > 5 ? ', ...' : ''}`

    await Promise.all([
      notifikasiService.sendToRole(ROLES.KABID, {
        type: 'PENSIUN_REMINDER',
        judul: 'Pengingat BUP',
        isi,
        link: '/perencanaan/pensiun',
      }),
      notifikasiService.sendToRole(ROLES.KEPALA_BADAN, {
        type: 'PENSIUN_REMINDER',
        judul: 'Pengingat BUP',
        isi,
        link: '/perencanaan/pensiun',
      }),
    ])

    await db.perencanaanPensiun.updateMany({
      where: { id: { in: approaching.map((item) => item.id) } },
      data: { sudahDiproses: true },
    })
  }

  const result = { count: approaching.length }
  logger.info('job:done', { job: 'pensiun-reminder', durationMs: Date.now() - startMs, ...result })
  return result
}
