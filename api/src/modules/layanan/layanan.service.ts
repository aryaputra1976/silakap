import { randomUUID } from 'crypto'
import { StatusUsulan, TahapUsulan } from '@prisma/client'
import { layananRepository } from './layanan.repository'
import { workflowService } from '@/modules/workflow/workflow.service'
import { layananNumberingService } from './layanan-numbering.service'
import { layananDocumentService } from './layanan-document.service'
import { layananAccessPolicy } from './layanan-access.policy'
import { AppError } from '@/core/errors/app-error'
import { getPaginationParams, buildMeta } from '@/core/http/pagination.helper'
import { db } from '@/core/database/prisma.client'
import { logWorkflow } from './engine/workflow.engine'

type Actor = {
  id: string
  roleName: string
}

export const layananService = {
  async list(userId: string, role: string, query: any) {
    const { page, limit, skip } = getPaginationParams(query)
    const where: any = { deletedAt: null }

    const [data, total] = await Promise.all([
      layananRepository.findList(where, skip, limit),
      layananRepository.countList(where),
    ])

    return { data, meta: buildMeta(total, page, limit) }
  },

  async detail(id: string) {
    return layananRepository.findByIdOrThrow(id)
  },

  async create(dto: any, actor: Actor) {
    layananAccessPolicy.canCreate(actor.roleName)

    const nomorUsulan = await layananNumberingService.generate()

    return layananRepository.createDraft({
      id: randomUUID(),
      nomorUsulan,
      jenisLayanan: { connect: { id: dto.jenisLayananId } },
      asn: { connect: { id: dto.asnId } },
      unitOrganisasi: { connect: { id: dto.unitOrganisasiId } },
      diajukanOleh: { connect: { id: actor.id } },
      tanggalUsulan: dto.tanggalUsulan,
      status: StatusUsulan.Draft,
    })
  },

  async uploadDokumen(id: string, file: any, dto: any, actor: Actor) {
    layananAccessPolicy.canUpload(actor.roleName)
    return layananDocumentService.upload(id, file, dto, actor.id)
  },

  async submit(id: string, actor: Actor) {
    layananAccessPolicy.canSubmit(actor.roleName)

    const usulan = await layananRepository.findByIdOrThrow(id)
    if (usulan.status !== StatusUsulan.Draft) {
      throw new AppError('Invalid status', 422)
    }

    return db.$transaction(async (tx) => {
      const updated = await tx.usulanLayanan.update({
        where: { id },
        data: { status: StatusUsulan.Diajukan },
      })

      await logWorkflow(id, null, null, 'SUBMIT', actor.id, undefined, tx)
      return updated
    })
  },

  async terima(id: string, actor: Actor) {
    layananAccessPolicy.canTerima(actor.roleName)

    return db.$transaction(async (tx) => {
      const updated = await tx.usulanLayanan.update({
        where: { id },
        data: {
          status: StatusUsulan.VerifikasiAP,
          tahapSaatIni: TahapUsulan.AP,
        },
      })

      await logWorkflow(id, null, TahapUsulan.AP, 'TERIMA', actor.id, undefined, tx)
      return updated
    })
  },

  async teruskan(id: string, catatan: string, actor: Actor) {
    const usulan = await layananRepository.findByIdOrThrow(id)

    const current = usulan.tahapSaatIni
    if (!current) throw new AppError('Tahap invalid', 422)

    layananAccessPolicy.canProcess(actor.roleName, current)

    const next = workflowService.resolveNextTahap(current)

    return db.$transaction(async (tx) => {
      const updated = await tx.usulanLayanan.update({
        where: { id },
        data: {
          tahapSaatIni: next,
          status: workflowService.statusByTahap[next],
        },
      })

      await logWorkflow(id, current, next, 'TERUSKAN', actor.id, catatan, tx)
      return updated
    })
  },

  async kembalikan(id: string, alasan: string, actor: Actor) {
    const usulan = await layananRepository.findByIdOrThrow(id)

    const current = usulan.tahapSaatIni
    if (!current) throw new AppError('Tahap invalid', 422)

    layananAccessPolicy.canProcess(actor.roleName, current)

    const prev = workflowService.resolvePreviousTahap(current)

    return db.$transaction(async (tx) => {
      const updated = await tx.usulanLayanan.update({
        where: { id },
        data: {
          status: StatusUsulan.Dikembalikan,
          tahapSaatIni: prev,
          alasanPenolakan: alasan,
        },
      })

      await logWorkflow(id, current, prev, 'KEMBALIKAN', actor.id, alasan, tx)
      return updated
    })
  },

  async setujui(id: string, catatan: string, actor: Actor) {
    layananAccessPolicy.canApprove(actor.roleName)

    return db.$transaction(async (tx) => {
      const updated = await tx.usulanLayanan.update({
        where: { id },
        data: {
          status: StatusUsulan.Selesai,
          tglSelesai: new Date(),
        },
      })

      await logWorkflow(id, null, null, 'SETUJUI', actor.id, catatan, tx)
      return updated
    })
  },

  async batal(id: string, alasan: string, actor: Actor) {
    layananAccessPolicy.canCancel(actor.roleName)

    return db.$transaction(async (tx) => {
      const updated = await tx.usulanLayanan.update({
        where: { id },
        data: {
          status: StatusUsulan.Ditolak,
          alasanPenolakan: alasan,
        },
      })

      await logWorkflow(id, null, null, 'BATAL', actor.id, alasan, tx)
      return updated
    })
  },

  async resubmit(id: string, catatan: string, actor: Actor) {
    layananAccessPolicy.canSubmit(actor.roleName)

    return db.$transaction(async (tx) => {
      const updated = await tx.usulanLayanan.update({
        where: { id },
        data: { status: StatusUsulan.Diajukan },
      })

      await logWorkflow(id, null, null, 'RESUBMIT', actor.id, catatan, tx)
      return updated
    })
  },

  async dokumenOutput(id: string, actor: Actor) {
    return layananDocumentService.getOutput(id)
  },
}