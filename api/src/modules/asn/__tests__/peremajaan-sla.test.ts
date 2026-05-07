import { describe, it, expect } from 'vitest'
import {
  getPeremajaanSlaHari,
  getPeremajaanNamaLayanan,
  getPeremajaanSlaStatus,
  isPeremajaanDalamSla,
} from '../peremajaan-sla.helper'

const DAY_MS = 24 * 60 * 60 * 1000

describe('getPeremajaanSlaHari', () => {
  it('kontak & alamat → 2 hari', () => {
    expect(getPeremajaanSlaHari('DataKontak', { nomorHp: '08xx' })).toBe(2)
    expect(getPeremajaanSlaHari('DataKontak', { email: 'a@b.com' })).toBe(2)
    expect(getPeremajaanSlaHari('DataKontak', { alamat: 'Jl. A' })).toBe(2)
  })

  it('Pendidikan → 3 hari', () => {
    expect(getPeremajaanSlaHari('Pendidikan', {})).toBe(3)
  })

  it('Data Keluarga → 3 hari', () => {
    expect(getPeremajaanSlaHari('Data Keluarga', {})).toBe(3)
  })

  it('jenis lain (Jabatan, Golongan, dll) → 5 hari default', () => {
    expect(getPeremajaanSlaHari('Jabatan', {})).toBe(5)
    expect(getPeremajaanSlaHari('Golongan', {})).toBe(5)
    expect(getPeremajaanSlaHari('Data Lain', {})).toBe(5)
  })

  it('dataBaru null → fallback ke default 5 hari', () => {
    expect(getPeremajaanSlaHari('Unknown', null)).toBe(5)
  })
})

describe('getPeremajaanNamaLayanan', () => {
  it('Pendidikan → "Update ijazah / gelar"', () => {
    expect(getPeremajaanNamaLayanan('Pendidikan')).toBe('Update ijazah / gelar')
  })

  it('Data Keluarga → "Data keluarga"', () => {
    expect(getPeremajaanNamaLayanan('Data Keluarga')).toBe('Data keluarga')
  })

  it('kontak field → "Kontak & alamat"', () => {
    expect(getPeremajaanNamaLayanan('DataKontak', { nomorHp: '08xx' })).toBe('Kontak & alamat')
  })

  it('field nama → "Perubahan nama"', () => {
    expect(getPeremajaanNamaLayanan('DataDiri', { nama: 'Budi' })).toBe('Perubahan nama')
  })

  it('jenis tidak dikenal → kembalikan jenisPerubahan', () => {
    expect(getPeremajaanNamaLayanan('Custom123')).toBe('Custom123')
  })

  it('jenis kosong → fallback "Peremajaan ASN"', () => {
    expect(getPeremajaanNamaLayanan('')).toBe('Peremajaan ASN')
  })
})

describe('getPeremajaanSlaStatus', () => {
  const base = new Date('2026-05-01T08:00:00Z')

  it('hari ke-1 dari SLA 5 hari → OK', () => {
    const now = new Date(base.getTime() + 1 * DAY_MS)
    const result = getPeremajaanSlaStatus(base, 5, now)
    expect(result.statusSla).toBe('OK')
    expect(result.hariKe).toBe(1)
  })

  it('hari ke-5 tepat dari SLA 5 hari → Warning', () => {
    // ceil(4.5 hari) = 5 → tepat di batas SLA → Warning
    const now = new Date(base.getTime() + 4.5 * DAY_MS)
    const result = getPeremajaanSlaStatus(base, 5, now)
    expect(result.statusSla).toBe('Warning')
    expect(result.hariKe).toBe(5)
  })

  it('hari ke-6 dari SLA 5 hari → Overdue', () => {
    const now = new Date(base.getTime() + 6 * DAY_MS)
    const result = getPeremajaanSlaStatus(base, 5, now)
    expect(result.statusSla).toBe('Overdue')
    expect(result.hariKe).toBeGreaterThan(5)
  })

  it('hariKe minimal 1 (tidak pernah 0)', () => {
    const now = new Date(base.getTime() + 100) // beberapa detik setelah dibuat
    const result = getPeremajaanSlaStatus(base, 5, now)
    expect(result.hariKe).toBeGreaterThanOrEqual(1)
  })

  it('totalSla tersimpan dalam hasil', () => {
    const now = new Date(base.getTime() + 1 * DAY_MS)
    const result = getPeremajaanSlaStatus(base, 3, now)
    expect(result.totalSla).toBe(3)
  })
})

describe('isPeremajaanDalamSla', () => {
  const base = new Date('2026-05-01T08:00:00Z')

  it('selesai dalam 5 hari untuk SLA 5 hari → true', () => {
    const selesai = new Date(base.getTime() + 4 * DAY_MS)
    expect(isPeremajaanDalamSla(base, selesai, 'Jabatan', {})).toBe(true)
  })

  it('selesai di hari ke-6 untuk SLA 5 hari → false', () => {
    const selesai = new Date(base.getTime() + 6 * DAY_MS)
    expect(isPeremajaanDalamSla(base, selesai, 'Jabatan', {})).toBe(false)
  })

  it('selesaiAt null → false (belum selesai)', () => {
    expect(isPeremajaanDalamSla(base, null, 'Jabatan', {})).toBe(false)
  })
})
