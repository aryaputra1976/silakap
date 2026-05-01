import type { NextFunction, Request, RequestHandler, Response } from 'express'
import type { ZodSchema } from 'zod'
import { ValidationError } from '@/core/errors/validation.error'

export const validate =
  (schema: ZodSchema): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) return next(new ValidationError(parsed.error))

    req.body = parsed.data
    return next()
  }
