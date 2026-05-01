import type { Request, Response, NextFunction } from 'express'
import { sendSuccess } from '@/core/http/response.helper'
import { AppError } from '@/core/errors/app-error'
import { authService } from './auth.service'

export const authController = {
  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.login(
        req.body.username,
        req.body.password,
        req.ip,
        req.headers['user-agent'],
      )
      sendSuccess(res, result, 'Login berhasil')
    } catch (error) {
      next(error)
    }
  },

  refresh: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.refreshToken(
        req.body.refreshToken,
        req.ip,
        req.headers['user-agent'],
      )
      sendSuccess(res, result, 'Token berhasil diperbarui')
    } catch (error) {
      next(error)
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError('Sesi tidak valid, silakan login kembali', 401)
      const refreshToken = typeof req.body.refreshToken === 'string' ? req.body.refreshToken : ''
      if (!refreshToken) throw new AppError('Refresh token wajib diisi', 422)

      await authService.logout(req.user.id, refreshToken)
      sendSuccess(res, null, 'Logout berhasil')
    } catch (error) {
      next(error)
    }
  },

  me: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError('Sesi tidak valid, silakan login kembali', 401)
      const result = await authService.me(req.user.id)
      sendSuccess(res, result)
    } catch (error) {
      next(error)
    }
  },

  changePassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError('Sesi tidak valid, silakan login kembali', 401)
      await authService.changePassword(req.user.id, req.body.passwordLama, req.body.passwordBaru)
      sendSuccess(res, null, 'Password berhasil diubah')
    } catch (error) {
      next(error)
    }
  },
}
