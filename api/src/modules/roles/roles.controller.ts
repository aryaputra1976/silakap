import type { NextFunction, Request, Response } from 'express'
import { sendCreated, sendPaginated, sendSuccess } from '@/core/http/response.helper'
import { rolesService } from './roles.service'

export const rolesController = {
  list: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await rolesService.list(req.query)
      sendPaginated(res, result.data, result.meta)
    } catch (error) {
      next(error)
    }
  },

  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await rolesService.create(req.body, req.user)
      sendCreated(res, result, 'Role berhasil dibuat')
    } catch (error) {
      next(error)
    }
  },

  update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await rolesService.update(req.params.id, req.body, req.user)
      sendSuccess(res, result, 'Role berhasil diperbarui')
    } catch (error) {
      next(error)
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await rolesService.remove(req.params.id, req.user)
      sendSuccess(res, null, 'Role berhasil dihapus')
    } catch (error) {
      next(error)
    }
  },

  permissions: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await rolesService.permissions(req.params.id)
      sendSuccess(res, result)
    } catch (error) {
      next(error)
    }
  },

  setPermissions: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await rolesService.setPermissions(req.params.id, req.body, req.user)
      sendSuccess(res, result, 'Permission role berhasil diperbarui')
    } catch (error) {
      next(error)
    }
  },
}
