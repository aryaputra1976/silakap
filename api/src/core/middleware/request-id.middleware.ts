import type { NextFunction, Request, Response } from 'express'
import { randomUUID } from 'crypto'

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.header('X-Request-ID') ?? randomUUID()
  req.requestId = requestId
  res.setHeader('X-Request-ID', requestId)
  next()
}
