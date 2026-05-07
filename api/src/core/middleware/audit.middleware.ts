import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { Prisma } from '@prisma/client'
import { db } from '@/core/database/prisma.client'
import { logger } from '@/core/logger/logger'

const SENSITIVE_FIELDS = new Set([
  'password',
  'passwordHash',
  'confirmPassword',
  'oldPassword',
  'newPassword',
  'token',
  'refreshToken',
  'secret',
])

const sanitizeBody = (body: unknown): unknown => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return body
  const sanitized: Record<string, unknown> = { ...(body as Record<string, unknown>) }
  for (const field of SENSITIVE_FIELDS) {
    if (field in sanitized) sanitized[field] = '[REDACTED]'
  }
  return sanitized
}

export const auditLog =
  (action: string, entityType: string): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    const shouldAudit = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)
    if (!shouldAudit) return next()

    res.on('finish', () => {
      if (res.statusCode >= 400) return

      void db.auditLog
        .create({
          data: {
            userId: req.user?.id,
            userNama: req.user?.namaLengkap,
            action,
            entityType,
            entityId: typeof req.params.id === 'string' ? req.params.id : undefined,
            newValues: sanitizeBody(req.body) as Prisma.InputJsonValue,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
          },
        })
        .catch((error: unknown) => {
          logger.warn('Gagal mencatat audit log', { error })
        })
    })

    return next()
  }
