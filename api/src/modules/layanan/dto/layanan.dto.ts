import { z } from 'zod'

export const createUsulanSchema = z.object({
  jenisLayananId: z.coerce.bigint(),
  asnId: z.coerce.bigint(),
  unitOrganisasiId: z.coerce.bigint(),
  tanggalUsulan: z.coerce.date(),
})

export const submitSchema = z.object({})
export const terimaSchema = z.object({})
export const teruskanSchema = z.object({ catatan: z.string().optional() })
export const kembalikanSchema = z.object({ alasan: z.string().min(10) })
export const setujuiSchema = z.object({ catatan: z.string().optional() })
export const batalSchema = z.object({ alasan: z.string().min(5) })
export const resubmitSchema = z.object({ catatan: z.string().optional() })
export const uploadDokumenSchema = z.object({ jenisDokumen: z.string().optional() })

export type CreateUsulanDto = z.infer<typeof createUsulanSchema>
export type TeruskanDto = z.infer<typeof teruskanSchema>
export type KembalikanDto = z.infer<typeof kembalikanSchema>
export type SetujuiDto = z.infer<typeof setujuiSchema>
export type BatalDto = z.infer<typeof batalSchema>
export type ResubmitDto = z.infer<typeof resubmitSchema>
export type UploadDokumenDto = z.infer<typeof uploadDokumenSchema>
