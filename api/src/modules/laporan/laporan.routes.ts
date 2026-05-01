import { Router } from 'express'
import { authorize } from '@/core/middleware/rbac.middleware'
import { ROLES } from '@/shared/constants'
import { laporanController } from './laporan.controller'

export const laporanRoutes = Router()

laporanRoutes.get('/harian', laporanController.listHarian)
laporanRoutes.post('/harian/generate', authorize(ROLES.KABID, ROLES.ADMIN_SISTEM), laporanController.generateHarian)
laporanRoutes.get('/harian/:id', laporanController.detailHarian)
laporanRoutes.get('/bulanan', laporanController.listBulanan)
laporanRoutes.post('/bulanan/generate', authorize(ROLES.KABID, ROLES.ADMIN_SISTEM), laporanController.generateBulanan)
laporanRoutes.get('/bulanan/:id', laporanController.detailBulanan)
