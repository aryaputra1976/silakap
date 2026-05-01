import type { NextFunction, Request, Response } from 'express'
import { sendCreated, sendPaginated, sendSuccess } from '@/core/http/response.helper'
import { uploadDokumenSchema } from './dto/layanan.dto'
import { layananService } from './layanan.service'

export const layananController = {
  list: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await layananService.list(req.user!.id, req.user!.roleName, req.query)
      sendPaginated(res, result.data, result.meta)
    } catch (error) {
      next(error)
    }
  },

  detail: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await layananService.detail(req.params.id))
    } catch (error) {
      next(error)
    }
  },

  dokumenOutput: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dokumen = await layananService.dokumenOutput(req.params.id, req.user)
      res.download(dokumen.pathFile, dokumen.namaFile)
    } catch (error) {
      next(error)
    }
  },

  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendCreated(res, await layananService.create(req.body, req.user), 'Usulan berhasil dibuat')
    } catch (error) {
      next(error)
    }
  },

  uploadDokumen: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = uploadDokumenSchema.parse(req.body)
      sendCreated(res, await layananService.uploadDokumen(req.params.id, req.file, parsed, req.user), 'Dokumen berhasil diunggah')
    } catch (error) {
      next(error)
    }
  },

  submit: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await layananService.submit(req.params.id, req.user), 'Usulan berhasil diajukan')
    } catch (error) {
      next(error)
    }
  },

  terima: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await layananService.terima(req.params.id, req.user), 'Usulan berhasil diterima')
    } catch (error) {
      next(error)
    }
  },

  teruskan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await layananService.teruskan(req.params.id, req.body.catatan, req.user), 'Usulan berhasil diteruskan')
    } catch (error) {
      next(error)
    }
  },

  kembalikan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await layananService.kembalikan(req.params.id, req.body.alasan, req.user), 'Usulan berhasil dikembalikan')
    } catch (error) {
      next(error)
    }
  },

  setujui: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await layananService.setujui(req.params.id, req.body.catatan, req.user), 'Usulan berhasil disetujui')
    } catch (error) {
      next(error)
    }
  },

  batal: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await layananService.batal(req.params.id, req.body.alasan, req.user), 'Usulan berhasil dibatalkan')
    } catch (error) {
      next(error)
    }
  },

  resubmit: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await layananService.resubmit(req.params.id, req.body.catatan, req.user), 'Usulan berhasil diajukan ulang')
    } catch (error) {
      next(error)
    }
  },
}
