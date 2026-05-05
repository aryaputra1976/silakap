import type { Request, Response, NextFunction } from 'express'
import { sendSuccess } from '@/core/http/response.helper'
import { dashboardService } from './dashboard.service'

export const dashboardController = {
  // ─── Enterprise Dashboard ────────────────────────────────────────────────

  summary: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      sendSuccess(res, await dashboardService.summary())
    } catch (e) {
      next(e)
    }
  },

  recent: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      sendSuccess(res, await dashboardService.recent())
    } catch (e) {
      next(e)
    }
  },

  trend: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const days = Number(req.query.days ?? 7)
      sendSuccess(res, await dashboardService.trend(days))
    } catch (e) {
      next(e)
    }
  },

  // ─── Role-Based Dashboard (existing pages) ───────────────────────────────

  ringkasan: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const unitOrganisasiId = req.query.unitOrganisasiId as string | undefined
      sendSuccess(res, await dashboardService.ringkasan(unitOrganisasiId))
    } catch (e) {
      next(e)
    }
  },

  perJenisLayanan: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      sendSuccess(res, await dashboardService.perJenisLayanan())
    } catch (e) {
      next(e)
    }
  },

  antrianPerTahap: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      sendSuccess(res, await dashboardService.antrianPerTahap())
    } catch (e) {
      next(e)
    }
  },

  laporanHarian: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      sendSuccess(res, await dashboardService.laporanHarian())
    } catch (e) {
      next(e)
    }
  },

  aktivitas: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      sendSuccess(res, await dashboardService.aktivitas())
    } catch (e) {
      next(e)
    }
  },

  // ─── Analytics ───────────────────────────────────────────────────────────

  slaTrend: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const days = Number(req.query.days ?? 14)
      sendSuccess(res, await dashboardService.slaTrend(days))
    } catch (e) {
      next(e)
    }
  },

  throughput: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const days = Number(req.query.days ?? 30)
      sendSuccess(res, await dashboardService.throughput(days))
    } catch (e) {
      next(e)
    }
  },

  bottleneck: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      sendSuccess(res, await dashboardService.bottleneck())
    } catch (e) {
      next(e)
    }
  },

  rankingOpd: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query.limit ?? 10)
      sendSuccess(res, await dashboardService.rankingOpd(limit))
    } catch (e) {
      next(e)
    }
  },
}
