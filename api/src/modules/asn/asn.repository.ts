import type { Prisma } from '@prisma/client'
import { db } from '@/core/database/prisma.client'

const listInclude = {
  golongan: { select: { nama: true } },
  jenisJabatan: { select: { nama: true } },
  unitOrganisasi: { select: { nama: true } },
  tingkatPendidikan: { select: { nama: true } },
} satisfies Prisma.AsnInclude

const detailInclude = {
  golongan: true,
  jenisJabatan: true,
  jabatanStruktural: true,
  jabatanFungsional: true,
  jabatanPelaksana: true,
  unitOrganisasi: true,
  tingkatPendidikan: true,
  bidangPendidikan: true,
  jenisKelamin: true,
  agama: true,
  statusKawin: true,
} satisfies Prisma.AsnInclude

export const asnRepository = {
  findMany(where: Prisma.AsnWhereInput, skip: number, limit: number) {
    return db.asn.findMany({
      where,
      skip,
      take: limit,
      include: listInclude,
      orderBy: { nama: 'asc' },
    })
  },

  findById(id: string) {
    return db.asn.findFirst({ where: { id, deletedAt: null }, include: detailInclude })
  },

  findByNip(nipBaru: string) {
    return db.asn.findFirst({ where: { nipBaru, deletedAt: null } })
  },

  create(id: string, data: Omit<Prisma.AsnUncheckedCreateInput, 'id'>) {
    return db.asn.create({ data: { ...data, id }, include: detailInclude })
  },

  update(id: string, data: Prisma.AsnUncheckedUpdateInput) {
    return db.asn.update({ where: { id }, data, include: detailInclude })
  },

  softDelete(id: string) {
    return db.asn.update({ where: { id }, data: { deletedAt: new Date() } })
  },

  count(where: Prisma.AsnWhereInput) {
    return db.asn.count({ where })
  },
}
