import { Router } from 'express'
import { authorize } from '@/core/middleware/rbac.middleware'
import { validate } from '@/core/middleware/validate.middleware'
import { ROLES } from '@/shared/constants'
import { createUserSchema } from './dto/create-user.dto'
import { updateUserSchema } from './dto/update-user.dto'
import { usersController } from './users.controller'

export const usersRoutes = Router()

usersRoutes.use(authorize(ROLES.ADMIN_SISTEM))
usersRoutes.get('/', usersController.list)
usersRoutes.get('/access-review', usersController.accessReview)
usersRoutes.get('/access-review/export', usersController.accessReviewExport)
usersRoutes.get('/:id', usersController.detail)
usersRoutes.post('/', validate(createUserSchema), usersController.create)
usersRoutes.put('/:id', validate(updateUserSchema), usersController.update)
usersRoutes.delete('/:id', usersController.remove)
usersRoutes.post('/:id/reset-password', usersController.resetPassword)
usersRoutes.post('/:id/unlock', usersController.unlock)
