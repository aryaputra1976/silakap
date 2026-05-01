import type { NextFunction, Request, Response } from 'express'
import { sendSuccess } from '@/core/http/response.helper'
import { dashboardService } from './dashboard.service'

export const dashboardController = {
  ringkasan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await dashboardService.ringkasan(req.user?.roleName ?? '', req.user?.unitOrganisasiId))
    } catch (error) {
      next(error)
    }
  },

  perJenisLayanan: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await dashboardService.perJenisLayanan())
    } catch (error) {
      next(error)
    }
  },

  antrianPerTahap: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await dashboardService.antrianPerTahap())
    } catch (error) {
      next(error)
    }
  },

  laporanHarianTerakhir: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await dashboardService.laporanHarianTerakhir())
    } catch (error) {
      next(error)
    }
  },

  aktivitasTerkini: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await dashboardService.aktivitasTerkini())
    } catch (error) {
      next(error)
    }
  },

  slaTrend: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await dashboardService.slaTrend(Number(req.query.days ?? 14)))
    } catch (error) {
      next(error)
    }
  },

  throughput: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await dashboardService.throughput(Number(req.query.days ?? 30)))
    } catch (error) {
      next(error)
    }
  },

  bottleneck: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await dashboardService.bottleneck())
    } catch (error) {
      next(error)
    }
  },

  rankingOpd: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await dashboardService.rankingOpd(Number(req.query.limit ?? 10)))
    } catch (error) {
      next(error)
    }
  },
}
