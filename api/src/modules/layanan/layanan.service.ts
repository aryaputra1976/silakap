import { createHash, randomUUID } from 'node:crypto'
import { createReadStream, promises as fs } from 'node:fs'
import path from 'node:path'
import type { Express } from 'express'
import { Prisma, StatusTte, StatusUsulan, TahapUsulan } from '@prisma/client'
import { env } from '@/core/config/env'
import { db } from '@/core/database/prisma.client'
import { AppError } from '@/core/errors/app-error'
import { buildMeta, getPaginationParams } from '@/core/http/pagination.helper'
import { MAX_REVISI, ROLES } from '@/shared/constants'
import { notifikasiService } from '@/modules/notifikasi/notifikasi.service'
import type {
  BatalDto,
  CreateUsulanDto,
  KembalikanDto,
  ResubmitDto,
  SetujuiDto,
  TeruskanDto,
  UploadDokumenDto,
} from './dto/layanan.dto'
import { buatSlaTracker, tutupSlaTracker } from './engine/sla.engine'
import { workflowService } from '@/modules/workflow/workflow.service'
import { logWorkflow } from './engine/workflow.engine'

type Actor = Express.Request['user']

type UsulanWithJenis = Prisma.UsulanLayananGetPayload<{
  include: { jenisLayanan: true }
}>

const processingStatuses = [
  StatusUsulan.Diajukan,
  StatusUsulan.VerifikasiAP,
  StatusUsulan.VerifikasiAM,
  StatusUsulan.QualityControl,
  StatusUsulan.ApprovalKabid,
  StatusUsulan.ApprovalKepalaBadan,
]

const statusByTahap: Record<TahapUsulan, StatusUsulan> = {
  [TahapUsulan.AP]: StatusUsulan.VerifikasiAP,
  [TahapUsulan.AM]: StatusUsulan.VerifikasiAM,
  [TahapUsulan.AD]: StatusUsulan.QualityControl,
  [TahapUsulan.Kabid]: StatusUsulan.ApprovalKabid,
  [TahapUsulan.KepalaBadan]: StatusUsulan.ApprovalKepalaBadan,
}

const roleByTahap: Record<TahapUsulan, string> = {
  [TahapUsulan.AP]: ROLES.ANALIS_PERTAMA,
  [TahapUsulan.AM]: ROLES.ANALIS_MUDA,
  [TahapUsulan.AD]: ROLES.ANALIS_MADYA,
  [TahapUsulan.Kabid]: ROLES.KABID,
  [TahapUsulan.KepalaBadan]: ROLES.KEPALA_BADAN,
}

const masukFieldByTahap: Record<TahapUsulan, keyof Prisma.UsulanLayananUncheckedUpdateInput> = {
  [TahapUsulan.AP]: 'tglMasukAp',
  [TahapUsulan.AM]: 'tglMasukAm',
  [TahapUsulan.AD]: 'tglMasukAd',
  [TahapUsulan.Kabid]: 'tglMasukKabid',
  [TahapUsulan.KepalaBadan]: 'tglMasukKepalaBadan',
}

const catatanFieldByTahap: Record<TahapUsulan, keyof Prisma.UsulanLayananUncheckedUpdateInput> = {
  [TahapUsulan.AP]: 'catatanAp',
  [TahapUsulan.AM]: 'catatanAm',
  [TahapUsulan.AD]: 'catatanAd',
  [TahapUsulan.Kabid]: 'catatanKabid',
  [TahapUsulan.KepalaBadan]: 'catatanKepalaBadan',
}

const assertRole = (actor: Actor, ...roles: string[]): void => {
  if (!actor || !roles.includes(actor.roleName)) {
    throw new AppError('Anda tidak memiliki akses ke fitur ini', 403)
  }
}

const requireUsulan = async (id: string): Promise<UsulanWithJenis> => {
  const usulan = await db.usulanLayanan.findFirst({
    where: { id, deletedAt: null },
    include: { jenisLayanan: true },
  })
  if (!usulan) throw new AppError('Data tidak ditemukan', 404)
  return usulan
}

const nextRevisionNumber = async (usulanId: string): Promise<number> => {
  const latest = await db.usulanRevisi.findFirst({
    where: { usulanId },
    orderBy: { nomorRevisi: 'desc' },
    select: { nomorRevisi: true },
  })
  const current = latest?.nomorRevisi ?? 0
  if (current >= MAX_REVISI) throw new AppError('Batas maksimum revisi tercapai', 422)
  return current + 1
}

const generateNomorUsulan = async (): Promise<string> => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const count = await db.usulanLayanan.count()
  return `USL/${year}/${month}/${String(count + 1).padStart(5, '0')}`
}

const hashFile = (path: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    const stream = createReadStream(path)
    stream.on('error', reject)
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
  })

const ensureDokumenOutput = async (usulanId: string, actor: Actor): Promise<void> => {
  const usulan = await db.usulanLayanan.findUnique({
    where: { id: usulanId },
    include: {
      asn: { select: { nama: true, nipBaru: true } },
      jenisLayanan: { select: { nama: true, kode: true } },
      unitOrganisasi: { select: { nama: true } },
    },
  })
  if (!usulan) throw new AppError('Data tidak ditemukan', 404)

  const outputDir = path.join(env.UPLOAD_DIR, 'dokumen-output')
  await fs.mkdir(outputDir, { recursive: true })
  const filename = `${usulan.nomorUsulan.replace(/[\\/]/g, '-')}-hasil.txt`
  const filePath = path.join(outputDir, filename)
  const content = [
    'DOKUMEN HASIL LAYANAN SILAKAP',
    `Nomor Usulan: ${usulan.nomorUsulan}`,
    `Jenis Layanan: ${usulan.jenisLayanan.nama}`,
    `ASN: ${usulan.asn.nama}`,
    `NIP: ${usulan.asn.nipBaru}`,
    `Unit: ${usulan.unitOrganisasi.nama}`,
    `Status: ${usulan.status}`,
    `Tanggal Selesai: ${usulan.tglSelesai?.toISOString() ?? new Date().toISOString()}`,
    `Ditandatangani/Disahkan oleh: ${actor?.namaLengkap ?? 'Sistem'}`,
  ].join('\n')
  await fs.writeFile(filePath, content, 'utf8')
  const digest = createHash('sha256').update(content).digest('hex')

  await db.usulanDokumenOutput.create({
    data: {
      usulanLayananId: usulanId,
      jenisDokumen: usulan.jenisLayanan.nama,
      nomorDokumen: usulan.nomorUsulan,
      tanggalDokumen: new Date(),
      namaFile: filename,
      pathFile: filePath,
      hashFile: digest,
      tteOlehId: actor?.id,
      tglTte: new Date(),
      statusTte: StatusTte.Signed,
    },
  })
}

const sendToRole = (roleName: string, judul: string, usulanId: string): Promise<void> =>
  notifikasiService.sendToRole(roleName, {
    type: 'workflow',
    judul,
    isi: 'Ada pembaruan usulan layanan yang perlu ditindaklanjuti.',
    link: `/layanan/${usulanId}`,
  })

const sendToSubmitter = (usulan: { diajukanOlehId: string | null }, judul: string, usulanId: string): Promise<void> =>
  usulan.diajukanOlehId
    ? notifikasiService.sendToUser(usulan.diajukanOlehId, {
        type: 'workflow',
        judul,
        isi: 'Status usulan layanan Anda diperbarui.',
        link: `/layanan/${usulanId}`,
      })
    : Promise.resolve()

export const layananService = {
  async list(userId: string, userRoleName: string, query: { page?: unknown; limit?: unknown; status?: unknown; tahap?: unknown }) {
    const { page, limit, skip } = getPaginationParams(query)
    const where: Prisma.UsulanLayananWhereInput = { deletedAt: null }

    if (userRoleName === ROLES.PENGELOLA_OPD) {
      const user = await db.user.findUnique({ where: { id: userId }, select: { unitOrganisasiId: true } })
      if (user?.unitOrganisasiId) {
        where.unitOrganisasiId = user.unitOrganisasiId
      } else {
        where.id = '__NO_ACCESS__'
      }
    }
    if (typeof query.status === 'string' && query.status in StatusUsulan) {
      where.status = query.status as StatusUsulan
    } else if (query.status === 'DalamProses') {
      where.status = { in: processingStatuses }
    }
    if (typeof query.tahap === 'string' && query.tahap in TahapUsulan) {
      where.tahapSaatIni = query.tahap as TahapUsulan
    }

    const [data, total] = await Promise.all([
      db.usulanLayanan.findMany({
        where,
        skip,
        take: limit,
        include: {
          asn: { select: { id: true, nipBaru: true, nama: true } },
          jenisLayanan: { select: { id: true, kode: true, nama: true } },
          unitOrganisasi: { select: { id: true, nama: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.usulanLayanan.count({ where }),
    ])

    return { data, meta: buildMeta(total, page, limit) }
  },

  async detail(id: string) {
    const item = await db.usulanLayanan.findFirst({
      where: { id, deletedAt: null },
      include: {
        asn: true,
        jenisLayanan: true,
        unitOrganisasi: true,
        workflowLog: {
          take: 20,
          include: { dilakukanOleh: { select: { id: true, namaLengkap: true } } },
          orderBy: { createdAt: 'desc' },
        },
        slaTracker: { where: { selesaiAt: null }, orderBy: { masukTahap: 'desc' } },
        dokumen: { orderBy: { createdAt: 'desc' } },
        dokumenOutput: { orderBy: { createdAt: 'desc' } },
      },
    })
    if (!item) throw new AppError('Data tidak ditemukan', 404)
    return item
  },

  async create(dto: CreateUsulanDto, actor: Actor) {
    assertRole(actor, ROLES.PENGELOLA_OPD)
    const nomorUsulan = await generateNomorUsulan()
    const result = await db.usulanLayanan.create({
      data: {
        id: randomUUID(),
        nomorUsulan,
        jenisLayananId: BigInt(dto.jenisLayananId),
        asnId: BigInt(dto.asnId),
        unitOrganisasiId: BigInt(dto.unitOrganisasiId),
        diajukanOlehId: actor?.id,
        tanggalUsulan: dto.tanggalUsulan,
        status: StatusUsulan.Draft,
      },
      include: { jenisLayanan: true, asn: true, unitOrganisasi: true },
    })

    await db.auditLog.create({
      data: {
        userId: actor?.id,
        userNama: actor?.namaLengkap,
        action: 'CREATE_USULAN',
        entityType: 'UsulanLayanan',
        entityId: result.id,
        newValues: { nomorUsulan: result.nomorUsulan },
      },
    })

    return result
  },

  async uploadDokumen(usulanId: string, file: Express.Multer.File | undefined, dto: UploadDokumenDto, actor: Actor) {
    assertRole(actor, ROLES.PENGELOLA_OPD)
    if (!file) throw new AppError('File wajib diunggah', 422)

    const usulan = await requireUsulan(usulanId)
    const digest = await hashFile(file.path)
    return db.usulanDokumen.create({
      data: {
        usulanLayananId: usulan.id,
        jenisDokumen: dto.jenisDokumen,
        namaFile: file.originalname,
        pathFile: file.path,
        ukuran: BigInt(file.size),
        mimeType: file.mimetype,
        hashFile: digest,
        uploadOlehId: actor?.id,
      },
    })
  },

  async submit(id: string, actor: Actor) {
    assertRole(actor, ROLES.PENGELOLA_OPD)
    const usulan = await requireUsulan(id)
    if (usulan.status !== StatusUsulan.Draft) throw new AppError('Usulan hanya dapat diajukan dari Draft', 422)

    const result = await db.$transaction(async (tx) => {
      const updated = await tx.usulanLayanan.update({
        where: { id },
        data: { status: StatusUsulan.Diajukan, alasanPenolakan: null },
      })
      await logWorkflow(id, null, null, 'SUBMIT', actor?.id, undefined, tx)
      return updated
    })
    await sendToRole(ROLES.ANALIS_PERTAMA, 'Usulan Baru Masuk', id)
    return result
  },

  async terima(id: string, actor: Actor) {
    assertRole(actor, ROLES.ANALIS_PERTAMA)
    const usulan = await requireUsulan(id)
    if (usulan.status !== StatusUsulan.Diajukan) throw new AppError('Usulan tidak dalam status Diajukan', 422)

    const result = await db.$transaction(async (tx) => {
      const updated = await tx.usulanLayanan.update({
        where: { id },
        data: {
          status: StatusUsulan.VerifikasiAP,
          tahapSaatIni: TahapUsulan.AP,
          tglMasukAp: new Date(),
        },
      })
      await buatSlaTracker(id, TahapUsulan.AP, usulan.jenisLayananId, tx)
      await logWorkflow(id, null, TahapUsulan.AP, 'TERIMA', actor?.id, undefined, tx)
      return updated
    })
    await sendToSubmitter(usulan, 'Usulan Sedang Diverifikasi', id)
    return result
  },

  async teruskan(id: string, catatan: TeruskanDto['catatan'], actor: Actor) {
    const usulan = await requireUsulan(id)

    if (!usulan.tahapSaatIni) {
      throw new AppError('Tahap usulan tidak valid', 422)
    }

    const currentTahap = usulan.tahapSaatIni

    workflowService.assertRoleCanHandleTahap(actor?.roleName, currentTahap)
    workflowService.assertStatusMatchesTahap(usulan.status, currentTahap)

    const nextTahap = workflowService.resolveNextTahap(currentTahap)

    const result = await db.$transaction(async (tx) => {
      const updateData: Prisma.UsulanLayananUncheckedUpdateInput = {
        status: statusByTahap[nextTahap],
        tahapSaatIni: nextTahap,
        [masukFieldByTahap[nextTahap]]: new Date(),
        [catatanFieldByTahap[currentTahap]]: catatan,
      }

      const updated = await tx.usulanLayanan.update({
        where: { id },
        data: updateData,
      })

      await tutupSlaTracker(id, currentTahap, tx)
      await buatSlaTracker(id, nextTahap, usulan.jenisLayananId, tx)
      await logWorkflow(id, currentTahap, nextTahap, 'TERUSKAN', actor?.id, catatan, tx)

      return updated
    })

    await sendToRole(roleByTahap[nextTahap], 'Berkas Siap Ditindaklanjuti', id)

    return result
  },

  async kembalikan(id: string, alasan: KembalikanDto['alasan'], actor: Actor) {
    const usulan = await requireUsulan(id)

    if (!usulan.tahapSaatIni) {
      throw new AppError('Tahap usulan tidak valid', 422)
    }

    const currentTahap = usulan.tahapSaatIni

    workflowService.assertRoleCanHandleTahap(actor?.roleName, currentTahap)
    workflowService.assertStatusMatchesTahap(usulan.status, currentTahap)

    const previousTahap = workflowService.resolvePreviousTahap(currentTahap)
    const nomorRevisi = await nextRevisionNumber(id)

    const result = await db.$transaction(async (tx) => {
      const updated = await tx.usulanLayanan.update({
        where: { id },
        data: {
          status: StatusUsulan.Dikembalikan,
          tahapSaatIni: previousTahap,
          alasanPenolakan: alasan,
        },
      })

      await tutupSlaTracker(id, currentTahap, tx)

      await tx.usulanRevisi.create({
        data: {
          usulanId: id,
          nomorRevisi,
          dariTahap: currentTahap,
          keTahap: previousTahap,
          alasanDikembalikan: alasan,
          dikembalikanOlehId: actor!.id,
        },
      })

      await logWorkflow(id, currentTahap, previousTahap, 'KEMBALIKAN', actor?.id, alasan, tx)

      return updated
    })

    await sendToSubmitter(usulan, 'Usulan Dikembalikan untuk Perbaikan', id)

    return result
  },

  async setujui(id: string, catatan: SetujuiDto['catatan'], actor: Actor) {
    const usulan = await requireUsulan(id)

    if (!usulan.tahapSaatIni) {
      throw new AppError('Tahap usulan tidak valid', 422)
    }

    const currentTahap = usulan.tahapSaatIni

    workflowService.assertRoleCanHandleTahap(actor?.roleName, currentTahap)
    workflowService.assertStatusMatchesTahap(usulan.status, currentTahap)

    if (currentTahap !== TahapUsulan.Kabid && currentTahap !== TahapUsulan.KepalaBadan) {
      throw new AppError('Usulan tidak berada pada tahap persetujuan', 422)
    }

    const needsKepala =
      currentTahap === TahapUsulan.Kabid &&
      usulan.jenisLayanan.butuhTteKepalaBadan

    const nextTahap = needsKepala ? TahapUsulan.KepalaBadan : null

    const result = await db.$transaction(async (tx) => {
      const updateData: Prisma.UsulanLayananUncheckedUpdateInput = nextTahap
        ? {
            status: StatusUsulan.ApprovalKepalaBadan,
            tahapSaatIni: nextTahap,
            tglMasukKepalaBadan: new Date(),
            [catatanFieldByTahap[currentTahap]]: catatan,
          }
        : {
            status: StatusUsulan.Selesai,
            tahapSaatIni: currentTahap,
            tglSelesai: new Date(),
            [catatanFieldByTahap[currentTahap]]: catatan,
          }

      const updated = await tx.usulanLayanan.update({
        where: { id },
        data: updateData,
      })

      await tutupSlaTracker(id, currentTahap, tx)

      if (nextTahap) {
        await buatSlaTracker(id, nextTahap, usulan.jenisLayananId, tx)
      }

      await logWorkflow(id, currentTahap, nextTahap, 'SETUJUI', actor?.id, catatan, tx)

      return updated
    })

    if (nextTahap) {
      await sendToRole(ROLES.KEPALA_BADAN, 'Berkas Menunggu TTd', id)
    } else {
      await ensureDokumenOutput(id, actor)
      await sendToSubmitter(usulan, 'Usulan Selesai', id)
    }

    return result
  },

  async dokumenOutput(id: string, actor: Actor) {
    const usulan = await db.usulanLayanan.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, status: true, diajukanOlehId: true, unitOrganisasiId: true },
    })
    if (!usulan) throw new AppError('Data tidak ditemukan', 404)
    if (usulan.status !== StatusUsulan.Selesai) throw new AppError('Dokumen output belum tersedia', 422)
    if (actor?.roleName === ROLES.PENGELOLA_OPD) {
      const user = await db.user.findUnique({ where: { id: actor.id }, select: { unitOrganisasiId: true } })
      if (user?.unitOrganisasiId !== usulan.unitOrganisasiId) throw new AppError('Anda tidak memiliki akses ke dokumen ini', 403)
    }

    const dokumen = await db.usulanDokumenOutput.findFirst({
      where: { usulanLayananId: id },
      orderBy: { createdAt: 'desc' },
    })
    if (!dokumen?.pathFile) throw new AppError('Dokumen output belum tersedia', 404)

    try {
      await fs.access(dokumen.pathFile)
    } catch {
      throw new AppError('File dokumen output tidak ditemukan di storage', 404)
    }

    return {
      pathFile: dokumen.pathFile,
      namaFile: dokumen.namaFile ?? `hasil-${id}.txt`,
      mimeType: 'text/plain',
    }
  },

  async batal(id: string, alasan: BatalDto['alasan'], actor: Actor) {
    assertRole(actor, ROLES.PENGELOLA_OPD, ROLES.ADMIN_SISTEM)
    const usulan = await requireUsulan(id)
    if (actor?.roleName === ROLES.PENGELOLA_OPD && usulan.status !== StatusUsulan.Draft) {
      throw new AppError('Pengelola OPD hanya dapat membatalkan usulan Draft', 422)
    }

    const result = await db.$transaction(async (tx) => {
      const updated = await tx.usulanLayanan.update({
        where: { id },
        data: { status: StatusUsulan.Ditolak, alasanPenolakan: alasan },
      })
      if (usulan.tahapSaatIni) await tutupSlaTracker(id, usulan.tahapSaatIni, tx)
      await logWorkflow(id, usulan.tahapSaatIni, null, 'BATAL', actor?.id, alasan, tx)
      return updated
    })
    await sendToSubmitter(usulan, 'Usulan Dibatalkan', id)
    return result
  },

  async resubmit(id: string, catatan: ResubmitDto['catatan'], actor: Actor) {
    assertRole(actor, ROLES.PENGELOLA_OPD)

    const usulan = await requireUsulan(id)

    if (usulan.status !== StatusUsulan.Dikembalikan || !usulan.tahapSaatIni) {
      throw new AppError('Usulan tidak sedang menunggu perbaikan', 422)
    }

    const revisi = await db.usulanRevisi.findFirst({
      where: {
        usulanId: id,
        statusRevisi: 'Menunggu',
      },
      orderBy: { nomorRevisi: 'desc' },
    })

    if (!revisi) {
      throw new AppError('Data revisi tidak ditemukan', 404)
    }

    const targetTahap = revisi.keTahap ?? usulan.tahapSaatIni

    workflowService.assertStatusMatchesTahap(statusByTahap[targetTahap], targetTahap)

    const result = await db.$transaction(async (tx) => {
      const updated = await tx.usulanLayanan.update({
        where: { id },
        data: {
          status: statusByTahap[targetTahap],
          tahapSaatIni: targetTahap,
          alasanPenolakan: null,
          [masukFieldByTahap[targetTahap]]: new Date(),
        },
      })

      await tx.usulanRevisi.update({
        where: { id: revisi.id },
        data: {
          statusRevisi: 'Selesai',
          catatanPerbaikan: catatan,
          tglResubmit: new Date(),
          resubmitOlehId: actor?.id,
        },
      })

      await buatSlaTracker(id, targetTahap, usulan.jenisLayananId, tx)
      await logWorkflow(id, null, targetTahap, 'RESUBMIT', actor?.id, catatan, tx)

      return updated
    })

    await sendToRole(roleByTahap[targetTahap], 'Usulan Telah Diperbaiki', id)

    return result
  },
}
