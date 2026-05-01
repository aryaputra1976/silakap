import type { Response } from 'express'
import type { PaginationMeta } from './pagination.helper'

export const sendSuccess = <T>(
  res: Response,
  data: T | null,
  message = 'Success',
  statusCode = 200,
): Response => res.status(statusCode).json({ success: true, message, data })

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  meta: PaginationMeta,
  message = 'Success',
): Response => res.status(200).json({ success: true, message, data, meta })

export const sendCreated = <T>(res: Response, data: T, message = 'Created'): Response =>
  sendSuccess(res, data, message, 201)

export const sendNoContent = (res: Response): Response => res.status(204).send()
