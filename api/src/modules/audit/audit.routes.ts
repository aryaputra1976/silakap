import { Router } from 'express'
import { authorize } from '@/core/middleware/rbac.middleware'
import { ROLES } from '@/shared/constants'
import { auditController } from './audit.controller'

export const auditRoutes = Router()

auditRoutes.use(authorize(ROLES.ADMIN_SISTEM))
auditRoutes.get('/', auditController.list)
auditRoutes.get('/export', auditController.export)
auditRoutes.get('/:id', auditController.detail)
