import { z } from 'zod'
import { StatusPegawai } from '@/shared/enums'

const optionalString = (max?: number) => {
  const schema = max ? z.string().max(max) : z.string()
  return schema.optional()
}

export const createAsnSchema = z.object({
  nipBaru: z.string().min(1).max(20),
  nipLama: optionalString(20),
  nama: z.string().min(1).max(255),
  gelarDepan: optionalString(50),
  gelarBelakang: optionalString(100),
  tempatLahir: optionalString(100),
  tanggalLahir: z.coerce.date().optional(),
  tempatLahirId: z.coerce.bigint().optional(),
  jenisKelaminId: z.coerce.bigint().optional(),
  agamaId: z.coerce.bigint().optional(),
  statusKawinId: z.coerce.bigint().optional(),
  nik: optionalString(20),
  nomorHp: optionalString(20),
  email: z.string().email().max(100).optional(),
  emailGov: z.string().email().max(100).optional(),
  alamat: optionalString(),
  npwp: optionalString(20),
  bpjs: optionalString(20),
  jenisPegawaiId: z.coerce.bigint().optional(),
  statusPegawai: z.nativeEnum(StatusPegawai).optional(),
  kedudukanHukum: optionalString(100),
  nomorSkCpns: optionalString(100),
  tanggalSkCpns: z.coerce.date().optional(),
  tmtCpns: z.coerce.date().optional(),
  nomorSkPns: optionalString(100),
  tanggalSkPns: z.coerce.date().optional(),
  tmtPns: z.coerce.date().optional(),
  golonganId: z.coerce.bigint().optional(),
  tmtGolongan: z.coerce.date().optional(),
  mkTahun: z.coerce.number().int().min(0).optional(),
  mkBulan: z.coerce.number().int().min(0).optional(),
  jenisJabatanId: z.coerce.bigint().optional(),
  jabatanId: z.coerce.bigint().optional(),
  tmtJabatan: z.coerce.date().optional(),
  tingkatPendidikanId: z.coerce.bigint().optional(),
  bidangPendidikanId: z.coerce.bigint().optional(),
  namaSekolah: optionalString(255),
  tahunLulus: z.coerce.number().int().optional(),
  unitOrganisasiId: z.coerce.bigint().optional(),
  lokasiKerja: optionalString(255),
  nikValid: z.boolean().optional(),
  flagIkd: z.boolean().optional(),
})

export const updateAsnSchema = createAsnSchema.partial()

export const createPeremajaanSchema = z.object({
  asnId: z.string().min(1),
  jenisPerubahan: z.string().min(1).max(100),
  dataBaru: z.record(z.string(), z.unknown()).default({}),
  dokumenBukti: optionalString(500),
  catatan: optionalString(),
})

export const approvePeremajaanSchema = z.object({
  statusApproval: z.enum(['Approved', 'Rejected']).default('Approved'),
  catatan: optionalString(),
})

export type CreateAsnDto = z.infer<typeof createAsnSchema>
export type UpdateAsnDto = z.infer<typeof updateAsnSchema>
export type CreatePeremajaanDto = z.infer<typeof createPeremajaanSchema>
export type ApprovePeremajaanDto = z.infer<typeof approvePeremajaanSchema>
