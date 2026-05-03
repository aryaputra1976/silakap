import { z } from 'zod'

export const createPerencanaanSchema = z.object({
  asnId: z.coerce.bigint(),
  tanggalBup: z.coerce.date(),
  tahunBup: z.coerce.number().int(),
  bupUsia: z.coerce.number().int(),
  keterangan: z.string().optional(),
})

export const updatePerencanaanSchema = createPerencanaanSchema.partial()

export type CreatePerencanaanDto = z.infer<typeof createPerencanaanSchema>
export type UpdatePerencanaanDto = z.infer<typeof updatePerencanaanSchema>
