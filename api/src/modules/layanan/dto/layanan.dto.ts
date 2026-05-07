import { z } from 'zod'

export const createUsulanSchema = z.object({
  jenisLayananId: z.coerce.bigint(),
  asnId: z.coerce.bigint(),
  unitOrganisasiId: z.coerce.bigint(),
  tanggalUsulan: z.coerce.date(),
})

const catatanOptional = z.string().max(1000).trim().optional()
const alasanWajib = (min: number) => z.string().trim().min(min).max(1000)

export const submitSchema = z.object({})
export const terimaSchema = z.object({})
export const teruskanSchema = z.object({ catatan: catatanOptional })
export const kembalikanSchema = z.object({ alasan: alasanWajib(10) })
export const setujuiSchema = z.object({ catatan: catatanOptional })
export const batalSchema = z.object({ alasan: alasanWajib(5) })
export const resubmitSchema = z.object({ catatan: catatanOptional })
export const uploadDokumenSchema = z.object({ jenisDokumen: z.string().optional() })

export type CreateUsulanDto = z.infer<typeof createUsulanSchema>
export type TeruskanDto = z.infer<typeof teruskanSchema>
export type KembalikanDto = z.infer<typeof kembalikanSchema>
export type SetujuiDto = z.infer<typeof setujuiSchema>
export type BatalDto = z.infer<typeof batalSchema>
export type ResubmitDto = z.infer<typeof resubmitSchema>
export type UploadDokumenDto = z.infer<typeof uploadDokumenSchema>
