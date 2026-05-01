import { z } from 'zod'

export const changePasswordSchema = z
  .object({
    passwordLama: z.string().min(1),
    passwordBaru: z
      .string()
      .min(8)
      .regex(/^(?=.*[A-Z])(?=.*[0-9])/, 'Password harus mengandung huruf kapital dan angka'),
    konfirmasiPassword: z.string(),
  })
  .refine((data) => data.passwordBaru === data.konfirmasiPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['konfirmasiPassword'],
  })

export type ChangePasswordDto = z.infer<typeof changePasswordSchema>
