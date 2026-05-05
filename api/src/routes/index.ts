import { Router } from 'express'
import { authenticate } from '@/core/middleware/auth.middleware'
import {
  auditRoutes,
  aiRoutes,
  arsipRoutes,
  asnRoutes,
  authRoutes,
  dashboardRoutes,
  integrasiRoutes,
  jobsRoutes,
  laporanRoutes,
  layananRoutes,
  notifikasiRoutes,
  pengaturanRoutes,
  perencanaanRoutes,
  referensiRoutes,
  rolesRoutes,
  usersRoutes,
  workflowRoutes,
} from '@/modules'
import { reportingRoutes } from '@/modules/reporting/reporting.routes'
import { insightsRoutes } from '@/modules/insights/insights.routes'

export const router = Router()

router.use('/auth', authRoutes)
router.use('/jobs', jobsRoutes)
router.use('/users', authenticate, usersRoutes)
router.use('/roles', authenticate, rolesRoutes)
router.use('/asn', authenticate, asnRoutes)
router.use('/referensi', authenticate, referensiRoutes)
router.use('/layanan', authenticate, layananRoutes)
router.use('/workflow', authenticate, workflowRoutes)
router.use('/dashboard', authenticate, dashboardRoutes)
router.use('/laporan', authenticate, laporanRoutes)
router.use('/notifikasi', authenticate, notifikasiRoutes)
router.use('/integrasi', authenticate, integrasiRoutes)
router.use('/pengaturan', authenticate, pengaturanRoutes)
router.use('/audit', authenticate, auditRoutes)
router.use('/ai', authenticate, aiRoutes)
router.use('/perencanaan', authenticate, perencanaanRoutes)
router.use('/arsip', authenticate, arsipRoutes)
router.use('/reporting', authenticate, reportingRoutes)
router.use('/insights', authenticate, insightsRoutes)