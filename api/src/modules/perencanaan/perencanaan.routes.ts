import { Router } from 'express'
import { authorize } from '@/core/middleware/rbac.middleware'
import { validate } from '@/core/middleware/validate.middleware'
import { ROLES } from '@/shared/constants'
import { createPerencanaanSchema, updatePerencanaanSchema } from './dto/perencanaan.dto'
import { perencanaanController } from './perencanaan.controller'

export const perencanaanRoutes = Router()

perencanaanRoutes.get('/', perencanaanController.list)
perencanaanRoutes.get('/:id', perencanaanController.detail)
perencanaanRoutes.post('/', authorize(ROLES.ADMIN_SISTEM, ROLES.KABID), validate(createPerencanaanSchema), perencanaanController.create)
perencanaanRoutes.put('/:id', authorize(ROLES.ADMIN_SISTEM, ROLES.KABID), validate(updatePerencanaanSchema), perencanaanController.update)
perencanaanRoutes.delete('/:id', authorize(ROLES.ADMIN_SISTEM), perencanaanController.remove)
perencanaanRoutes.post('/:id/selesai', authorize(ROLES.ADMIN_SISTEM, ROLES.KABID), perencanaanController.tandaiSelesai)
