import { z } from 'zod'
import { passwordSchema } from '@/shared/validators/password.validator'

export const registerSchema = z
  .object({
    nip: z.string().regex(/^\d{18}$/, 'NIP harus terdiri dari 18 digit'),
    email: z.string().email(),
    nomorHp: z.string().min(8).max(20),
    unitOrganisasiId: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Konfirmasi password tidak sama',
    path: ['confirmPassword'],
  })

export type RegisterDto = z.infer<typeof registerSchema>
