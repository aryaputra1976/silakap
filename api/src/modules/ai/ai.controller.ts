import type { NextFunction, Request, Response } from 'express'
import { sendSuccess } from '@/core/http/response.helper'
import { aiService } from './ai.service'

export const aiController = {
  status: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, aiService.status())
    } catch (error) {
      next(error)
    }
  },

  chat: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await aiService.chat(req.body, req.user), 'Jawaban AI berhasil dibuat')
    } catch (error) {
      next(error)
    }
  },

  ringkasUsulan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await aiService.ringkasUsulan(req.params.id, req.user), 'Ringkasan AI berhasil dibuat')
    } catch (error) {
      next(error)
    }
  },

  cekKelengkapan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await aiService.cekKelengkapan(req.params.id, req.body, req.user), 'Cek kelengkapan AI berhasil dibuat')
    } catch (error) {
      next(error)
    }
  },
}
