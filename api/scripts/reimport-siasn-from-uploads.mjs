import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import XLSX from 'xlsx'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()
const uploadsDir = path.resolve('uploads')

const normKey = (key) => key.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
const toStringValue = (value) => {
  if (value == null) return ''
  if (typeof value === 'number' && Number.isFinite(value) && Math.abs(value) >= 1e10) return value.toFixed(0)
  return String(value).trim()
}
const digitsOnly = (value) => toStringValue(value).replace(/\D/g, '')
const cleanNullable = (value) => {
  const cleaned = toStringValue(value).trim()
  return cleaned ? cleaned : null
}
const pick = (row, keys) => {
  const normalized = new Map(Object.entries(row).map(([key, value]) => [normKey(key), value]))
  for (const key of keys) {
    const value = toStringValue(normalized.get(normKey(key)))
    if (value) return value
  }
  return ''
}
const parseDate = (value) => {
  const raw = toStringValue(value)
  if (!raw) return null
  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}
const parseIntValue = (value) => {
  const raw = digitsOnly(value)
  if (!raw) return null
  const parsed = Number(raw)
  return Number.isInteger(parsed) ? parsed : null
}
const parseBoolean = (value) => {
  const raw = toStringValue(value).toLowerCase()
  if (['1', 'true', 'ya', 'y', 'valid', 'aktif'].includes(raw)) return true
  if (['0', 'false', 'tidak', 'n', 'invalid', 'nonaktif'].includes(raw)) return false
  return null
}
const parseJenisKelamin = (value) => {
  const raw = toStringValue(value).toLowerCase()
  if (raw === 'm' || raw === 'l' || raw.includes('laki')) return 'M'
  if (raw === 'f' || raw === 'p' || raw.includes('perempuan') || raw.includes('wanita')) return 'F'
  return null
}
const readRows = (file) => {
  const workbook = XLSX.readFile(file)
  return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '', raw: false })
}
const latestFile = (predicate) => {
  const files = readdirSync(uploadsDir)
    .filter((name) => name.endsWith('.xlsx') || name.endsWith('.xls'))
    .map((name) => path.join(uploadsDir, name))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)

  for (const file of files) {
    const rows = readRows(file)
    if (predicate(rows)) return { file, rows }
  }
  throw new Error('File upload yang cocok tidak ditemukan')
}

async function importUnits(rows) {
  const parsed = rows.map((row) => {
    const idSiasn = pick(row, ['ID', 'ID_UNOR', 'UNOR_ID', 'UNORID', 'KODE_UNOR'])
    const namaRaw = pick(row, ['NAMA_UNOR', 'NAMA UNOR', 'NAMAUNOR', 'NAMA', 'NAMA_UNIT'])
    const idAtasan = cleanNullable(pick(row, ['ID_ATASAN', 'ID ATASAN', 'PARENT_ID', 'ID_INDUK', 'DIATASAN_ID']))
    return { idSiasn, nama: namaRaw.trim(), idAtasan }
  }).filter((row) => row.idSiasn && row.nama)

  for (const row of parsed) {
    await db.refUnitOrganisasi.upsert({
      where: { idSiasn: row.idSiasn },
      create: { idSiasn: row.idSiasn, kode: row.idSiasn, nama: row.nama, level: 1, isOpd: false },
      update: { nama: row.nama },
    })
  }

  const persisted = await db.refUnitOrganisasi.findMany({
    where: { idSiasn: { in: parsed.flatMap((row) => [row.idSiasn, row.idAtasan].filter(Boolean)) } },
    select: { id: true, idSiasn: true },
  })
  const idBySiasn = new Map(persisted.map((unit) => [unit.idSiasn, unit.id]))

  for (const row of parsed) {
    const unitId = idBySiasn.get(row.idSiasn)
    if (!unitId) continue
    const parentId = row.idAtasan ? idBySiasn.get(row.idAtasan) ?? null : null
    await db.refUnitOrganisasi.update({
      where: { id: unitId },
      data: { idAtasan: parentId, level: parentId ? 2 : 1, isOpd: !parentId },
    })
  }

  return parsed.length
}

async function ensureJenisKelamin(kode) {
  if (!kode) return null
  const item = await db.refJenisKelamin.upsert({
    where: { kode },
    create: { kode, nama: kode === 'M' ? 'Laki-laki' : 'Perempuan' },
    update: {},
  })
  return item.id
}

async function importAsn(rows) {
  const units = await db.refUnitOrganisasi.findMany({ select: { id: true, idSiasn: true } })
  const unitIdBySiasn = new Map(units.map((unit) => [unit.idSiasn, unit.id]))
  const golongan = await db.refGolongan.findMany({ select: { id: true, kode: true } })
  const golonganIdByKode = new Map(golongan.map((item) => [item.kode, item.id]))
  let success = 0
  let failed = 0

  for (const row of rows) {
    const nipBaru = digitsOnly(pick(row, ['NIP BARU', 'nipBaru', 'nip_baru', 'nip']))
    const nama = pick(row, ['NAMA', 'nama', 'nama lengkap'])
    if (!/^\d{18}$/.test(nipBaru) || !nama) {
      failed += 1
      continue
    }

    const tempatLahirIdSiasn = cleanNullable(pick(row, ['TEMPAT LAHIR ID', 'tempat lahir id']))
    const tempatLahirNama = cleanNullable(pick(row, ['TEMPAT LAHIR NAMA', 'tempat lahir nama', 'tempat lahir']))
    const tempatLahir = tempatLahirIdSiasn && tempatLahirNama
      ? await db.refWilayah.upsert({
        where: { idSiasn: tempatLahirIdSiasn },
        create: { idSiasn: tempatLahirIdSiasn, nama: tempatLahirNama },
        update: { nama: tempatLahirNama },
      })
      : null

    const jenisPegawaiIdSiasn = cleanNullable(pick(row, ['JENIS PEGAWAI ID', 'jenis pegawai id']))
    const jenisPegawaiNama = cleanNullable(pick(row, ['JENIS PEGAWAI NAMA', 'jenis pegawai nama', 'jenis pegawai']))
    const jenisPegawai = jenisPegawaiIdSiasn && jenisPegawaiNama
      ? await db.refJenisPegawai.upsert({
        where: { idSiasn: jenisPegawaiIdSiasn },
        create: { idSiasn: jenisPegawaiIdSiasn, nama: jenisPegawaiNama },
        update: { nama: jenisPegawaiNama },
      })
      : null

    const unitSiasn = cleanNullable(pick(row, ['UNOR ID', 'ID_UNOR', 'unitOrganisasiId', 'unit organisasi id']))
    const golonganKode = cleanNullable(pick(row, ['GOLONGAN KODE', 'kode golongan', 'golongan kode']))
    const jenisKelaminId = await ensureJenisKelamin(parseJenisKelamin(pick(row, ['JENIS KELAMIN', 'jenis kelamin'])))

    await db.asn.upsert({
      where: { nipBaru },
      create: {
        pnsId: cleanNullable(pick(row, ['PNS ID', 'pns id'])),
        nipBaru,
        nipLama: cleanNullable(digitsOnly(pick(row, ['NIP LAMA', 'nip lama']))),
        nama,
        gelarDepan: cleanNullable(pick(row, ['GELAR DEPAN', 'gelar depan'])),
        gelarBelakang: cleanNullable(pick(row, ['GELAR BELAKANG', 'gelar belakang'])),
        tempatLahirId: tempatLahir?.id ?? null,
        tanggalLahir: parseDate(pick(row, ['TANGGAL LAHIR', 'tanggal lahir'])),
        jenisKelaminId,
        nik: cleanNullable(digitsOnly(pick(row, ['NIK', 'nik']))),
        nomorHp: cleanNullable(digitsOnly(pick(row, ['NOMOR HP', 'NO HP', 'nomor hp']))),
        email: cleanNullable(pick(row, ['EMAIL', 'email'])),
        emailGov: cleanNullable(pick(row, ['EMAIL GOV', 'email gov', 'emailGov'])),
        alamat: cleanNullable(pick(row, ['ALAMAT', 'alamat'])),
        npwp: cleanNullable(digitsOnly(pick(row, ['NPWP NOMOR', 'NPWP', 'npwp']))),
        bpjs: cleanNullable(digitsOnly(pick(row, ['BPJS', 'bpjs']))),
        jenisPegawaiId: jenisPegawai?.id ?? null,
        kedudukanHukum: cleanNullable(pick(row, ['KEDUDUKAN HUKUM NAMA', 'kedudukan hukum'])),
        nomorSkCpns: cleanNullable(pick(row, ['NOMOR SK CPNS', 'nomor sk cpns'])),
        tanggalSkCpns: parseDate(pick(row, ['TANGGAL SK CPNS', 'tanggal sk cpns'])),
        tmtCpns: parseDate(pick(row, ['TMT CPNS', 'tmt cpns'])),
        nomorSkPns: cleanNullable(pick(row, ['NOMOR SK PNS', 'nomor sk pns'])),
        tanggalSkPns: parseDate(pick(row, ['TANGGAL SK PNS', 'tanggal sk pns'])),
        tmtPns: parseDate(pick(row, ['TMT PNS', 'tmt pns'])),
        golonganId: golonganKode ? golonganIdByKode.get(golonganKode) ?? null : null,
        tmtGolongan: parseDate(pick(row, ['TMT GOLONGAN', 'tmt golongan'])),
        mkTahun: parseIntValue(pick(row, ['MK TAHUN', 'masa kerja tahun'])),
        mkBulan: parseIntValue(pick(row, ['MK BULAN', 'masa kerja bulan'])),
        tmtJabatan: parseDate(pick(row, ['TMT JABATAN', 'tmt jabatan'])),
        namaSekolah: cleanNullable(pick(row, ['NAMA SEKOLAH', 'nama sekolah'])),
        tahunLulus: parseIntValue(pick(row, ['TAHUN LULUS', 'tahun lulus'])),
        lokasiKerja: cleanNullable(pick(row, ['LOKASI KERJA NAMA', 'lokasi kerja'])),
        unitOrganisasiId: unitSiasn ? unitIdBySiasn.get(unitSiasn) ?? null : null,
        nikValid: parseBoolean(pick(row, ['IS VALID NIK', 'valid nik'])),
        flagIkd: parseBoolean(pick(row, ['FLAG IKD', 'flag ikd'])),
        lastSyncSiasn: new Date(),
      },
      update: {
        nama,
        unitOrganisasiId: unitSiasn ? unitIdBySiasn.get(unitSiasn) ?? null : null,
        lastSyncSiasn: new Date(),
      },
    })
    success += 1
  }

  return { success, failed }
}

const unitUpload = latestFile((rows) => rows.length >= 900 && rows[0] && Object.keys(rows[0]).some((key) => normKey(key) === 'namaunor'))
const asnUpload = latestFile((rows) => rows.length >= 8000 && rows[0] && Object.keys(rows[0]).some((key) => normKey(key) === 'nipbaru'))

console.log(`Import unit: ${path.basename(unitUpload.file)}`)
const unitCount = await importUnits(unitUpload.rows)
console.log(`Unit organisasi: ${unitCount}`)

console.log(`Import ASN: ${path.basename(asnUpload.file)}`)
const asnResult = await importAsn(asnUpload.rows)
console.log(`ASN berhasil: ${asnResult.success}, gagal: ${asnResult.failed}`)

await db.$disconnect()
