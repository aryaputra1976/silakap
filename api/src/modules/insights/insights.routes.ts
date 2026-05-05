import { Router } from 'express'
import { authorize } from '@/core/middleware/rbac.middleware'
import { ROLES } from '@/shared/constants'
import { insightsController } from './insights.controller'

export const insightsRoutes = Router()

insightsRoutes.get(
  '/summary',
  authorize(ROLES.ADMIN_SISTEM, ROLES.KABID, ROLES.KEPALA_BADAN),
  insightsController.summary,
)