import { z } from 'zod'

export const createPerencanaanSchema = z.object({
  asnId: z.coerce.bigint(),
  jenisPensiun: z.enum(['BUP', 'APS', 'JandaDuda', 'Uzur', 'Dini']).default('BUP'),
  tanggalBup: z.coerce.date(),
  tahunBup: z.coerce.number().int(),
  bupUsia: z.coerce.number().int(),
  isDarurat: z.boolean().optional().default(false),
  subJenisUzur: z.enum(['KarenaDinas', 'BukanKarenaDinas']).optional(),
  tanggalTmt: z.coerce.date().optional(),
  keterangan: z.string().optional(),
})

export const updatePerencanaanSchema = createPerencanaanSchema.partial()

export const updateStatusPensiunSchema = z.object({
  statusPensiun: z.enum([
    'Terdeteksi',
    'DraftBerkas',
    'ValidasiSyarat',
    'PersetujuanPejabat',
    'VerifikasiBKPSDM',
    'InputSIASN',
    'CetakDokumen',
    'DikirimKanreg',
    'SKTerbit',
    'Ditolak',
    'Dibatalkan',
  ]),
  subJenisUzur: z.enum(['KarenaDinas', 'BukanKarenaDinas']).optional(),
  catatanPenolakan: z.string().optional(),
  nomorSkPensiun: z.string().optional(),
  tanggalSkTerbit: z.coerce.date().optional(),
  tanggalPengajuanKeBkn: z.coerce.date().optional(),
  dokumenChecklist: z.record(z.string(), z.boolean()).optional(),
})

export type CreatePerencanaanDto = z.infer<typeof createPerencanaanSchema>
export type UpdatePerencanaanDto = z.infer<typeof updatePerencanaanSchema>
export type UpdateStatusPensiunDto = z.infer<typeof updateStatusPensiunSchema>
