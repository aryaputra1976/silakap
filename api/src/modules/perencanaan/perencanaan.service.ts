import type { JenisPensiun, StatusPensiun, Prisma } from '@prisma/client'
import { db } from '@/core/database/prisma.client'
import { AppError } from '@/core/errors/app-error'
import { buildMeta, getPaginationParams } from '@/core/http/pagination.helper'
import { logger } from '@/core/logger/logger'
import { ROLES } from '@/shared/constants'
import { notifikasiService } from '@/modules/notifikasi'
import type { CreatePerencanaanDto, UpdatePerencanaanDto, UpdateStatusPensiunDto } from './dto/perencanaan.dto'

// Dokumen checklist per jenis pensiun (sesuai Perka BKN No. 3/2020)
const CHECKLIST_UMUM = ['skCpns', 'skPnsTerakhir', 'ktp', 'kk', 'pasfoto']
const CHECKLIST_KHUSUS: Record<JenisPensiun, string[]> = {
  BUP: [],
  APS: ['suratPermohonanSendiri', 'buktMasaKerja'],
  JandaDuda: ['suratKematian', 'aktaNikah', 'aktaKelahiranAnak'],
  Uzur: ['suratTimPengujiKesehatan', 'suratDokterPemerintah'],
  Dini: ['skKebijakanPerampingan', 'suratPersetujuanInstansi'],
}

const buildDokumenChecklist = (jenis: JenisPensiun): Record<string, boolean> => {
  const keys = [...CHECKLIST_UMUM, ...CHECKLIST_KHUSUS[jenis]]
  return Object.fromEntries(keys.map((k) => [k, false]))
}

// Transisi status yang valid per jenis pensiun
const VALID_TRANSITIONS: Record<StatusPensiun, StatusPensiun[]> = {
  Terdeteksi:         ['DraftBerkas', 'Dibatalkan'],
  DraftBerkas:        ['ValidasiSyarat', 'VerifikasiBKPSDM', 'Dibatalkan'],
  ValidasiSyarat:     ['PersetujuanPejabat', 'Ditolak'],
  PersetujuanPejabat: ['VerifikasiBKPSDM', 'Ditolak'],
  VerifikasiBKPSDM:   ['InputSIASN', 'DraftBerkas', 'Ditolak'],
  InputSIASN:         ['CetakDokumen', 'SKTerbit'],
  CetakDokumen:       ['DikirimKanreg'],
  DikirimKanreg:      ['SKTerbit', 'Ditolak'],
  SKTerbit:           [],
  Ditolak:            [],
  Dibatalkan:         [],
}

const parseBigInt = (id: string): bigint => {
  try { return BigInt(id) } catch { throw new AppError('Data tidak ditemukan', 404) }
}

const auditLog = async (
  actor: Express.Request['user'],
  action: string,
  entityId: string,
  newValues?: Prisma.InputJsonValue,
): Promise<void> => {
  await db.auditLog.create({
    data: { userId: actor?.id, userNama: actor?.namaLengkap, action, entityType: 'PerencanaanPensiun', entityId, newValues },
  })
}

const asnSelect = {
  id: true, nipBaru: true, nama: true, unitOrganisasiId: true,
  tanggalLahir: true, mkTahun: true, mkBulan: true, statusPegawai: true,
  jabatan: { select: { bup: true, nama: true } },
  unitOrganisasi: { select: { id: true, nama: true } },
} as const

const validateApsEligibility = async (asnId: bigint): Promise<void> => {
  const asn = await db.asn.findUnique({ where: { id: asnId }, select: { tanggalLahir: true, mkTahun: true } })
  if (!asn) throw new AppError('ASN tidak ditemukan', 404)

  if (!asn.tanggalLahir) throw new AppError('Data tanggal lahir ASN belum ada — tidak bisa validasi APS', 422)
  const usia = new Date().getFullYear() - asn.tanggalLahir.getFullYear()
  if (usia < 50) throw new AppError(`ASN belum memenuhi syarat APS: usia saat ini ${usia} tahun (minimum 50 tahun)`, 422)

  const mkTahun = asn.mkTahun ?? 0
  if (mkTahun < 20) throw new AppError(`ASN belum memenuhi syarat APS: masa kerja ${mkTahun} tahun (minimum 20 tahun)`, 422)
}

export const perencanaanService = {
  async list(query: {
    page?: unknown; limit?: unknown; jenisPensiun?: unknown;
    statusPensiun?: unknown; isDarurat?: unknown; search?: unknown
  }) {
    const { page, limit, skip } = getPaginationParams(query)
    const where: Prisma.PerencanaanPensiunWhereInput = {}

    if (query.jenisPensiun && typeof query.jenisPensiun === 'string') {
      where.jenisPensiun = query.jenisPensiun as JenisPensiun
    }
    if (query.statusPensiun && typeof query.statusPensiun === 'string') {
      where.statusPensiun = query.statusPensiun as StatusPensiun
    }
    if (typeof query.isDarurat === 'string') {
      where.isDarurat = query.isDarurat === 'true'
    }
    if (typeof query.search === 'string' && query.search.trim()) {
      where.asn = { OR: [{ nama: { contains: query.search.trim() } }, { nipBaru: { contains: query.search.trim() } }] }
    }

    const [data, total] = await Promise.all([
      db.perencanaanPensiun.findMany({
        where, skip, take: limit,
        include: { asn: { select: asnSelect } },
        orderBy: [{ isDarurat: 'desc' }, { tanggalBup: 'asc' }],
      }),
      db.perencanaanPensiun.count({ where }),
    ])

    return { data, meta: buildMeta(total, page, limit) }
  },

  async detail(id: string) {
    const item = await db.perencanaanPensiun.findUnique({
      where: { id: parseBigInt(id) },
      include: { asn: { select: asnSelect } },
    })
    if (!item) throw new AppError('Data tidak ditemukan', 404)
    return item
  },

  async create(dto: CreatePerencanaanDto, actor: Express.Request['user']) {
    // Validasi APS sebelum menerima pengajuan
    if (dto.jenisPensiun === 'APS') {
      await validateApsEligibility(dto.asnId)
    }

    // Uzur wajib ada subJenisUzur
    if (dto.jenisPensiun === 'Uzur' && !dto.subJenisUzur) {
      throw new AppError('Sub-jenis uzur wajib diisi (KarenaDinas / BukanKarenaDinas)', 422)
    }

    // Uzur bukan karena dinas: masa kerja >= 4 tahun
    if (dto.jenisPensiun === 'Uzur' && dto.subJenisUzur === 'BukanKarenaDinas') {
      const asn = await db.asn.findUnique({ where: { id: dto.asnId }, select: { mkTahun: true } })
      if ((asn?.mkTahun ?? 0) < 4) {
        throw new AppError('Uzur bukan karena dinas memerlukan masa kerja minimal 4 tahun', 422)
      }
    }

    const isDarurat = dto.jenisPensiun === 'JandaDuda' ? true : (dto.isDarurat ?? false)
    const statusPensiun: StatusPensiun = dto.jenisPensiun === 'APS' ? 'ValidasiSyarat' : 'DraftBerkas'

    const result = await db.perencanaanPensiun.create({
      data: {
        asnId: dto.asnId,
        jenisPensiun: dto.jenisPensiun,
        statusPensiun,
        isDarurat,
        subJenisUzur: dto.subJenisUzur,
        tanggalBup: dto.tanggalBup,
        tahunBup: dto.tahunBup,
        bupUsia: dto.bupUsia,
        tanggalTmt: dto.tanggalTmt,
        keterangan: dto.keterangan,
        dokumenChecklist: buildDokumenChecklist(dto.jenisPensiun),
      },
    })

    await auditLog(actor, 'CREATE_PERENCANAAN', result.id.toString(), {
      asnId: dto.asnId.toString(), jenisPensiun: dto.jenisPensiun,
    })
    return result
  },

  async update(id: string, dto: UpdatePerencanaanDto, actor: Express.Request['user']) {
    const perencanaanId = parseBigInt(id)
    const existing = await db.perencanaanPensiun.findUnique({ where: { id: perencanaanId } })
    if (!existing) throw new AppError('Data tidak ditemukan', 404)

    const terminal: StatusPensiun[] = ['SKTerbit', 'Ditolak', 'Dibatalkan']
    if (terminal.includes(existing.statusPensiun)) {
      throw new AppError('Data pensiun sudah final dan tidak bisa diubah', 409)
    }

    const result = await db.perencanaanPensiun.update({ where: { id: perencanaanId }, data: dto })
    await auditLog(actor, 'UPDATE_PERENCANAAN', id, { asnId: result.asnId.toString() })
    return result
  },

  async updateStatus(id: string, dto: UpdateStatusPensiunDto, actor: Express.Request['user']) {
    const perencanaanId = parseBigInt(id)
    const existing = await db.perencanaanPensiun.findUnique({ where: { id: perencanaanId } })
    if (!existing) throw new AppError('Data tidak ditemukan', 404)

    const validNext = VALID_TRANSITIONS[existing.statusPensiun]
    if (!validNext.includes(dto.statusPensiun as StatusPensiun)) {
      throw new AppError(
        `Transisi dari ${existing.statusPensiun} ke ${dto.statusPensiun} tidak diizinkan`,
        422,
      )
    }

    // Ditolak wajib ada catatan
    if (dto.statusPensiun === 'Ditolak' && !dto.catatanPenolakan?.trim()) {
      throw new AppError('Catatan penolakan wajib diisi', 422)
    }

    // SKTerbit wajib ada nomor SK
    if (dto.statusPensiun === 'SKTerbit' && !dto.nomorSkPensiun?.trim()) {
      throw new AppError('Nomor SK pensiun wajib diisi', 422)
    }

    const updateData: Prisma.PerencanaanPensiunUpdateInput = {
      statusPensiun: dto.statusPensiun as StatusPensiun,
    }
    if (dto.catatanPenolakan !== undefined) updateData.catatanPenolakan = dto.catatanPenolakan
    if (dto.nomorSkPensiun !== undefined) updateData.nomorSkPensiun = dto.nomorSkPensiun
    if (dto.tanggalSkTerbit !== undefined) updateData.tanggalSkTerbit = dto.tanggalSkTerbit
    if (dto.tanggalPengajuanKeBkn !== undefined) updateData.tanggalPengajuanKeBkn = dto.tanggalPengajuanKeBkn
    if (dto.subJenisUzur !== undefined) updateData.subJenisUzur = dto.subJenisUzur
    if (dto.dokumenChecklist !== undefined) updateData.dokumenChecklist = dto.dokumenChecklist

    const result = await db.perencanaanPensiun.update({ where: { id: perencanaanId }, data: updateData })
    await auditLog(actor, `STATUS_PENSIUN_${dto.statusPensiun.toUpperCase()}`, id, {
      dari: existing.statusPensiun, ke: dto.statusPensiun,
    })
    return result
  },

  async remove(id: string, actor: Express.Request['user']) {
    const perencanaanId = parseBigInt(id)
    const existing = await db.perencanaanPensiun.findUnique({ where: { id: perencanaanId } })
    if (!existing) throw new AppError('Data tidak ditemukan', 404)

    await db.perencanaanPensiun.delete({ where: { id: perencanaanId } })
    await auditLog(actor, 'DELETE_PERENCANAAN', id)
  },

  // Scan ASN yang akan memasuki BUP dalam 15 bulan — dipanggil oleh job harian
  async scanBupHarian(): Promise<{ created: number; notified: number }> {
    const H450 = new Date(Date.now() + 450 * 24 * 60 * 60 * 1000) // 15 bulan ≈ 450 hari
    const H90 = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    const H30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const asnAktif = await db.asn.findMany({
      where: { statusPegawai: 'Aktif', tanggalLahir: { not: null }, deletedAt: null },
      select: {
        id: true, nama: true, nipBaru: true,
        tanggalLahir: true,
        jabatan: { select: { bup: true } },
        perencanaanPensiun: {
          where: { statusPensiun: { notIn: ['SKTerbit', 'Dibatalkan', 'Ditolak'] } },
          select: { id: true },
        },
      },
    })

    let created = 0
    const bulanH90: string[] = []
    const bulanH30: string[] = []

    for (const asn of asnAktif) {
      if (!asn.tanggalLahir) continue
      const bupUsia = asn.jabatan?.bup ?? 58
      const tanggalBup = new Date(asn.tanggalLahir)
      tanggalBup.setFullYear(tanggalBup.getFullYear() + bupUsia)

      if (tanggalBup > H450) continue // belum masuk window

      // Sudah ada record aktif
      if (asn.perencanaanPensiun.length > 0) {
        if (tanggalBup <= H30) bulanH30.push(asn.nama)
        else if (tanggalBup <= H90) bulanH90.push(asn.nama)
        continue
      }

      // Buat record baru otomatis
      const tahunBup = tanggalBup.getFullYear()
      await db.perencanaanPensiun.create({
        data: {
          asnId: asn.id,
          jenisPensiun: 'BUP',
          statusPensiun: 'Terdeteksi',
          autoDetected: true,
          tanggalBup,
          tahunBup,
          bupUsia,
          dokumenChecklist: buildDokumenChecklist('BUP'),
        },
      })
      created++

      if (tanggalBup <= H30) bulanH30.push(asn.nama)
      else if (tanggalBup <= H90) bulanH90.push(asn.nama)
    }

    // Kirim notifikasi H-90
    if (bulanH90.length > 0) {
      const isi = `${bulanH90.length} ASN akan pensiun dalam ~3 bulan: ${bulanH90.slice(0, 5).join(', ')}${bulanH90.length > 5 ? '...' : ''}`
      await Promise.allSettled([
        notifikasiService.sendToRole(ROLES.KABID, { type: 'BUP_H90', judul: 'Peringatan BUP H-90', isi, link: '/perencanaan' }),
      ])
    }

    // Kirim notifikasi H-30 ke Kepala Badan juga
    if (bulanH30.length > 0) {
      const isi = `🔔 KRITIS: ${bulanH30.length} ASN pensiun dalam 30 hari: ${bulanH30.slice(0, 5).join(', ')}${bulanH30.length > 5 ? '...' : ''}`
      await Promise.allSettled([
        notifikasiService.sendToRole(ROLES.KABID, { type: 'BUP_H30', judul: 'Peringatan BUP H-30', isi, link: '/perencanaan' }),
        notifikasiService.sendToRole(ROLES.KEPALA_BADAN, { type: 'BUP_H30', judul: 'Peringatan BUP H-30', isi, link: '/perencanaan' }),
      ])
    }

    logger.info('pensiun-scanner:done', { created, h90: bulanH90.length, h30: bulanH30.length })
    return { created, notified: bulanH90.length + bulanH30.length }
  },

  // Hapus otomatis DraftBerkas non-darurat yang tidak dilengkapi > 7 hari kerja
  async cleanupStaleDrafts(): Promise<{ cleaned: number }> {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const result = await db.perencanaanPensiun.updateMany({
      where: {
        statusPensiun: 'DraftBerkas',
        isDarurat: false,
        autoDetected: false,
        createdAt: { lte: cutoff },
      },
      data: { statusPensiun: 'Dibatalkan', catatanPenolakan: 'Dibatalkan otomatis: berkas tidak dilengkapi dalam 7 hari' },
    })
    if (result.count > 0) {
      logger.info('pensiun-cleanup:done', { cleaned: result.count })
    }
    return { cleaned: result.count }
  },
}
