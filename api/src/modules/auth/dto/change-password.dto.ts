import { z } from 'zod'
import { passwordSchema } from '@/shared/validators/password.validator'

export const changePasswordSchema = z
  .object({
    passwordLama: z.string().min(1),
    passwordBaru: passwordSchema,
    konfirmasiPassword: z.string(),
  })
  .refine((data) => data.passwordBaru === data.konfirmasiPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['konfirmasiPassword'],
  })

export type ChangePasswordDto = z.infer<typeof changePasswordSchema>
