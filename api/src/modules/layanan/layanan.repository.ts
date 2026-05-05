import { Prisma, StatusUsulan, TahapUsulan } from '@prisma/client'
import { db } from '@/core/database/prisma.client'

export const layananRepository = {
  findByIdOrThrow: async (id: string) => {
    const data = await db.usulanLayanan.findFirst({
      where: { id, deletedAt: null },
      include: { jenisLayanan: true },
    })
    if (!data) throw new Error('DATA_NOT_FOUND')
    return data
  },

  findList: async (where: Prisma.UsulanLayananWhereInput, skip: number, take: number) => {
    return db.usulanLayanan.findMany({
      where,
      skip,
      take,
      include: {
        asn: { select: { id: true, nipBaru: true, nama: true } },
        jenisLayanan: { select: { id: true, kode: true, nama: true } },
        unitOrganisasi: { select: { id: true, nama: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  countList: async (where: Prisma.UsulanLayananWhereInput) => {
    return db.usulanLayanan.count({ where })
  },

  createDraft: async (data: Prisma.UsulanLayananCreateInput) => {
    return db.usulanLayanan.create({
      data,
      include: { jenisLayanan: true, asn: true, unitOrganisasi: true },
    })
  },

  update: async (id: string, data: Prisma.UsulanLayananUncheckedUpdateInput) => {
    return db.usulanLayanan.update({
      where: { id },
      data,
    })
  },

  createDokumen: async (data: Prisma.UsulanDokumenCreateInput) => {
    return db.usulanDokumen.create({ data })
  },

  createRevisi: async (data: Prisma.UsulanRevisiCreateInput) => {
    return db.usulanRevisi.create({ data })
  },

  findLastRevisi: async (usulanId: string) => {
    return db.usulanRevisi.findFirst({
      where: { usulanId },
      orderBy: { nomorRevisi: 'desc' },
      select: { nomorRevisi: true },
    })
  },

  findPendingRevisi: async (usulanId: string) => {
    return db.usulanRevisi.findFirst({
      where: { usulanId, statusRevisi: 'Menunggu' },
      orderBy: { nomorRevisi: 'desc' },
    })
  },

  getLatestOutput: async (usulanId: string) => {
    return db.usulanDokumenOutput.findFirst({
      where: { usulanLayananId: usulanId },
      orderBy: { createdAt: 'desc' },
    })
  },  
}