import { Router } from 'express'
import { authorize } from '@/core/middleware/rbac.middleware'
import { validate } from '@/core/middleware/validate.middleware'
import { ROLES } from '@/shared/constants'
import { arsipController } from './arsip.controller'
import { arsipkanSchema } from './dto/arsip.dto'

export const arsipRoutes = Router()

arsipRoutes.get('/', arsipController.list)
arsipRoutes.get('/:id', arsipController.detail)
arsipRoutes.post('/', authorize(ROLES.ADMIN_SISTEM, ROLES.KABID), validate(arsipkanSchema), arsipController.arsipkan)
