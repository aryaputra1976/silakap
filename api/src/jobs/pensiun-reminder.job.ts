import { db } from '@/core/database/prisma.client'
import { ROLES } from '@/shared/constants'
import { notifikasiService } from '@/modules/notifikasi'

export async function jalankanPensiunReminder(): Promise<{ count: number }> {
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

  return { count: approaching.length }
}
