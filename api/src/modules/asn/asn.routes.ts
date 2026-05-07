import { Router } from 'express'
import { authorize } from '@/core/middleware/rbac.middleware'
import { upload } from '@/core/middleware/upload.middleware'
import { validate } from '@/core/middleware/validate.middleware'
import { ROLES } from '@/shared/constants'
import { asnController } from './asn.controller'
import { approvePeremajaanSchema, createAsnSchema, createPeremajaanSchema, updateAsnSchema } from './dto/asn.dto'

export const asnRoutes = Router()

asnRoutes.get('/', asnController.list)
asnRoutes.get('/stats', asnController.stats)
asnRoutes.get('/peremajaan', authorize(ROLES.PENGELOLA_OPD, ROLES.ANALIS_MADYA, ROLES.KABID, ROLES.ADMIN_SISTEM), asnController.listPeremajaan)
asnRoutes.get('/peremajaan/dokumen/:fileId', authorize(ROLES.PENGELOLA_OPD, ROLES.ANALIS_MADYA, ROLES.KABID, ROLES.ADMIN_SISTEM), asnController.downloadPeremajaanDokumen)
asnRoutes.post('/peremajaan/dokumen', authorize(ROLES.PENGELOLA_OPD, ROLES.ANALIS_MADYA), upload.single('file'), asnController.uploadPeremajaanDokumen)
asnRoutes.post('/peremajaan', authorize(ROLES.PENGELOLA_OPD, ROLES.ANALIS_MADYA), validate(createPeremajaanSchema), asnController.createPeremajaan)
asnRoutes.post('/peremajaan/:id/claim', authorize(ROLES.ANALIS_MADYA, ROLES.KABID, ROLES.ADMIN_SISTEM), asnController.claimPeremajaan)
asnRoutes.put('/peremajaan/:id/approve', authorize(ROLES.ANALIS_MADYA, ROLES.KABID, ROLES.ADMIN_SISTEM), validate(approvePeremajaanSchema), asnController.approvePeremajaan)
asnRoutes.get('/:id', asnController.detail)
asnRoutes.get('/:id/riwayat', asnController.riwayat)
asnRoutes.post('/', authorize(ROLES.ADMIN_SISTEM), validate(createAsnSchema), asnController.create)
asnRoutes.put('/:id', authorize(ROLES.ADMIN_SISTEM, ROLES.KABID), validate(updateAsnSchema), asnController.update)
asnRoutes.delete('/:id', authorize(ROLES.ADMIN_SISTEM), asnController.remove)
