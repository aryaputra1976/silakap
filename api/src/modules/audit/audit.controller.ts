import type { NextFunction, Request, Response } from 'express'
import { sendPaginated, sendSuccess } from '@/core/http/response.helper'
import { auditService } from './audit.service'

export const auditController = {
  list: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await auditService.list(req.query)
      sendPaginated(res, result.data, result.meta)
    } catch (error) {
      next(error)
    }
  },
  detail: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await auditService.detail(req.params.id))
    } catch (error) {
      next(error)
    }
  },
  export: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const buffer = await auditService.export(req.query)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', 'attachment; filename="audit-log.xlsx"')
      res.send(buffer)
    } catch (error) {
      next(error)
    }
  },
}
