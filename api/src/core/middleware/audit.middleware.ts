import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { db } from '@/core/database/prisma.client'
import { logger } from '@/core/logger/logger'

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
            newValues: req.body,
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
