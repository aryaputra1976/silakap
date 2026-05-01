import { z } from 'zod'

export const createRoleSchema = z.object({
  nama: z.string().min(1).max(50),
  deskripsi: z.string().max(255).optional(),
})

export type CreateRoleDto = z.infer<typeof createRoleSchema>
