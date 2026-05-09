import type { NextFunction, Request, Response } from 'express'
import { sendCreated, sendPaginated, sendSuccess } from '@/core/http/response.helper'
import { perencanaanService } from './perencanaan.service'

export const perencanaanController = {
  list: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await perencanaanService.list(req.query)
      sendPaginated(res, result.data, result.meta)
    } catch (error) {
      next(error)
    }
  },

  detail: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await perencanaanService.detail(req.params.id))
    } catch (error) {
      next(error)
    }
  },

  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendCreated(res, await perencanaanService.create(req.body, req.user), 'Perencanaan berhasil dibuat')
    } catch (error) {
      next(error)
    }
  },

  update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await perencanaanService.update(req.params.id, req.body, req.user), 'Perencanaan berhasil diperbarui')
    } catch (error) {
      next(error)
    }
  },

  updateStatus: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await perencanaanService.updateStatus(req.params.id, req.body, req.user), 'Status pensiun berhasil diperbarui')
    } catch (error) {
      next(error)
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await perencanaanService.remove(req.params.id, req.user)
      sendSuccess(res, null, 'Perencanaan berhasil dihapus')
    } catch (error) {
      next(error)
    }
  },

  scanBup: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await perencanaanService.scanBupHarian(), 'Scan BUP selesai')
    } catch (error) {
      next(error)
    }
  },
}
