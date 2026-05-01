import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { db } from '@/core/database/prisma.client'
import { AppError } from '@/core/errors/app-error'

export const authorize =
  (...roles: string[]): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new AppError('Sesi tidak valid, silakan login kembali', 401))
    if (!roles.includes(req.user.roleName)) {
      return next(new AppError('Anda tidak memiliki akses ke fitur ini', 403))
    }

    return next()
  }

export const requirePermission =
  (moduleName: string, permission: string): RequestHandler =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError('Sesi tidak valid, silakan login kembali', 401)

      const permissionRow = await db.rolePermission.findFirst({
        where: { roleId: req.user.roleId, module: moduleName, permission },
      })

      if (!permissionRow) throw new AppError('Anda tidak memiliki akses ke fitur ini', 403)

      next()
    } catch (error) {
      next(error)
    }
  }
