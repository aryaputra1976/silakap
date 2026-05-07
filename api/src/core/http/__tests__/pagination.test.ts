import { describe, it, expect } from 'vitest'
import { getPaginationParams, buildMeta } from '../pagination.helper'

describe('getPaginationParams', () => {
  it('default page=1, limit=20 jika query kosong', () => {
    const result = getPaginationParams({})
    expect(result).toEqual({ page: 1, limit: 20, skip: 0 })
  })

  it('hitung skip dengan benar', () => {
    const result = getPaginationParams({ page: 3, limit: 10 })
    expect(result.skip).toBe(20)
  })

  it('batas atas limit adalah 50', () => {
    const result = getPaginationParams({ page: 1, limit: 999 })
    expect(result.limit).toBe(50)
  })

  it('limit tepat 50 diterima', () => {
    const result = getPaginationParams({ page: 1, limit: 50 })
    expect(result.limit).toBe(50)
  })

  it('page negatif fallback ke 1', () => {
    const result = getPaginationParams({ page: -5, limit: 10 })
    expect(result.page).toBe(1)
  })

  it('page 0 fallback ke 1', () => {
    const result = getPaginationParams({ page: 0, limit: 10 })
    expect(result.page).toBe(1)
  })

  it('page NaN fallback ke 1', () => {
    const result = getPaginationParams({ page: 'abc', limit: 10 })
    expect(result.page).toBe(1)
  })

  it('limit NaN fallback ke 20', () => {
    const result = getPaginationParams({ page: 1, limit: 'abc' })
    expect(result.limit).toBe(20)
  })

  it('limit 0 fallback ke 20', () => {
    const result = getPaginationParams({ page: 1, limit: 0 })
    expect(result.limit).toBe(20)
  })

  it('page desimal dibulatkan ke bawah', () => {
    const result = getPaginationParams({ page: 2.9, limit: 10 })
    expect(result.page).toBe(2)
    expect(result.skip).toBe(10)
  })
})

describe('buildMeta', () => {
  it('menghitung totalPages dengan benar', () => {
    const meta = buildMeta(100, 1, 20)
    expect(meta.totalPages).toBe(5)
  })

  it('membulatkan ke atas jika tidak habis dibagi', () => {
    const meta = buildMeta(101, 1, 20)
    expect(meta.totalPages).toBe(6)
  })

  it('total 0 menghasilkan totalPages 0', () => {
    const meta = buildMeta(0, 1, 20)
    expect(meta.totalPages).toBe(0)
  })

  it('total sama dengan limit menghasilkan totalPages 1', () => {
    const meta = buildMeta(20, 1, 20)
    expect(meta.totalPages).toBe(1)
  })

  it('menyimpan page dan limit yang diberikan', () => {
    const meta = buildMeta(50, 3, 10)
    expect(meta.page).toBe(3)
    expect(meta.limit).toBe(10)
    expect(meta.total).toBe(50)
  })
})
