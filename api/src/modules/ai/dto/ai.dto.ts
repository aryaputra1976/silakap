import { z } from 'zod'

export const aiChatSchema = z.object({
  message: z.string().trim().min(3, 'Pertanyaan minimal 3 karakter').max(3000),
  usulanId: z.string().uuid().optional(),
  mode: z.enum(['umum', 'usulan', 'dokumen', 'dashboard']).default('umum'),
})

export const aiCekKelengkapanSchema = z.object({
  catatanTambahan: z.string().trim().max(2000).optional(),
})

export type AiChatDto = z.infer<typeof aiChatSchema>
export type AiCekKelengkapanDto = z.infer<typeof aiCekKelengkapanSchema>
