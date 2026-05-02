import type { Prisma, RefUnitOrganisasi } from '@prisma/client'
import { db } from '@/core/database/prisma.client'
import { AppError } from '@/core/errors/app-error'
import { buildMeta, getPaginationParams } from '@/core/http/pagination.helper'
import type {
  CreateGolonganDto,
  CreateJabatanFungsionalDto,
  CreateJabatanPelaksanaDto,
  CreateJabatanStrukturalDto,
  CreateJenisJabatanDto,
  CreateJenisLayananDto,
  CreateUnitOrganisasiDto,
  ReplacePersyaratanDto,
  UpdateGolonganDto,
  UpdateJabatanFungsionalDto,
  UpdateJabatanPelaksanaDto,
  UpdateJabatanStrukturalDto,
  UpdateJenisJabatanDto,
  UpdateJenisLayananDto,
  UpdateUnitOrganisasiDto,
} from './dto/referensi.dto'

type TreeNode = RefUnitOrganisasi & { children: TreeNode[] }

const parseBigInt = (id: string): bigint => {
  try {
    return BigInt(id)
  } catch {
    throw new AppError('Data tidak ditemukan', 404)
  }
}

const sortUnitSiblings = (units: RefUnitOrganisasi[]): RefUnitOrganisasi[] =>
  [...units].sort((a, b) =>
    (a.level ?? 0) - (b.level ?? 0) ||
    a.id.localeCompare(b.id) ||
    a.nama.localeCompare(b.nama, 'id', { sensitivity: 'base' }),
  )

const buildUnitTree = (units: RefUnitOrganisasi[]): TreeNode[] => {
  const childrenByParent = new Map<string | null, RefUnitOrganisasi[]>()
  for (const unit of units) {
    const parentId = units.some((candidate) => candidate.id === unit.idAtasan) ? unit.idAtasan : null
    const children = childrenByParent.get(parentId) ?? []
    children.push(unit)
    childrenByParent.set(parentId, children)
  }

  const visit = (parentId: string | null): TreeNode[] =>
    sortUnitSiblings(childrenByParent.get(parentId) ?? [])
      .map((unit) => ({ ...unit, children: visit(unit.id) }))

  return visit(null)
}

const flattenUnitTree = (nodes: TreeNode[]): RefUnitOrganisasi[] =>
  nodes.flatMap(({ children, ...unit }) => [unit, ...flattenUnitTree(children)])

export const referensiService = {
  golongan() {
    return db.refGolongan.findMany({ orderBy: [{ tingkat: 'asc' }, { kode: 'asc' }] })
  },

  createGolongan(dto: CreateGolonganDto) {
    return db.refGolongan.create({ data: dto })
  },

  async updateGolongan(id: string, dto: UpdateGolonganDto) {
    const existing = await db.refGolongan.findUnique({ where: { id: parseBigInt(id) } })
    if (!existing) throw new AppError('Data tidak ditemukan', 404)
    return db.refGolongan.update({ where: { id: existing.id }, data: dto })
  },

  async unitOrganisasi(tree?: boolean) {
    const units = await db.refUnitOrganisasi.findMany({ orderBy: [{ level: 'asc' }, { nama: 'asc' }] })
    const unitTree = buildUnitTree(units)
    return tree ? unitTree : flattenUnitTree(unitTree)
  },

  async unitOrganisasiById(id: string) {
    const unit = await db.refUnitOrganisasi.findUnique({
      where: { id },
      include: { atasan: true, subUnit: true },
    })
    if (!unit) throw new AppError('Data tidak ditemukan', 404)
    return unit
  },

  createUnitOrganisasi(dto: CreateUnitOrganisasiDto) {
    return db.refUnitOrganisasi.create({
      data: {
        id: dto.id,
        nama: dto.nama,
        idAtasan: dto.idAtasan,
        level: dto.level ?? 1,
        isOpd: dto.isOpd ?? false,
      },
    })
  },

  async updateUnitOrganisasi(id: string, dto: UpdateUnitOrganisasiDto) {
    const existing = await db.refUnitOrganisasi.findUnique({ where: { id } })
    if (!existing) throw new AppError('Data tidak ditemukan', 404)
    return db.refUnitOrganisasi.update({ where: { id }, data: dto })
  },

  jenisJabatan() {
    return db.refJenisJabatan.findMany({ orderBy: { nama: 'asc' } })
  },

  createJenisJabatan(dto: CreateJenisJabatanDto) {
    return db.refJenisJabatan.create({ data: dto })
  },

  async updateJenisJabatan(id: string, dto: UpdateJenisJabatanDto) {
    const existing = await db.refJenisJabatan.findUnique({ where: { id: BigInt(id) } })
    if (!existing) throw new AppError('Data tidak ditemukan', 404)
    return db.refJenisJabatan.update({ where: { id: BigInt(id) }, data: dto })
  },

  jabatanStruktural(unitOrganisasiId?: string) {
    return db.refJabatanStruktural.findMany({
      where: unitOrganisasiId ? { unitOrganisasiId } : undefined,
      include: { unitOrganisasi: { select: { id: true, nama: true } } },
      orderBy: { nama: 'asc' },
    })
  },

  createJabatanStruktural(dto: CreateJabatanStrukturalDto) {
    return db.refJabatanStruktural.create({ data: dto })
  },

  async updateJabatanStruktural(id: string, dto: UpdateJabatanStrukturalDto) {
    const existing = await db.refJabatanStruktural.findUnique({ where: { id } })
    if (!existing) throw new AppError('Data tidak ditemukan', 404)
    return db.refJabatanStruktural.update({ where: { id }, data: dto })
  },

  jabatanFungsional() {
    return db.refJabatanFungsional.findMany({ orderBy: { nama: 'asc' } })
  },

  createJabatanFungsional(dto: CreateJabatanFungsionalDto) {
    return db.refJabatanFungsional.create({ data: dto })
  },

  async updateJabatanFungsional(id: string, dto: UpdateJabatanFungsionalDto) {
    const existing = await db.refJabatanFungsional.findUnique({ where: { id } })
    if (!existing) throw new AppError('Data tidak ditemukan', 404)
    return db.refJabatanFungsional.update({ where: { id }, data: dto })
  },

  jabatanPelaksana() {
    return db.refJabatanPelaksana.findMany({ orderBy: { nama: 'asc' } })
  },

  createJabatanPelaksana(dto: CreateJabatanPelaksanaDto) {
    return db.refJabatanPelaksana.create({ data: dto })
  },

  async updateJabatanPelaksana(id: string, dto: UpdateJabatanPelaksanaDto) {
    const existing = await db.refJabatanPelaksana.findUnique({ where: { id } })
    if (!existing) throw new AppError('Data tidak ditemukan', 404)
    return db.refJabatanPelaksana.update({ where: { id }, data: dto })
  },

  pendidikan() {
    return db.refPendidikan.findMany({ orderBy: { nama: 'asc' } })
  },

  bidangPendidikan() {
    return db.refBidangPendidikan.findMany({ orderBy: { nama: 'asc' } })
  },

  jenisLayanan() {
    return db.refJenisLayanan.findMany({
      include: { persyaratanLayanan: { orderBy: { urutan: 'asc' } } },
      orderBy: { nama: 'asc' },
    })
  },

  async createJenisLayanan(dto: CreateJenisLayananDto) {
    return db.refJenisLayanan.create({
      data: {
        kode: dto.kode,
        nama: dto.nama,
        deskripsi: dto.deskripsi,
        butuhTteKepalaBadan: dto.butuhTteKepalaBadan ?? false,
        isActive: dto.isActive ?? true,
        persyaratanLayanan: dto.persyaratan
          ? {
              create: dto.persyaratan.map((item, index) => ({
                urutan: item.urutan ?? index + 1,
                namaPersyaratan: item.namaPersyaratan,
                isRequired: item.isRequired ?? true,
              })),
            }
          : undefined,
      },
      include: { persyaratanLayanan: true },
    })
  },

  async updateJenisLayanan(id: string, dto: UpdateJenisLayananDto) {
    const jenisLayananId = parseBigInt(id)
    const existing = await db.refJenisLayanan.findUnique({ where: { id: jenisLayananId } })
    if (!existing) throw new AppError('Data tidak ditemukan', 404)

    return db.refJenisLayanan.update({
      where: { id: jenisLayananId },
      data: {
        kode: dto.kode,
        nama: dto.nama,
        deskripsi: dto.deskripsi,
        butuhTteKepalaBadan: dto.butuhTteKepalaBadan,
        isActive: dto.isActive,
      },
      include: { persyaratanLayanan: { orderBy: { urutan: 'asc' } } },
    })
  },

  async persyaratan(id: string) {
    const jenisLayananId = parseBigInt(id)
    return db.refPersyaratanLayanan.findMany({
      where: { jenisLayananId },
      orderBy: { urutan: 'asc' },
    })
  },

  async replacePersyaratan(id: string, dto: ReplacePersyaratanDto) {
    const jenisLayananId = parseBigInt(id)
    const existing = await db.refJenisLayanan.findUnique({ where: { id: jenisLayananId } })
    if (!existing) throw new AppError('Data tidak ditemukan', 404)

    await db.$transaction([
      db.refPersyaratanLayanan.deleteMany({ where: { jenisLayananId } }),
      ...dto.persyaratan.map((item, index) =>
        db.refPersyaratanLayanan.create({
          data: {
            jenisLayananId,
            urutan: item.urutan ?? index + 1,
            namaPersyaratan: item.namaPersyaratan,
            isRequired: item.isRequired ?? true,
          },
        }),
      ),
    ])

    return this.persyaratan(id)
  },

  async gajiPokok(query: { page?: unknown; limit?: unknown; golonganId?: unknown }) {
    const { page, limit, skip } = getPaginationParams(query)
    const where: Prisma.RefGajiPokokWhereInput = {}
    if (typeof query.golonganId === 'string' && query.golonganId) {
      where.golonganId = BigInt(query.golonganId)
    }

    const [data, total] = await Promise.all([
      db.refGajiPokok.findMany({
        where,
        skip,
        take: limit,
        include: { golongan: true },
        orderBy: [{ golonganId: 'asc' }, { masaKerja: 'asc' }],
      }),
      db.refGajiPokok.count({ where }),
    ])

    return { data, meta: buildMeta(total, page, limit) }
  },
}
