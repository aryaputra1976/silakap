import { db } from '@/core/database/prisma.client'
import { TahapUsulan } from '@prisma/client'

const TAHAP_TO_JABATAN: Record<TahapUsulan, string> = {
  AP: 'AP',
  AM: 'AM',
  AD: 'AD',
  Kabid: 'Kabid',
  KepalaBadan: 'KepalaBadan',
}

export const slaEngine = {
  async open(usulanId: string, tahap: TahapUsulan, jenisLayananId: bigint, tx = db) {
    const jabatan = TAHAP_TO_JABATAN[tahap]

    const config =
      (await tx.configSla.findFirst({ where: { jenisLayananId, jabatan } })) ??
      (await tx.configSla.findFirst({ where: { jenisLayananId: null, jabatan } }))

    const slaHari = config?.slaHari ?? 1
    const slaJam = config?.slaJam ?? 0

    const now = new Date()
    const due = new Date(now)
    due.setDate(due.getDate() + slaHari)
    due.setHours(due.getHours() + slaJam)

    await tx.slaTracker.create({
      data: {
        usulanId,
        tahapSaat: tahap,
        masukTahap: now,
        slaHari,
        slaJam,
        slaHabisAt: due,
      },
    })
  },

  async close(usulanId: string, tahap: TahapUsulan, tx = db) {
    const tracker = await tx.slaTracker.findFirst({
      where: { usulanId, tahapSaat: tahap, selesaiAt: null },
    })

    if (!tracker) return

    const now = new Date()
    const overdue = now > tracker.slaHabisAt

    await tx.slaTracker.update({
      where: { id: tracker.id },
      data: {
        selesaiAt: now,
        statusSla: overdue ? 'Overdue' : 'OK',
      },
    })
  },

  async checkOverdue() {
    const now = new Date()

    return db.slaTracker.updateMany({
      where: {
        selesaiAt: null,
        slaHabisAt: { lt: now },
      },
      data: {
        statusSla: 'Overdue',
      },
    })
  },
}