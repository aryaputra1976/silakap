import { z } from 'zod'

export const createGolonganSchema = z.object({
  idSiasn: z.string().max(64).nullable().optional(),
  kode: z.string().min(1).max(10),
  nama: z.string().min(1).max(100),
  roman: z.string().max(10).optional(),
  tingkat: z.number().int().optional(),
  isActive: z.boolean().optional(),
})

export const updateGolonganSchema = createGolonganSchema.partial()

const unitOrganisasiIdSchema = z.string().min(1).max(64)

export const createUnitOrganisasiSchema = z.object({
  id: unitOrganisasiIdSchema,
  kode: z.string().max(64).nullable().optional(),
  nama: z.string().min(1).max(255),
  idAtasan: z.coerce.bigint().nullable().optional(),
  level: z.number().int().positive().optional(),
  isOpd: z.boolean().optional(),
  isActive: z.boolean().optional(),
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

export const createJenisJabatanSchema = z.object({
  idSiasn: z.string().max(64).nullable().optional(),
  kode: z.string().max(32).nullable().optional(),
  nama: z.string().min(1).max(150),
  keterangan: z.string().max(255).nullable().optional(),
  isActive: z.boolean().optional(),
})
export const updateJenisJabatanSchema = createJenisJabatanSchema.partial()

export const createRefMasterSchema = z.object({
  idSiasn: z.string().max(64).nullable().optional(),
  kode: z.string().max(64).nullable().optional(),
  nama: z.string().min(1).max(255),
  isActive: z.boolean().optional(),
})
export const updateRefMasterSchema = createRefMasterSchema.partial()

export const createRefJenisKelaminSchema = z.object({
  kode: z.string().min(1).max(10),
  nama: z.string().min(1).max(50),
  isActive: z.boolean().optional(),
})
export const updateRefJenisKelaminSchema = createRefJenisKelaminSchema.partial()

export const createRefStatusAsnSchema = z.object({
  kode: z.string().min(1).max(32),
  nama: z.string().min(1).max(100),
  isActive: z.boolean().optional(),
})
export const updateRefStatusAsnSchema = createRefStatusAsnSchema.partial()

export const createRefPendidikanSchema = createRefMasterSchema.extend({
  tingkatId: z.coerce.bigint().nullable().optional(),
})
export const updateRefPendidikanSchema = createRefPendidikanSchema.partial()

export const createRefJabatanSchema = createRefMasterSchema.extend({
  idSiasn: z.string().max(100).nullable().optional(),
  jenisJabatanId: z.coerce.bigint().nullable().optional(),
  unitOrganisasiId: z.coerce.bigint().nullable().optional(),
  eselonId: z.coerce.number().int().nullable().optional(),
  jenjang: z.string().max(50).nullable().optional(),
  bup: z.coerce.number().int().nullable().optional(),
})
export const updateRefJabatanSchema = createRefJabatanSchema.partial()

export const createTemplateDokumenSchema = z.object({
  jenisLayananId: z.coerce.bigint().nullable().optional(),
  kode: z.string().min(1).max(50),
  nama: z.string().min(1).max(255),
  deskripsi: z.string().nullable().optional(),
  konten: z.string().min(1),
  variabel: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
})
export const updateTemplateDokumenSchema = createTemplateDokumenSchema.partial()

export const createJabatanStrukturalSchema = createRefJabatanSchema.extend({
  id: z.string().min(1).max(100).optional(),
  nama: z.string().min(1).max(255),
  unitOrganisasiId: z.coerce.bigint().nullable().optional(),
  eselonId: z.coerce.number().int().nullable().optional(),
  bup: z.coerce.number().int().nullable().optional(),
  kode: z.string().max(64).nullable().optional(),
  idSiasn: z.string().max(100).nullable().optional(),
})
export const updateJabatanStrukturalSchema = createJabatanStrukturalSchema.omit({ id: true }).partial()

export const createJabatanFungsionalSchema = createRefJabatanSchema.extend({
  id: z.string().min(1).max(100).optional(),
  kode: z.string().max(64).nullable().optional(),
  nama: z.string().min(1).max(255),
  jenjang: z.string().max(50).nullable().optional(),
  bup: z.coerce.number().int().nullable().optional(),
  idSiasn: z.string().max(100).nullable().optional(),
})
export const updateJabatanFungsionalSchema = createJabatanFungsionalSchema.omit({ id: true }).partial()

export const createJabatanPelaksanaSchema = createRefJabatanSchema.extend({
  id: z.string().min(1).max(100).optional(),
  kode: z.string().max(64).nullable().optional(),
  nama: z.string().min(1).max(255),
  idSiasn: z.string().max(100).nullable().optional(),
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
export type CreateRefMasterDto = z.infer<typeof createRefMasterSchema>
export type UpdateRefMasterDto = z.infer<typeof updateRefMasterSchema>
export type CreateRefJenisKelaminDto = z.infer<typeof createRefJenisKelaminSchema>
export type UpdateRefJenisKelaminDto = z.infer<typeof updateRefJenisKelaminSchema>
export type CreateRefStatusAsnDto = z.infer<typeof createRefStatusAsnSchema>
export type UpdateRefStatusAsnDto = z.infer<typeof updateRefStatusAsnSchema>
export type CreateRefPendidikanDto = z.infer<typeof createRefPendidikanSchema>
export type UpdateRefPendidikanDto = z.infer<typeof updateRefPendidikanSchema>
export type CreateRefJabatanDto = z.infer<typeof createRefJabatanSchema>
export type UpdateRefJabatanDto = z.infer<typeof updateRefJabatanSchema>
export type CreateTemplateDokumenDto = z.infer<typeof createTemplateDokumenSchema>
export type UpdateTemplateDokumenDto = z.infer<typeof updateTemplateDokumenSchema>
export type CreateJabatanStrukturalDto = z.infer<typeof createJabatanStrukturalSchema>
export type UpdateJabatanStrukturalDto = z.infer<typeof updateJabatanStrukturalSchema>
export type CreateJabatanFungsionalDto = z.infer<typeof createJabatanFungsionalSchema>
export type UpdateJabatanFungsionalDto = z.infer<typeof updateJabatanFungsionalSchema>
export type CreateJabatanPelaksanaDto = z.infer<typeof createJabatanPelaksanaSchema>
export type UpdateJabatanPelaksanaDto = z.infer<typeof updateJabatanPelaksanaSchema>
