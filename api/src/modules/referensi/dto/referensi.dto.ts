import { z } from 'zod'

export const createGolonganSchema = z.object({
  kode: z.string().min(1).max(10),
  nama: z.string().min(1).max(100),
  roman: z.string().max(10).optional(),
  tingkat: z.number().int().optional(),
})

export const updateGolonganSchema = createGolonganSchema.partial()

const unitOrganisasiIdSchema = z.string().min(1).max(36)

export const createUnitOrganisasiSchema = z.object({
  id: unitOrganisasiIdSchema,
  nama: z.string().min(1).max(255),
  idAtasan: unitOrganisasiIdSchema.nullable().optional(),
  level: z.number().int().positive().optional(),
  isOpd: z.boolean().optional(),
})

export const updateUnitOrganisasiSchema = createUnitOrganisasiSchema.omit({ id: true }).partial()

export const createJenisLayananSchema = z.object({
  kode: z.string().min(1).max(20),
  nama: z.string().min(1).max(100),
  deskripsi: z.string().nullable().optional(),
  butuhTteKepalaBadan: z.boolean().optional(),
  isActive: z.boolean().optional(),
  persyaratan: z
    .array(
      z.object({
        urutan: z.number().int().optional(),
        namaPersyaratan: z.string().min(1).max(255),
        isRequired: z.boolean().optional(),
      }),
    )
    .optional(),
})

export const updateJenisLayananSchema = createJenisLayananSchema.partial()

export const replacePersyaratanSchema = z.object({
  persyaratan: z.array(
    z.object({
      urutan: z.number().int().optional(),
      namaPersyaratan: z.string().min(1).max(255),
      isRequired: z.boolean().optional(),
    }),
  ),
})

export type CreateGolonganDto = z.infer<typeof createGolonganSchema>
export type UpdateGolonganDto = z.infer<typeof updateGolonganSchema>
export type CreateUnitOrganisasiDto = z.infer<typeof createUnitOrganisasiSchema>
export type UpdateUnitOrganisasiDto = z.infer<typeof updateUnitOrganisasiSchema>
export type CreateJenisLayananDto = z.infer<typeof createJenisLayananSchema>
export type UpdateJenisLayananDto = z.infer<typeof updateJenisLayananSchema>
export type ReplacePersyaratanDto = z.infer<typeof replacePersyaratanSchema>
