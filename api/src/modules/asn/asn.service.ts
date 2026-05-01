import crypto from 'node:crypto'
import { Prisma, StatusApproval } from '@prisma/client'
import { db } from '@/core/database/prisma.client'
import { AppError } from '@/core/errors/app-error'
import { buildMeta, getPaginationParams } from '@/core/http/pagination.helper'
import { notifikasiService } from '@/modules/notifikasi/notifikasi.service'
import { ROLES } from '@/shared/constants'
import { StatusPegawai } from '@/shared/enums'
import { asnRepository } from './asn.repository'
import type { AsnListQuery } from './asn.types'
import type { ApprovePeremajaanDto, CreateAsnDto, CreatePeremajaanDto, UpdateAsnDto } from './dto/asn.dto'

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
  'jabatanStrukturaId',
  'jabatanFungsionalId',
  'jabatanPelaksanaId',
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

export const asnService = {
  async list(query: AsnListQuery) {
    const { page, limit, skip } = getPaginationParams(query)
    const where: Prisma.AsnWhereInput = { deletedAt: null }

    if (typeof query.search === 'string' && query.search.trim()) {
      const search = query.search.trim()
      where.OR = [{ nama: { contains: search } }, { nipBaru: { contains: search } }]
    }
    if (typeof query.unitOrganisasiId === 'string' && query.unitOrganisasiId) {
      where.unitOrganisasiId = query.unitOrganisasiId
    }
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

    const result = await asnRepository.create(crypto.randomUUID(), dto)
    await audit(actor, 'CREATE_ASN', result.id, { nipBaru: result.nipBaru, nama: result.nama })
    return result
  },

  async update(id: string, dto: UpdateAsnDto, actor: Express.Request['user']) {
    const existing = await asnRepository.findById(id)
    if (!existing) throw new AppError('Data tidak ditemukan', 404)

    if (dto.nipBaru && dto.nipBaru !== existing.nipBaru) {
      const duplicate = await asnRepository.findByNip(dto.nipBaru)
      if (duplicate) throw new AppError('NIP sudah terdaftar', 409)
    }

    const result = await asnRepository.update(id, dto)
    await audit(actor, 'UPDATE_ASN', result.id, { nipBaru: result.nipBaru, nama: result.nama })
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
      where: { asnId: id },
      orderBy: { createdAt: 'desc' },
    })
  },

  async listPeremajaan(query: { page?: unknown; limit?: unknown; status?: unknown }) {
    const { page, limit, skip } = getPaginationParams(query)
    const where: Prisma.AsnPeremajaanWhereInput = {}
    if (typeof query.status === 'string' && query.status in StatusApproval) {
      where.statusApproval = query.status as StatusApproval
    }

    const [data, total] = await Promise.all([
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

    return { data, meta: buildMeta(total, page, limit) }
  },

  async createPeremajaan(dto: CreatePeremajaanDto, actor: Express.Request['user']) {
    if (!actor) throw new AppError('Unauthorized', 401)
    const asn = await asnRepository.findById(dto.asnId)
    if (!asn) throw new AppError('Data ASN tidak ditemukan', 404)

    const sanitized = sanitizePeremajaanData(dto.dataBaru)
    if (Object.keys(sanitized).length === 0) throw new AppError('Data perubahan tidak valid', 422)

    const dataLama = Object.keys(sanitized).reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = (asn as unknown as Record<string, unknown>)[key]
      return acc
    }, {})

    const result = await db.asnPeremajaan.create({
      data: {
        asnId: dto.asnId,
        jenisPerubahan: dto.jenisPerubahan,
        dataLama: dataLama as Prisma.InputJsonObject,
        dataBaru: sanitized as Prisma.InputJsonObject,
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

  async approvePeremajaan(id: string, dto: ApprovePeremajaanDto, actor: Express.Request['user']) {
    if (!actor) throw new AppError('Unauthorized', 401)
    const peremajaanId = BigInt(id)
    const existing = await db.asnPeremajaan.findUnique({ where: { id: peremajaanId }, include: { asn: true } })
    if (!existing) throw new AppError('Data peremajaan tidak ditemukan', 404)
    if (existing.statusApproval !== StatusApproval.Pending) throw new AppError('Pengajuan sudah diproses', 422)

    const approved = dto.statusApproval === StatusApproval.Approved
    const result = await db.$transaction(async (tx) => {
      if (approved) {
        const updateData = sanitizePeremajaanData(existing.dataBaru as Record<string, unknown>)
        await tx.asn.update({ where: { id: existing.asnId }, data: updateData })
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
    await audit(actor, approved ? 'APPROVE_PEREMAJAAN_ASN' : 'REJECT_PEREMAJAAN_ASN', existing.asnId, {
      peremajaanId: id,
    })
    return result
  },
}
