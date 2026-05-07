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

  // ── Unit organisasi (seed first — users depend on these) ────────────────
  await db.refUnitOrganisasi.upsert({
    where: { idSiasn: '00000000-0000-0000-0000-000000000001' },
    create: { idSiasn: '00000000-0000-0000-0000-000000000001', kode: 'BKPSDM', nama: 'Badan Kepegawaian dan Pengembangan SDM', level: 1, isOpd: true },
    update: {},
  })
  await db.refUnitOrganisasi.upsert({
    where: { idSiasn: '00000000-0000-0000-0000-000000000002' },
    create: { idSiasn: '00000000-0000-0000-0000-000000000002', kode: 'DISDIK', nama: 'Dinas Pendidikan', level: 1, isOpd: true },
    update: {},
  })
  await db.refUnitOrganisasi.upsert({
    where: { idSiasn: '00000000-0000-0000-0000-000000000003' },
    create: { idSiasn: '00000000-0000-0000-0000-000000000003', kode: 'DINKES', nama: 'Dinas Kesehatan', level: 1, isOpd: true },
    update: {},
  })

  const unitBKPSDM  = await db.refUnitOrganisasi.findFirstOrThrow({ where: { kode: 'BKPSDM' } })
  const unitDISDIK  = await db.refUnitOrganisasi.findFirstOrThrow({ where: { kode: 'DISDIK' } })
  const unitDINKES  = await db.refUnitOrganisasi.findFirstOrThrow({ where: { kode: 'DINKES' } })

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

  // ── Demo users per role ──────────────────────────────────────────────────
  const demoPassword = await bcrypt.hash('Silakap@2026', 10)

  const roleKB    = await db.role.findUniqueOrThrow({ where: { nama: 'Kepala_Badan' } })
  const roleKabid = await db.role.findUniqueOrThrow({ where: { nama: 'Kabid' } })
  const roleAD    = await db.role.findUniqueOrThrow({ where: { nama: 'Analis_Madya' } })
  const roleAM    = await db.role.findUniqueOrThrow({ where: { nama: 'Analis_Muda' } })
  const roleAP    = await db.role.findUniqueOrThrow({ where: { nama: 'Analis_Pertama' } })
  const roleOPD   = await db.role.findUniqueOrThrow({ where: { nama: 'Pengelola_OPD' } })

  const demoUsers = [
    {
      id: 'usr-kb-000000000001',
      username: 'kepala.badan',
      namaLengkap: 'Dr. H. Ahmad Fauzi, S.Sos., M.Si.',
      email: 'kepala.badan@silakap.local',
      roleId: roleKB.id,
      unitOrganisasiId: unitBKPSDM.id,
    },
    {
      id: 'usr-kabid-00000001',
      username: 'kabid',
      namaLengkap: 'Hj. Siti Rahayu, S.AP., M.M.',
      email: 'kabid@silakap.local',
      roleId: roleKabid.id,
      unitOrganisasiId: unitBKPSDM.id,
    },
    {
      id: 'usr-ad-000000000001',
      username: 'analis.madya',
      namaLengkap: 'Budi Santoso, S.AP.',
      email: 'analis.madya@silakap.local',
      roleId: roleAD.id,
      unitOrganisasiId: unitBKPSDM.id,
    },
    {
      id: 'usr-am-000000000001',
      username: 'analis.muda',
      namaLengkap: 'Dewi Kusuma, A.Md.',
      email: 'analis.muda@silakap.local',
      roleId: roleAM.id,
      unitOrganisasiId: unitBKPSDM.id,
    },
    {
      id: 'usr-ap-000000000001',
      username: 'analis.pertama',
      namaLengkap: 'Rizky Pratama, S.Kom.',
      email: 'analis.pertama@silakap.local',
      roleId: roleAP.id,
      unitOrganisasiId: unitBKPSDM.id,
    },
    {
      id: 'usr-opd-disdik-001',
      username: 'opd.disdik',
      namaLengkap: 'Rina Wulandari, S.Pd.',
      email: 'opd.disdik@silakap.local',
      roleId: roleOPD.id,
      unitOrganisasiId: unitDISDIK.id,
    },
    {
      id: 'usr-opd-dinkes-001',
      username: 'opd.dinkes',
      namaLengkap: 'dr. Hendra Setiawan',
      email: 'opd.dinkes@silakap.local',
      roleId: roleOPD.id,
      unitOrganisasiId: unitDINKES.id,
    },
  ]

  for (const u of demoUsers) {
    await db.user.upsert({
      where: { username: u.username },
      create: { ...u, passwordHash: demoPassword, isActive: true, mustChangePassword: false },
      update: {},
    })
  }

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

  const jenisStruktural = await db.refJenisJabatan.findUniqueOrThrow({ where: { nama: 'Struktural' } })
  const jenisFungsional = await db.refJenisJabatan.findUniqueOrThrow({ where: { nama: 'Fungsional' } })
  const jenisPelaksana = await db.refJenisJabatan.findUniqueOrThrow({ where: { nama: 'Pelaksana' } })

  const jabatanDemo = [
    { kode: 'KABID-PM-BKPSDM', nama: 'Kepala Bidang Pengembangan Mutasi', jenisJabatanId: jenisStruktural.id, unitOrganisasiId: unitBKPSDM.id, eselonId: 3, jenjang: 'Administrator', bup: 60 },
    { kode: 'ANALIS-SDM-BKPSDM', nama: 'Analis Sumber Daya Manusia Aparatur Ahli Muda', jenisJabatanId: jenisFungsional.id, unitOrganisasiId: unitBKPSDM.id, eselonId: null, jenjang: 'Ahli Muda', bup: 60 },
    { kode: 'ANALIS-KEPEG-DISDIK', nama: 'Analis Kepegawaian Ahli Pertama', jenisJabatanId: jenisFungsional.id, unitOrganisasiId: unitDISDIK.id, eselonId: null, jenjang: 'Ahli Pertama', bup: 60 },
    { kode: 'GURU-DISDIK', nama: 'Guru Ahli Pertama', jenisJabatanId: jenisFungsional.id, unitOrganisasiId: unitDISDIK.id, eselonId: null, jenjang: 'Ahli Pertama', bup: 60 },
    { kode: 'DOKTER-DINKES', nama: 'Dokter Ahli Pertama', jenisJabatanId: jenisFungsional.id, unitOrganisasiId: unitDINKES.id, eselonId: null, jenjang: 'Ahli Pertama', bup: 60 },
    { kode: 'PERAWAT-DINKES', nama: 'Perawat Terampil', jenisJabatanId: jenisFungsional.id, unitOrganisasiId: unitDINKES.id, eselonId: null, jenjang: 'Terampil', bup: 58 },
    { kode: 'PENGELOLA-LAYANAN-BKPSDM', nama: 'Pengelola Layanan Kepegawaian', jenisJabatanId: jenisPelaksana.id, unitOrganisasiId: unitBKPSDM.id, eselonId: null, jenjang: null, bup: 58 },
  ]

  for (const item of jabatanDemo) {
    await db.refJabatan.upsert({
      where: { kode: item.kode },
      create: item,
      update: {
        nama: item.nama,
        jenisJabatanId: item.jenisJabatanId,
        unitOrganisasiId: item.unitOrganisasiId,
        eselonId: item.eselonId,
        jenjang: item.jenjang,
        bup: item.bup,
        isActive: true,
      },
    })
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

  // ── ASN Demo ────────────────────────────────────────────────────────────
  const golonganByKode = new Map((await db.refGolongan.findMany()).map((item) => [item.kode, item.id]))
  const jabatanByKode = new Map((await db.refJabatan.findMany()).map((item) => [item.kode, item]))

  const asnDemo = [
    { nipBaru: '197803042006042018', nama: 'A Darmawaty Bambang', unitId: unitDISDIK.id, golonganKode: 'IIIb', jabatanKode: 'GURU-DISDIK' },
    { nipBaru: '197309131996061001', nama: 'A Rafiuddin J', unitId: unitDISDIK.id, golonganKode: 'IIIc', jabatanKode: 'ANALIS-KEPEG-DISDIK' },
    { nipBaru: '198501122010011015', nama: 'Budi Santoso Wibowo', unitId: unitBKPSDM.id, golonganKode: 'IIId', jabatanKode: 'KABID-PM-BKPSDM' },
    { nipBaru: '199002032015042001', nama: 'Dewi Kusuma Wardani', unitId: unitBKPSDM.id, golonganKode: 'IIIb', jabatanKode: 'ANALIS-SDM-BKPSDM' },
    { nipBaru: '197612201999031004', nama: 'Hendra Setiawan Putra', unitId: unitDINKES.id, golonganKode: 'IIIc', jabatanKode: 'DOKTER-DINKES' },
    { nipBaru: '198807152012122002', nama: 'Indah Permatasari', unitId: unitDINKES.id, golonganKode: 'IIc', jabatanKode: 'PERAWAT-DINKES' },
    { nipBaru: '197405062000031007', nama: 'Joko Widodo Susanto', unitId: unitDISDIK.id, golonganKode: 'IIId', jabatanKode: 'GURU-DISDIK' },
    { nipBaru: '199510102020121001', nama: 'Kartika Dewi Rahayu', unitId: unitBKPSDM.id, golonganKode: 'IIIa', jabatanKode: 'PENGELOLA-LAYANAN-BKPSDM' },
    { nipBaru: '198203142006041009', nama: 'Lukman Hakim Nasution', unitId: unitDINKES.id, golonganKode: 'IIIb', jabatanKode: 'DOKTER-DINKES' },
    { nipBaru: '197901082003121003', nama: 'Muhamad Rizky Pratama', unitId: unitDISDIK.id, golonganKode: 'IIIc', jabatanKode: 'ANALIS-KEPEG-DISDIK' },
  ]
  for (const a of asnDemo) {
    const jabatan = jabatanByKode.get(a.jabatanKode)
    const data = {
      nama: a.nama,
      unitOrganisasiId: a.unitId,
      statusPegawai: 'Aktif' as const,
      golonganId: golonganByKode.get(a.golonganKode),
      jenisJabatanId: jabatan?.jenisJabatanId ?? undefined,
      jabatanId: jabatan?.id,
      tmtGolongan: new Date('2024-04-01'),
      tmtJabatan: new Date('2024-06-01'),
    }

    await db.asn.upsert({
      where: { nipBaru: a.nipBaru },
      create: { nipBaru: a.nipBaru, ...data },
      update: data,
    })
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

/*
  Seed berhasil. Berikut daftar user yang tersedia:

Username	Password	Role	Unit
admin	Admin@12345	Admin Sistem	—
kepala.badan	Silakap@2026	Kepala Badan	BKPSDM
kabid	Silakap@2026	Kabid	BKPSDM
analis.madya	Silakap@2026	Analis Madya	BKPSDM
analis.muda	Silakap@2026	Analis Muda	BKPSDM
analis.pertama	Silakap@2026	Analis Pertama	BKPSDM
opd.disdik	Silakap@2026	Pengelola OPD	Dinas Pendidikan
opd.dinkes	Silakap@2026	Pengelola OPD	Dinas Kesehatan
*/
