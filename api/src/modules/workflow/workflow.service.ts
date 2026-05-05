import { StatusUsulan, TahapUsulan } from '@prisma/client'
import { AppError } from '@/core/errors/app-error'
import { ROLES } from '@/shared/constants'

export const statusByTahap: Record<TahapUsulan, StatusUsulan> = {
  [TahapUsulan.AP]: StatusUsulan.VerifikasiAP,
  [TahapUsulan.AM]: StatusUsulan.VerifikasiAM,
  [TahapUsulan.AD]: StatusUsulan.QualityControl,
  [TahapUsulan.Kabid]: StatusUsulan.ApprovalKabid,
  [TahapUsulan.KepalaBadan]: StatusUsulan.ApprovalKepalaBadan,
}

export const roleByTahap: Record<TahapUsulan, string> = {
  [TahapUsulan.AP]: ROLES.ANALIS_PERTAMA,
  [TahapUsulan.AM]: ROLES.ANALIS_MUDA,
  [TahapUsulan.AD]: ROLES.ANALIS_MADYA,
  [TahapUsulan.Kabid]: ROLES.KABID,
  [TahapUsulan.KepalaBadan]: ROLES.KEPALA_BADAN,
}

export const nextTahapByCurrent: Partial<Record<TahapUsulan, TahapUsulan>> = {
  [TahapUsulan.AP]: TahapUsulan.AM,
  [TahapUsulan.AM]: TahapUsulan.AD,
  [TahapUsulan.AD]: TahapUsulan.Kabid,
}

export const previousTahapByCurrent: Partial<Record<TahapUsulan, TahapUsulan>> = {
  [TahapUsulan.AP]: TahapUsulan.AP,
  [TahapUsulan.AM]: TahapUsulan.AP,
  [TahapUsulan.AD]: TahapUsulan.AM,
  [TahapUsulan.Kabid]: TahapUsulan.AD,
  [TahapUsulan.KepalaBadan]: TahapUsulan.Kabid,
}

export const workflowService = {
  statusByTahap,
  roleByTahap,

  assertTahapValid(tahap: TahapUsulan | null): asserts tahap is TahapUsulan {
    if (!tahap) {
      throw new AppError('Tahap usulan tidak valid', 422)
    }
  },

  assertRoleCanHandleTahap(actorRoleName: string | undefined, tahap: TahapUsulan) {
    const requiredRole = roleByTahap[tahap]
    if (!actorRoleName || actorRoleName !== requiredRole) {
      throw new AppError('Anda tidak memiliki akses ke tahap ini', 403)
    }
  },

  assertStatusMatchesTahap(status: StatusUsulan, tahap: TahapUsulan) {
    if (status !== statusByTahap[tahap]) {
      throw new AppError('Status tidak sesuai tahap', 422)
    }
  },

  resolveNextTahap(current: TahapUsulan): TahapUsulan {
    const next = nextTahapByCurrent[current]
    if (!next) {
      throw new AppError('Tidak bisa lanjut tahap', 422)
    }
    return next
  },

  resolvePreviousTahap(current: TahapUsulan): TahapUsulan {
    const prev = previousTahapByCurrent[current]
    if (!prev) {
      throw new AppError('Tidak bisa kembali tahap', 422)
    }
    return prev
  },
}