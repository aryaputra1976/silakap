import { Router } from 'express'
import { authenticate } from '@/core/middleware/auth.middleware'
import { rateLimitLogin, rateLimitRefresh, rateLimit } from '@/core/middleware/rate-limit.middleware'
import { validate } from '@/core/middleware/validate.middleware'
import { authController } from './auth.controller'
import { changePasswordSchema } from './dto/change-password.dto'
import { loginSchema } from './dto/login.dto'
import { refreshSchema } from './dto/refresh.dto'
import { registerSchema } from './dto/register.dto'

export const authRoutes = Router()

// 5 percobaan/menit — lindungi dari brute force
authRoutes.post('/login', rateLimitLogin, validate(loginSchema), authController.login)
authRoutes.post('/register', rateLimit(10, 5 * 60_000), validate(registerSchema), authController.register)
authRoutes.get('/asn/by-nip/:nip', rateLimit(30, 5 * 60_000), authController.asnByNip)
authRoutes.get('/unit-organisasi', rateLimit(60, 5 * 60_000), authController.unitOrganisasi)

// 20 request/menit — refresh token boleh lebih longgar tapi tetap dibatasi
authRoutes.post('/refresh', rateLimitRefresh, validate(refreshSchema), authController.refresh)

authRoutes.post('/logout', authenticate, authController.logout)
authRoutes.get('/me', authenticate, authController.me)

// 10 percobaan/5 menit untuk ganti password
authRoutes.post('/change-password', authenticate, rateLimit(10, 5 * 60_000), validate(changePasswordSchema), authController.changePassword)
