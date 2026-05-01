import { z } from 'zod'

export const updateUserSchema = z.object({
  namaLengkap: z.string().min(2).max(255).optional(),
  email: z.string().email().optional(),
  nomorHp: z.string().optional(),
  roleId: z.coerce.bigint().positive().optional(),
  unitOrganisasiId: z.string().uuid().nullable().optional(),
  asnId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().optional(),
})

export type UpdateUserDto = z.infer<typeof updateUserSchema>
