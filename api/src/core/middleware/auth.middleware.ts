import type { NextFunction, Request, Response } from 'express'
import { db } from '@/core/database/prisma.client'
import { AppError } from '@/core/errors/app-error'
import { env } from '@/core/config/env'
import { verifyAccessToken } from '@/core/security/jwt.helper'

// Endpoint yang boleh diakses walau password sudah kadaluarsa
const expiryExemptPaths = new Set([
  `${env.API_PREFIX}/auth/change-password`,
  `${env.API_PREFIX}/auth/logout`,
  `${env.API_PREFIX}/auth/me`,
])

const isExemptFromExpiry = (req: Request): boolean => {
  const path = req.originalUrl.split('?')[0]
  return expiryExemptPaths.has(path)
}

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

    // Cek password kadaluarsa (kecuali untuk endpoint ganti password & logout)
    if (env.PASSWORD_EXPIRY_DAYS > 0 && !isExemptFromExpiry(req)) {
      const reference = user.passwordChangedAt ?? user.createdAt
      const daysSince = (Date.now() - reference.getTime()) / 86_400_000
      if (daysSince > env.PASSWORD_EXPIRY_DAYS) {
        throw new AppError(
          `Password Anda telah kadaluarsa (lebih dari ${env.PASSWORD_EXPIRY_DAYS} hari). Silakan ganti password untuk melanjutkan.`,
          403,
          undefined,
          'PASSWORD_EXPIRED',
        )
      }
    }

    req.user = {
      id: user.id,
      username: user.username,
      namaLengkap: user.namaLengkap,
      roleId: user.roleId,
      roleName: user.role.nama,
      unitOrganisasiId: user.unitOrganisasiId?.toString(),
    }

    next()
  } catch (error) {
    next(error)
  }
}
