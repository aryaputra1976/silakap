import { Router } from 'express'
import { dashboardController } from './dashboard.controller'

export const dashboardRoutes = Router()

dashboardRoutes.get('/ringkasan', dashboardController.ringkasan)
dashboardRoutes.get('/per-jenis-layanan', dashboardController.perJenisLayanan)
dashboardRoutes.get('/antrian-per-tahap', dashboardController.antrianPerTahap)
dashboardRoutes.get('/laporan-harian', dashboardController.laporanHarianTerakhir)
dashboardRoutes.get('/aktivitas', dashboardController.aktivitasTerkini)
dashboardRoutes.get('/analytics/sla-trend', dashboardController.slaTrend)
dashboardRoutes.get('/analytics/throughput', dashboardController.throughput)
dashboardRoutes.get('/analytics/bottleneck', dashboardController.bottleneck)
dashboardRoutes.get('/analytics/ranking-opd', dashboardController.rankingOpd)
