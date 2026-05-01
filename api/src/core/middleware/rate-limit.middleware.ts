import type { RequestHandler } from 'express'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Bersihkan entri kedaluwarsa setiap 10 menit
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of store.entries()) {
    if (value.resetAt < now) store.delete(key)
  }
}, 10 * 60 * 1000).unref()

export const rateLimit =
  (maxRequests: number, windowMs: number): RequestHandler =>
  (req, res, next) => {
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown'
    const now = Date.now()
    const entry = store.get(ip)

    if (!entry || entry.resetAt < now) {
      store.set(ip, { count: 1, resetAt: now + windowMs })
      return next()
    }

    if (entry.count >= maxRequests) {
      const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000)
      res.setHeader('Retry-After', String(retryAfterSec))
      res.setHeader('X-RateLimit-Limit', String(maxRequests))
      res.setHeader('X-RateLimit-Remaining', '0')
      res.setHeader('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)))
      return res.status(429).json({
        success: false,
        message: `Terlalu banyak percobaan. Silakan coba lagi dalam ${retryAfterSec} detik.`,
      })
    }

    entry.count += 1
    res.setHeader('X-RateLimit-Limit', String(maxRequests))
    res.setHeader('X-RateLimit-Remaining', String(maxRequests - entry.count))
    return next()
  }

// 5 percobaan per menit untuk login
export const rateLimitLogin = rateLimit(5, 60_000)

// 20 permintaan per menit untuk refresh token
export const rateLimitRefresh = rateLimit(20, 60_000)

// 100 permintaan per menit — global fallback
export const rateLimitGlobal = rateLimit(100, 60_000)
