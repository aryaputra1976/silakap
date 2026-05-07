import { z } from 'zod'
import { passwordSchema } from '@/shared/validators/password.validator'

export const createUserSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9._]+$/, 'Hanya huruf kecil, angka, titik, underscore'),
  namaLengkap: z.string().min(2).max(255),
  email: z.string().email(),
  nomorHp: z.string().optional(),
  roleId: z.coerce.bigint().positive(),
  unitOrganisasiId: z.coerce.bigint().optional(),
  asnId: z.coerce.bigint().optional(),
  password: passwordSchema.optional(),
  isActive: z.boolean().optional().default(true),
})

export type CreateUserDto = z.infer<typeof createUserSchema>
