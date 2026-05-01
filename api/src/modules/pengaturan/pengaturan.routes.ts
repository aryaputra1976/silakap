import { Router } from 'express'
import { authorize } from '@/core/middleware/rbac.middleware'
import { validate } from '@/core/middleware/validate.middleware'
import { ROLES } from '@/shared/constants'
import {
  cleanupOrphanFilesSchema,
  configSlaSchema,
  testEmailSchema,
  updateNotifikasiConfigSchema,
  upsertLaporanOtomatisSchema,
} from './dto/pengaturan.dto'
import { pengaturanController } from './pengaturan.controller'

export const pengaturanRoutes = Router()

pengaturanRoutes.use(authorize(ROLES.ADMIN_SISTEM, ROLES.KABID))
pengaturanRoutes.get('/sla', pengaturanController.listConfigSla)
pengaturanRoutes.put('/sla', validate(configSlaSchema), pengaturanController.upsertConfigSla)
pengaturanRoutes.delete('/sla/:id', pengaturanController.deleteConfigSla)
pengaturanRoutes.get('/email/status', authorize(ROLES.ADMIN_SISTEM), pengaturanController.emailStatus)
pengaturanRoutes.post('/email/test', authorize(ROLES.ADMIN_SISTEM), validate(testEmailSchema), pengaturanController.testEmail)
pengaturanRoutes.get('/notifikasi', authorize(ROLES.ADMIN_SISTEM), pengaturanController.listConfigNotifikasi)
pengaturanRoutes.post('/notifikasi', authorize(ROLES.ADMIN_SISTEM), validate(updateNotifikasiConfigSchema), pengaturanController.createConfigNotifikasi)
pengaturanRoutes.put('/notifikasi/:id', authorize(ROLES.ADMIN_SISTEM), validate(updateNotifikasiConfigSchema), pengaturanController.updateConfigNotifikasi)
pengaturanRoutes.get('/laporan-otomatis', authorize(ROLES.ADMIN_SISTEM), pengaturanController.listLaporanOtomatis)
pengaturanRoutes.put('/laporan-otomatis', authorize(ROLES.ADMIN_SISTEM), validate(upsertLaporanOtomatisSchema), pengaturanController.upsertLaporanOtomatis)
pengaturanRoutes.get('/health', authorize(ROLES.ADMIN_SISTEM), pengaturanController.health)
pengaturanRoutes.post('/maintenance/arsip-older-than-1y', authorize(ROLES.ADMIN_SISTEM), pengaturanController.arsipOlderThanOneYear)
pengaturanRoutes.post('/maintenance/db-backup', authorize(ROLES.ADMIN_SISTEM), pengaturanController.backupDatabase)
pengaturanRoutes.post('/maintenance/cleanup-orphan-files', authorize(ROLES.ADMIN_SISTEM), validate(cleanupOrphanFilesSchema), pengaturanController.cleanupOrphanFiles)
