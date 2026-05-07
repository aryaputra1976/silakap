import type { NextFunction, Request, Response } from 'express'
import { sendCreated, sendPaginated, sendSuccess } from '@/core/http/response.helper'
import { uploadDokumenSchema } from './dto/layanan.dto'
import { layananService } from './layanan.service'
import { AppError } from '@/core/errors/app-error'

const requireUser = (req: Request) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401)
  }
  return req.user
}

export const layananController = {
  list: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = requireUser(req)
      const result = await layananService.list(user.id, user.roleName, user.unitOrganisasiId, req.query)
      sendPaginated(res, result.data, result.meta)
    } catch (error) {
      next(error)
    }
  },

  detail: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = requireUser(req)
      sendSuccess(res, await layananService.detail(req.params.id, user))
    } catch (error) {
      next(error)
    }
  },

  dokumenOutput: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = requireUser(req)
      const dokumen = await layananService.dokumenOutput(req.params.id, user)
      res.download(dokumen.pathFile, dokumen.namaFile)
    } catch (error) {
      next(error)
    }
  },

  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = requireUser(req)
      sendCreated(res, await layananService.create(req.body, user), 'Usulan berhasil dibuat')
    } catch (error) {
      next(error)
    }
  },

  uploadDokumen: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = requireUser(req)
      const parsed = uploadDokumenSchema.parse(req.body)
      sendCreated(
        res,
        await layananService.uploadDokumen(req.params.id, req.file, parsed, user),
        'Dokumen berhasil diunggah',
      )
    } catch (error) {
      next(error)
    }
  },

  submit: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = requireUser(req)
      sendSuccess(res, await layananService.submit(req.params.id, user), 'Usulan berhasil diajukan')
    } catch (error) {
      next(error)
    }
  },

  terima: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = requireUser(req)
      sendSuccess(res, await layananService.terima(req.params.id, user), 'Usulan berhasil diterima')
    } catch (error) {
      next(error)
    }
  },

  teruskan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = requireUser(req)
      sendSuccess(
        res,
        await layananService.teruskan(req.params.id, req.body.catatan, user),
        'Usulan berhasil diteruskan',
      )
    } catch (error) {
      next(error)
    }
  },

  kembalikan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = requireUser(req)
      sendSuccess(
        res,
        await layananService.kembalikan(req.params.id, req.body.alasan, user),
        'Usulan berhasil dikembalikan',
      )
    } catch (error) {
      next(error)
    }
  },

  setujui: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = requireUser(req)
      sendSuccess(
        res,
        await layananService.setujui(req.params.id, req.body.catatan, user),
        'Usulan berhasil disetujui',
      )
    } catch (error) {
      next(error)
    }
  },

  batal: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = requireUser(req)
      sendSuccess(
        res,
        await layananService.batal(req.params.id, req.body.alasan, user),
        'Usulan berhasil dibatalkan',
      )
    } catch (error) {
      next(error)
    }
  },

  resubmit: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = requireUser(req)
      sendSuccess(
        res,
        await layananService.resubmit(req.params.id, req.body.catatan, user),
        'Usulan berhasil diajukan ulang',
      )
    } catch (error) {
      next(error)
    }
  },
}