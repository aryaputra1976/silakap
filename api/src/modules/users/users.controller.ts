import type { NextFunction, Request, Response } from 'express'
import { sendCreated, sendPaginated, sendSuccess } from '@/core/http/response.helper'
import { usersService } from './users.service'

export const usersController = {
  list: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await usersService.list(req.query)
      sendPaginated(res, result.data, result.meta)
    } catch (error) {
      next(error)
    }
  },

  detail: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await usersService.detail(req.params.id)
      sendSuccess(res, result)
    } catch (error) {
      next(error)
    }
  },

  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await usersService.create(req.body, req.user)
      sendCreated(res, result, 'User berhasil dibuat')
    } catch (error) {
      next(error)
    }
  },

  update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await usersService.update(req.params.id, req.body, req.user)
      sendSuccess(res, result, 'User berhasil diperbarui')
    } catch (error) {
      next(error)
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await usersService.remove(req.params.id, req.user)
      sendSuccess(res, null, 'User berhasil dihapus')
    } catch (error) {
      next(error)
    }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await usersService.resetPassword(req.params.id, req.user)
      sendSuccess(res, result, 'Password berhasil direset')
    } catch (error) {
      next(error)
    }
  },

  unlock: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await usersService.unlock(req.params.id, req.user)
      sendSuccess(res, result, 'User berhasil dibuka kuncinya')
    } catch (error) {
      next(error)
    }
  },

  accessReview: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await usersService.accessReview(req.query)
      sendPaginated(res, result.data, result.meta)
    } catch (error) {
      next(error)
    }
  },

  accessReviewExport: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const buffer = await usersService.accessReviewExport(req.query)
      const filename = `access-review-${new Date().toISOString().slice(0, 10)}.xlsx`
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      res.send(buffer)
    } catch (error) {
      next(error)
    }
  },
}
