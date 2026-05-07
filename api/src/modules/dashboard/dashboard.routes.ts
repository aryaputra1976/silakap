import { Router } from 'express'
import { dashboardController } from './dashboard.controller'
import { authorize } from '@/core/middleware/rbac.middleware'
import { ROLES } from '@/shared/constants'

export const dashboardRoutes = Router()

const allRoles = [
  ROLES.ADMIN_SISTEM,
  ROLES.KABID,
  ROLES.KEPALA_BADAN,
  ROLES.ANALIS_PERTAMA,
  ROLES.ANALIS_MUDA,
  ROLES.ANALIS_MADYA,
  ROLES.PENGELOLA_OPD,
]

const seniorRoles = [
  ROLES.ADMIN_SISTEM,
  ROLES.KABID,
  ROLES.KEPALA_BADAN,
]

// ─── Enterprise Dashboard ──────────────────────────────────────────────────

dashboardRoutes.get('/summary', authorize(...seniorRoles), dashboardController.summary)
dashboardRoutes.get('/recent', authorize(...seniorRoles), dashboardController.recent)
dashboardRoutes.get('/trend', authorize(...seniorRoles), dashboardController.trend)

// ─── Role-Based Dashboard (existing pages) ────────────────────────────────

dashboardRoutes.get('/ringkasan', authorize(...allRoles), dashboardController.ringkasan)
dashboardRoutes.get('/per-jenis-layanan', authorize(...allRoles), dashboardController.perJenisLayanan)
dashboardRoutes.get('/antrian-per-tahap', authorize(...allRoles), dashboardController.antrianPerTahap)
dashboardRoutes.get('/laporan-harian', authorize(...allRoles), dashboardController.laporanHarian)
dashboardRoutes.get('/aktivitas', authorize(...allRoles), dashboardController.aktivitas)

// ─── Analytics ────────────────────────────────────────────────────────────

dashboardRoutes.get('/analytics/sla-trend', authorize(...seniorRoles), dashboardController.slaTrend)
dashboardRoutes.get('/analytics/throughput', authorize(...seniorRoles), dashboardController.throughput)
dashboardRoutes.get('/analytics/bottleneck', authorize(...seniorRoles), dashboardController.bottleneck)
dashboardRoutes.get('/analytics/ranking-opd', authorize(...seniorRoles), dashboardController.rankingOpd)

// ─── New Dashboard Views ──────────────────────────────────────────────────

const analisRoles = [ROLES.ANALIS_PERTAMA, ROLES.ANALIS_MUDA, ROLES.ANALIS_MADYA, ROLES.ADMIN_SISTEM]

dashboardRoutes.get('/pimpinan', authorize(...seniorRoles), dashboardController.pimpinan)
dashboardRoutes.get('/eskalasi-peremajaan', authorize(...seniorRoles, ROLES.ANALIS_MADYA), dashboardController.eskalasiPeremajaan)
dashboardRoutes.get('/operator-kpi', authorize(...analisRoles), dashboardController.operatorKpi)
dashboardRoutes.get('/antrian-detail', authorize(...allRoles), dashboardController.antrianDetail)
