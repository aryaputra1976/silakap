import { Router } from 'express'
import * as XLSX from 'xlsx'
import { db } from '@/core/database/prisma.client'
import { AppError } from '@/core/errors/app-error'
import { sendSuccess } from '@/core/http/response.helper'
import { authorize } from '@/core/middleware/rbac.middleware'
import { upload } from '@/core/middleware/upload.middleware'
import { validate } from '@/core/middleware/validate.middleware'
import { ROLES } from '@/shared/constants'
import {
  createGolonganSchema,
  createJenisLayananSchema,
  createUnitOrganisasiSchema,
  replacePersyaratanSchema,
  updateGolonganSchema,
  updateJenisLayananSchema,
  updateUnitOrganisasiSchema,
} from './dto/referensi.dto'
import { referensiController } from './referensi.controller'

export const referensiRoutes = Router()
const adminOnly = authorize(ROLES.ADMIN_SISTEM)
const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

referensiRoutes.get('/golongan', referensiController.golongan)
referensiRoutes.post('/golongan', adminOnly, validate(createGolonganSchema), referensiController.createGolongan)
referensiRoutes.put('/golongan/:id', adminOnly, validate(updateGolonganSchema), referensiController.updateGolongan)

referensiRoutes.get('/unit-organisasi', referensiController.unitOrganisasi)
referensiRoutes.get('/unit-organisasi/:id', referensiController.unitOrganisasiById)
referensiRoutes.post('/unit-organisasi', adminOnly, validate(createUnitOrganisasiSchema), referensiController.createUnitOrganisasi)
referensiRoutes.put('/unit-organisasi/:id', adminOnly, validate(updateUnitOrganisasiSchema), referensiController.updateUnitOrganisasi)

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
    const wb = XLSX.readFile(file.path)
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      wb.Sheets[wb.SheetNames[0]],
      { defval: '', raw: false },
    )

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
        where: { id: { in: externalParentIds } },
        select: { id: true },
      })).map((unit) => unit.id))
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
        where: { id: { in: parsed.map((row) => row.id) } },
        select: { id: true },
      })).map((unit) => unit.id))
      : new Set<string>()

    const upsertOps = parsed.map((row) => {
      const level = resolveLevel(row)
      const isOpd = row.explicitIsOpd ?? level === 2
      if (existingUnitIds.has(row.id)) {
        diperbarui++
        return db.refUnitOrganisasi.update({
          where: { id: row.id },
          data: { nama: row.nama, level, isOpd },
        })
      }

      berhasil++
      return db.refUnitOrganisasi.create({
          data: { id: row.id, nama: row.nama, level, isOpd, idAtasan: null },
        })
    })

    for (const ops of chunk(upsertOps, 100)) {
      await db.$transaction(ops)
    }

    const parentOps = parsed
      .filter((row) => row.idAtasan)
      .map((row) => db.refUnitOrganisasi.update({
        where: { id: row.id },
        data: { idAtasan: row.idAtasan },
      }))

    for (const ops of chunk(parentOps, 100)) {
      await db.$transaction(ops)
    }

    sendSuccess(res, { total: parsed.length, berhasil, diperbarui, errors }, `Import selesai: ${berhasil} ditambahkan, ${diperbarui} diperbarui, ${errors.length} error`)
  } catch (err) {
    next(err)
  }
})

referensiRoutes.get('/jabatan/struktural', referensiController.jabatanStruktural)
referensiRoutes.get('/jabatan/fungsional', referensiController.jabatanFungsional)
referensiRoutes.get('/jabatan/pelaksana', referensiController.jabatanPelaksana)
referensiRoutes.get('/pendidikan', referensiController.pendidikan)
referensiRoutes.get('/bidang-pendidikan', referensiController.bidangPendidikan)

referensiRoutes.get('/jenis-layanan', referensiController.jenisLayanan)
referensiRoutes.post('/jenis-layanan', adminOnly, validate(createJenisLayananSchema), referensiController.createJenisLayanan)
referensiRoutes.put('/jenis-layanan/:id', adminOnly, validate(updateJenisLayananSchema), referensiController.updateJenisLayanan)
referensiRoutes.get('/jenis-layanan/:id/persyaratan', referensiController.persyaratan)
referensiRoutes.put('/jenis-layanan/:id/persyaratan', adminOnly, validate(replacePersyaratanSchema), referensiController.replacePersyaratan)

referensiRoutes.get('/gaji-pokok', referensiController.gajiPokok)
