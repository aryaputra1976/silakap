import type { NextFunction, Request, Response } from 'express'
import { AppError } from '@/core/errors/app-error'
import { sendPaginated, sendSuccess } from '@/core/http/response.helper'
import { notifikasiService } from './notifikasi.service'

const requireUserId = (req: Request): string => {
  if (!req.user) throw new AppError('Sesi tidak valid, silakan login kembali', 401)
  return req.user.id
}

export const notifikasiController = {
  list: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await notifikasiService.list(requireUserId(req), req.query)
      sendPaginated(res, result.data, result.meta)
    } catch (error) {
      next(error)
    }
  },
  count: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await notifikasiService.count(requireUserId(req)))
    } catch (error) {
      next(error)
    }
  },
  read: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await notifikasiService.read(requireUserId(req), req.params.id), 'Notifikasi ditandai dibaca')
    } catch (error) {
      next(error)
    }
  },
  readAll: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await notifikasiService.readAll(requireUserId(req))
      sendSuccess(res, null, 'Semua notifikasi ditandai dibaca')
    } catch (error) {
      next(error)
    }
  },
  remove: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await notifikasiService.remove(requireUserId(req), req.params.id)
      sendSuccess(res, null, 'Notifikasi berhasil dihapus')
    } catch (error) {
      next(error)
    }
  },
}
