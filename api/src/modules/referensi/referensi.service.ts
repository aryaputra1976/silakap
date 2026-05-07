import type { Prisma, RefUnitOrganisasi } from '@prisma/client'
import { db } from '@/core/database/prisma.client'
import { AppError } from '@/core/errors/app-error'
import { buildMeta, getPaginationParams } from '@/core/http/pagination.helper'
import type {
  CreateGolonganDto,
  CreateJenisJabatanDto,
  CreateJenisLayananDto,
  CreateRefJenisKelaminDto,
  CreateRefJabatanDto,
  CreateRefMasterDto,
  CreateRefPendidikanDto,
  CreateRefStatusAsnDto,
  CreateTemplateDokumenDto,
  CreateUnitOrganisasiDto,
  ReplacePersyaratanDto,
  UpdateGolonganDto,
  UpdateJenisJabatanDto,
  UpdateJenisLayananDto,
  UpdateRefJenisKelaminDto,
  UpdateRefJabatanDto,
  UpdateRefMasterDto,
  UpdateRefPendidikanDto,
  UpdateRefStatusAsnDto,
  UpdateTemplateDokumenDto,
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
    a.id.toString().localeCompare(b.id.toString()) ||
    a.nama.localeCompare(b.nama, 'id', { sensitivity: 'base' }),
  )

const buildUnitTree = (units: RefUnitOrganisasi[]): TreeNode[] => {
  const childrenByParent = new Map<string | null, RefUnitOrganisasi[]>()
  for (const unit of units) {
    const parentId = units.some((candidate) => candidate.id === unit.idAtasan) ? unit.idAtasan?.toString() ?? null : null
    const children = childrenByParent.get(parentId) ?? []
    children.push(unit)
    childrenByParent.set(parentId, children)
  }

  const visit = (parentId: string | null): TreeNode[] =>
    sortUnitSiblings(childrenByParent.get(parentId) ?? [])
      .map((unit) => ({ ...unit, children: visit(unit.id.toString()) }))

  return visit(null)
}

const flattenUnitTree = (nodes: TreeNode[]): RefUnitOrganisasi[] =>
  nodes.flatMap(({ children, ...unit }) => [unit, ...flattenUnitTree(children)])

type PrismaDelegate = {
  create(args: Record<string, unknown>): Promise<unknown>
  findUnique(args: Record<string, unknown>): Promise<unknown>
  update(args: Record<string, unknown>): Promise<unknown>
}

const normalizeEmpty = <T extends Record<string, unknown>>(data: T): T =>
  Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, value === '' ? null : value]),
  ) as T

const createRecord = (delegate: PrismaDelegate, dto: Record<string, unknown>) =>
  delegate.create({ data: normalizeEmpty(dto) })

const updateRecord = async (delegate: PrismaDelegate, id: string, dto: Record<string, unknown>, bigIntId = true) => {
  const recordId = bigIntId ? parseBigInt(id) : id
  const existing = await delegate.findUnique({ where: { id: recordId } })
  if (!existing) throw new AppError('Data tidak ditemukan', 404)
  return delegate.update({ where: { id: recordId }, data: normalizeEmpty(dto) })
}

const deactivateRecord = async (delegate: PrismaDelegate, id: string, bigIntId = true) =>
  updateRecord(delegate, id, { isActive: false }, bigIntId)

const ensureJenisJabatan = (nama: string, kode: string) =>
  db.refJenisJabatan.upsert({
    where: { nama },
    create: { nama, kode },
    update: { kode },
  })

type LegacyJabatanDto = CreateRefJabatanDto & { id?: string | null }

const jabatanData = (dto: CreateRefJabatanDto | UpdateRefJabatanDto, jenisJabatanId?: bigint) =>
  normalizeEmpty({
    idSiasn: dto.idSiasn,
    kode: dto.kode,
    nama: dto.nama,
    jenisJabatanId: dto.jenisJabatanId ?? jenisJabatanId,
    unitOrganisasiId: dto.unitOrganisasiId,
    eselonId: dto.eselonId,
    jenjang: dto.jenjang,
    bup: dto.bup,
    isActive: dto.isActive,
  })

export const referensiService = {
  agama() {
    return db.refAgama.findMany({ orderBy: { nama: 'asc' } })
  },

  createAgama(dto: CreateRefMasterDto) {
    return createRecord(db.refAgama, dto)
  },

  updateAgama(id: string, dto: UpdateRefMasterDto) {
    return updateRecord(db.refAgama, id, dto)
  },

  deleteAgama(id: string) {
    return deactivateRecord(db.refAgama, id)
  },

  jenisKelamin() {
    return db.refJenisKelamin.findMany({ orderBy: { nama: 'asc' } })
  },

  createJenisKelamin(dto: CreateRefJenisKelaminDto) {
    return createRecord(db.refJenisKelamin, dto)
  },

  updateJenisKelamin(id: string, dto: UpdateRefJenisKelaminDto) {
    return updateRecord(db.refJenisKelamin, id, dto)
  },

  deleteJenisKelamin(id: string) {
    return deactivateRecord(db.refJenisKelamin, id)
  },

  statusPerkawinan() {
    return db.refStatusPerkawinan.findMany({ orderBy: { nama: 'asc' } })
  },

  createStatusPerkawinan(dto: CreateRefMasterDto) {
    return createRecord(db.refStatusPerkawinan, dto)
  },

  updateStatusPerkawinan(id: string, dto: UpdateRefMasterDto) {
    return updateRecord(db.refStatusPerkawinan, id, dto)
  },

  deleteStatusPerkawinan(id: string) {
    return deactivateRecord(db.refStatusPerkawinan, id)
  },

  jenisPegawai() {
    return db.refJenisPegawai.findMany({ orderBy: { nama: 'asc' } })
  },

  createJenisPegawai(dto: CreateRefMasterDto) {
    return createRecord(db.refJenisPegawai, dto)
  },

  updateJenisPegawai(id: string, dto: UpdateRefMasterDto) {
    return updateRecord(db.refJenisPegawai, id, dto)
  },

  deleteJenisPegawai(id: string) {
    return deactivateRecord(db.refJenisPegawai, id)
  },

  kedudukanHukum() {
    return db.refKedudukanHukum.findMany({ orderBy: { nama: 'asc' } })
  },

  createKedudukanHukum(dto: CreateRefMasterDto) {
    return createRecord(db.refKedudukanHukum, dto)
  },

  updateKedudukanHukum(id: string, dto: UpdateRefMasterDto) {
    return updateRecord(db.refKedudukanHukum, id, dto)
  },

  deleteKedudukanHukum(id: string) {
    return deactivateRecord(db.refKedudukanHukum, id)
  },

  statusAsn() {
    return db.refStatusAsn.findMany({ orderBy: { nama: 'asc' } })
  },

  createStatusAsn(dto: CreateRefStatusAsnDto) {
    return createRecord(db.refStatusAsn, dto)
  },

  updateStatusAsn(id: string, dto: UpdateRefStatusAsnDto) {
    return updateRecord(db.refStatusAsn, id, dto)
  },

  deleteStatusAsn(id: string) {
    return deactivateRecord(db.refStatusAsn, id)
  },

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

  deleteGolongan(id: string) {
    return deactivateRecord(db.refGolongan, id)
  },

  async unitOrganisasi(tree?: boolean) {
    const units = await db.refUnitOrganisasi.findMany({ orderBy: [{ level: 'asc' }, { nama: 'asc' }] })
    const unitTree = buildUnitTree(units)
    return tree ? unitTree : flattenUnitTree(unitTree)
  },

  async unitOrganisasiById(id: string) {
    const unit = await db.refUnitOrganisasi.findUnique({
      where: { id: parseBigInt(id) },
      include: { atasan: true, subUnit: true },
    })
    if (!unit) throw new AppError('Data tidak ditemukan', 404)
    return unit
  },

  createUnitOrganisasi(dto: CreateUnitOrganisasiDto) {
    return db.refUnitOrganisasi.create({
      data: {
        idSiasn: dto.id,
        kode: dto.kode,
        nama: dto.nama,
        idAtasan: dto.idAtasan,
        level: dto.level ?? 1,
        isOpd: dto.isOpd ?? false,
        isActive: dto.isActive ?? true,
      },
    })
  },

  async updateUnitOrganisasi(id: string, dto: UpdateUnitOrganisasiDto) {
    const unitId = parseBigInt(id)
    const existing = await db.refUnitOrganisasi.findUnique({ where: { id: unitId } })
    if (!existing) throw new AppError('Data tidak ditemukan', 404)
    return db.refUnitOrganisasi.update({ where: { id: unitId }, data: dto })
  },

  deleteUnitOrganisasi(id: string) {
    return deactivateRecord(db.refUnitOrganisasi, id)
  },

  jenisJabatan() {
    return db.refJenisJabatan.findMany({ orderBy: { nama: 'asc' } })
  },

  jabatan() {
    return db.refJabatan.findMany({
      include: {
        jenisJabatan: { select: { id: true, nama: true } },
        unitOrganisasi: { select: { id: true, nama: true } },
      },
      orderBy: { nama: 'asc' },
    })
  },

  createJenisJabatan(dto: CreateJenisJabatanDto) {
    return db.refJenisJabatan.create({ data: dto })
  },

  async updateJenisJabatan(id: string, dto: UpdateJenisJabatanDto) {
    const existing = await db.refJenisJabatan.findUnique({ where: { id: BigInt(id) } })
    if (!existing) throw new AppError('Data tidak ditemukan', 404)
    return db.refJenisJabatan.update({ where: { id: BigInt(id) }, data: dto })
  },

  deleteJenisJabatan(id: string) {
    return deactivateRecord(db.refJenisJabatan, id)
  },

  createJabatan(dto: CreateRefJabatanDto) {
    return db.refJabatan.create({
      data: jabatanData(dto) as Prisma.RefJabatanUncheckedCreateInput,
    })
  },

  updateJabatan(id: string, dto: UpdateRefJabatanDto) {
    return updateRecord(db.refJabatan, id, jabatanData(dto))
  },

  deleteJabatan(id: string) {
    return deactivateRecord(db.refJabatan, id)
  },

  async jabatanStruktural(unitOrganisasiId?: string) {
    const jenis = await ensureJenisJabatan('Struktural', 'STRUKTURAL')
    return db.refJabatan.findMany({
      where: {
        jenisJabatanId: jenis.id,
        ...(unitOrganisasiId ? { unitOrganisasiId: parseBigInt(unitOrganisasiId) } : {}),
      },
      include: { unitOrganisasi: { select: { id: true, nama: true } }, jenisJabatan: { select: { id: true, nama: true } } },
      orderBy: { nama: 'asc' },
    })
  },

  async createJabatanStruktural(dto: LegacyJabatanDto) {
    const jenis = await ensureJenisJabatan('Struktural', 'STRUKTURAL')
    return db.refJabatan.create({
      data: jabatanData({ ...dto, idSiasn: dto.idSiasn ?? dto.id }, jenis.id) as Prisma.RefJabatanUncheckedCreateInput,
    })
  },

  async updateJabatanStruktural(id: string, dto: UpdateRefJabatanDto) {
    const existing = await db.refJabatan.findUnique({ where: { id: parseBigInt(id) } })
    if (!existing) throw new AppError('Data tidak ditemukan', 404)
    return db.refJabatan.update({ where: { id: parseBigInt(id) }, data: jabatanData(dto) })
  },

  deleteJabatanStruktural(id: string) {
    return deactivateRecord(db.refJabatan, id)
  },

  async jabatanFungsional() {
    const jenis = await ensureJenisJabatan('Fungsional', 'FUNGSIONAL')
    return db.refJabatan.findMany({
      where: { jenisJabatanId: jenis.id },
      include: { jenisJabatan: { select: { id: true, nama: true } } },
      orderBy: { nama: 'asc' },
    })
  },

  async createJabatanFungsional(dto: LegacyJabatanDto) {
    const jenis = await ensureJenisJabatan('Fungsional', 'FUNGSIONAL')
    return db.refJabatan.create({
      data: jabatanData({ ...dto, idSiasn: dto.idSiasn ?? dto.id }, jenis.id) as Prisma.RefJabatanUncheckedCreateInput,
    })
  },

  async updateJabatanFungsional(id: string, dto: UpdateRefJabatanDto) {
    const existing = await db.refJabatan.findUnique({ where: { id: parseBigInt(id) } })
    if (!existing) throw new AppError('Data tidak ditemukan', 404)
    return db.refJabatan.update({ where: { id: parseBigInt(id) }, data: jabatanData(dto) })
  },

  deleteJabatanFungsional(id: string) {
    return deactivateRecord(db.refJabatan, id)
  },

  async jabatanPelaksana() {
    const jenis = await ensureJenisJabatan('Pelaksana', 'PELAKSANA')
    return db.refJabatan.findMany({
      where: { jenisJabatanId: jenis.id },
      include: { jenisJabatan: { select: { id: true, nama: true } } },
      orderBy: { nama: 'asc' },
    })
  },

  async createJabatanPelaksana(dto: LegacyJabatanDto) {
    const jenis = await ensureJenisJabatan('Pelaksana', 'PELAKSANA')
    return db.refJabatan.create({
      data: jabatanData({ ...dto, idSiasn: dto.idSiasn ?? dto.id }, jenis.id) as Prisma.RefJabatanUncheckedCreateInput,
    })
  },

  async updateJabatanPelaksana(id: string, dto: UpdateRefJabatanDto) {
    const existing = await db.refJabatan.findUnique({ where: { id: parseBigInt(id) } })
    if (!existing) throw new AppError('Data tidak ditemukan', 404)
    return db.refJabatan.update({ where: { id: parseBigInt(id) }, data: jabatanData(dto) })
  },

  deleteJabatanPelaksana(id: string) {
    return deactivateRecord(db.refJabatan, id)
  },

  pendidikan() {
    return db.refPendidikan.findMany({ include: { tingkat: { select: { id: true, nama: true } } }, orderBy: { nama: 'asc' } })
  },

  createPendidikan(dto: CreateRefPendidikanDto) {
    return createRecord(db.refPendidikan, dto)
  },

  updatePendidikan(id: string, dto: UpdateRefPendidikanDto) {
    return updateRecord(db.refPendidikan, id, dto)
  },

  deletePendidikan(id: string) {
    return deactivateRecord(db.refPendidikan, id)
  },

  pendidikanTingkat() {
    return db.refPendidikanTingkat.findMany({ orderBy: { nama: 'asc' } })
  },

  createPendidikanTingkat(dto: CreateRefMasterDto) {
    return createRecord(db.refPendidikanTingkat, dto)
  },

  updatePendidikanTingkat(id: string, dto: UpdateRefMasterDto) {
    return updateRecord(db.refPendidikanTingkat, id, dto)
  },

  deletePendidikanTingkat(id: string) {
    return deactivateRecord(db.refPendidikanTingkat, id)
  },

  wilayah() {
    return db.refWilayah.findMany({ orderBy: { nama: 'asc' } })
  },

  createWilayah(dto: CreateRefMasterDto) {
    return createRecord(db.refWilayah, dto)
  },

  updateWilayah(id: string, dto: UpdateRefMasterDto) {
    return updateRecord(db.refWilayah, id, dto)
  },

  deleteWilayah(id: string) {
    return deactivateRecord(db.refWilayah, id)
  },

  kpkn() {
    return db.refKpkn.findMany({ orderBy: { nama: 'asc' } })
  },

  createKpkn(dto: CreateRefMasterDto) {
    return createRecord(db.refKpkn, dto)
  },

  updateKpkn(id: string, dto: UpdateRefMasterDto) {
    return updateRecord(db.refKpkn, id, dto)
  },

  deleteKpkn(id: string) {
    return deactivateRecord(db.refKpkn, id)
  },

  lokasiKerja() {
    return db.refLokasiKerja.findMany({ orderBy: { nama: 'asc' } })
  },

  createLokasiKerja(dto: CreateRefMasterDto) {
    return createRecord(db.refLokasiKerja, dto)
  },

  updateLokasiKerja(id: string, dto: UpdateRefMasterDto) {
    return updateRecord(db.refLokasiKerja, id, dto)
  },

  deleteLokasiKerja(id: string) {
    return deactivateRecord(db.refLokasiKerja, id)
  },

  bidangPendidikan() {
    return db.refBidangPendidikan.findMany({ orderBy: { nama: 'asc' } })
  },

  async jenisLayanan() {
    const rows = await db.refJenisLayanan.findMany({
      include: {
        persyaratanLayanan: { orderBy: { urutan: 'asc' } },
        configSla: true,
      },
      orderBy: { nama: 'asc' },
    })
    return rows.map((r) => ({
      ...r,
      totalSlaHari: r.configSla.reduce((acc, c) => acc + c.slaHari, 0),
    }))
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

  deleteJenisLayanan(id: string) {
    return deactivateRecord(db.refJenisLayanan, id)
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

  templateDokumen() {
    return db.templateDokumen.findMany({
      where: { deletedAt: null },
      include: { jenisLayanan: { select: { id: true, kode: true, nama: true } } },
      orderBy: { nama: 'asc' },
    })
  },

  createTemplateDokumen(dto: CreateTemplateDokumenDto) {
    return db.templateDokumen.create({
      data: {
        jenisLayananId: dto.jenisLayananId,
        kode: dto.kode,
        nama: dto.nama,
        deskripsi: dto.deskripsi,
        konten: dto.konten,
        variabel: dto.variabel,
        isActive: dto.isActive ?? true,
      },
      include: { jenisLayanan: { select: { id: true, kode: true, nama: true } } },
    })
  },

  async updateTemplateDokumen(id: string, dto: UpdateTemplateDokumenDto) {
    const templateId = parseBigInt(id)
    const existing = await db.templateDokumen.findFirst({ where: { id: templateId, deletedAt: null } })
    if (!existing) throw new AppError('Data tidak ditemukan', 404)
    return db.templateDokumen.update({
      where: { id: templateId },
      data: {
        jenisLayananId: dto.jenisLayananId,
        kode: dto.kode,
        nama: dto.nama,
        deskripsi: dto.deskripsi,
        konten: dto.konten,
        variabel: dto.variabel,
        isActive: dto.isActive,
      },
      include: { jenisLayanan: { select: { id: true, kode: true, nama: true } } },
    })
  },

  async deleteTemplateDokumen(id: string) {
    const templateId = parseBigInt(id)
    const existing = await db.templateDokumen.findFirst({ where: { id: templateId, deletedAt: null } })
    if (!existing) throw new AppError('Data tidak ditemukan', 404)
    return db.templateDokumen.update({
      where: { id: templateId },
      data: { deletedAt: new Date(), isActive: false },
    })
  },
}
