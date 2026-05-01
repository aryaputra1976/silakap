import type { NextFunction, Request, Response } from 'express'
import { sendPaginated, sendSuccess } from '@/core/http/response.helper'
import { laporanService } from './laporan.service'

export const laporanController = {
  listHarian: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await laporanService.listHarian(req.query)
      sendPaginated(res, result.data, result.meta)
    } catch (error) {
      next(error)
    }
  },

  detailHarian: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await laporanService.detailHarian(req.params.id))
    } catch (error) {
      next(error)
    }
  },

  generateHarian: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tanggal = typeof req.body?.tanggal === 'string' ? req.body.tanggal : undefined
      sendSuccess(res, await laporanService.generateHarian(tanggal), 'Laporan harian berhasil dibuat')
    } catch (error) {
      next(error)
    }
  },

  listBulanan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await laporanService.listBulanan(req.query)
      sendPaginated(res, result.data, result.meta)
    } catch (error) {
      next(error)
    }
  },

  detailBulanan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await laporanService.detailBulanan(req.params.id))
    } catch (error) {
      next(error)
    }
  },

  generateBulanan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tahun = req.body?.tahun ? Number(req.body.tahun) : undefined
      const bulan = req.body?.bulan ? Number(req.body.bulan) : undefined
      sendSuccess(res, await laporanService.generateBulanan(tahun, bulan), 'Laporan bulanan berhasil dibuat')
    } catch (error) {
      next(error)
    }
  },
}
