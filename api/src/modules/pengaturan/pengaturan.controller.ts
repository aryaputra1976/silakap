import type { NextFunction, Request, Response } from 'express'
import { sendSuccess } from '@/core/http/response.helper'
import { maintenanceService } from './maintenance.service'
import { pengaturanService } from './pengaturan.service'

export const pengaturanController = {
  listConfigSla: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const jenisLayananId = typeof req.query.jenisLayananId === 'string' ? req.query.jenisLayananId : undefined
      sendSuccess(res, await pengaturanService.listConfigSla(jenisLayananId))
    } catch (error) {
      next(error)
    }
  },

  upsertConfigSla: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await pengaturanService.upsertConfigSla(req.body, req.user), 'Config SLA berhasil disimpan')
    } catch (error) {
      next(error)
    }
  },

  deleteConfigSla: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await pengaturanService.deleteConfigSla(req.params.id, req.user)
      sendSuccess(res, null, 'Config SLA berhasil dihapus')
    } catch (error) {
      next(error)
    }
  },

  testEmail: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await pengaturanService.testEmail(req.body.to), 'Email test berhasil dikirim')
    } catch (error) {
      next(error)
    }
  },

  emailStatus: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, pengaturanService.emailStatus())
    } catch (error) {
      next(error)
    }
  },

  listConfigNotifikasi: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await pengaturanService.listConfigNotifikasi())
    } catch (error) {
      next(error)
    }
  },

  createConfigNotifikasi: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await pengaturanService.createConfigNotifikasi(req.body, req.user), 'Config notifikasi berhasil dibuat', 201)
    } catch (error) {
      next(error)
    }
  },

  updateConfigNotifikasi: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await pengaturanService.updateConfigNotifikasi(req.params.id, req.body, req.user), 'Config notifikasi berhasil disimpan')
    } catch (error) {
      next(error)
    }
  },

  listLaporanOtomatis: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await pengaturanService.listLaporanOtomatis())
    } catch (error) {
      next(error)
    }
  },

  upsertLaporanOtomatis: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await pengaturanService.upsertLaporanOtomatis(req.body, req.user), 'Config laporan otomatis berhasil disimpan')
    } catch (error) {
      next(error)
    }
  },

  health: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await maintenanceService.health())
    } catch (error) {
      next(error)
    }
  },

  arsipOlderThanOneYear: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await maintenanceService.arsipOlderThanOneYear(req.user), 'Arsip usulan lama selesai diproses')
    } catch (error) {
      next(error)
    }
  },

  backupDatabase: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await maintenanceService.backupDatabase(req.user), 'Backup database berhasil dibuat')
    } catch (error) {
      next(error)
    }
  },

  cleanupOrphanFiles: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(
        res,
        await maintenanceService.cleanupOrphanFiles(req.user, req.body.dryRun),
        req.body.dryRun ? 'Scan orphan file selesai' : 'Cleanup orphan file selesai',
      )
    } catch (error) {
      next(error)
    }
  },
}
