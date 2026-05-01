// AUDIT SCHEMA.PRISMA TERHADAP ALUR KERJA SILAKAP

## 1. ANALISIS ALUR KERJA APLIKASI

### ALUR UTAMA (dari dokumentasi sebelumnya):

```
1. OPD Ajukan Layanan
   ↓
2. Analis Pertama (AP) - Cek Kelengkapan (SLA 1 hari)
   ├─ Teruskan → AM
   └─ Kembalikan → OPD (dengan catatan)
   ↓
3. Analis Muda (AM) - Verifikasi Substansi (SLA 2 hari)
   ├─ Teruskan → AD
   └─ Kembalikan → AP atau OPD (dengan catatan)
   ↓
4. Analis Madya (AD) - Quality Control & Rekomendasi (SLA 2 hari)
   ├─ Teruskan → Kabid
   └─ Kembalikan → AM (dengan catatan)
   ↓
5. Kabid - Approval & Tandatangan Pertama (SLA 1 hari)
   ├─ Approve → Dokumen output jika Kepala Badan tidak perlu TTE
   ├─ Approve → Kepala Badan jika perlu TTE
   └─ Kembalikan → AD (jarang)
   ↓
6. Kepala Badan (Jika perlu) - TTE SAJA (jarang delay)
   ├─ TTE → Dokumen Final, kirim ke OPD
   └─ Tolak → Kembali ke Kabid (sangat jarang)
   ↓
7. Dokumen Final → OPD download & gunakan
```

### AKTOR DAN PERAN:

| Aktor | Role | Aksi | SLA | Hak Akses |
|---|---|---|---|---|
| **OPD** | Pengelola_OPD | Ajukan, upload dokumen, lihat status, download hasil | - | Own OPD data only |
| **Analis Pertama** | Analis_Pertama | Cek kelengkapan, kembalikan/teruskan | 1 hari | All antrian |
| **Analis Muda** | Analis_Muda | Verifikasi data SIASN, hitung kelayakan, teruskan/kembalikan | 2 hari | All antrian |
| **Analis Madya** | Analis_Madya | Review QC, susun rekomendasi, teruskan/kembalikan | 2 hari | All antrian |
| **Kabid** | Kabid | Approve, tandatangan, monitor SLA staf, lihat laporan harian | 1 hari | Own bidang |
| **Kepala Badan** | Kepala_Badan | TTE dokumen final tertentu (SK, Usulan Formasi), lihat laporan bulanan | - | All dokumen |
| **Admin** | Admin_Sistem | Manage users, settings, integrasi data, audit log | - | Full system |

### MENU & FITUR YANG DIBUTUHKAN:

**Dashboard (per role):**
- OPD: Status pengajuan aktif, berkas dikembalikan
- AP/AM/AD: Antrian hari ini, SLA timer, beban kerja
- Kabid: Beban kerja staf, menunggu approval, SLA terlampaui
- Kepala Badan: Statistik bulanan, dokumen menunggu TTE

**Master Data & Referensi:**
- Unit Organisasi (hierarki, OPD?)
- Jabatan (struktural, fungsional, pelaksana)
- Golongan (I/a - IV/e)
- Pendidikan
- Jenis Layanan (KGB, Mutasi, Cuti, TB, Pensiun, dll)
- Persyaratan Layanan per jenis

**ASN Management:**
- Profil ASN (create, read, update)
- Riwayat perubahan ASN (log)
- Validasi data (flag invalid)
- Peremajaan data (update tanpa workflow)

**Workflow:**
- Buat usulan layanan (OPD)
- Upload dokumen (OPD, di tahap apapun)
- Verifikasi per tahap (AP → AM → AD)
- Approval & TTE (Kabid → Kepala Badan)
- Catatan per tahap
- Kembalikan dengan alasan (per tahap)
- Log setiap action (siapa, kapan, apa)

**Laporan:**
- Laporan harian otomatis (Kabid)
- Laporan bulanan agregat (Kepala Badan)
- Error log integrasi data

**Notifikasi:**
- Berkas masuk antrian
- SLA warning
- Berkas dikembalikan
- Laporan harian

---

## 2. AUDIT SCHEMA.PRISMA DETAIL

### ✅ TABEL YANG SUDAH LENGKAP

#### A. REFERENSI MASTER DATA (11 model)
- ✅ RefGolongan - storing golongan/pangkat
- ✅ RefGajiPokok - storing gaji per golongan & masa kerja
- ✅ RefUnitOrganisasi - unit dengan self-reference (atasan)
- ✅ RefJenisJabatan - 3 jenis: Struktural, Fungsional, Pelaksana
- ✅ RefJabatanStruktural - jabatan per unit organisasi
- ✅ RefJabatanFungsional - jabatan fungsional dengan jenjang
- ✅ RefJabatanPelaksana - jabatan pelaksana
- ✅ RefPendidikan - tingkat pendidikan
- ✅ RefBidangPendidikan - bidang studi
- ✅ RefAgama - 6 agama
- ✅ RefStatusKawin - status perkawinan

#### B. ASN MASTER DATA (2 model)
- ✅ Asn - master ASN lengkap dengan semua field
- ✅ AsnRiwayat - log perubahan ASN

#### C. WORKFLOW LAYANAN (4 model)
- ✅ UsulanLayanan - master pengajuan layanan
- ✅ UsulanDokumen - dokumen yg diupload OPD
- ✅ UsulanWorkflowLog - log setiap action
- ✅ UsulanDokumenOutput - dokumen output (SK, surat, dll)

#### D. USER & ROLE (3 model)
- ✅ Role - master role
- ✅ User - user account
- ✅ RolePermission - permission per role

#### E. NOTIFIKASI & LAPORAN (3 model)
- ✅ Notifikasi - per user
- ✅ LaporanHarian - daily summary
- ✅ LaporanBulanan - monthly aggregate

#### F. KONFIGURASI (4 model)
- ✅ ConfigSla - SLA per layanan per jabatan
- ✅ ConfigNotifikasi - notifikasi trigger & template
- ✅ ConfigLaporanOtomatis - schedule laporan otomatis
- ✅ AuditLog - audit trail

#### G. INTEGRASI (2 model)
- ✅ SihasnImportLog - log import
- ✅ SihasnImportError - error per baris

---

### ⚠️ GAP & MISSING FEATURES

#### 1. **WORKFLOW SLA & ESKALASI**

**Gap**: Tidak ada mekanisme untuk tracking SLA otomatis dan eskalasi

**Dibutuhkan?**: YES - Critical untuk monitor deadline

**Solusi**:
```prisma
model SlaTracker {
  id          BigInt   @id @default(autoincrement())
  usulanId    String   @db.VarChar(36)
  tahapSaat   String   @db.VarChar(50)  // analis_pertama, analis_muda, dll
  masukTahap  DateTime
  slaHari     Int
  slaHabisAt  DateTime
  eskalasi    Boolean  @default(false)  // true jika sudah eskalasi
  eskalasiBuat DateTime? // kapan eskalasi dibuat
  
  usulanLayanan UsulanLayanan @relation(fields: [usulanId], references: [id])
}
```

**Impact**: Untuk calculate SLA real-time di dashboard, untuk notifikasi otomatis eskalasi

---

#### 2. **REJECT & REVISI TRACKING**

**Gap**: Tidak ada tracking khusus untuk reject, revisi, dan counter reject

**Dibutuhkan?**: YES - Perlu tau berapa kali dikembalikan, dari siapa, dengan alasan apa

**Solusi**:
```prisma
model UsulanRevisi {
  id                  BigInt   @id @default(autoincrement())
  usulanId            String   @db.VarChar(36)
  nomorRevisi         Int      // 1, 2, 3, ...
  dariTahap           String   @db.VarChar(50)
  alasanDikembalikan  String   @db.Text
  dikembalikanOleh    String   @db.VarChar(36) // user id
  tglDikembalikan     DateTime
  statusRevisi        String   @default("Menunggu")  // Menunggu, Direvisi, Dikirim
  tglResubmit         DateTime? // kapan OPD kirim ulang
  
  usulanLayanan UsulanLayanan @relation(fields: [usulanId], references: [id])
}
```

**Impact**: Untuk tahu berapa kali dokumen dikembalikan, untuk auto-eskalasi jika 3x reject dari analis yang sama

---

#### 3. **CATATAN INTERNAL PER TAHAP**

**Gap**: Ada catatan tapi tidak detailed tentang review dari masing-masing analis

**Dibutuhkan?**: RECOMMENDED - Untuk audit trail & komunikasi

**Solusi**: Bisa gunakan `UsulanWorkflowLog` dengan `Json` untuk store catatan detail

**Contoh**:
```prisma
model UsulanWorkflowLog {
  // ... existing fields
  detailCatatan Json?  // { reviewer: "Analis Muda A", findings: [...], recommendation: "..." }
}
```

---

#### 4. **MEKANISME PERSETUJUAN STEP-BY-STEP**

**Gap**: `UsulanLayanan.status` adalah status global, tidak capture approval path

**Dibutuhkan?**: OPTIONAL tapi helpful untuk clarity

**Solusi**: Tambah field untuk tracking approval step
```prisma
model UsulanLayanan {
  // ... existing
  
  // Tracking approval path
  approvalPath    String  @default("AP")  // "AP→AM→AD→Kabid" atau sesuai path
  approvalStatus  Json?   // { ap: "approved", am: "pending", ad: "not_started" }
}
```

---

#### 5. **PEREMAJAAN DATA (DATA REFRESH)**

**Gap**: Tidak ada model untuk track peremajaan data (update ASN tanpa workflow)

**Dibutuhkan?**: YES - Untuk update data ASN yg salah tanpa go through layanan workflow

**Solusi**:
```prisma
model AsnPeremajaan {
  id              BigInt   @id @default(autoincrement())
  asnId           String   @db.VarChar(36)
  jenisPerubahan  String   @db.VarChar(100)  // "golongan", "jabatan", "pendidikan"
  dataDokumen     String?  @db.VarChar(255)  // dokumen bukti bukti
  statusApproval  String   @default("Pending")  // Pending, Approved, Rejected
  diajukanOleh    String   @db.VarChar(36)  // unit organisasi id
  disetujuiOleh   String?  @db.VarChar(36)  // analis madya id
  catatan         String?  @db.Text
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  asn             Asn      @relation(fields: [asnId], references: [id])
}
```

**Impact**: Untuk pisahkan flow peremajaan data dari workflow layanan (no SLA, no approval Kabid)

---

#### 6. **NOTIFIKASI BERJENJANG (MULTI-LEVEL)**

**Gap**: `Notifikasi` hanya simple text, tidak ada template atau differentiation

**Dibutuhkan?**: OPTIONAL tapi helpful untuk system scalability

**Solusi**: `ConfigNotifikasi` sudah ada, tapi perlu link ke actual `Notifikasi` untuk tracking siapa dapat notifikasi apa

```prisma
model NotifikasiTemplate {
  id              BigInt   @id @default(autoincrement())
  configId        BigInt   // FK ke ConfigNotifikasi
  eventType       String   @db.VarChar(100)
  subject         String   @db.VarChar(255)  // untuk email
  body            String   @db.Text          // template dengan {placeholder}
  channels        String   @db.VarChar(100)  // "email,in_app,whatsapp"
  
  configNotifikasi ConfigNotifikasi @relation(fields: [configId], references: [id])
}
```

---

#### 7. **CALON PENSIUN BUP**

**Gap**: Tidak ada model explicit untuk tracking calon pensiun

**Dibutuhkan?**: NO - Sudah ada view `vw_calon_pensiun_bup` di SQL schema

**Status**: ✅ COVERED via view

---

#### 8. **LAPORAN DETAIL PER OPD, JENIS LAYANAN, STAF**

**Gap**: `LaporanHarian` & `LaporanBulanan` hanya store JSON aggregat, tidak normalized

**Dibutuhkan?**: OPTIONAL - Untuk query fleksibel & analytics

**Solusi**: Bisa tambah tabel breakdown jika perlu pivot queries
```prisma
model LaporanDailyBreakdown {
  id              BigInt   @id @default(autoincrement())
  laporanHarianId BigInt
  dimensi         String   // "per_staf", "per_opd", "per_jenis_layanan"
  dimensiValue    String   // nama staf, nama OPD, nama layanan
  usulanMasuk     Int      @default(0)
  usulanSelesai   Int      @default(0)
  melepasuiSla    Int      @default(0)
  
  laporanHarian   LaporanHarian @relation(fields: [laporanHarianId], references: [id])
}
```

**Impact**: Untuk membuat dashboard drill-down, pivot table

---

#### 9. **PERMISSION GRANULAR BERBASIS FIELD**

**Gap**: `RolePermission` hanya module + action, tidak ada field-level access control

**Dibutuhkan?**: NO untuk Phase 1 - terlalu complex. Bisa implementasi di application level

**Status**: 🟡 CAN BE ADDED LATER

---

#### 10. **SINKRONISASI & CONSISTENCY DENGAN SIASN**

**Gap**: Tidak ada tracking tentang last sync time per tabel, conflict resolution

**Dibutuhkan?**: OPTIONAL - untuk periodic sync ke SIASN

**Solusi**: Tambah field di Asn
```prisma
model Asn {
  // ... existing
  lastSyncSiasn       DateTime?      // kapan terakhir di-sync
  syncStatus          String         @default("OK")  // OK, Conflict, NeedManualReview
  conflictDetail      Json?          // detail conflict jika ada
}
```

**Status**: ✅ ALREADY PRESENT di schema

---

### ✅ FITUR YANG SUDAH COVERED

1. **Master Data & Referensi** - Semua ada ✅
2. **ASN Management** - Create, read, update, log perubahan ✅
3. **Workflow Dasar** - Usulan, dokumen, log action ✅
4. **Multi-level Approval** - Path AP → AM → AD → Kabid → KB ✅
5. **User & Role** - Basic RBAC ✅
6. **Notifikasi** - Per user, per event type ✅
7. **Laporan** - Daily & monthly ✅
8. **Konfigurasi** - SLA, notifikasi, laporan otomatis ✅
9. **Integrasi SIASN** - Import logging & error tracking ✅
10. **Audit Log** - Action tracking ✅

---

## 3. REKOMENDASI PERBAIKAN SCHEMA

### Priority 1 (WAJIB sebelum Go Live)

```prisma
// 1. SLA Tracker - untuk real-time SLA monitoring
model SlaTracker {
  id              BigInt   @id @default(autoincrement())
  usulanId        String   @db.VarChar(36)
  tahapSaat       String   @db.VarChar(50)
  masukTahap      DateTime
  slaHari         Int
  slaHabisAt      DateTime
  statusSla       String   @default("OK")  // OK, Warning, Overdue
  eskalasi        Boolean  @default(false)
  eskalasiBuat    DateTime?
  createdAt       DateTime @default(now())
  
  usulanLayanan   UsulanLayanan @relation(fields: [usulanId], references: [id])
  
  @@index([usulanId, statusSla])
}

// 2. Revisi & Reject Tracking
model UsulanRevisi {
  id                  BigInt   @id @default(autoincrement())
  usulanId            String   @db.VarChar(36)
  nomorRevisi         Int
  dariTahap           String   @db.VarChar(50)
  alasanDikembalikan  String   @db.Text
  dikembalikanOleh    String   @db.VarChar(36)
  tglDikembalikan     DateTime
  statusRevisi        String   @default("Menunggu")
  tglResubmit         DateTime?
  
  usulanLayanan       UsulanLayanan @relation(fields: [usulanId], references: [id])
  
  @@index([usulanId, nomorRevisi])
}
```

### Priority 2 (Untuk enriched features)

```prisma
// 3. Peremajaan Data
model AsnPeremajaan {
  id              BigInt   @id @default(autoincrement())
  asnId           String   @db.VarChar(36)
  jenisPerubahan  String   @db.VarChar(100)
  dataLama        Json?
  dataBaru        Json?
  dokumenBukti    String?  @db.VarChar(255)
  statusApproval  String   @default("Pending")
  diajukanOleh    String   @db.VarChar(36)
  disetujuiOleh   String?  @db.VarChar(36)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  asn             Asn      @relation(fields: [asnId], references: [id])
  
  @@index([asnId, statusApproval])
}
```

---

## 4. KESIMPULAN AUDIT

**Schema.prisma Completeness: 85%** ✅

### Yang sudah ada:
- ✅ Semua master data & referensi
- ✅ ASN master & riwayat
- ✅ Workflow dasar (usulan, dokumen, log)
- ✅ User & role management
- ✅ Notifikasi & laporan
- ✅ Konfigurasi sistem
- ✅ Integrasi data & audit log

### Yang perlu ditambah (Priority):
- ⚠️ SLA Tracker (untuk real-time monitoring)
- ⚠️ Revisi & Reject Tracking (untuk historisasi reject)
- ⚠️ Peremajaan Data (untuk update ASN non-workflow)

### Estimasi effort penambahan:
- SLA Tracker: 2-3 jam (model + index)
- Revisi Tracking: 2-3 jam
- Peremajaan Data: 3-4 jam

**Total**: ~8 jam untuk 3 tambahan critical features

**Recommendation**: Tambah 3 model tersebut SEBELUM lanjut ke development fase selanjutnya untuk avoid refactor nanti.

---

End of Audit
