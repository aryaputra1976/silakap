import { Router } from 'express'
import { authorize } from '@/core/middleware/rbac.middleware'
import { upload } from '@/core/middleware/upload.middleware'
import { validate } from '@/core/middleware/validate.middleware'
import { ROLES } from '@/shared/constants'
import {
  batalSchema,
  createUsulanSchema,
  kembalikanSchema,
  resubmitSchema,
  setujuiSchema,
  terimaSchema,
  teruskanSchema,
} from './dto/layanan.dto'
import { layananController } from './layanan.controller'

export const layananRoutes = Router()

layananRoutes.get('/', layananController.list)
layananRoutes.get('/:id/dokumen-output', layananController.dokumenOutput)
layananRoutes.get('/:id', layananController.detail)
layananRoutes.post('/', authorize(ROLES.PENGELOLA_OPD), validate(createUsulanSchema), layananController.create)
layananRoutes.post('/:id/dokumen', authorize(ROLES.PENGELOLA_OPD), upload.single('file'), layananController.uploadDokumen)
layananRoutes.post('/:id/submit', authorize(ROLES.PENGELOLA_OPD), layananController.submit)
layananRoutes.post('/:id/terima', authorize(ROLES.ANALIS_PERTAMA), validate(terimaSchema), layananController.terima)
layananRoutes.post('/:id/teruskan', authorize(ROLES.ANALIS_PERTAMA, ROLES.ANALIS_MUDA, ROLES.ANALIS_MADYA), validate(teruskanSchema), layananController.teruskan)
layananRoutes.post('/:id/kembalikan', authorize(ROLES.ANALIS_PERTAMA, ROLES.ANALIS_MUDA, ROLES.ANALIS_MADYA, ROLES.KABID, ROLES.KEPALA_BADAN), validate(kembalikanSchema), layananController.kembalikan)
layananRoutes.post('/:id/setujui', authorize(ROLES.KABID, ROLES.KEPALA_BADAN), validate(setujuiSchema), layananController.setujui)
layananRoutes.post('/:id/batal', authorize(ROLES.PENGELOLA_OPD, ROLES.ADMIN_SISTEM), validate(batalSchema), layananController.batal)
layananRoutes.post('/:id/resubmit', authorize(ROLES.PENGELOLA_OPD), validate(resubmitSchema), layananController.resubmit)
