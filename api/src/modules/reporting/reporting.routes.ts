import { Router } from 'express'
import { reportingController } from './reporting.controller'
import { authorize } from '@/core/middleware/rbac.middleware'
import { ROLES } from '@/shared/constants'

export const reportingRoutes = Router()

reportingRoutes.get(
  '/triwulan',
  authorize(ROLES.ADMIN_SISTEM, ROLES.KABID, ROLES.KEPALA_BADAN),
  reportingController.triwulan,
)

reportingRoutes.get(
  '/excel',
  authorize(ROLES.ADMIN_SISTEM, ROLES.KABID, ROLES.KEPALA_BADAN),
  reportingController.excel,
)

reportingRoutes.get(
  '/pdf',
  authorize(ROLES.ADMIN_SISTEM, ROLES.KABID, ROLES.KEPALA_BADAN),
  reportingController.pdf,
)