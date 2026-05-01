import { z } from 'zod'

export const arsipkanSchema = z.object({
  usulanLayananId: z.string().min(1),
  alasanArsip: z.string().optional(),
})

export type ArsipkanDto = z.infer<typeof arsipkanSchema>
