import { AppError } from '@/core/errors/app-error'
import { ROLES } from '@/shared/constants'
import { TahapUsulan } from '@prisma/client'

type RoleName =
  | typeof ROLES.PENGELOLA_OPD
  | typeof ROLES.ADMIN_SISTEM
  | typeof ROLES.ANALIS_PERTAMA
  | typeof ROLES.ANALIS_MUDA
  | typeof ROLES.ANALIS_MADYA
  | typeof ROLES.KABID
  | typeof ROLES.KEPALA_BADAN

export const layananAccessPolicy = {
  canCreate(role: string) {
    if (role !== ROLES.PENGELOLA_OPD) {
      throw new AppError('Forbidden', 403)
    }
  },

  canUpload(role: string) {
    if (role !== ROLES.PENGELOLA_OPD) {
      throw new AppError('Forbidden', 403)
    }
  },

  canSubmit(role: string) {
    if (role !== ROLES.PENGELOLA_OPD) {
      throw new AppError('Forbidden', 403)
    }
  },

  canTerima(role: string) {
    if (role !== ROLES.ANALIS_PERTAMA) {
      throw new AppError('Forbidden', 403)
    }
  },

  canProcess(role: string, tahap: TahapUsulan) {
    const map: Record<TahapUsulan, RoleName> = {
      [TahapUsulan.AP]: ROLES.ANALIS_PERTAMA,
      [TahapUsulan.AM]: ROLES.ANALIS_MUDA,
      [TahapUsulan.AD]: ROLES.ANALIS_MADYA,
      [TahapUsulan.Kabid]: ROLES.KABID,
      [TahapUsulan.KepalaBadan]: ROLES.KEPALA_BADAN,
    }

    if (role !== map[tahap]) {
      throw new AppError('Forbidden', 403)
    }
  },

  canApprove(role: string) {
    if (role !== ROLES.KABID && role !== ROLES.KEPALA_BADAN) {
      throw new AppError('Forbidden', 403)
    }
  },

  canCancel(role: string) {
    if (role !== ROLES.PENGELOLA_OPD && role !== ROLES.ADMIN_SISTEM) {
      throw new AppError('Forbidden', 403)
    }
  },
}