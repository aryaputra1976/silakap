import type { ErrorRequestHandler } from 'express'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import { AppError } from '@/core/errors/app-error'
import { formatZodErrors } from '@/core/errors/validation.error'
import { logger } from '@/core/logger/logger'
import { env } from '@/core/config/env'

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.code ? { code: error.code } : {}),
      ...(error.errors ? { errors: error.errors } : {}),
    })
  }

  if (error instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: 'Validasi gagal',
      errors: formatZodErrors(error),
    })
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Data sudah terdaftar' })
    }

    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan' })
    }
  }

  logger.error('Unhandled error', {
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
  })

  return res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'production' ? 'Terjadi kesalahan server' : String(error),
  })
}
