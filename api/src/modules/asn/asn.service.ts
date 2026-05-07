import fs from 'fs/promises'
import path from 'path'
import { Prisma, StatusApproval } from '@prisma/client'
import { env } from '@/core/config/env'
import { db } from '@/core/database/prisma.client'
import { AppError } from '@/core/errors/app-error'
import { buildMeta, getPaginationParams } from '@/core/http/pagination.helper'
import { notifikasiService } from '@/modules/notifikasi/notifikasi.service'
import { ROLES } from '@/shared/constants'
import { StatusPegawai } from '@/shared/enums'
import { asnRepository } from './asn.repository'
import type { AsnListQuery } from './asn.types'
import type { ApprovePeremajaanDto, CreateAsnDto, CreatePeremajaanDto, UpdateAsnDto } from './dto/asn.dto'

const toBigIntId = (value: string): bigint => {
  try {
    return BigInt(value)
  } catch {
    throw new AppError('Data tidak ditemukan', 404)
  }
}

const audit = async (
  actor: Express.Request['user'],
  action: string,
  entityId: string,
  newValues?: Prisma.InputJsonValue,
): Promise<void> => {
  await db.auditLog.create({
    data: {
      userId: actor?.id,
      userNama: actor?.namaLengkap,
      action,
      entityType: 'Asn',
      entityId,
      newValues,
    },
  })
}

const allowedPeremajaanFields = new Set([
  'nama',
  'gelarDepan',
  'gelarBelakang',
  'tempatLahir',
  'tanggalLahir',
  'jenisKelaminId',
  'agamaId',
  'statusKawinId',
  'nik',
  'nomorHp',
  'email',
  'emailGov',
  'alamat',
  'npwp',
  'bpjs',
  'statusPegawai',
  'kedudukanHukum',
  'golonganId',
  'tmtGolongan',
  'mkTahun',
  'mkBulan',
  'jenisJabatanId',
  'jabatanId',
  'tmtJabatan',
  'tingkatPendidikanId',
  'bidangPendidikanId',
  'namaSekolah',
  'tahunLulus',
  'unitOrganisasiId',
  'lokasiKerja',
])

const sanitizePeremajaanData = (data: Record<string, unknown>): Prisma.AsnUncheckedUpdateInput => {
  const sanitized: Prisma.AsnUncheckedUpdateInput = {}
  for (const [key, value] of Object.entries(data)) {
    if (allowedPeremajaanFields.has(key)) {
      ;(sanitized as Record<string, unknown>)[key] = value
    }
  }
  return sanitized
}

const buildPeremajaanSnapshot = (asn: unknown, data: Record<string, unknown>): Record<string, unknown> => {
  return Object.keys(data).reduce<Record<string, unknown>>((acc, key) => {
    acc[key] = (asn as Record<string, unknown>)[key] ?? null
    return acc
  }, {})
}

type PeremajaanAssignmentRow = {
  id: bigint
  ditugaskanKepadaId: string | null
  ditugaskanAt: Date | null
  namaLengkap: string | null
}

type PeremajaanAssignmentOnlyRow = {
  ditugaskanKepadaId: string | null
}

const attachPeremajaanAssignments = async <T extends { id: bigint }>(items: T[]) => {
  if (items.length === 0) return items

  const rows = await db.$queryRaw<PeremajaanAssignmentRow[]>`
    SELECT
      p.id,
      p.ditugaskan_kepada_id AS ditugaskanKepadaId,
      p.ditugaskan_at AS ditugaskanAt,
      u.namaLengkap AS namaLengkap
    FROM asn_peremajaan p
    LEFT JOIN user u ON u.id = p.ditugaskan_kepada_id
    WHERE p.id IN (${Prisma.join(items.map((item) => item.id))})
  `
  const assignmentMap = new Map(rows.map((row) => [row.id.toString(), row]))

  return items.map((item) => {
    const row = assignmentMap.get(item.id.toString())
    return {
      ...item,
      ditugaskanAt: row?.ditugaskanAt ?? null,
      ditugaskanKepada: row?.ditugaskanKepadaId
        ? { id: row.ditugaskanKepadaId, namaLengkap: row.namaLengkap ?? '-' }
        : null,
    }
  })
}

export const asnService = {
  async stats() {
    const baseWhere: Prisma.AsnWhereInput = { deletedAt: null }
    const pnsWhere: Prisma.AsnWhereInput = {
      ...baseWhere,
      statusAsn: {
        is: {
          OR: [{ kode: 'PNS' }, { nama: 'PNS' }],
        },
      },
    }
    const pppkBaseWhere: Prisma.AsnWhereInput = {
      OR: [
        { statusAsn: { is: { OR: [{ kode: { contains: 'PPPK' } }, { nama: { contains: 'PPPK' } }] } } },
        { jenisPegawai: { is: { OR: [{ kode: { contains: 'PPPK' } }, { nama: { contains: 'PPPK' } }] } } },
      ],
    }
    const paruhWaktuWhere: Prisma.AsnWhereInput = {
      OR: [
        { statusAsn: { is: { OR: [{ kode: { contains: 'PARUH' } }, { nama: { contains: 'Paruh' } }] } } },
        { jenisPegawai: { is: { OR: [{ kode: { contains: 'PARUH' } }, { nama: { contains: 'Paruh' } }] } } },
      ],
    }
    const pppkWhere: Prisma.AsnWhereInput = {
      ...baseWhere,
      AND: [pppkBaseWhere, { NOT: paruhWaktuWhere }],
    }
    const pppkParuhWaktuWhere: Prisma.AsnWhereInput = {
      ...baseWhere,
      AND: [paruhWaktuWhere],
    }

    const [total, pns, pppk, pppkParuhWaktu] = await Promise.all([
      db.asn.count({ where: baseWhere }),
      db.asn.count({ where: pnsWhere }),
      db.asn.count({ where: pppkWhere }),
      db.asn.count({ where: pppkParuhWaktuWhere }),
    ])

    return { total, pns, pppk, pppkParuhWaktu }
  },

  async list(query: AsnListQuery) {
    const { page, limit, skip } = getPaginationParams(query)
    const where: Prisma.AsnWhereInput = { deletedAt: null }

    if (typeof query.search === 'string' && query.search.trim()) {
      const search = query.search.trim()
      where.OR = [{ nama: { contains: search } }, { nipBaru: { contains: search } }]
    }
    if (typeof query.unitOrganisasiId === 'string' && query.unitOrganisasiId) where.unitOrganisasiId = toBigIntId(query.unitOrganisasiId)
    if (query.golonganId) where.golonganId = BigInt(String(query.golonganId))
    if (query.jenisJabatanId) where.jenisJabatanId = BigInt(String(query.jenisJabatanId))
    if (typeof query.statusPegawai === 'string' && query.statusPegawai in StatusPegawai) {
      where.statusPegawai = query.statusPegawai as StatusPegawai
    }

    const [data, total] = await Promise.all([
      asnRepository.findMany(where, skip, limit),
      asnRepository.count(where),
    ])

    return { data, meta: buildMeta(total, page, limit) }
  },

  async detail(id: string) {
    const item = await asnRepository.findById(id)
    if (!item) throw new AppError('Data tidak ditemukan', 404)
    return item
  },

  async create(dto: CreateAsnDto, actor: Express.Request['user']) {
    const duplicate = await asnRepository.findByNip(dto.nipBaru)
    if (duplicate) throw new AppError('NIP sudah terdaftar', 409)

    const result = await asnRepository.create(dto as Prisma.AsnUncheckedCreateInput)
    await audit(actor, 'CREATE_ASN', result.id.toString(), { nipBaru: result.nipBaru, nama: result.nama })
    return result
  },

  async update(id: string, dto: UpdateAsnDto, actor: Express.Request['user']) {
    const existing = await asnRepository.findById(id)
    if (!existing) throw new AppError('Data tidak ditemukan', 404)

    if (dto.nipBaru && dto.nipBaru !== existing.nipBaru) {
      const duplicate = await asnRepository.findByNip(dto.nipBaru)
      if (duplicate) throw new AppError('NIP sudah terdaftar', 409)
    }

    const result = await asnRepository.update(id, dto as Prisma.AsnUncheckedUpdateInput)
    await audit(actor, 'UPDATE_ASN', result.id.toString(), { nipBaru: result.nipBaru, nama: result.nama })
    return result
  },

  async remove(id: string, actor: Express.Request['user']) {
    const existing = await asnRepository.findById(id)
    if (!existing) throw new AppError('Data tidak ditemukan', 404)

    await asnRepository.softDelete(id)
    await audit(actor, 'DELETE_ASN', id, { nipBaru: existing.nipBaru, nama: existing.nama })
  },

  async riwayat(id: string) {
    const existing = await asnRepository.findById(id)
    if (!existing) throw new AppError('Data tidak ditemukan', 404)

    return db.asnRiwayat.findMany({
      where: { asnId: toBigIntId(id) },
      orderBy: { createdAt: 'desc' },
    })
  },

  async listPeremajaan(query: { page?: unknown; limit?: unknown; status?: unknown }) {
    const { page, limit, skip } = getPaginationParams(query)
    const where: Prisma.AsnPeremajaanWhereInput = {}
    if (typeof query.status === 'string' && query.status in StatusApproval) {
      where.statusApproval = query.status as StatusApproval
    }

    const [rows, total] = await Promise.all([
      db.asnPeremajaan.findMany({
        where,
        skip,
        take: limit,
        include: {
          asn: { select: { id: true, nipBaru: true, nama: true } },
          diajukanOleh: { select: { id: true, namaLengkap: true } },
          disetujuiOleh: { select: { id: true, namaLengkap: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.asnPeremajaan.count({ where }),
    ])
    const data = await attachPeremajaanAssignments(rows)

    return { data, meta: buildMeta(total, page, limit) }
  },

  async createPeremajaan(dto: CreatePeremajaanDto, actor: Express.Request['user']) {
    if (!actor) throw new AppError('Unauthorized', 401)
    const asn = await asnRepository.findById(dto.asnId)
    if (!asn) throw new AppError('Data ASN tidak ditemukan', 404)

    if (Object.keys(dto.dataBaru).length === 0) throw new AppError('Data perubahan wajib diisi', 422)
    const dataLama = buildPeremajaanSnapshot(asn, dto.dataBaru)

    const result = await db.asnPeremajaan.create({
      data: {
        asnId: toBigIntId(dto.asnId),
        jenisPerubahan: dto.jenisPerubahan,
        dataLama: dataLama as Prisma.InputJsonObject,
        dataBaru: dto.dataBaru as Prisma.InputJsonObject,
        dokumenBukti: dto.dokumenBukti,
        catatan: dto.catatan,
        diajukanOlehId: actor.id,
      },
      include: { asn: { select: { id: true, nipBaru: true, nama: true } } },
    })

    await notifikasiService.sendToRole(ROLES.ANALIS_MADYA, {
      type: 'peremajaan',
      judul: 'Pengajuan Peremajaan ASN',
      isi: `Peremajaan data ASN ${asn.nama} menunggu verifikasi.`,
      link: '/asn/peremajaan',
    })
    await audit(actor, 'CREATE_PEREMAJAAN_ASN', dto.asnId, { peremajaanId: result.id.toString() })
    return result
  },

  async uploadPeremajaanDokumen(file: Express.Multer.File | undefined, actor: Express.Request['user']) {
    if (!actor) throw new AppError('Unauthorized', 401)
    if (!file) throw new AppError('File wajib diunggah', 422)

    const fileId = path.basename(file.path)
    const result = {
      fileId,
      namaFile: file.originalname,
      ukuran: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date().toISOString(),
    }

    await audit(actor, 'UPLOAD_DOKUMEN_PEREMAJAAN_ASN', actor.id, result as Prisma.InputJsonObject)
    return result
  },

  async downloadPeremajaanDokumen(fileId: string, actor: Express.Request['user']) {
    if (!actor) throw new AppError('Unauthorized', 401)
    if (!fileId || path.basename(fileId) !== fileId) throw new AppError('Dokumen tidak valid', 422)

    const uploadDir = path.resolve(env.UPLOAD_DIR)
    const filePath = path.resolve(uploadDir, fileId)
    if (!filePath.startsWith(`${uploadDir}${path.sep}`)) {
      throw new AppError('Dokumen tidak valid', 422)
    }

    const stats = await fs.stat(filePath).catch(() => null)
    if (!stats?.isFile()) throw new AppError('Dokumen tidak ditemukan', 404)

    await audit(actor, 'DOWNLOAD_DOKUMEN_PEREMAJAAN_ASN', actor.id, { fileId })
    return { filePath, fileName: fileId }
  },

  async claimPeremajaan(id: string, actor: Express.Request['user']) {
    if (!actor) throw new AppError('Unauthorized', 401)
    const peremajaanId = toBigIntId(id)

    const updated = await db.$executeRaw`
      UPDATE asn_peremajaan
      SET ditugaskan_kepada_id = ${actor.id}, ditugaskan_at = NOW(3), updatedAt = NOW(3)
      WHERE id = ${peremajaanId}
        AND status_approval = 'Pending'
        AND (ditugaskan_kepada_id IS NULL OR ditugaskan_kepada_id = ${actor.id})
    `

    if (updated === 0) {
      const existing = await db.$queryRaw<Array<{ id: bigint; statusApproval: string; ditugaskanKepadaId: string | null }>>`
        SELECT id, status_approval AS statusApproval, ditugaskan_kepada_id AS ditugaskanKepadaId
        FROM asn_peremajaan
        WHERE id = ${peremajaanId}
        LIMIT 1
      `
      const item = existing[0]
      if (!item) throw new AppError('Data peremajaan tidak ditemukan', 404)
      if (item.statusApproval !== StatusApproval.Pending) throw new AppError('Pengajuan sudah diproses', 422)
      throw new AppError('Tiket sudah diambil operator lain', 409)
    }

    const row = await db.asnPeremajaan.findUnique({
      where: { id: peremajaanId },
      include: {
        asn: { select: { id: true, nipBaru: true, nama: true } },
        diajukanOleh: { select: { id: true, namaLengkap: true } },
        disetujuiOleh: { select: { id: true, namaLengkap: true } },
      },
    })
    if (!row) throw new AppError('Data peremajaan tidak ditemukan', 404)

    await audit(actor, 'CLAIM_PEREMAJAAN_ASN', id, { ditugaskanKepadaId: actor.id })
    const [result] = await attachPeremajaanAssignments([row])
    return result
  },

  async approvePeremajaan(id: string, dto: ApprovePeremajaanDto, actor: Express.Request['user']) {
    if (!actor) throw new AppError('Unauthorized', 401)
    if (dto.statusApproval === StatusApproval.Rejected && !dto.catatan?.trim()) {
      throw new AppError('Alasan penolakan wajib diisi', 422)
    }
    const peremajaanId = BigInt(id)
    const existing = await db.asnPeremajaan.findUnique({ where: { id: peremajaanId }, include: { asn: true } })
    if (!existing) throw new AppError('Data peremajaan tidak ditemukan', 404)
    if (existing.statusApproval !== StatusApproval.Pending) throw new AppError('Pengajuan sudah diproses', 422)

    const assignmentRows = await db.$queryRaw<PeremajaanAssignmentOnlyRow[]>`
      SELECT ditugaskan_kepada_id AS ditugaskanKepadaId
      FROM asn_peremajaan
      WHERE id = ${peremajaanId}
      LIMIT 1
    `
    const ditugaskanKepadaId = assignmentRows[0]?.ditugaskanKepadaId ?? null
    if (!ditugaskanKepadaId) throw new AppError('Ambil tiket terlebih dahulu sebelum memproses', 422)
    if (ditugaskanKepadaId !== actor.id) throw new AppError('Tiket sedang ditangani operator lain', 403)

    const approved = dto.statusApproval === StatusApproval.Approved
    const result = await db.$transaction(async (tx) => {
      if (approved) {
        const updateData = sanitizePeremajaanData(existing.dataBaru as Record<string, unknown>)
        if (Object.keys(updateData).length > 0) {
          await tx.asn.update({ where: { id: existing.asnId }, data: updateData })
        }
        await tx.asnRiwayat.create({
          data: {
            asnId: existing.asnId,
            tipePerubahan: existing.jenisPerubahan,
            dataLama: existing.dataLama ?? Prisma.JsonNull,
            dataBaru: existing.dataBaru ?? Prisma.JsonNull,
            keterangan: dto.catatan,
            diubahOleh: actor.id,
          },
        })
      }

      return tx.asnPeremajaan.update({
        where: { id: peremajaanId },
        data: {
          statusApproval: approved ? StatusApproval.Approved : StatusApproval.Rejected,
          disetujuiOlehId: actor.id,
          catatan: dto.catatan ?? existing.catatan,
          approvedAt: approved ? new Date() : null,
          rejectedAt: approved ? null : new Date(),
        },
        include: { asn: { select: { id: true, nipBaru: true, nama: true } } },
      })
    })

    await notifikasiService.sendToUser(existing.diajukanOlehId, {
      type: 'peremajaan',
      judul: approved ? 'Peremajaan ASN Disetujui' : 'Peremajaan ASN Ditolak',
      isi: `Pengajuan peremajaan data ASN ${existing.asn.nama} telah ${approved ? 'disetujui' : 'ditolak'}.`,
      link: '/asn/peremajaan',
    })
    await audit(actor, approved ? 'APPROVE_PEREMAJAAN_ASN' : 'REJECT_PEREMAJAAN_ASN', existing.asnId.toString(), {
      peremajaanId: id,
    })
    return result
  },
}
