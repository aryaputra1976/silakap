import { db } from '@/core/database/prisma.client'
import { TahapUsulan, StatusSla } from '@prisma/client'
import type { Prisma } from '@prisma/client'

const TAHAP_TO_JABATAN: Partial<Record<TahapUsulan, string>> = {
  AP: 'AP',
  AM: 'AM',
  AD: 'AD',
  Kabid: 'Kabid',
  KepalaBadan: 'KepalaBadan',
}

export async function buatSlaTracker(
  usulanId: string,
  tahap: TahapUsulan,
  jenisLayananId: bigint,
  client: Prisma.TransactionClient = db,
): Promise<void> {
  const jabatan = TAHAP_TO_JABATAN[tahap]
  if (!jabatan) return

  const config =
    (await client.configSla.findFirst({ where: { jenisLayananId, jabatan } })) ??
    (await client.configSla.findFirst({ where: { jenisLayananId: null, jabatan } }))

  const slaHari = config?.slaHari ?? 1
  const slaJam = config?.slaJam ?? 0

  const masuk = new Date()
  const slaHabisAt = new Date(masuk)
  slaHabisAt.setDate(slaHabisAt.getDate() + slaHari)
  slaHabisAt.setHours(slaHabisAt.getHours() + slaJam)

  await client.slaTracker.create({
    data: {
      usulanId,
      tahapSaat: tahap,
      masukTahap: masuk,
      slaHari,
      slaJam,
      slaHabisAt,
      statusSla: StatusSla.OK,
    },
  })
}

export async function tutupSlaTracker(
  usulanId: string,
  tahap: TahapUsulan,
  client: Prisma.TransactionClient = db,
): Promise<void> {
  const trackers = await client.slaTracker.findMany({
    where: { usulanId, tahapSaat: tahap, selesaiAt: null },
  })

  const now = new Date()

  for (const tracker of trackers) {
    const overdue = tracker.slaHabisAt && now > tracker.slaHabisAt

    await client.slaTracker.update({
      where: { id: tracker.id },
      data: {
        selesaiAt: now,
        statusSla: overdue ? StatusSla.Overdue : StatusSla.OK,
      },
    })
  }
}