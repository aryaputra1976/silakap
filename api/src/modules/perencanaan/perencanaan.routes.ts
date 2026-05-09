import { Router } from 'express'
import { authorize } from '@/core/middleware/rbac.middleware'
import { validate } from '@/core/middleware/validate.middleware'
import { ROLES } from '@/shared/constants'
import { createPerencanaanSchema, updatePerencanaanSchema, updateStatusPensiunSchema } from './dto/perencanaan.dto'
import { perencanaanController } from './perencanaan.controller'

export const perencanaanRoutes = Router()

const canManage = authorize(ROLES.ADMIN_SISTEM, ROLES.KABID)
const canUpdateStatus = authorize(ROLES.ADMIN_SISTEM, ROLES.KABID, ROLES.ANALIS_MUDA, ROLES.ANALIS_MADYA)

perencanaanRoutes.get('/', perencanaanController.list)
perencanaanRoutes.post('/scan-bup', authorize(ROLES.ADMIN_SISTEM), perencanaanController.scanBup)
perencanaanRoutes.get('/:id', perencanaanController.detail)
perencanaanRoutes.post('/', canManage, validate(createPerencanaanSchema), perencanaanController.create)
perencanaanRoutes.put('/:id', canManage, validate(updatePerencanaanSchema), perencanaanController.update)
perencanaanRoutes.patch('/:id/status', canUpdateStatus, validate(updateStatusPensiunSchema), perencanaanController.updateStatus)
perencanaanRoutes.delete('/:id', authorize(ROLES.ADMIN_SISTEM), perencanaanController.remove)
