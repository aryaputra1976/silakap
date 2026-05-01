import { z } from 'zod'

const jabatanSchema = z.enum(['AP', 'AM', 'AD', 'Kabid', 'KepalaBadan'])

export const configSlaSchema = z.object({
  jenisLayananId: z.coerce.bigint().optional(),
  jabatan: jabatanSchema,
  slaHari: z.coerce.number().int().min(0),
  slaJam: z.coerce.number().int().min(0).max(23),
  eskalasiHari: z.coerce.number().int().optional(),
})

export const updateConfigSlaSchema = configSlaSchema.partial()

export const testEmailSchema = z.object({
  to: z.string().email(),
})

export const updateNotifikasiConfigSchema = z.object({
  eventType: z.string().max(100).optional().nullable(),
  channel: z.enum(['InApp', 'Email', 'WhatsApp', 'SMS']).optional().nullable(),
  penerimaRole: z.string().max(50).optional().nullable(),
  templateMessage: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

export const upsertLaporanOtomatisSchema = z.object({
  id: z.coerce.bigint().optional(),
  jenisLaporan: z.enum(['Harian', 'Bulanan']).optional().nullable(),
  jadwalPengiriman: z.string().max(100).optional().nullable(),
  formatLaporan: z.enum(['PDF', 'Excel']).optional().nullable(),
  penerimaRole: z.string().max(50).optional().nullable(),
  isActive: z.boolean().optional(),
})

export const cleanupOrphanFilesSchema = z.object({
  dryRun: z.boolean().optional().default(true),
})

export type ConfigSlaDto = z.infer<typeof configSlaSchema>
export type UpdateConfigSlaDto = z.infer<typeof updateConfigSlaSchema>
export type TestEmailDto = z.infer<typeof testEmailSchema>
export type UpdateNotifikasiConfigDto = z.infer<typeof updateNotifikasiConfigSchema>
export type UpsertLaporanOtomatisDto = z.infer<typeof upsertLaporanOtomatisSchema>
export type CleanupOrphanFilesDto = z.infer<typeof cleanupOrphanFilesSchema>
