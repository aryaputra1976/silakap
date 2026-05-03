import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const db = new PrismaClient()

async function main(): Promise<void> {
  const roles = [
    'Pengelola_OPD',
    'Analis_Pertama',
    'Analis_Muda',
    'Analis_Madya',
    'Kabid',
    'Kepala_Badan',
    'Admin_Sistem',
  ]

  for (const nama of roles) {
    await db.role.upsert({ where: { nama }, create: { nama }, update: {} })
  }

  const adminRole = await db.role.findUniqueOrThrow({ where: { nama: 'Admin_Sistem' } })
  const adminPassword = await bcrypt.hash('Admin@12345', 10)
  await db.user.upsert({
    where: { username: 'admin' },
    create: {
      id: 'usr-admin-000000000001',
      username: 'admin',
      passwordHash: adminPassword,
      namaLengkap: 'Administrator Sistem',
      email: 'admin@silakap.local',
      roleId: adminRole.id,
      isActive: true,
      mustChangePassword: true,
    },
    update: {},
  })

  const agama = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Budha', 'Konghucu']
  for (const [index, nama] of agama.entries()) {
    const kode = String(index + 1)
    await db.refAgama.upsert({ where: { kode }, create: { kode, nama }, update: {} })
  }

  const jenisKelamin = [
    { kode: 'M', nama: 'Laki-laki' },
    { kode: 'F', nama: 'Perempuan' },
  ]
  for (const item of jenisKelamin) {
    await db.refJenisKelamin.upsert({ where: { kode: item.kode }, create: item, update: { nama: item.nama } })
  }

  const statusKawin = ['Kawin', 'Belum Kawin', 'Janda/Duda']
  for (const [index, nama] of statusKawin.entries()) {
    const kode = String(index + 1)
    await db.refStatusPerkawinan.upsert({ where: { kode }, create: { kode, nama }, update: { nama } })
  }

  for (const kode of ['CPNS', 'PNS', 'PPPK']) {
    await db.refStatusAsn.upsert({ where: { kode }, create: { kode, nama: kode }, update: {} })
  }

  const pendidikan = ['SD', 'SMP', 'SMA/SMK', 'D3', 'D4', 'S1', 'S2', 'S3']
  for (const nama of pendidikan) {
    const existing = await db.refPendidikan.findFirst({ where: { nama } })
    if (!existing) await db.refPendidikan.create({ data: { nama } })
  }

  const jenisJabatan = ['Struktural', 'Fungsional', 'Pelaksana']
  for (const nama of jenisJabatan) {
    await db.refJenisJabatan.upsert({ where: { nama }, create: { nama }, update: {} })
  }

  const golongan = [
    ['Ia', 'I/a', 'I', 1],
    ['Ib', 'I/b', 'I', 2],
    ['Ic', 'I/c', 'I', 3],
    ['Id', 'I/d', 'I', 4],
    ['IIa', 'II/a', 'II', 5],
    ['IIb', 'II/b', 'II', 6],
    ['IIc', 'II/c', 'II', 7],
    ['IId', 'II/d', 'II', 8],
    ['IIIa', 'III/a', 'III', 9],
    ['IIIb', 'III/b', 'III', 10],
    ['IIIc', 'III/c', 'III', 11],
    ['IIId', 'III/d', 'III', 12],
    ['IVa', 'IV/a', 'IV', 13],
    ['IVb', 'IV/b', 'IV', 14],
    ['IVc', 'IV/c', 'IV', 15],
    ['IVd', 'IV/d', 'IV', 16],
    ['IVe', 'IV/e', 'IV', 17],
  ] as const
  for (const [kode, nama, roman, tingkat] of golongan) {
    await db.refGolongan.upsert({
      where: { kode },
      create: { kode, nama, roman, tingkat },
      update: {},
    })
  }

  await db.refUnitOrganisasi.upsert({
    where: { idSiasn: '00000000-0000-0000-0000-000000000001' },
    create: {
      idSiasn: '00000000-0000-0000-0000-000000000001',
      kode: 'BKPSDM',
      nama: 'Badan Kepegawaian dan Pengembangan SDM',
      level: 1,
      isOpd: true,
    },
    update: {},
  })
  await db.refUnitOrganisasi.upsert({
    where: { idSiasn: '00000000-0000-0000-0000-000000000002' },
    create: {
      idSiasn: '00000000-0000-0000-0000-000000000002',
      kode: 'DISDIK',
      nama: 'Dinas Pendidikan',
      level: 1,
      isOpd: true,
    },
    update: {},
  })
  await db.refUnitOrganisasi.upsert({
    where: { idSiasn: '00000000-0000-0000-0000-000000000003' },
    create: {
      idSiasn: '00000000-0000-0000-0000-000000000003',
      kode: 'DINKES',
      nama: 'Dinas Kesehatan',
      level: 1,
      isOpd: true,
    },
    update: {},
  })

  const jenisLayanan = [
    { kode: 'KGB', nama: 'Kenaikan Gaji Berkala', butuhTteKepalaBadan: false },
    { kode: 'CUTI', nama: 'Cuti', butuhTteKepalaBadan: false },
    { kode: 'MUTASI', nama: 'Mutasi', butuhTteKepalaBadan: true },
    { kode: 'PENS', nama: 'Pensiun/Pemberhentian', butuhTteKepalaBadan: true },
    { kode: 'TB', nama: 'Tugas Belajar', butuhTteKepalaBadan: true },
    { kode: 'PRMJ', nama: 'Peremajaan Data', butuhTteKepalaBadan: false },
    { kode: 'PROM', nama: 'Promosi Jabatan', butuhTteKepalaBadan: true },
    { kode: 'KP', nama: 'Kenaikan Pangkat', butuhTteKepalaBadan: true },
    { kode: 'BINA', nama: 'Pembinaan Kepegawaian', butuhTteKepalaBadan: false },
    { kode: 'SOPDATA', nama: 'SOP Perbaikan Data Kepegawaian', butuhTteKepalaBadan: false },
  ]

  for (const item of jenisLayanan) {
    const layanan = await db.refJenisLayanan.upsert({
      where: { kode: item.kode },
      create: { ...item, deskripsi: null },
      update: {},
    })
    const persyaratan = [
      'Surat pengantar OPD',
      'SK pangkat/jabatan terakhir',
      'Dokumen pendukung sesuai jenis layanan',
    ]
    for (const [index, namaPersyaratan] of persyaratan.entries()) {
      const existing = await db.refPersyaratanLayanan.findFirst({
        where: { jenisLayananId: layanan.id, namaPersyaratan },
      })
      if (!existing) {
        await db.refPersyaratanLayanan.create({
          data: {
            jenisLayananId: layanan.id,
            namaPersyaratan,
            urutan: index + 1,
            isRequired: true,
          },
        })
      }
    }
  }

  const slaDefault = [
    ['AP', 1, 0],
    ['AM', 2, 0],
    ['AD', 2, 0],
    ['Kabid', 1, 0],
    ['KepalaBadan', 1, 0],
  ] as const
  const layanan = await db.refJenisLayanan.findMany()
  for (const item of layanan) {
    for (const [jabatan, slaHari, slaJam] of slaDefault) {
      await db.configSla.upsert({
        where: { uk_layanan_jabatan: { jenisLayananId: item.id, jabatan } },
        create: { jenisLayananId: item.id, jabatan, slaHari, slaJam },
        update: {},
      })
    }
  }

  console.log('Seed selesai')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
