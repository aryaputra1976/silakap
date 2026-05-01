import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Request, Response } from 'express'

// Each test group gets a fresh module (fresh Map store)
const load = () => import('../rate-limit.middleware?t=' + Date.now())

const req = (ip: string) =>
  ({ ip, socket: { remoteAddress: ip } }) as unknown as Request

const mockRes = () => {
  const res = {
    setHeader: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
  res.status.mockReturnValue(res)
  return res as unknown as Response
}

describe('rateLimit middleware', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('allows requests under the limit', async () => {
    const { rateLimit } = await load()
    const mw = rateLimit(3, 60_000)
    const next = vi.fn()
    const r = req('10.0.0.1')

    mw(r, mockRes(), next)
    mw(r, mockRes(), next)
    mw(r, mockRes(), next)

    expect(next).toHaveBeenCalledTimes(3)
  })

  it('blocks the (limit + 1)th request with 429', async () => {
    const { rateLimit } = await load()
    const mw = rateLimit(2, 60_000)
    const next = vi.fn()
    const r = req('10.0.0.2')
    const res = mockRes()

    mw(r, mockRes(), next)
    mw(r, mockRes(), next)
    mw(r, res, next) // 3rd — should be blocked

    expect(next).toHaveBeenCalledTimes(2)
    expect(res.status).toHaveBeenCalledWith(429)
  })

  it('sets Retry-After and X-RateLimit-* headers on 429', async () => {
    const { rateLimit } = await load()
    const mw = rateLimit(1, 60_000)
    const next = vi.fn()
    const r = req('10.0.0.3')
    const res = mockRes()

    mw(r, mockRes(), next) // pass
    mw(r, res, next)       // block

    expect(res.setHeader).toHaveBeenCalledWith('Retry-After', expect.any(String))
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '1')
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '0')
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(String))
  })

  it('allows requests again after the window expires', async () => {
    const { rateLimit } = await load()
    const mw = rateLimit(2, 60_000)
    const next = vi.fn()
    const r = req('10.0.0.4')

    mw(r, mockRes(), next) // 1
    mw(r, mockRes(), next) // 2
    mw(r, mockRes(), next) // 3 — blocked

    vi.advanceTimersByTime(61_000) // window expires

    mw(r, mockRes(), next) // should pass again

    expect(next).toHaveBeenCalledTimes(3) // 2 before + 1 after reset
  })

  it('tracks separate counters per IP', async () => {
    const { rateLimit } = await load()
    const mw = rateLimit(1, 60_000)
    const next = vi.fn()

    mw(req('10.0.1.1'), mockRes(), next)
    mw(req('10.0.1.2'), mockRes(), next)

    expect(next).toHaveBeenCalledTimes(2) // different IPs, both pass
  })

  it('named exports use correct limits', async () => {
    const { rateLimitLogin, rateLimitRefresh, rateLimitGlobal } = await load()
    expect(rateLimitLogin).toBeTypeOf('function')
    expect(rateLimitRefresh).toBeTypeOf('function')
    expect(rateLimitGlobal).toBeTypeOf('function')
  })
})
