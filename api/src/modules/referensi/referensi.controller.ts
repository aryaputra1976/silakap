import type { NextFunction, Request, Response } from 'express'
import { sendCreated, sendPaginated, sendSuccess } from '@/core/http/response.helper'
import { referensiService } from './referensi.service'

export const referensiController = {
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
  jabatanStruktural: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await referensiService.jabatanStruktural(req.query.unitOrganisasiId as string | undefined))
    } catch (error) {
      next(error)
    }
  },
  jabatanFungsional: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await referensiService.jabatanFungsional())
    } catch (error) {
      next(error)
    }
  },
  jabatanPelaksana: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await referensiService.jabatanPelaksana())
    } catch (error) {
      next(error)
    }
  },
  pendidikan: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, await referensiService.pendidikan())
    } catch (error) {
      next(error)
    }
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
}
