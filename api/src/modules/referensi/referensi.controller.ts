import type { NextFunction, Request, Response } from 'express'
import { sendCreated, sendPaginated, sendSuccess } from '@/core/http/response.helper'
import { referensiService } from './referensi.service'

export const referensiController = {
  agama: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.agama()) } catch (error) { next(error) }
  },
  createAgama: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendCreated(res, await referensiService.createAgama(req.body), 'Agama berhasil dibuat') } catch (error) { next(error) }
  },
  updateAgama: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.updateAgama(req.params.id, req.body), 'Agama berhasil diperbarui') } catch (error) { next(error) }
  },
  deleteAgama: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.deleteAgama(req.params.id), 'Agama berhasil dinonaktifkan') } catch (error) { next(error) }
  },
  jenisKelamin: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.jenisKelamin()) } catch (error) { next(error) }
  },
  createJenisKelamin: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendCreated(res, await referensiService.createJenisKelamin(req.body), 'Jenis kelamin berhasil dibuat') } catch (error) { next(error) }
  },
  updateJenisKelamin: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.updateJenisKelamin(req.params.id, req.body), 'Jenis kelamin berhasil diperbarui') } catch (error) { next(error) }
  },
  deleteJenisKelamin: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.deleteJenisKelamin(req.params.id), 'Jenis kelamin berhasil dinonaktifkan') } catch (error) { next(error) }
  },
  statusPerkawinan: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.statusPerkawinan()) } catch (error) { next(error) }
  },
  createStatusPerkawinan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendCreated(res, await referensiService.createStatusPerkawinan(req.body), 'Status perkawinan berhasil dibuat') } catch (error) { next(error) }
  },
  updateStatusPerkawinan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.updateStatusPerkawinan(req.params.id, req.body), 'Status perkawinan berhasil diperbarui') } catch (error) { next(error) }
  },
  deleteStatusPerkawinan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.deleteStatusPerkawinan(req.params.id), 'Status perkawinan berhasil dinonaktifkan') } catch (error) { next(error) }
  },
  jenisPegawai: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.jenisPegawai()) } catch (error) { next(error) }
  },
  createJenisPegawai: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendCreated(res, await referensiService.createJenisPegawai(req.body), 'Jenis pegawai berhasil dibuat') } catch (error) { next(error) }
  },
  updateJenisPegawai: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.updateJenisPegawai(req.params.id, req.body), 'Jenis pegawai berhasil diperbarui') } catch (error) { next(error) }
  },
  deleteJenisPegawai: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.deleteJenisPegawai(req.params.id), 'Jenis pegawai berhasil dinonaktifkan') } catch (error) { next(error) }
  },
  kedudukanHukum: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.kedudukanHukum()) } catch (error) { next(error) }
  },
  createKedudukanHukum: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendCreated(res, await referensiService.createKedudukanHukum(req.body), 'Kedudukan hukum berhasil dibuat') } catch (error) { next(error) }
  },
  updateKedudukanHukum: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.updateKedudukanHukum(req.params.id, req.body), 'Kedudukan hukum berhasil diperbarui') } catch (error) { next(error) }
  },
  deleteKedudukanHukum: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.deleteKedudukanHukum(req.params.id), 'Kedudukan hukum berhasil dinonaktifkan') } catch (error) { next(error) }
  },
  statusAsn: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.statusAsn()) } catch (error) { next(error) }
  },
  createStatusAsn: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendCreated(res, await referensiService.createStatusAsn(req.body), 'Status ASN berhasil dibuat') } catch (error) { next(error) }
  },
  updateStatusAsn: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.updateStatusAsn(req.params.id, req.body), 'Status ASN berhasil diperbarui') } catch (error) { next(error) }
  },
  deleteStatusAsn: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.deleteStatusAsn(req.params.id), 'Status ASN berhasil dinonaktifkan') } catch (error) { next(error) }
  },
  golongan: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await referensiService.golongan())
    } catch (error) {
      next(error)
    }
  },
  createGolongan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendCreated(res, await referensiService.createGolongan(req.body), 'Golongan berhasil dibuat')
    } catch (error) {
      next(error)
    }
  },
  updateGolongan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await referensiService.updateGolongan(req.params.id, req.body), 'Golongan berhasil diperbarui')
    } catch (error) {
      next(error)
    }
  },
  deleteGolongan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.deleteGolongan(req.params.id), 'Golongan berhasil dinonaktifkan') } catch (error) { next(error) }
  },
  unitOrganisasi: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await referensiService.unitOrganisasi(req.query.tree === 'true'))
    } catch (error) {
      next(error)
    }
  },
  unitOrganisasiById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await referensiService.unitOrganisasiById(req.params.id))
    } catch (error) {
      next(error)
    }
  },
  createUnitOrganisasi: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendCreated(res, await referensiService.createUnitOrganisasi(req.body), 'Unit organisasi berhasil dibuat')
    } catch (error) {
      next(error)
    }
  },
  updateUnitOrganisasi: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await referensiService.updateUnitOrganisasi(req.params.id, req.body), 'Unit organisasi berhasil diperbarui')
    } catch (error) {
      next(error)
    }
  },
  deleteUnitOrganisasi: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.deleteUnitOrganisasi(req.params.id), 'Unit organisasi berhasil dinonaktifkan') } catch (error) { next(error) }
  },
  jenisJabatan: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.jenisJabatan()) } catch (e) { next(e) }
  },
  jabatan: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.jabatan()) } catch (e) { next(e) }
  },
  createJenisJabatan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendCreated(res, await referensiService.createJenisJabatan(req.body), 'Jenis jabatan berhasil dibuat') } catch (e) { next(e) }
  },
  updateJenisJabatan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.updateJenisJabatan(req.params.id, req.body), 'Jenis jabatan berhasil diperbarui') } catch (e) { next(e) }
  },
  deleteJenisJabatan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.deleteJenisJabatan(req.params.id), 'Jenis jabatan berhasil dinonaktifkan') } catch (e) { next(e) }
  },
  createJabatan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendCreated(res, await referensiService.createJabatan(req.body), 'Jabatan berhasil dibuat') } catch (e) { next(e) }
  },
  updateJabatan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.updateJabatan(req.params.id, req.body), 'Jabatan berhasil diperbarui') } catch (e) { next(e) }
  },
  deleteJabatan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.deleteJabatan(req.params.id), 'Jabatan berhasil dinonaktifkan') } catch (e) { next(e) }
  },
  jabatanStruktural: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await referensiService.jabatanStruktural(req.query.unitOrganisasiId as string | undefined))
    } catch (error) {
      next(error)
    }
  },
  createJabatanStruktural: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendCreated(res, await referensiService.createJabatanStruktural(req.body), 'Jabatan struktural berhasil dibuat') } catch (e) { next(e) }
  },
  updateJabatanStruktural: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.updateJabatanStruktural(req.params.id, req.body), 'Jabatan struktural berhasil diperbarui') } catch (e) { next(e) }
  },
  deleteJabatanStruktural: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.deleteJabatanStruktural(req.params.id), 'Jabatan struktural berhasil dinonaktifkan') } catch (e) { next(e) }
  },
  jabatanFungsional: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await referensiService.jabatanFungsional())
    } catch (error) {
      next(error)
    }
  },
  createJabatanFungsional: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendCreated(res, await referensiService.createJabatanFungsional(req.body), 'Jabatan fungsional berhasil dibuat') } catch (e) { next(e) }
  },
  updateJabatanFungsional: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.updateJabatanFungsional(req.params.id, req.body), 'Jabatan fungsional berhasil diperbarui') } catch (e) { next(e) }
  },
  deleteJabatanFungsional: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.deleteJabatanFungsional(req.params.id), 'Jabatan fungsional berhasil dinonaktifkan') } catch (e) { next(e) }
  },
  jabatanPelaksana: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await referensiService.jabatanPelaksana())
    } catch (error) {
      next(error)
    }
  },
  createJabatanPelaksana: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendCreated(res, await referensiService.createJabatanPelaksana(req.body), 'Jabatan pelaksana berhasil dibuat') } catch (e) { next(e) }
  },
  updateJabatanPelaksana: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.updateJabatanPelaksana(req.params.id, req.body), 'Jabatan pelaksana berhasil diperbarui') } catch (e) { next(e) }
  },
  deleteJabatanPelaksana: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.deleteJabatanPelaksana(req.params.id), 'Jabatan pelaksana berhasil dinonaktifkan') } catch (e) { next(e) }
  },
  pendidikan: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await referensiService.pendidikan())
    } catch (error) {
      next(error)
    }
  },
  createPendidikan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendCreated(res, await referensiService.createPendidikan(req.body), 'Pendidikan berhasil dibuat') } catch (error) { next(error) }
  },
  updatePendidikan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.updatePendidikan(req.params.id, req.body), 'Pendidikan berhasil diperbarui') } catch (error) { next(error) }
  },
  deletePendidikan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.deletePendidikan(req.params.id), 'Pendidikan berhasil dinonaktifkan') } catch (error) { next(error) }
  },
  pendidikanTingkat: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.pendidikanTingkat()) } catch (error) { next(error) }
  },
  createPendidikanTingkat: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendCreated(res, await referensiService.createPendidikanTingkat(req.body), 'Tingkat pendidikan berhasil dibuat') } catch (error) { next(error) }
  },
  updatePendidikanTingkat: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.updatePendidikanTingkat(req.params.id, req.body), 'Tingkat pendidikan berhasil diperbarui') } catch (error) { next(error) }
  },
  deletePendidikanTingkat: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.deletePendidikanTingkat(req.params.id), 'Tingkat pendidikan berhasil dinonaktifkan') } catch (error) { next(error) }
  },
  wilayah: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.wilayah()) } catch (error) { next(error) }
  },
  createWilayah: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendCreated(res, await referensiService.createWilayah(req.body), 'Wilayah berhasil dibuat') } catch (error) { next(error) }
  },
  updateWilayah: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.updateWilayah(req.params.id, req.body), 'Wilayah berhasil diperbarui') } catch (error) { next(error) }
  },
  deleteWilayah: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.deleteWilayah(req.params.id), 'Wilayah berhasil dinonaktifkan') } catch (error) { next(error) }
  },
  kpkn: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.kpkn()) } catch (error) { next(error) }
  },
  createKpkn: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendCreated(res, await referensiService.createKpkn(req.body), 'KPKN berhasil dibuat') } catch (error) { next(error) }
  },
  updateKpkn: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.updateKpkn(req.params.id, req.body), 'KPKN berhasil diperbarui') } catch (error) { next(error) }
  },
  deleteKpkn: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.deleteKpkn(req.params.id), 'KPKN berhasil dinonaktifkan') } catch (error) { next(error) }
  },
  lokasiKerja: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.lokasiKerja()) } catch (error) { next(error) }
  },
  createLokasiKerja: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendCreated(res, await referensiService.createLokasiKerja(req.body), 'Lokasi kerja berhasil dibuat') } catch (error) { next(error) }
  },
  updateLokasiKerja: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.updateLokasiKerja(req.params.id, req.body), 'Lokasi kerja berhasil diperbarui') } catch (error) { next(error) }
  },
  deleteLokasiKerja: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.deleteLokasiKerja(req.params.id), 'Lokasi kerja berhasil dinonaktifkan') } catch (error) { next(error) }
  },
  bidangPendidikan: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await referensiService.bidangPendidikan())
    } catch (error) {
      next(error)
    }
  },
  jenisLayanan: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await referensiService.jenisLayanan())
    } catch (error) {
      next(error)
    }
  },
  createJenisLayanan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendCreated(res, await referensiService.createJenisLayanan(req.body), 'Jenis layanan berhasil dibuat')
    } catch (error) {
      next(error)
    }
  },
  updateJenisLayanan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await referensiService.updateJenisLayanan(req.params.id, req.body), 'Jenis layanan berhasil diperbarui')
    } catch (error) {
      next(error)
    }
  },
  deleteJenisLayanan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.deleteJenisLayanan(req.params.id), 'Jenis layanan berhasil dinonaktifkan') } catch (error) { next(error) }
  },
  persyaratan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await referensiService.persyaratan(req.params.id))
    } catch (error) {
      next(error)
    }
  },
  replacePersyaratan: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await referensiService.replacePersyaratan(req.params.id, req.body), 'Persyaratan berhasil diperbarui')
    } catch (error) {
      next(error)
    }
  },
  gajiPokok: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await referensiService.gajiPokok(req.query)
      sendPaginated(res, result.data, result.meta)
    } catch (error) {
      next(error)
    }
  },
  templateDokumen: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.templateDokumen()) } catch (error) { next(error) }
  },
  createTemplateDokumen: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendCreated(res, await referensiService.createTemplateDokumen(req.body), 'Template dokumen berhasil dibuat') } catch (error) { next(error) }
  },
  updateTemplateDokumen: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.updateTemplateDokumen(req.params.id, req.body), 'Template dokumen berhasil diperbarui') } catch (error) { next(error) }
  },
  deleteTemplateDokumen: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await referensiService.deleteTemplateDokumen(req.params.id), 'Template dokumen berhasil dihapus') } catch (error) { next(error) }
  },
}
