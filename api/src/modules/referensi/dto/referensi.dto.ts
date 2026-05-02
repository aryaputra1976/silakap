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

const jabatanIdSchema = z.string().min(1).max(36)

export const createJenisJabatanSchema = z.object({
  nama: z.string().min(1).max(50),
  keterangan: z.string().max(255).nullable().optional(),
})
export const updateJenisJabatanSchema = createJenisJabatanSchema.partial()

export const createJabatanStrukturalSchema = z.object({
  id: jabatanIdSchema,
  nama: z.string().min(1).max(255),
  unitOrganisasiId: z.string().min(1).max(36),
  eselonId: z.number().int().nullable().optional(),
  bup: z.number().int().optional(),
  kode: z.string().max(50).nullable().optional(),
  idSiasn: z.string().max(100).nullable().optional(),
  isActive: z.boolean().optional(),
})
export const updateJabatanStrukturalSchema = createJabatanStrukturalSchema.omit({ id: true }).partial()

export const createJabatanFungsionalSchema = z.object({
  id: jabatanIdSchema,
  kode: z.string().max(50).nullable().optional(),
  nama: z.string().min(1).max(255),
  jenjang: z.string().max(20).nullable().optional(),
  bup: z.number().int().optional(),
  idSiasn: z.string().max(100).nullable().optional(),
  isActive: z.boolean().optional(),
})
export const updateJabatanFungsionalSchema = createJabatanFungsionalSchema.omit({ id: true }).partial()

export const createJabatanPelaksanaSchema = z.object({
  id: jabatanIdSchema,
  kode: z.string().max(50).nullable().optional(),
  nama: z.string().min(1).max(255),
  idSiasn: z.string().max(100).nullable().optional(),
  isActive: z.boolean().optional(),
})
export const updateJabatanPelaksanaSchema = createJabatanPelaksanaSchema.omit({ id: true }).partial()

export type CreateGolonganDto = z.infer<typeof createGolonganSchema>
export type UpdateGolonganDto = z.infer<typeof updateGolonganSchema>
export type CreateUnitOrganisasiDto = z.infer<typeof createUnitOrganisasiSchema>
export type UpdateUnitOrganisasiDto = z.infer<typeof updateUnitOrganisasiSchema>
export type CreateJenisLayananDto = z.infer<typeof createJenisLayananSchema>
export type UpdateJenisLayananDto = z.infer<typeof updateJenisLayananSchema>
export type ReplacePersyaratanDto = z.infer<typeof replacePersyaratanSchema>
export type CreateJenisJabatanDto = z.infer<typeof createJenisJabatanSchema>
export type UpdateJenisJabatanDto = z.infer<typeof updateJenisJabatanSchema>
export type CreateJabatanStrukturalDto = z.infer<typeof createJabatanStrukturalSchema>
export type UpdateJabatanStrukturalDto = z.infer<typeof updateJabatanStrukturalSchema>
export type CreateJabatanFungsionalDto = z.infer<typeof createJabatanFungsionalSchema>
export type UpdateJabatanFungsionalDto = z.infer<typeof updateJabatanFungsionalSchema>
export type CreateJabatanPelaksanaDto = z.infer<typeof createJabatanPelaksanaSchema>
export type UpdateJabatanPelaksanaDto = z.infer<typeof updateJabatanPelaksanaSchema>
