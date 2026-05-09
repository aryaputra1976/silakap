import { randomUUID } from 'crypto'
import { Prisma, StatusUsulan, TahapUsulan } from '@prisma/client'
import { layananRepository } from './layanan.repository'
import { workflowService } from '@/modules/workflow/workflow.service'
import { layananNumberingService } from './layanan-numbering.service'
import { layananDocumentService } from './layanan-document.service'
import { layananAccessPolicy } from './layanan-access.policy'
import { AppError } from '@/core/errors/app-error'
import { getPaginationParams, buildMeta } from '@/core/http/pagination.helper'
import { db } from '@/core/database/prisma.client'
import { logWorkflow } from './engine/workflow.engine'
import { workflowDecision } from '@/modules/workflow/workflow.decision'
import { tutupSlaTracker } from './engine/sla.engine'
import { buatSlaTracker } from './engine/sla.engine'
import { notificationEngine } from './engine/notification.engine'
import type { CreateUsulanDto, UploadDokumenDto } from './dto/layanan.dto'
import { ROLES } from '@/shared/constants'

type Actor = {
  id: string
  roleName: string
  unitOrganisasiId?: string
}

type LayananListQuery = {
  page?: unknown
  limit?: unknown
}

const ROLES_ALL_ACCESS = new Set<string>([
  ROLES.ANALIS_PERTAMA,
  ROLES.ANALIS_MUDA,
  ROLES.ANALIS_MADYA,
  ROLES.KABID,
  ROLES.KEPALA_BADAN,
  ROLES.ADMIN_SISTEM,
])

const assertCanAccessUsulan = (
  actor: Actor,
  usulanUnitOrganisasiId: bigint | string | null,
): void => {
  if (ROLES_ALL_ACCESS.has(actor.roleName)) return
  const unitId = usulanUnitOrganisasiId?.toString()
  if (!actor.unitOrganisasiId || actor.unitOrganisasiId !== unitId) {
    throw new AppError('Anda tidak memiliki akses ke usulan ini', 403)
  }
}

export const layananService = {
  async list(userId: string, role: string, unitOrganisasiId: string | undefined, query: LayananListQuery) {
    const { page, limit, skip } = getPaginationParams(query)
    const where: Prisma.UsulanLayananWhereInput = { deletedAt: null }

    // Pengelola_OPD hanya boleh melihat usulan milik unit organisasinya sendiri
    if (role === 'Pengelola_OPD') {
      if (!unitOrganisasiId) throw new AppError('Unit organisasi tidak ditemukan', 403)
      where.unitOrganisasiId = BigInt(unitOrganisasiId)
    }

    const [data, total] = await Promise.all([
      layananRepository.findList(where, skip, limit),
      layananRepository.countList(where),
    ])

    return { data, meta: buildMeta(total, page, limit) }
  },

  async detail(id: string, actor: Actor) {
    const usulan = await layananRepository.findByIdOrThrow(id)
    assertCanAccessUsulan(actor, usulan.unitOrganisasiId)
    const { usulanRevisi, ...rest } = usulan
    return { ...rest, revisi: usulanRevisi }
  },

  async create(dto: CreateUsulanDto, actor: Actor) {
    layananAccessPolicy.canCreate(actor.roleName)
    if (!actor.unitOrganisasiId) throw new AppError('Unit organisasi tidak ditemukan', 403)

    const nomorUsulan = await layananNumberingService.generate()

    return layananRepository.createDraft({
      id: randomUUID(),
      nomorUsulan,
      jenisLayanan: { connect: { id: dto.jenisLayananId } },
      asn: { connect: { id: dto.asnId } },
      unitOrganisasi: { connect: { id: BigInt(actor.unitOrganisasiId) } },
      diajukanOleh: { connect: { id: actor.id } },
      tanggalUsulan: dto.tanggalUsulan,
      status: StatusUsulan.Draft,
    })
  },

  async uploadDokumen(id: string, file: Express.Multer.File | undefined, dto: UploadDokumenDto, actor: Actor) {
    layananAccessPolicy.canUpload(actor.roleName)
    const usulan = await layananRepository.findByIdOrThrow(id)
    assertCanAccessUsulan(actor, usulan.unitOrganisasiId)
    return layananDocumentService.upload(id, file, dto, actor.id)
  },

  async submit(id: string, actor: Actor) {
    layananAccessPolicy.canSubmit(actor.roleName)

    const usulan = await layananRepository.findByIdOrThrow(id)
    assertCanAccessUsulan(actor, usulan.unitOrganisasiId)
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

  const decision = workflowDecision.forward(current)

  return db.$transaction(async (tx) => {
    const updated = await tx.usulanLayanan.update({
      where: { id },
      data: {
        tahapSaatIni: decision.to,
        status: decision.status,
      },
    })

    if (decision.closeSla) {
      await tutupSlaTracker(id, current, tx)
    }

    if (decision.openSla && decision.to) {
      await buatSlaTracker(id, decision.to, usulan.jenisLayananId, tx)
    }

    await logWorkflow(id, decision.from, decision.to, 'TERUSKAN', actor.id, catatan, tx)

    // 🔥 NOTIFICATION
    await notificationEngine.notifyNextRole(decision.to, `Usulan ${id} masuk ke tahap berikutnya`)

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
    const usulan = await layananRepository.findByIdOrThrow(id)
    assertCanAccessUsulan(actor, usulan.unitOrganisasiId)
    return layananDocumentService.getOutput(id)
  },
}
