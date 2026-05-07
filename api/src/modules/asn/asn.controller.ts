import type { NextFunction, Request, Response } from 'express'
import { sendCreated, sendPaginated, sendSuccess } from '@/core/http/response.helper'
import { asnService } from './asn.service'

export const asnController = {
  stats: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await asnService.stats())
    } catch (error) {
      next(error)
    }
  },

  list: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await asnService.list(req.query)
      sendPaginated(res, result.data, result.meta)
    } catch (error) {
      next(error)
    }
  },

  detail: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await asnService.detail(req.params.id))
    } catch (error) {
      next(error)
    }
  },

  listPeremajaan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await asnService.listPeremajaan(req.query)
      sendPaginated(res, result.data, result.meta)
    } catch (error) {
      next(error)
    }
  },

  createPeremajaan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendCreated(res, await asnService.createPeremajaan(req.body, req.user), 'Pengajuan peremajaan berhasil dibuat')
    } catch (error) {
      next(error)
    }
  },

  uploadPeremajaanDokumen: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendCreated(res, await asnService.uploadPeremajaanDokumen(req.file, req.user), 'Dokumen bukti berhasil diunggah')
    } catch (error) {
      next(error)
    }
  },

  downloadPeremajaanDokumen: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dokumen = await asnService.downloadPeremajaanDokumen(req.params.fileId, req.user)
      res.download(dokumen.filePath, dokumen.fileName)
    } catch (error) {
      next(error)
    }
  },

  claimPeremajaan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await asnService.claimPeremajaan(req.params.id, req.user), 'Tiket peremajaan berhasil diambil')
    } catch (error) {
      next(error)
    }
  },

  approvePeremajaan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await asnService.approvePeremajaan(req.params.id, req.body, req.user), 'Pengajuan peremajaan berhasil diproses')
    } catch (error) {
      next(error)
    }
  },

  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendCreated(res, await asnService.create(req.body, req.user), 'ASN berhasil dibuat')
    } catch (error) {
      next(error)
    }
  },

  update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await asnService.update(req.params.id, req.body, req.user), 'ASN berhasil diperbarui')
    } catch (error) {
      next(error)
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await asnService.remove(req.params.id, req.user)
      sendSuccess(res, null, 'ASN berhasil dihapus')
    } catch (error) {
      next(error)
    }
  },

  riwayat: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await asnService.riwayat(req.params.id))
    } catch (error) {
      next(error)
    }
  },
}
