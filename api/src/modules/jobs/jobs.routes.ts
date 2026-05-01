import type { NextFunction, Request, Response } from 'express'
import { Router } from 'express'
import { env } from '@/core/config/env'
import { auditEnv } from '@/core/config/env-audit'
import { sendSuccess } from '@/core/http/response.helper'
import { jalankanBackupDatabase, listBackups } from '@/jobs/db-backup.job'
import { jalankanLaporanBulanan } from '@/jobs/laporan-bulanan.job'
import { jalankanLaporanHarian } from '@/jobs/laporan-harian.job'
import { jalankanPensiunReminder } from '@/jobs/pensiun-reminder.job'
import { jalankanSlaChecker } from '@/jobs/sla-checker.job'

export const jobsRoutes = Router()

const cronAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (req.headers['x-cron-secret'] !== env.CRON_SECRET) {
    res.status(401).json({ success: false, message: 'Unauthorized' })
    return
  }
  next()
}

jobsRoutes.post('/sla-check', cronAuth, async (_req, res, next) => {
  try {
    sendSuccess(res, await jalankanSlaChecker(), 'SLA check selesai')
  } catch (error) {
    next(error)
  }
})

jobsRoutes.post('/laporan-harian', cronAuth, async (_req, res, next) => {
  try {
    await jalankanLaporanHarian()
    sendSuccess(res, null, 'Laporan harian selesai')
  } catch (error) {
    next(error)
  }
})

jobsRoutes.post('/laporan-bulanan', cronAuth, async (_req, res, next) => {
  try {
    await jalankanLaporanBulanan()
    sendSuccess(res, null, 'Laporan bulanan selesai')
  } catch (error) {
    next(error)
  }
})

jobsRoutes.post('/pensiun-reminder', cronAuth, async (_req, res, next) => {
  try {
    sendSuccess(res, await jalankanPensiunReminder(), 'Pensiun reminder selesai')
  } catch (error) {
    next(error)
  }
})

jobsRoutes.post('/db-backup', cronAuth, async (_req, res, next) => {
  try {
    sendSuccess(res, await jalankanBackupDatabase(), 'Backup database selesai')
  } catch (error) {
    next(error)
  }
})

jobsRoutes.get('/db-backup', cronAuth, async (_req, res, next) => {
  try {
    sendSuccess(res, await listBackups(), 'Daftar backup database')
  } catch (error) {
    next(error)
  }
})

jobsRoutes.get('/env-audit', cronAuth, async (_req, res, next) => {
  try {
    sendSuccess(res, auditEnv(), 'Audit environment')
  } catch (error) {
    next(error)
  }
})
