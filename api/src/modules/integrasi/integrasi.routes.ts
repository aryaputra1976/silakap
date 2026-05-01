import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import * as XLSX from 'xlsx'
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

const toStringValue = (value: unknown): string => (value === undefined || value === null ? '' : String(value).trim())

const pick = (row: Record<string, unknown>, keys: string[]): string => {
  const normalized = new Map(Object.entries(row).map(([key, value]) => [key.trim().toLowerCase(), value]))
  for (const key of keys) {
    const value = normalized.get(key.toLowerCase())
    const result = toStringValue(value)
    if (result) return result
  }
  return ''
}

const validateNip = (nip: string): boolean => /^\d{18}$/.test(nip)
const validateNik = (nik: string): boolean => !nik || /^\d{16}$/.test(nik)
const normalizeStatusPegawai = (value: string): StatusPegawai =>
  value in StatusPegawai ? (value as StatusPegawai) : StatusPegawai.Aktif

const parseAsnRow = (row: Record<string, unknown>) => {
  const nipBaru = pick(row, ['nipBaru', 'nip_baru', 'nip baru', 'nip'])
  const nik = pick(row, ['nik', 'nomor nik'])
  return {
    nipBaru,
    nama: pick(row, ['nama', 'nama lengkap', 'nama_asn']),
    nik: nik || null,
    email: pick(row, ['email']) || null,
    emailGov: pick(row, ['emailGov', 'email_gov', 'email gov']) || null,
    nomorHp: pick(row, ['nomorHp', 'nomor_hp', 'no hp', 'hp']) || null,
    unitOrganisasiId: pick(row, ['unitOrganisasiId', 'unit_organisasi_id', 'unit id']) || null,
    statusPegawai: pick(row, ['statusPegawai', 'status_pegawai']) || 'Aktif',
  }
}

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
    const workbook = XLSX.readFile(file.path)
    const sheetName = workbook.SheetNames[0]
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], { defval: '' })
    let successBaris = 0
    const errors: Prisma.SiasnImportErrorCreateManyInput[] = []

    for (const [index, row] of rows.entries()) {
      const nomorBaris = index + 2
      const parsed = parseAsnRow(row)
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
        await db.asn.upsert({
          where: { nipBaru: parsed.nipBaru },
          create: {
            id: randomUUID(),
            nipBaru: parsed.nipBaru,
            nama: parsed.nama,
            nik: parsed.nik,
            nikValid: Boolean(parsed.nik),
            email: parsed.email,
            emailGov: parsed.emailGov,
            nomorHp: parsed.nomorHp,
            unitOrganisasiId: parsed.unitOrganisasiId,
            statusPegawai: normalizeStatusPegawai(parsed.statusPegawai),
            lastSyncSiasn: new Date(),
          },
          update: {
            nama: parsed.nama,
            nik: parsed.nik,
            nikValid: Boolean(parsed.nik),
            email: parsed.email,
            emailGov: parsed.emailGov,
            nomorHp: parsed.nomorHp,
            unitOrganisasiId: parsed.unitOrganisasiId,
            statusPegawai: normalizeStatusPegawai(parsed.statusPegawai),
            lastSyncSiasn: new Date(),
          },
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
        errorDetails: errors.slice(0, 20).map((error) => ({
          nomorBaris: error.nomorBaris,
          nomorId: error.nomorId,
          errorMessage: error.errorMessage,
        })),
        status,
        completedAt: new Date(),
      },
    })
    sendSuccess(res, updated, 'Import ASN selesai')
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
    const sheet = XLSX.utils.json_to_sheet(
      errors.map((item) => ({
        nomorBaris: item.nomorBaris,
        nomorId: item.nomorId,
        errorMessage: item.errorMessage,
        dataAsli: JSON.stringify(item.dataAsli),
      })),
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, sheet, 'Errors')
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' }) as Buffer
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
