import type { NextFunction, Request, Response } from 'express'
import { db } from '@/core/database/prisma.client'
import { AppError } from '@/core/errors/app-error'
import { verifyAccessToken } from '@/core/security/jwt.helper'

export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const header = req.headers.authorization
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null

    if (!token) throw new AppError('Sesi tidak valid, silakan login kembali', 401)

    const payload = verifyAccessToken(token)
    if (!payload.userId) throw new AppError('Sesi tidak valid, silakan login kembali', 401)

    const user = await db.user.findFirst({
      where: { id: payload.userId, isActive: true, deletedAt: null },
      include: { role: true },
    })

    if (!user || user.role.deletedAt) throw new AppError('Sesi tidak valid, silakan login kembali', 401)

    req.user = {
      id: user.id,
      username: user.username,
      namaLengkap: user.namaLengkap,
      roleId: user.roleId,
      roleName: user.role.nama,
      unitOrganisasiId: user.unitOrganisasiId ?? undefined,
    }

    next()
  } catch (error) {
    next(error)
  }
}
