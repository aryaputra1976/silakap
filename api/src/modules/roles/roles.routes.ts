import { Router } from 'express'
import { authorize } from '@/core/middleware/rbac.middleware'
import { validate } from '@/core/middleware/validate.middleware'
import { ROLES } from '@/shared/constants'
import { createRoleSchema } from './dto/create-role.dto'
import { setRolePermissionsSchema } from './dto/role-permissions.dto'
import { updateRoleSchema } from './dto/update-role.dto'
import { rolesController } from './roles.controller'

export const rolesRoutes = Router()

rolesRoutes.use(authorize(ROLES.ADMIN_SISTEM))
rolesRoutes.get('/', rolesController.list)
rolesRoutes.post('/', validate(createRoleSchema), rolesController.create)
rolesRoutes.put('/:id', validate(updateRoleSchema), rolesController.update)
rolesRoutes.delete('/:id', rolesController.remove)
rolesRoutes.get('/:id/permissions', rolesController.permissions)
rolesRoutes.put('/:id/permissions', validate(setRolePermissionsSchema), rolesController.setPermissions)
