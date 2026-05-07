import { Router } from 'express'
import ExcelJS from 'exceljs'
import { Prisma, StatusPegawai } from '@prisma/client'
import { db } from '@/core/database/prisma.client'
import { AppError } from '@/core/errors/app-error'
import { NotFoundError } from '@/core/errors/not-found.error'
import { buildMeta, getPaginationParams } from '@/core/http/pagination.helper'
import { sendPaginated, sendSuccess } from '@/core/http/response.helper'
import { authorize } from '@/core/middleware/rbac.middleware'
import { upload } from '@/core/middleware/upload.middleware'
import { ROLES } from '@/shared/constants'

export const integrasiRoutes = Router()

integrasiRoutes.use(authorize(ROLES.ADMIN_SISTEM))

const readExcelRows = async (filePath: string): Promise<Record<string, unknown>[]> => {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.readFile(filePath)
  const ws = wb.worksheets[0]
  if (!ws) return []
  const headers: string[] = []
  ws.getRow(1).eachCell({ includeEmpty: true }, (cell, col) => { headers[col - 1] = String(cell.value ?? '') })
  if (headers.length === 0) return []
  const rows: Record<string, unknown>[] = []
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const obj: Record<string, unknown> = Object.fromEntries(headers.map((h) => [h, '']))
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      const header = headers[col - 1]
      if (!header) return
      const val = cell.value
      if (val == null) return
      if (val instanceof Date) { obj[header] = val.toISOString().split('T')[0]; return }
      if (typeof val === 'object') {
        if ('richText' in val) { obj[header] = (val as {richText: {text: string}[]}).richText.map((r) => r.text).join(''); return }
        if ('result' in val) { const r = (val as {result: unknown}).result; obj[header] = r instanceof Date ? r.toISOString().split('T')[0] : (r ?? ''); return }
        if ('text' in val) { obj[header] = (val as {text: string}).text; return }
        obj[header] = ''; return
      }
      obj[header] = val
    })
    rows.push(obj)
  })
  return rows
}

const toStringValue = (value: unknown): string => {
  if (value === undefined || value === null) return ''
  if (typeof value === 'number') {
    // Large integers (18-digit NIP etc.) come back as JS numbers when stored as numbers in Excel.
    // String() would emit scientific notation for values ≥ 1e21, but toFixed(0) avoids that entirely.
    if (Number.isFinite(value) && Math.abs(value) >= 1e10) return value.toFixed(0)
    return String(value)
  }
  return String(value).trim()
}

const cleanNullable = (value: string): string | null => {
  const cleaned = value.trim()
  return cleaned ? cleaned : null
}

const digitsOnly = (value: string): string => toStringValue(value).replace(/\D/g, '')

const parseOptionalInt = (value: string): number | undefined => {
  const cleaned = digitsOnly(value)
  if (!cleaned) return undefined
  const parsed = Number(cleaned)
  return Number.isInteger(parsed) ? parsed : undefined
}

const parseOptionalDate = (value: string): Date | undefined => {
  const raw = toStringValue(value)
  if (!raw) return undefined

  const parsed = new Date(raw)
  if (!Number.isNaN(parsed.getTime())) return parsed

  const match = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})$/.exec(raw)
  if (!match) return undefined

  const month = Number(match[1]) - 1
  const day = Number(match[2])
  const yearValue = Number(match[3])
  const year = yearValue < 100 ? (yearValue > 30 ? 1900 + yearValue : 2000 + yearValue) : yearValue
  const date = new Date(year, month, day)
  return Number.isNaN(date.getTime()) ? undefined : date
}

const parseJenisKelamin = (value: string): number | undefined => {
  const v = toStringValue(value).toLowerCase().trim()
  if (v === 'm' || v === 'l' || v.includes('laki')) return 1
  if (v === 'f' || v === 'p' || v.includes('perempuan') || v.includes('wanita')) return 2
  const n = parseInt(v, 10)
  return n === 1 || n === 2 ? n : undefined
}

const parseBoolean = (value: string): boolean | undefined => {
  const normalized = toStringValue(value).toLowerCase()
  if (['1', 'true', 'ya', 'y', 'valid', 'aktif'].includes(normalized)) return true
  if (['0', 'false', 'tidak', 'n', 'invalid', 'nonaktif'].includes(normalized)) return false
  return undefined
}

const normKey = (key: string): string => key.trim().toLowerCase().replace(/[^a-z0-9]/g, '')

const pick = (row: Record<string, unknown>, keys: string[]): string => {
  const normalized = new Map(Object.entries(row).map(([key, value]) => [normKey(key), value]))
  for (const key of keys) {
    const value = normalized.get(normKey(key))
    const result = toStringValue(value)
    if (result) return result
  }
  return ''
}

const validateNip = (nip: string): boolean => /^\d{18}$/.test(nip)
const validateNik = (nik: string): boolean => !nik || /^\d{16}$/.test(nik)
const normalizeStatusPegawai = (value: string): StatusPegawai => {
  const normalized = toStringValue(value).toLowerCase()
  if (normalized.includes('cuti')) return StatusPegawai.Cuti
  if (normalized.includes('pensiun')) return StatusPegawai.Pensiun
  if (normalized.includes('meninggal')) return StatusPegawai.Meninggal
  if (normalized.includes('diberhentikan')) return StatusPegawai.Diberhentikan
  if (normalized.includes('berhenti')) return StatusPegawai.Berhenti
  return StatusPegawai.Aktif
}

const parseAsnRow = (row: Record<string, unknown>) => {
  const nipBaru = digitsOnly(pick(row, ['nipBaru', 'nip_baru', 'nip baru', 'nip', 'nipbaru', 'no nip', 'nonip', 'nip18']))
  const nik = digitsOnly(pick(row, ['nik', 'nomor nik', 'nominik', 'no nik', 'nonik']))
  const unitOrganisasiId = pick(row, ['unitOrganisasiId', 'unit_organisasi_id', 'unit id', 'unitorgid', 'id_unor', 'unor id', 'unorid', 'kode unor', 'kodeanor'])

  return {
    nipBaru,
    nipLama: cleanNullable(digitsOnly(pick(row, ['nipLama', 'nip_lama', 'nip lama', 'niplama']))),
    nama: pick(row, ['nama', 'nama lengkap', 'nama_asn', 'namaasn', 'namalengkap', 'nama pegawai', 'namapegawai']),
    gelarDepan: cleanNullable(pick(row, ['gelar depan', 'gelardepan'])),
    gelarBelakang: cleanNullable(pick(row, ['gelar belakang', 'gelarbelakang'])),
    tempatLahirId: cleanNullable(pick(row, ['tempat lahir id', 'tempatlahirid', 'id tempat lahir', 'idtempatlahir'])),
    tempatLahirNama: cleanNullable(pick(row, ['tempat lahir nama', 'tempat lahir', 'tempatlahir'])),
    jenisKelaminId: parseJenisKelamin(pick(row, ['jenis kelamin', 'jeniskelamin', 'jenis kelamin id', 'jeniskelaminid'])),
    agamaId: parseOptionalInt(pick(row, ['agama id', 'agamaid', 'id agama', 'idagama'])),
    statusKawinId: parseOptionalInt(pick(row, ['status kawin id', 'statuskawinid', 'kawin id', 'kawinid'])),
    golonganKode: cleanNullable(pick(row, ['golongan kode', 'golongankode', 'kode golongan', 'kodegolongan'])),
    jenisJabatanId: parseOptionalInt(pick(row, ['jenis jabatan id', 'jenisjabatanid', 'id jenis jabatan'])),
    jabatanFungsionalSiasnId: cleanNullable(pick(row, ['jabatan fungsional id', 'jabatanfungsionalid', 'id jabatan fungsional', 'idjabatanfungsional'])),
    jabatanStrukturaLSiasnId: cleanNullable(pick(row, ['jabatan struktural id', 'jabatanstrukturalid', 'id jabatan struktural', 'idjabatanstruktural'])),
    jabatanPelaksanaSiasnId: cleanNullable(pick(row, ['jabatan pelaksana id', 'jabatanpelaksanaid', 'id jabatan pelaksana', 'idjabatanpelaksana'])),
    tingkatPendidikanId: parseOptionalInt(pick(row, ['tingkat pendidikan id', 'tingkatpendidikanid', 'pendidikan id', 'pendidikanid'])),
    bidangPendidikanId: cleanNullable(pick(row, ['bidang pendidikan id', 'bidangpendidikanid', 'bidang studi id', 'bidangstudiid'])),
    tanggalLahir: parseOptionalDate(pick(row, ['tanggal lahir', 'tanggallahir', 'tgl lahir', 'tgllahir'])),
    nik: nik || null,
    email: pick(row, ['email', 'email pribadi', 'emailpribadi']) || null,
    emailGov: pick(row, ['emailGov', 'email_gov', 'email gov', 'emailgov', 'email dinas', 'emaildinas']) || null,
    nomorHp: cleanNullable(digitsOnly(pick(row, ['nomorHp', 'nomor hp', 'nomor_hp', 'no hp', 'hp', 'nohp', 'telepon', 'telp', 'handphone']))),
    alamat: cleanNullable(pick(row, ['alamat'])),
    npwp: cleanNullable(digitsOnly(pick(row, ['npwp nomor', 'npwp']))),
    bpjs: cleanNullable(digitsOnly(pick(row, ['bpjs']))),
    jenisPegawaiId: parseOptionalInt(pick(row, ['jenis pegawai id', 'jenispegawaiid', 'id jenis pegawai'])),
    jenisPegawaiNama: cleanNullable(pick(row, ['jenis pegawai nama', 'jenispegawainama', 'jenis pegawai', 'jenispegawai'])),
    kedudukanHukum: cleanNullable(pick(row, ['kedudukan hukum nama', 'kedudukan hukum', 'kedudukanhukum'])),
    nomorSkCpns: cleanNullable(pick(row, ['nomor sk cpns', 'nomorskcpns'])),
    tanggalSkCpns: parseOptionalDate(pick(row, ['tanggal sk cpns', 'tanggalskcpns'])),
    tmtCpns: parseOptionalDate(pick(row, ['tmt cpns', 'tmtcpns'])),
    nomorSkPns: cleanNullable(pick(row, ['nomor sk pns', 'nomorskpns'])),
    tanggalSkPns: parseOptionalDate(pick(row, ['tanggal sk pns', 'tanggalskpns'])),
    tmtPns: parseOptionalDate(pick(row, ['tmt pns', 'tmtpns'])),
    tmtGolongan: parseOptionalDate(pick(row, ['tmt golongan', 'tmtgolongan'])),
    mkTahun: parseOptionalInt(pick(row, ['mk tahun', 'mktahun'])),
    mkBulan: parseOptionalInt(pick(row, ['mk bulan', 'mkbulan'])),
    tmtJabatan: parseOptionalDate(pick(row, ['tmt jabatan', 'tmtjabatan'])),
    namaSekolah: cleanNullable(pick(row, ['nama sekolah', 'namasekolah'])),
    tahunLulus: parseOptionalInt(pick(row, ['tahun lulus', 'tahunlulus'])),
    lokasiKerja: cleanNullable(pick(row, ['lokasi kerja nama', 'lokasi kerja', 'lokasikerja'])),
    unitOrganisasiId: unitOrganisasiId || null,
    nikValid: parseBoolean(pick(row, ['is valid nik', 'valid nik', 'nik valid', 'nikvalid'])),
    flagIkd: parseBoolean(pick(row, ['flag ikd', 'flagikd'])),
    statusPegawai: pick(row, ['statusPegawai', 'status_pegawai', 'statuspegawai', 'kedudukan hukum nama', 'kedudukan hukum', 'status']) || 'Aktif',
  }
}

// Diagnosa: baca kolom Excel dan 3 baris pertama tanpa menyimpan apapun
integrasiRoutes.post('/diagnosa/asn', upload.single('file'), async (req, res, next) => {
  const file = req.file
  if (!file) { next(new AppError('File Excel wajib diunggah', 422)); return }
  try {
    const rows = await readExcelRows(file.path)
    if (rows.length === 0) { sendSuccess(res, { kolom: [], contoh: [], pesan: 'File kosong atau tidak ada baris data' }); return }

    const kolomAsli = Object.keys(rows[0])
    const kolomNormalized = kolomAsli.map((k) => ({ asli: k, normalized: normKey(k) }))
    const contoh = rows.slice(0, 3).map((row) => parseAsnRow(row))
    const nipDetected = contoh.every((r) => r.nipBaru !== '')
    const namaDetected = contoh.every((r) => r.nama !== '')
    const nipValid = contoh.every((r) => /^\d{18}$/.test(r.nipBaru))

    sendSuccess(res, {
      totalBaris: rows.length,
      kolom: kolomNormalized,
      contohParsed: contoh,
      deteksi: {
        nip: nipDetected && nipValid
          ? 'OK'
          : nipDetected
            ? `KOLOM DITEMUKAN tapi nilai tidak valid — contoh: "${contoh[0]?.nipBaru}" (harus 18 digit)`
            : 'TIDAK DITEMUKAN — pastikan kolom bernama: nip, nipBaru, nip_baru',
        nama: namaDetected ? 'OK' : 'TIDAK DITEMUKAN — pastikan kolom bernama: nama, nama lengkap',
      },
    }, 'Diagnosa selesai')
  } catch (err) { next(err) }
})

integrasiRoutes.post('/import/asn', upload.single('file'), async (req, res, next) => {
  const file = req.file
  if (!file) {
    next(new AppError('File Excel wajib diunggah', 422))
    return
  }

  const log = await db.siasnImportLog.create({
    data: {
      filename: file.originalname,
      jenisData: 'ASN',
      totalBaris: 0,
      importedOlehId: req.user?.id,
      status: 'Processing',
      startedAt: new Date(),
    },
  })

  try {
    const rows = await readExcelRows(file.path)
    const kolomTerdeteksi = rows.length > 0 ? Object.keys(rows[0]).join(', ') : '(tidak ada baris)'
    const parsedRows = rows.map((row) => parseAsnRow(row))
    const candidateUnitIds = [...new Set(parsedRows.map((row) => row.unitOrganisasiId).filter((id): id is string => Boolean(id)))]
    const existingUnits = candidateUnitIds.length > 0
      ? await db.refUnitOrganisasi.findMany({
          where: { idSiasn: { in: candidateUnitIds } },
          select: { id: true, idSiasn: true },
        })
      : []
    const unitIdBySiasn = new Map(existingUnits.map((unit) => [unit.idSiasn!, unit.id]))
    const skippedUnitIds = new Set(candidateUnitIds.filter((id) => !unitIdBySiasn.has(id)))

    // Golongan lookup by kode
    const candidateGolonganKodes = [...new Set(parsedRows.map((r) => r.golonganKode).filter((k): k is string => Boolean(k)))]
    const golonganKodeToId = candidateGolonganKodes.length > 0
      ? new Map((await db.refGolongan.findMany({
          where: { kode: { in: candidateGolonganKodes } },
          select: { id: true, kode: true },
        })).map((g) => [g.kode, g.id]))
      : new Map<string, bigint>()

    // Jabatan lookup by idSiasn. Semua jenis jabatan SIASN disimpan dalam tabel ref_jabatan.
    const candidateJabatanIds = [...new Set(parsedRows
      .flatMap((r) => [r.jabatanStrukturaLSiasnId, r.jabatanFungsionalSiasnId, r.jabatanPelaksanaSiasnId])
      .filter((id): id is string => Boolean(id)))]
    const jabatanSiasnToId = candidateJabatanIds.length > 0
      ? new Map((await db.refJabatan.findMany({
          where: { idSiasn: { in: candidateJabatanIds } },
          select: { id: true, idSiasn: true },
        })).map((j) => [j.idSiasn!, j.id]))
      : new Map<string, bigint>()

    // Bidang pendidikan: direct id lookup (string UUID)
    const candidateBidangIds = [...new Set(parsedRows.map((r) => r.bidangPendidikanId).filter((id): id is string => Boolean(id)))]
    const existingBidangIds = candidateBidangIds.length > 0
      ? new Map((await db.refPendidikan.findMany({ where: { idSiasn: { in: candidateBidangIds } }, select: { id: true, idSiasn: true } })).map((b) => [b.idSiasn!, b.id]))
      : new Map<string, bigint>()

    let successBaris = 0
    const errors: Prisma.SiasnImportErrorCreateManyInput[] = []

    for (const [index, row] of rows.entries()) {
      const nomorBaris = index + 2
      const parsed = parsedRows[index]
      const rowErrors: string[] = []
      if (!validateNip(parsed.nipBaru)) rowErrors.push('NIP harus 18 digit angka')
      if (!parsed.nama) rowErrors.push('Nama wajib diisi')
      if (!validateNik(parsed.nik ?? '')) rowErrors.push('NIK harus 16 digit angka')

      if (rowErrors.length) {
        errors.push({
          importLogId: log.id,
          nomorBaris,
          nomorId: parsed.nipBaru || parsed.nik,
          dataAsli: row as Prisma.InputJsonObject,
          errorMessage: rowErrors.join('; '),
        })
        continue
      }

      try {
        const unitOrganisasiId = parsed.unitOrganisasiId && unitIdBySiasn.has(parsed.unitOrganisasiId)
          ? unitIdBySiasn.get(parsed.unitOrganisasiId)!
          : null
        const jabatanId =
          (parsed.jabatanStrukturaLSiasnId ? jabatanSiasnToId.get(parsed.jabatanStrukturaLSiasnId) : undefined) ??
          (parsed.jabatanFungsionalSiasnId ? jabatanSiasnToId.get(parsed.jabatanFungsionalSiasnId) : undefined) ??
          (parsed.jabatanPelaksanaSiasnId ? jabatanSiasnToId.get(parsed.jabatanPelaksanaSiasnId) : undefined) ??
          null

        // Upsert ref_jenis_pegawai jika ada ID dan nama
        let jenisPegawaiInternalId: bigint | null = null
        if (parsed.jenisPegawaiId != null && parsed.jenisPegawaiNama) {
          const jenisPegawai = await db.refJenisPegawai.upsert({
            where: { idSiasn: String(parsed.jenisPegawaiId) },
            create: { idSiasn: String(parsed.jenisPegawaiId), nama: parsed.jenisPegawaiNama },
            update: { nama: parsed.jenisPegawaiNama },
          })
          jenisPegawaiInternalId = jenisPegawai.id
        }

        // Upsert ref_tempat_lahir jika ada ID dan nama
        const tempatLahir = parsed.tempatLahirId && parsed.tempatLahirNama
          ? await db.refWilayah.upsert({
            where: { idSiasn: parsed.tempatLahirId },
            create: { idSiasn: parsed.tempatLahirId, nama: parsed.tempatLahirNama },
            update: { nama: parsed.tempatLahirNama },
          })
          : null

        const data = {
          nipBaru: parsed.nipBaru,
          nipLama: parsed.nipLama,
          nama: parsed.nama,
          gelarDepan: parsed.gelarDepan,
          gelarBelakang: parsed.gelarBelakang,
          tempatLahirId: tempatLahir?.id ?? null,
          tanggalLahir: parsed.tanggalLahir,
          jenisKelaminId: parsed.jenisKelaminId,
          agamaId: parsed.agamaId != null ? BigInt(parsed.agamaId) : null,
          statusKawinId: parsed.statusKawinId != null ? BigInt(parsed.statusKawinId) : null,
          golonganId: parsed.golonganKode ? (golonganKodeToId.get(parsed.golonganKode) ?? null) : null,
          jenisJabatanId: parsed.jenisJabatanId != null ? BigInt(parsed.jenisJabatanId) : null,
          jabatanId,
          tingkatPendidikanId: parsed.tingkatPendidikanId != null ? BigInt(parsed.tingkatPendidikanId) : null,
          bidangPendidikanId: parsed.bidangPendidikanId ? (existingBidangIds.get(parsed.bidangPendidikanId) ?? null) : null,
          nik: parsed.nik,
          nikValid: parsed.nikValid ?? Boolean(parsed.nik),
          email: parsed.email,
          emailGov: parsed.emailGov,
          nomorHp: parsed.nomorHp,
          alamat: parsed.alamat,
          npwp: parsed.npwp,
          bpjs: parsed.bpjs,
          jenisPegawaiId: jenisPegawaiInternalId,
          kedudukanHukum: parsed.kedudukanHukum,
          nomorSkCpns: parsed.nomorSkCpns,
          tanggalSkCpns: parsed.tanggalSkCpns,
          tmtCpns: parsed.tmtCpns,
          nomorSkPns: parsed.nomorSkPns,
          tanggalSkPns: parsed.tanggalSkPns,
          tmtPns: parsed.tmtPns,
          tmtGolongan: parsed.tmtGolongan,
          mkTahun: parsed.mkTahun,
          mkBulan: parsed.mkBulan,
          tmtJabatan: parsed.tmtJabatan,
          namaSekolah: parsed.namaSekolah,
          tahunLulus: parsed.tahunLulus,
          lokasiKerja: parsed.lokasiKerja,
          unitOrganisasiId,
          flagIkd: parsed.flagIkd,
          statusPegawai: normalizeStatusPegawai(parsed.statusPegawai),
          lastSyncSiasn: new Date(),
        } satisfies Omit<Prisma.AsnUncheckedUpdateInput, 'id'>

        await db.asn.upsert({
          where: { nipBaru: parsed.nipBaru },
          create: data,
          update: data,
        })
        successBaris += 1
      } catch (error) {
        errors.push({
          importLogId: log.id,
          nomorBaris,
          nomorId: parsed.nipBaru,
          dataAsli: row as Prisma.InputJsonObject,
          errorMessage: error instanceof Error ? error.message : 'Gagal menyimpan baris',
        })
      }
    }

    if (errors.length) await db.siasnImportError.createMany({ data: errors })
    const status = errors.length === 0 ? 'Success' : successBaris > 0 ? 'PartialFail' : 'Failed'
    const updated = await db.siasnImportLog.update({
      where: { id: log.id },
      data: {
        totalBaris: rows.length,
        successBaris,
        failedBaris: errors.length,
        errorDetails: {
          errors: errors.slice(0, 20).map((error) => ({
            nomorBaris: error.nomorBaris,
            nomorId: error.nomorId,
            errorMessage: error.errorMessage,
          })),
          ...(skippedUnitIds.size > 0
            ? {
                unitOrganisasiTidakDitemukan: [...skippedUnitIds].slice(0, 50),
                totalUnitOrganisasiTidakDitemukan: skippedUnitIds.size,
              }
            : {}),
        },
        status,
        completedAt: new Date(),
      },
    })
    sendSuccess(res, { ...updated, kolomTerdeteksi }, 'Import ASN selesai')
  } catch (error) {
    await db.siasnImportLog.update({
      where: { id: log.id },
      data: { status: 'Failed', completedAt: new Date(), errorDetails: { message: error instanceof Error ? error.message : 'Unknown error' } },
    })
    next(error)
  }
})

integrasiRoutes.get('/status', async (_req, res, next) => {
  try {
    const status = await db.siasnImportLog.findMany({
      orderBy: { createdAt: 'desc' },
      distinct: ['jenisData'],
      select: {
        id: true,
        jenisData: true,
        status: true,
        createdAt: true,
        successBaris: true,
        failedBaris: true,
      },
    })
    sendSuccess(res, status, 'Status integrasi')
  } catch (error) {
    next(error)
  }
})

integrasiRoutes.get('/log', async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query)
    const [data, total] = await Promise.all([
      db.siasnImportLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.siasnImportLog.count(),
    ])
    sendPaginated(res, data, buildMeta(total, page, limit))
  } catch (error) {
    next(error)
  }
})

integrasiRoutes.get('/log/:id', async (req, res, next) => {
  try {
    const log = await db.siasnImportLog.findUnique({
      where: { id: BigInt(req.params.id) },
      include: { errors: { take: 100, orderBy: { nomorBaris: 'asc' } } },
    })
    if (!log) throw new NotFoundError('Log tidak ditemukan')
    sendSuccess(res, log, 'Detail log import')
  } catch (error) {
    next(error)
  }
})

integrasiRoutes.get('/log/:id/errors', async (req, res, next) => {
  try {
    const importLogId = BigInt(req.params.id)
    const errors = await db.siasnImportError.findMany({
      where: { importLogId },
      orderBy: { nomorBaris: 'asc' },
      take: 1000,
    })
    const errorRows = errors.map((item) => ({
      nomorBaris: item.nomorBaris,
      nomorId: item.nomorId,
      errorMessage: item.errorMessage,
      dataAsli: JSON.stringify(item.dataAsli),
    }))
    const workbook = new ExcelJS.Workbook()
    const ws = workbook.addWorksheet('Errors')
    if (errorRows.length > 0) ws.columns = Object.keys(errorRows[0]).map((key) => ({ header: key, key }))
    ws.addRows(errorRows)
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer())
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="import-errors-${req.params.id}.xlsx"`)
    res.send(buffer)
  } catch (error) {
    next(error)
  }
})

integrasiRoutes.get('/validasi', async (_req, res, next) => {
  try {
    const [asnTanpaUnit, duplikatNik] = await Promise.all([
      db.asn.count({ where: { deletedAt: null, unitOrganisasiId: null } }),
      db.asn.groupBy({
        by: ['nik'],
        where: { deletedAt: null, nik: { not: null } },
        _count: { nik: true },
        having: { nik: { _count: { gt: 1 } } },
      }),
    ])
    sendSuccess(res, {
      asnTanpaUnit,
      duplikatNik: duplikatNik.length,
      duplikatNip: 0,
    }, 'Hasil validasi data')
  } catch (error) {
    next(error)
  }
})

integrasiRoutes.post('/validasi/run', async (_req, res, next) => {
  try {
    const [asnTanpaUnit, duplikatNik] = await Promise.all([
      db.asn.count({ where: { deletedAt: null, unitOrganisasiId: null } }),
      db.asn.groupBy({
        by: ['nik'],
        where: { deletedAt: null, nik: { not: null } },
        _count: { nik: true },
        having: { nik: { _count: { gt: 1 } } },
      }),
    ])
    sendSuccess(res, {
      asnTanpaUnit,
      duplikatNik: duplikatNik.length,
      duplikatNip: 0,
      checkedAt: new Date(),
    }, 'Validasi ulang selesai')
  } catch (error) {
    next(error)
  }
})
