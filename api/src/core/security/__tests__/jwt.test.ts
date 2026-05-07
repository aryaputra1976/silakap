import { describe, it, expect } from 'vitest'
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../jwt.helper'
import { AppError } from '@/core/errors/app-error'

const sampleAccessPayload = {
  userId: 'usr-test-001',
  roleId: 'role-001',
  roleName: 'Analis_Muda',
}

const sampleRefreshPayload = { userId: 'usr-test-001' }

describe('signAccessToken + verifyAccessToken', () => {
  it('menghasilkan token string yang tidak kosong', () => {
    const token = signAccessToken(sampleAccessPayload)
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(20)
    expect(token.split('.')).toHaveLength(3) // header.payload.signature
  })

  it('payload terdecode dengan benar', () => {
    const token = signAccessToken(sampleAccessPayload)
    const decoded = verifyAccessToken(token)
    expect(decoded.userId).toBe(sampleAccessPayload.userId)
    expect(decoded.roleId).toBe(sampleAccessPayload.roleId)
    expect(decoded.roleName).toBe(sampleAccessPayload.roleName)
  })

  it('token yang dirusak throw AppError 401', () => {
    expect(() => verifyAccessToken('token.rusak.sekali')).toThrow(AppError)
    expect(() => verifyAccessToken('token.rusak.sekali')).toThrow('Sesi tidak valid')
  })

  it('string kosong throw AppError', () => {
    expect(() => verifyAccessToken('')).toThrow(AppError)
  })

  it('payload berbeda tidak bisa saling diverifikasi (access vs refresh secret berbeda)', () => {
    const refreshToken = signRefreshToken(sampleRefreshPayload)
    expect(() => verifyAccessToken(refreshToken)).toThrow(AppError)
  })
})

describe('signRefreshToken + verifyRefreshToken', () => {
  it('menghasilkan token string yang tidak kosong', () => {
    const token = signRefreshToken(sampleRefreshPayload)
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)
  })

  it('payload userId terdecode dengan benar', () => {
    const token = signRefreshToken(sampleRefreshPayload)
    const decoded = verifyRefreshToken(token)
    expect(decoded.userId).toBe(sampleRefreshPayload.userId)
  })

  it('token rusak throw AppError 401', () => {
    expect(() => verifyRefreshToken('bukan.token.valid')).toThrow(AppError)
  })

  it('access token tidak bisa diverifikasi sebagai refresh token', () => {
    const accessToken = signAccessToken(sampleAccessPayload)
    expect(() => verifyRefreshToken(accessToken)).toThrow(AppError)
  })
})

describe('token mengandung field iat dan exp', () => {
  it('access token punya iat dan exp', () => {
    const token = signAccessToken(sampleAccessPayload)
    const decoded = verifyAccessToken(token)
    expect(decoded.iat).toBeTypeOf('number')
    expect(decoded.exp).toBeTypeOf('number')
    expect(decoded.exp!).toBeGreaterThan(decoded.iat!)
  })
})
