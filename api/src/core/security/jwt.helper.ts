import jwt, { type JwtPayload as BaseJwtPayload, type SignOptions } from 'jsonwebtoken'
import { env } from '@/core/config/env'
import { AppError } from '@/core/errors/app-error'

export interface AccessTokenPayload {
  userId: string
  roleId: string
  roleName: string
}

export interface RefreshTokenPayload {
  userId: string
}

export type JwtPayload = BaseJwtPayload & Partial<AccessTokenPayload & RefreshTokenPayload>

export const signAccessToken = (payload: AccessTokenPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as SignOptions)

export const signRefreshToken = (payload: RefreshTokenPayload): string =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as SignOptions)

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload
  } catch {
    throw new AppError('Sesi tidak valid, silakan login kembali', 401)
  }
}

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload
  } catch {
    throw new AppError('Sesi tidak valid, silakan login kembali', 401)
  }
}
