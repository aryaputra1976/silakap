import { z } from 'zod'

export const updateRoleSchema = z.object({
  nama: z.string().min(1).max(50).optional(),
  deskripsi: z.string().max(255).nullable().optional(),
})

export type UpdateRoleDto = z.infer<typeof updateRoleSchema>
