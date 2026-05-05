import type { Request, Response, NextFunction } from 'express'
import { reportingService } from './reporting.service'

export const reportingController = {
  triwulan: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const year = Number(req.query.year)
      const q = Number(req.query.q)

      const data = await reportingService.getTriwulanData(year, q)

      res.json(data)
    } catch (e) {
      next(e)
    }
  },

  excel: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const year = Number(req.query.year)
      const q = Number(req.query.q)

      const data = await reportingService.getTriwulanData(year, q)
      const file = await reportingService.generateExcel(data)

      res.setHeader(
        'Content-Disposition',
        `attachment; filename=laporan_triwulan_${year}_Q${q}.xlsx`,
      )
      res.send(file)
    } catch (e) {
      next(e)
    }
  },

  pdf: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const year = Number(req.query.year)
      const q = Number(req.query.q)

      const data = await reportingService.getTriwulanData(year, q)
      const file = await reportingService.generatePDF(data)

      res.setHeader(
        'Content-Disposition',
        `attachment; filename=laporan_triwulan_${year}_Q${q}.pdf`,
      )
      res.send(file)
    } catch (e) {
      next(e)
    }
  },
}