import type { NextFunction, Request, Response } from 'express'
import { sendCreated, sendPaginated, sendSuccess } from '@/core/http/response.helper'
import { arsipService } from './arsip.service'

export const arsipController = {
  list: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await arsipService.list(req.query)
      sendPaginated(res, result.data, result.meta)
    } catch (error) {
      next(error)
    }
  },

  detail: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await arsipService.detail(req.params.id))
    } catch (error) {
      next(error)
    }
  },

  arsipkan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendCreated(res, await arsipService.arsipkan(req.body, req.user), 'Usulan berhasil diarsipkan')
    } catch (error) {
      next(error)
    }
  },
}
