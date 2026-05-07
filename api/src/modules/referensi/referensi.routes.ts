import { Router } from 'express'
import ExcelJS from 'exceljs'
import { db } from '@/core/database/prisma.client'
import { AppError } from '@/core/errors/app-error'
import { sendSuccess } from '@/core/http/response.helper'
import { authorize } from '@/core/middleware/rbac.middleware'
import { upload } from '@/core/middleware/upload.middleware'
import { validate } from '@/core/middleware/validate.middleware'
import { ROLES } from '@/shared/constants'
import {
  createGolonganSchema,
  createJabatanFungsionalSchema,
  createJabatanPelaksanaSchema,
  createJabatanStrukturalSchema,
  createJenisJabatanSchema,
  createJenisLayananSchema,
  createRefJenisKelaminSchema,
  createRefJabatanSchema,
  createRefMasterSchema,
  createRefPendidikanSchema,
  createRefStatusAsnSchema,
  createTemplateDokumenSchema,
  createUnitOrganisasiSchema,
  replacePersyaratanSchema,
  updateGolonganSchema,
  updateJabatanFungsionalSchema,
  updateJabatanPelaksanaSchema,
  updateJabatanStrukturalSchema,
  updateJenisJabatanSchema,
  updateJenisLayananSchema,
  updateRefJenisKelaminSchema,
  updateRefJabatanSchema,
  updateRefMasterSchema,
  updateRefPendidikanSchema,
  updateRefStatusAsnSchema,
  updateTemplateDokumenSchema,
  updateUnitOrganisasiSchema,
} from './dto/referensi.dto'
import { referensiController } from './referensi.controller'

export const referensiRoutes = Router()
const adminOnly = authorize(ROLES.ADMIN_SISTEM)

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

const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

const ensureJenisJabatan = (nama: string, kode: string) =>
  db.refJenisJabatan.upsert({
    where: { nama },
    create: { nama, kode },
    update: { kode },
  })

referensiRoutes.get('/agama', referensiController.agama)
referensiRoutes.post('/agama', adminOnly, validate(createRefMasterSchema), referensiController.createAgama)
referensiRoutes.put('/agama/:id', adminOnly, validate(updateRefMasterSchema), referensiController.updateAgama)
referensiRoutes.delete('/agama/:id', adminOnly, referensiController.deleteAgama)
referensiRoutes.get('/jenis-kelamin', referensiController.jenisKelamin)
referensiRoutes.post('/jenis-kelamin', adminOnly, validate(createRefJenisKelaminSchema), referensiController.createJenisKelamin)
referensiRoutes.put('/jenis-kelamin/:id', adminOnly, validate(updateRefJenisKelaminSchema), referensiController.updateJenisKelamin)
referensiRoutes.delete('/jenis-kelamin/:id', adminOnly, referensiController.deleteJenisKelamin)
referensiRoutes.get('/status-perkawinan', referensiController.statusPerkawinan)
referensiRoutes.post('/status-perkawinan', adminOnly, validate(createRefMasterSchema), referensiController.createStatusPerkawinan)
referensiRoutes.put('/status-perkawinan/:id', adminOnly, validate(updateRefMasterSchema), referensiController.updateStatusPerkawinan)
referensiRoutes.delete('/status-perkawinan/:id', adminOnly, referensiController.deleteStatusPerkawinan)
referensiRoutes.get('/jenis-pegawai', referensiController.jenisPegawai)
referensiRoutes.post('/jenis-pegawai', adminOnly, validate(createRefMasterSchema), referensiController.createJenisPegawai)
referensiRoutes.put('/jenis-pegawai/:id', adminOnly, validate(updateRefMasterSchema), referensiController.updateJenisPegawai)
referensiRoutes.delete('/jenis-pegawai/:id', adminOnly, referensiController.deleteJenisPegawai)
referensiRoutes.get('/kedudukan-hukum', referensiController.kedudukanHukum)
referensiRoutes.post('/kedudukan-hukum', adminOnly, validate(createRefMasterSchema), referensiController.createKedudukanHukum)
referensiRoutes.put('/kedudukan-hukum/:id', adminOnly, validate(updateRefMasterSchema), referensiController.updateKedudukanHukum)
referensiRoutes.delete('/kedudukan-hukum/:id', adminOnly, referensiController.deleteKedudukanHukum)
referensiRoutes.get('/status-asn', referensiController.statusAsn)
referensiRoutes.post('/status-asn', adminOnly, validate(createRefStatusAsnSchema), referensiController.createStatusAsn)
referensiRoutes.put('/status-asn/:id', adminOnly, validate(updateRefStatusAsnSchema), referensiController.updateStatusAsn)
referensiRoutes.delete('/status-asn/:id', adminOnly, referensiController.deleteStatusAsn)

referensiRoutes.get('/golongan', referensiController.golongan)
referensiRoutes.post('/golongan', adminOnly, validate(createGolonganSchema), referensiController.createGolongan)
referensiRoutes.put('/golongan/:id', adminOnly, validate(updateGolonganSchema), referensiController.updateGolongan)
referensiRoutes.delete('/golongan/:id', adminOnly, referensiController.deleteGolongan)

referensiRoutes.get('/unit-organisasi', referensiController.unitOrganisasi)
referensiRoutes.get('/unit-organisasi/:id', referensiController.unitOrganisasiById)
referensiRoutes.post('/unit-organisasi', adminOnly, validate(createUnitOrganisasiSchema), referensiController.createUnitOrganisasi)
referensiRoutes.put('/unit-organisasi/:id', adminOnly, validate(updateUnitOrganisasiSchema), referensiController.updateUnitOrganisasi)
referensiRoutes.delete('/unit-organisasi/:id', adminOnly, referensiController.deleteUnitOrganisasi)

// Import Unit Organisasi dari Excel SIASN.
// Header didukung: ID_UNOR/UNOR_ID/KODE_UNOR, NAMA_UNOR/NAMA_UNIT,
// ID_ATASAN/PARENT_ID/DIATASAN_ID, LEVEL, dan IS_OPD/OPD.
referensiRoutes.post('/unit-organisasi/import', adminOnly, upload.single('file'), async (req, res, next) => {
  const file = req.file
  if (!file) {
    next(new AppError('File Excel wajib diunggah', 422))
    return
  }

  try {
    const rows = await readExcelRows(file.path)

    const toStr = (value: unknown): string => (value == null ? '' : String(value))
    const normalizeKey = (key: string): string => key.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')

    const pick = (row: Record<string, unknown>, ...keys: string[]): string => {
      const map = new Map(Object.entries(row).map(([key, value]) => [normalizeKey(key), value]))
      for (const key of keys) {
        const value = toStr(map.get(normalizeKey(key))).trim()
        if (value !== '') return value
      }
      return ''
    }

    const pickRaw = (row: Record<string, unknown>, ...keys: string[]): string => {
      const map = new Map(Object.entries(row).map(([key, value]) => [normalizeKey(key), value]))
      for (const key of keys) {
        const value = toStr(map.get(normalizeKey(key)))
        if (value.trim() !== '') return value
      }
      return ''
    }

    const parseBoolean = (value: string): boolean | null => {
      const normalized = value.trim().toLowerCase()
      if (['1', 'true', 'ya', 'y', 'opd'].includes(normalized)) return true
      if (['0', 'false', 'tidak', 'n'].includes(normalized)) return false
      return null
    }

    const parseLevel = (value: string): number | null => {
      const parsed = Number(value)
      return Number.isInteger(parsed) && parsed > 0 ? parsed : null
    }

    type ParsedRow = {
      baris: number
      id: string
      namaRaw: string
      nama: string
      idAtasan: string | null
      leadingWs: number
      explicitLevel: number | null
      explicitIsOpd: boolean | null
    }

    const parsed: ParsedRow[] = []
    const errors: Array<{ baris: number; pesan: string }> = []
    const seenIds = new Set<string>()

    for (const [i, row] of rows.entries()) {
      const nomorBaris = i + 2
      const id = pick(row, 'ID', 'ID_UNOR', 'UNOR_ID', 'UNORID', 'KODE', 'KODE_UNOR', 'KODEUNOR')
      const namaRaw = pickRaw(row, 'NAMA_UNOR', 'NAMA UNOR', 'NAMAUNOR', 'NAMA', 'NAMA_UNIT', 'NAMA UNIT', 'UNOR')
      const idAtasanRaw = pick(
        row,
        'ID_ATASAN',
        'ID ATASAN',
        'IDATASAN',
        'PARENT_ID',
        'PARENTID',
        'ID_INDUK',
        'INDUK_ID',
        'UNOR_INDUK_ID',
        'DIATASAN_ID',
        'DIATASANID',
        'ATASAN_ID',
        'KODE_ATASAN',
      )
      const explicitLevel = parseLevel(pick(row, 'LEVEL', 'LVL', 'TINGKAT'))
      const explicitIsOpd = parseBoolean(pick(row, 'IS_OPD', 'ISOPD', 'OPD', 'UNIT_OPD'))

      if (!id) { errors.push({ baris: nomorBaris, pesan: 'Kolom ID wajib diisi' }); continue }
      if (!namaRaw.trim()) { errors.push({ baris: nomorBaris, pesan: 'Kolom NAMA_UNOR wajib diisi' }); continue }
      if (seenIds.has(id)) { errors.push({ baris: nomorBaris, pesan: `ID '${id}' duplikat di file` }); continue }
      seenIds.add(id)

      parsed.push({
        baris: nomorBaris,
        id,
        namaRaw,
        nama: namaRaw.trim(),
        idAtasan: idAtasanRaw || null,
        leadingWs: namaRaw.length - namaRaw.trimStart().length,
        explicitLevel,
        explicitIsOpd,
      })
    }

    const rowsById = new Map(parsed.map((row) => [row.id, row]))
    const externalParentIds = [
      ...new Set(parsed
        .map((row) => row.idAtasan)
        .filter((id): id is string => id !== null && !rowsById.has(id))),
    ]
    const existingExternalParents = externalParentIds.length > 0
      ? new Set((await db.refUnitOrganisasi.findMany({
        where: { idSiasn: { in: externalParentIds } },
        select: { idSiasn: true },
      })).map((unit) => unit.idSiasn).filter((id): id is string => Boolean(id)))
      : new Set<string>()

    for (const row of parsed) {
      if (row.idAtasan === row.id) {
        errors.push({ baris: row.baris, pesan: `ID_ATASAN tidak boleh sama dengan ID untuk '${row.nama}'` })
        row.idAtasan = null
      } else if (row.idAtasan && !rowsById.has(row.idAtasan) && !existingExternalParents.has(row.idAtasan)) {
        errors.push({ baris: row.baris, pesan: `ID_ATASAN '${row.idAtasan}' tidak ditemukan untuk unit '${row.nama}'` })
        row.idAtasan = null
      }
    }

    const distinctIndents = [...new Set(parsed.map((row) => row.leadingWs))].sort((a, b) => a - b)
    const indentToLevel = new Map(distinctIndents.map((ws, index) => [ws, index + 1]))
    const levelMemo = new Map<string, number>()
    const resolveLevel = (row: ParsedRow, stack = new Set<string>()): number => {
      if (row.explicitLevel) return row.explicitLevel
      const cached = levelMemo.get(row.id)
      if (cached) return cached
      if (!row.idAtasan || stack.has(row.idAtasan)) {
        const fallback = indentToLevel.get(row.leadingWs) ?? 1
        levelMemo.set(row.id, fallback)
        return fallback
      }

      const parent = rowsById.get(row.idAtasan)
      if (!parent) {
        const fallback = indentToLevel.get(row.leadingWs) ?? 1
        levelMemo.set(row.id, fallback)
        return fallback
      }

      stack.add(row.id)
      const level = resolveLevel(parent, stack) + 1
      levelMemo.set(row.id, level)
      return level
    }

    let berhasil = 0
    let diperbarui = 0
    const existingUnitIds = parsed.length > 0
      ? new Set((await db.refUnitOrganisasi.findMany({
        where: { idSiasn: { in: parsed.map((row) => row.id) } },
        select: { idSiasn: true },
      })).map((unit) => unit.idSiasn).filter((id): id is string => Boolean(id)))
      : new Set<string>()

    const upsertOps = parsed.map((row) => {
      const level = resolveLevel(row)
      const isOpd = row.explicitIsOpd ?? level === 2
      if (existingUnitIds.has(row.id)) {
        diperbarui++
        return db.refUnitOrganisasi.update({
          where: { idSiasn: row.id },
          data: { nama: row.nama, level, isOpd },
        })
      }

      berhasil++
      return db.refUnitOrganisasi.create({
          data: { idSiasn: row.id, kode: row.id, nama: row.nama, level, isOpd, idAtasan: null },
        })
    })

    for (const ops of chunk(upsertOps, 100)) {
      await db.$transaction(ops)
    }

    const persistedUnits = await db.refUnitOrganisasi.findMany({
      where: { idSiasn: { in: parsed.flatMap((row) => [row.id, row.idAtasan].filter((id): id is string => Boolean(id))) } },
      select: { id: true, idSiasn: true },
    })
    const idBySiasn = new Map(persistedUnits.map((unit) => [unit.idSiasn!, unit.id]))
    const parentOps = parsed
      .filter((row) => row.idAtasan && idBySiasn.has(row.idAtasan) && idBySiasn.has(row.id))
      .map((row) => db.refUnitOrganisasi.update({
        where: { id: idBySiasn.get(row.id)! },
        data: { idAtasan: idBySiasn.get(row.idAtasan!)! },
      }))

    for (const ops of chunk(parentOps, 100)) {
      await db.$transaction(ops)
    }

    sendSuccess(res, { total: parsed.length, berhasil, diperbarui, errors }, `Import selesai: ${berhasil} ditambahkan, ${diperbarui} diperbarui, ${errors.length} error`)
  } catch (err) {
    next(err)
  }
})

referensiRoutes.get('/jenis-jabatan', referensiController.jenisJabatan)
referensiRoutes.get('/jabatan', referensiController.jabatan)
referensiRoutes.post('/jenis-jabatan', adminOnly, validate(createJenisJabatanSchema), referensiController.createJenisJabatan)
referensiRoutes.put('/jenis-jabatan/:id', adminOnly, validate(updateJenisJabatanSchema), referensiController.updateJenisJabatan)
referensiRoutes.delete('/jenis-jabatan/:id', adminOnly, referensiController.deleteJenisJabatan)

referensiRoutes.get('/jabatan/struktural', referensiController.jabatanStruktural)
referensiRoutes.post('/jabatan/struktural', adminOnly, validate(createJabatanStrukturalSchema), referensiController.createJabatanStruktural)
referensiRoutes.put('/jabatan/struktural/:id', adminOnly, validate(updateJabatanStrukturalSchema), referensiController.updateJabatanStruktural)
referensiRoutes.delete('/jabatan/struktural/:id', adminOnly, referensiController.deleteJabatanStruktural)

// Import Jabatan Struktural dari Excel SIASN.
// Header: ID/ID_JABATAN, NAMA/NAMA_JABATAN, ID_UNOR/UNOR_ID, ESELON/ESELON_ID, BUP, KODE, ID_SIASN.
// Update hanya mengubah nama/unit/eselon/bup — kode dan id_siasn tidak diubah agar tidak melanggar UNIQUE constraint.
referensiRoutes.post('/jabatan/struktural/import', adminOnly, upload.single('file'), async (req, res, next) => {
  const file = req.file
  if (!file) { next(new AppError('File Excel wajib diunggah', 422)); return }
  try {
    const rows = await readExcelRows(file.path)

    const toStr = (v: unknown): string => v == null ? '' : String(v)
    const normKey = (k: string): string => k.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
    const pick = (row: Record<string, unknown>, ...keys: string[]): string => {
      const map = new Map(Object.entries(row).map(([k, v]) => [normKey(k), v]))
      for (const k of keys) { const v = toStr(map.get(normKey(k))).trim(); if (v) return v }
      return ''
    }

    type StrukturalRow = { baris: number; id: string; nama: string; unitOrganisasiId: string; eselonId: number | null; bup: number; kode: string | null; idSiasn: string | null }
    const parsed: StrukturalRow[] = []
    const errors: Array<{ baris: number; pesan: string }> = []
    const seenIds = new Set<string>()

    for (const [i, row] of rows.entries()) {
      const baris = i + 2
      const id = pick(row, 'ID', 'ID_JABATAN', 'JABATAN_ID', 'KODE_JABATAN', 'ID_JABATAN_STRUKTURAL')
      const nama = pick(row, 'NAMA', 'NAMA_JABATAN', 'NAMA_JABATAN_STRUKTURAL')
      const unitOrganisasiId = pick(row, 'ID_UNOR', 'UNOR_ID', 'UNIT_ORGANISASI_ID', 'UNITORGID', 'KODE_UNOR', 'ID_UNIT_ORGANISASI', 'UNOR')
      const eselonRaw = pick(row, 'ESELON', 'ESELON_ID', 'ID_ESELON', 'TINGKAT_ESELON')
      const bupRaw = pick(row, 'BUP', 'BATAS_USIA_PENSIUN')
      const kode = pick(row, 'KODE', 'KODE_JABATAN') || null
      const idSiasn = pick(row, 'ID_SIASN', 'IDSIASN') || null

      if (!id) { errors.push({ baris, pesan: 'Kolom ID wajib diisi' }); continue }
      if (!nama) { errors.push({ baris, pesan: 'Kolom NAMA wajib diisi' }); continue }
      if (!unitOrganisasiId) { errors.push({ baris, pesan: 'Kolom ID_UNOR (Unit Organisasi) wajib diisi' }); continue }
      if (seenIds.has(id)) { errors.push({ baris, pesan: `ID '${id}' duplikat di file` }); continue }
      seenIds.add(id)

      const eselonId = eselonRaw && Number.isInteger(Number(eselonRaw)) ? Number(eselonRaw) : null
      const bup = bupRaw && Number.isInteger(Number(bupRaw)) ? Number(bupRaw) : 58
      parsed.push({ baris, id, nama, unitOrganisasiId, eselonId, bup, kode, idSiasn })
    }

    const allUnorIds = [...new Set(parsed.map(r => r.unitOrganisasiId))]
    const existingUnors = allUnorIds.length > 0
      ? await db.refUnitOrganisasi.findMany({ where: { idSiasn: { in: allUnorIds } }, select: { id: true, idSiasn: true } })
      : []
    const unorIdBySiasn = new Map(existingUnors.map((r) => [r.idSiasn!, r.id]))

    const validRows = parsed.filter(row => {
      if (!unorIdBySiasn.has(row.unitOrganisasiId)) {
        errors.push({ baris: row.baris, pesan: `Unit Organisasi '${row.unitOrganisasiId}' tidak ditemukan di database` })
        return false
      }
      return true
    })

    const jenis = await ensureJenisJabatan('Struktural', 'STRUKTURAL')
    const existingIds = validRows.length > 0
      ? new Set((await db.refJabatan.findMany({
        where: { idSiasn: { in: validRows.map(r => r.idSiasn ?? r.id) } },
        select: { idSiasn: true },
      })).map(r => r.idSiasn).filter((id): id is string => Boolean(id)))
      : new Set<string>()

    let berhasil = 0
    let diperbarui = 0
    const upsertOps = validRows.map(row => {
      const idSiasn = row.idSiasn ?? row.id
      if (existingIds.has(idSiasn)) {
        diperbarui++
        return db.refJabatan.update({
          where: { idSiasn },
          data: {
            nama: row.nama,
            jenisJabatanId: jenis.id,
            unitOrganisasiId: unorIdBySiasn.get(row.unitOrganisasiId)!,
            eselonId: row.eselonId,
            bup: row.bup,
          },
        })
      }
      berhasil++
      return db.refJabatan.create({
        data: {
          idSiasn,
          kode: row.kode,
          nama: row.nama,
          jenisJabatanId: jenis.id,
          unitOrganisasiId: unorIdBySiasn.get(row.unitOrganisasiId)!,
          eselonId: row.eselonId,
          bup: row.bup,
        },
      })
    })

    for (const ops of chunk(upsertOps, 100)) { await db.$transaction(ops) }
    sendSuccess(res, { total: parsed.length, berhasil, diperbarui, errors }, `Import selesai: ${berhasil} ditambahkan, ${diperbarui} diperbarui, ${errors.length} error`)
  } catch (err) { next(err) }
})

referensiRoutes.get('/jabatan/fungsional', referensiController.jabatanFungsional)
referensiRoutes.post('/jabatan/fungsional', adminOnly, validate(createJabatanFungsionalSchema), referensiController.createJabatanFungsional)
referensiRoutes.put('/jabatan/fungsional/:id', adminOnly, validate(updateJabatanFungsionalSchema), referensiController.updateJabatanFungsional)
referensiRoutes.delete('/jabatan/fungsional/:id', adminOnly, referensiController.deleteJabatanFungsional)

// Import Jabatan Fungsional dari Excel SIASN.
// Header: ID/ID_JABATAN, KODE/KODE_JABATAN, NAMA/NAMA_JABATAN, JENJANG, BUP, ID_SIASN.
referensiRoutes.post('/jabatan/fungsional/import', adminOnly, upload.single('file'), async (req, res, next) => {
  const file = req.file
  if (!file) { next(new AppError('File Excel wajib diunggah', 422)); return }
  try {
    const rows = await readExcelRows(file.path)

    const toStr = (v: unknown): string => v == null ? '' : String(v)
    const normKey = (k: string): string => k.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
    const pick = (row: Record<string, unknown>, ...keys: string[]): string => {
      const map = new Map(Object.entries(row).map(([k, v]) => [normKey(k), v]))
      for (const k of keys) { const v = toStr(map.get(normKey(k))).trim(); if (v) return v }
      return ''
    }

    type FungsionalRow = { baris: number; id: string; kode: string | null; nama: string; jenjang: string | null; bup: number; idSiasn: string | null }
    const parsed: FungsionalRow[] = []
    const errors: Array<{ baris: number; pesan: string }> = []
    const seenIds = new Set<string>()

    for (const [i, row] of rows.entries()) {
      const baris = i + 2
      const id = pick(row, 'ID', 'ID_JABATAN', 'JABATAN_ID', 'KODE_JABATAN', 'ID_JABATAN_FUNGSIONAL')
      const kode = pick(row, 'KODE', 'KODE_JABATAN') || null
      const nama = pick(row, 'NAMA', 'NAMA_JABATAN', 'NAMA_JABATAN_FUNGSIONAL')
      const jenjang = pick(row, 'JENJANG', 'JENJANG_JABATAN', 'TINGKAT_JENJANG', 'TINGKAT') || null
      const bupRaw = pick(row, 'BUP', 'BATAS_USIA_PENSIUN')
      const idSiasn = pick(row, 'ID_SIASN', 'IDSIASN') || null

      if (!id) { errors.push({ baris, pesan: 'Kolom ID wajib diisi' }); continue }
      if (!nama) { errors.push({ baris, pesan: 'Kolom NAMA wajib diisi' }); continue }
      if (seenIds.has(id)) { errors.push({ baris, pesan: `ID '${id}' duplikat di file` }); continue }
      seenIds.add(id)

      const bup = bupRaw && Number.isInteger(Number(bupRaw)) ? Number(bupRaw) : 65
      parsed.push({ baris, id, kode, nama, jenjang, bup, idSiasn })
    }

    const jenis = await ensureJenisJabatan('Fungsional', 'FUNGSIONAL')
    const existingIds = parsed.length > 0
      ? new Set((await db.refJabatan.findMany({
        where: { idSiasn: { in: parsed.map(r => r.idSiasn ?? r.id) } },
        select: { idSiasn: true },
      })).map(r => r.idSiasn).filter((id): id is string => Boolean(id)))
      : new Set<string>()

    let berhasil = 0
    let diperbarui = 0
    const upsertOps = parsed.map(row => {
      const idSiasn = row.idSiasn ?? row.id
      if (existingIds.has(idSiasn)) {
        diperbarui++
        return db.refJabatan.update({
          where: { idSiasn },
          data: { nama: row.nama, jenisJabatanId: jenis.id, jenjang: row.jenjang, bup: row.bup },
        })
      }
      berhasil++
      return db.refJabatan.create({
        data: {
          idSiasn,
          kode: row.kode,
          nama: row.nama,
          jenisJabatanId: jenis.id,
          jenjang: row.jenjang,
          bup: row.bup,
        },
      })
    })

    for (const ops of chunk(upsertOps, 100)) { await db.$transaction(ops) }
    sendSuccess(res, { total: parsed.length, berhasil, diperbarui, errors }, `Import selesai: ${berhasil} ditambahkan, ${diperbarui} diperbarui, ${errors.length} error`)
  } catch (err) { next(err) }
})

referensiRoutes.get('/jabatan/pelaksana', referensiController.jabatanPelaksana)
referensiRoutes.post('/jabatan/pelaksana', adminOnly, validate(createJabatanPelaksanaSchema), referensiController.createJabatanPelaksana)
referensiRoutes.put('/jabatan/pelaksana/:id', adminOnly, validate(updateJabatanPelaksanaSchema), referensiController.updateJabatanPelaksana)
referensiRoutes.delete('/jabatan/pelaksana/:id', adminOnly, referensiController.deleteJabatanPelaksana)
referensiRoutes.post('/jabatan', adminOnly, validate(createRefJabatanSchema), referensiController.createJabatan)
referensiRoutes.put('/jabatan/:id', adminOnly, validate(updateRefJabatanSchema), referensiController.updateJabatan)
referensiRoutes.delete('/jabatan/:id', adminOnly, referensiController.deleteJabatan)

// Import Jabatan Pelaksana dari Excel SIASN.
// Header: ID/ID_JABATAN, KODE/KODE_JABATAN, NAMA/NAMA_JABATAN, ID_SIASN.
referensiRoutes.post('/jabatan/pelaksana/import', adminOnly, upload.single('file'), async (req, res, next) => {
  const file = req.file
  if (!file) { next(new AppError('File Excel wajib diunggah', 422)); return }
  try {
    const rows = await readExcelRows(file.path)

    const toStr = (v: unknown): string => v == null ? '' : String(v)
    const normKey = (k: string): string => k.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
    const pick = (row: Record<string, unknown>, ...keys: string[]): string => {
      const map = new Map(Object.entries(row).map(([k, v]) => [normKey(k), v]))
      for (const k of keys) { const v = toStr(map.get(normKey(k))).trim(); if (v) return v }
      return ''
    }

    type PelaksanaRow = { baris: number; id: string; kode: string | null; nama: string; idSiasn: string | null }
    const parsed: PelaksanaRow[] = []
    const errors: Array<{ baris: number; pesan: string }> = []
    const seenIds = new Set<string>()

    for (const [i, row] of rows.entries()) {
      const baris = i + 2
      const id = pick(row, 'ID', 'ID_JABATAN', 'JABATAN_ID', 'KODE_JABATAN', 'ID_JABATAN_PELAKSANA')
      const kode = pick(row, 'KODE', 'KODE_JABATAN') || null
      const nama = pick(row, 'NAMA', 'NAMA_JABATAN', 'NAMA_JABATAN_PELAKSANA')
      const idSiasn = pick(row, 'ID_SIASN', 'IDSIASN') || null

      if (!id) { errors.push({ baris, pesan: 'Kolom ID wajib diisi' }); continue }
      if (!nama) { errors.push({ baris, pesan: 'Kolom NAMA wajib diisi' }); continue }
      if (seenIds.has(id)) { errors.push({ baris, pesan: `ID '${id}' duplikat di file` }); continue }
      seenIds.add(id)

      parsed.push({ baris, id, kode, nama, idSiasn })
    }

    const jenis = await ensureJenisJabatan('Pelaksana', 'PELAKSANA')
    const existingIds = parsed.length > 0
      ? new Set((await db.refJabatan.findMany({
        where: { idSiasn: { in: parsed.map(r => r.idSiasn ?? r.id) } },
        select: { idSiasn: true },
      })).map(r => r.idSiasn).filter((id): id is string => Boolean(id)))
      : new Set<string>()

    let berhasil = 0
    let diperbarui = 0
    const upsertOps = parsed.map(row => {
      const idSiasn = row.idSiasn ?? row.id
      if (existingIds.has(idSiasn)) {
        diperbarui++
        return db.refJabatan.update({ where: { idSiasn }, data: { nama: row.nama, jenisJabatanId: jenis.id } })
      }
      berhasil++
      return db.refJabatan.create({ data: { idSiasn, kode: row.kode, nama: row.nama, jenisJabatanId: jenis.id } })
    })

    for (const ops of chunk(upsertOps, 100)) { await db.$transaction(ops) }
    sendSuccess(res, { total: parsed.length, berhasil, diperbarui, errors }, `Import selesai: ${berhasil} ditambahkan, ${diperbarui} diperbarui, ${errors.length} error`)
  } catch (err) { next(err) }
})
referensiRoutes.get('/pendidikan', referensiController.pendidikan)
referensiRoutes.post('/pendidikan', adminOnly, validate(createRefPendidikanSchema), referensiController.createPendidikan)
referensiRoutes.put('/pendidikan/:id', adminOnly, validate(updateRefPendidikanSchema), referensiController.updatePendidikan)
referensiRoutes.delete('/pendidikan/:id', adminOnly, referensiController.deletePendidikan)
referensiRoutes.get('/pendidikan-tingkat', referensiController.pendidikanTingkat)
referensiRoutes.post('/pendidikan-tingkat', adminOnly, validate(createRefMasterSchema), referensiController.createPendidikanTingkat)
referensiRoutes.put('/pendidikan-tingkat/:id', adminOnly, validate(updateRefMasterSchema), referensiController.updatePendidikanTingkat)
referensiRoutes.delete('/pendidikan-tingkat/:id', adminOnly, referensiController.deletePendidikanTingkat)
referensiRoutes.get('/bidang-pendidikan', referensiController.bidangPendidikan)
referensiRoutes.get('/wilayah', referensiController.wilayah)
referensiRoutes.post('/wilayah', adminOnly, validate(createRefMasterSchema), referensiController.createWilayah)
referensiRoutes.put('/wilayah/:id', adminOnly, validate(updateRefMasterSchema), referensiController.updateWilayah)
referensiRoutes.delete('/wilayah/:id', adminOnly, referensiController.deleteWilayah)
referensiRoutes.get('/kpkn', referensiController.kpkn)
referensiRoutes.post('/kpkn', adminOnly, validate(createRefMasterSchema), referensiController.createKpkn)
referensiRoutes.put('/kpkn/:id', adminOnly, validate(updateRefMasterSchema), referensiController.updateKpkn)
referensiRoutes.delete('/kpkn/:id', adminOnly, referensiController.deleteKpkn)
referensiRoutes.get('/lokasi-kerja', referensiController.lokasiKerja)
referensiRoutes.post('/lokasi-kerja', adminOnly, validate(createRefMasterSchema), referensiController.createLokasiKerja)
referensiRoutes.put('/lokasi-kerja/:id', adminOnly, validate(updateRefMasterSchema), referensiController.updateLokasiKerja)
referensiRoutes.delete('/lokasi-kerja/:id', adminOnly, referensiController.deleteLokasiKerja)

referensiRoutes.get('/jenis-layanan', referensiController.jenisLayanan)
referensiRoutes.post('/jenis-layanan', adminOnly, validate(createJenisLayananSchema), referensiController.createJenisLayanan)
referensiRoutes.put('/jenis-layanan/:id', adminOnly, validate(updateJenisLayananSchema), referensiController.updateJenisLayanan)
referensiRoutes.delete('/jenis-layanan/:id', adminOnly, referensiController.deleteJenisLayanan)
referensiRoutes.get('/jenis-layanan/:id/persyaratan', referensiController.persyaratan)
referensiRoutes.put('/jenis-layanan/:id/persyaratan', adminOnly, validate(replacePersyaratanSchema), referensiController.replacePersyaratan)

referensiRoutes.get('/gaji-pokok', referensiController.gajiPokok)
referensiRoutes.get('/template-dokumen', referensiController.templateDokumen)
referensiRoutes.post('/template-dokumen', adminOnly, validate(createTemplateDokumenSchema), referensiController.createTemplateDokumen)
referensiRoutes.put('/template-dokumen/:id', adminOnly, validate(updateTemplateDokumenSchema), referensiController.updateTemplateDokumen)
referensiRoutes.delete('/template-dokumen/:id', adminOnly, referensiController.deleteTemplateDokumen)
