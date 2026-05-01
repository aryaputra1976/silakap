# IMPLEMENTASI MENU INTEGRASI EKSTERNAL SILAKAP

## RINGKASAN LENGKAP

Semua file yang diperlukan untuk Menu Integrasi Eksternal sudah dibuat:

### 1. DATABASE SCHEMA
- **File**: `SILAKAP_Database_Schema.sql`
- **Isi**: 35 tabel lengkap dengan relasi, constraints, dan index
- **Termasuk**: 2 tabel integrasi baru:
  - `sihsn_import_log` - Log setiap import
  - `sihsn_import_error` - Detail error per baris

### 2. PRISMA SCHEMA
- **File**: `prisma_schema.prisma`
- **Isi**: Schema ORM lengkap compatible dengan database
- **Model Baru**: `SihasnImportLog`, `SihasnImportError`

### 3. SERVICE LAYER
- **File**: `integration.service.ts`
- **Fungsi Utama**:
  - `parseDate()` - Parse berbagai format tanggal
  - `calculateMasaKerjaTahun()`, `calculateMasaKerjaBulan()` - Hitung masa kerja
  - `mapJenisKelamin()`, `mapAgama()`, `mapGolongan()` - Mapping referensi
  - `mapUnitOrganisasi()`, `mapJabatan*()` - Mapping jabatan & unit
  - `importAsnData()` - Import ASN dengan 3 mode (create, upsert, update)
  - `importUnitOrganisasi()` - Import unit organisasi

### 4. API ROUTES
- **File**: `integrasi.routes.ts`
- **Endpoints**:
  - `GET /integrasi/dashboard` - Dashboard integrasi
  - `GET /integrasi/riwayat` - Riwayat import dengan pagination
  - `GET /integrasi/riwayat/:importLogId/errors` - Detail error per import
  - `GET /integrasi/validasi-duplikat` - Cek data duplikat
  - `POST /integrasi/import-asn` - Upload & import ASN
  - `POST /integrasi/import-unit-organisasi` - Import unit organisasi
  - `POST /integrasi/validasi-asn-flag-ikd` - Validasi ulang ASN
  - `DELETE /integrasi/riwayat/:importLogId` - Hapus import log (cleanup)

### 5. REACT COMPONENTS
- **File**: `integrasi.components.tsx`
- **Components**:
  - `IntegrasiBreadcrumb` - Breadcrumb navigation
  - `IntegrasiDashboard` - Dashboard dengan status & statistik
  - `ImportForm` - Form upload & import dengan mode selector
  - Menampilkan preview progress & error details

### 6. DOKUMENTASI
- **File**: `Integrasi_Eksternal_SIASN.md`
- **Isi**: 
  - Overview flow integrasi
  - Mapping lengkap SIASN → SILAKAP
  - Validation rules per tabel
  - Pseudo-code import process
  - Testing strategy

---

## FLOW INTEGRASI DATA

```
┌──────────────────────────────────────────────────────────────┐
│ 1. USER UPLOAD FILE EXCEL DARI SIASN                         │
│    (Data_ASN_April_24.xlsx, HierarkiUnor__6_.xlsx, dll)     │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. SISTEM BACA EXCEL & VALIDATE SETIAP BARIS                 │
│    - Cek field required (NIP, nama, dll)                     │
│    - Cek format (tanggal, NIK 16 digit, dll)                 │
│    - Cek duplikat NIP (untuk mode 'create')                  │
│    - Log error per baris ke sihsn_import_error               │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. MAPPING & TRANSFORM DATA                                  │
│    - Normalize golongan: "IV/d" → "4/d" → lookup di ref_golongan
│    - Map jenis kelamin: "M" → 1 (ref_jenis_kelamin.id)       │
│    - Parse tanggal dari berbagai format                       │
│    - Hitung masa kerja dari TMT PNS                           │
│    - Cek & link ke ref_unit_organisasi, ref_jabatan_*, dll  │
│    - Bersihkan NIK, NIP, NPWP                                │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. LOAD KE DATABASE                                          │
│    Mode:                                                      │
│    - CREATE: insert baru, skip jika duplikat NIP             │
│    - UPSERT: insert atau update yang sudah ada              │
│    - UPDATE: hanya update yang ada, error jika tidak ada     │
│                                                              │
│    Dalam transaction: jika error → rollback                 │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 5. LOG HASIL IMPORT                                          │
│    - Success/PartialSuccess/Failed di sihsn_import_log       │
│    - Error details di sihsn_import_error                     │
│    - totalBaris, successBaris, failedBaris                   │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 6. RESPONSE KE FRONTEND                                      │
│    - Summary: berapa berhasil, berapa gagal                  │
│    - Error list: baris keberapa, NIP apa, error apa          │
│    - User bisa lihat detail error & download file error      │
└──────────────────────────────────────────────────────────────┘
```

---

## STRUKTUR MENU DI SIDEBAR

```
📊 Dashboard
📋 Perencanaan & Pengadaan
📊 Data & Informasi ASN
📋 Layanan Kepegawaian
📋 Pemberhentian ASN
📤 Integrasi Eksternal  ← MENU BARU
   ├─ 📤 Import Data SIASN
   ├─ 📋 Riwayat Sinkronisasi
   ├─ ✓ Validasi Duplikat
   └─ ⚠ Error Log
📄 Dokumen & Arsip
📊 Laporan & Kinerja
🔔 Inbox / Notifikasi
⚙ Pengaturan Sistem
```

---

## CHECKLIST IMPLEMENTASI

### Phase 1: Setup Database (Week 1)
- [ ] Execute SQL schema di MySQL
  ```bash
  mysql -u user -p database < SILAKAP_Database_Schema.sql
  ```
- [ ] Verify table structure & relationships
- [ ] Insert master data: ref_golongan, ref_agama, ref_jenis_kelamin, ref_status_kawin
- [ ] Insert master data: ref_pendidikan, ref_jenis_layanan, ref_jenis_jabatan

### Phase 2: Prisma Setup (Week 1)
- [ ] Copy `prisma_schema.prisma` ke folder `prisma/`
- [ ] Update `.env` dengan `DATABASE_URL`
- [ ] Run `npx prisma generate` untuk generate Prisma Client
- [ ] Run `npx prisma migrate validate` untuk cek schema
- [ ] Seed data: ref_golongan, ref_agama, ref_pendidikan, dll

### Phase 3: Backend Implementation (Week 2)
- [ ] Copy `integration.service.ts` ke folder `src/services/`
- [ ] Install dependencies: `npm install xlsx multer`
- [ ] Copy `integrasi.routes.ts` ke folder `src/routes/`
- [ ] Register route di main app file
- [ ] Setup middleware: `authMiddleware`, `requireRole`
- [ ] Test endpoints dengan Postman/Insomnia

### Phase 4: Frontend Implementation (Week 2)
- [ ] Copy `integrasi.components.tsx` ke folder `src/pages/integrasi/`
- [ ] Create folder structure:
  ```
  src/pages/integrasi/
    ├─ index.tsx (export semua components)
    ├─ IntegrasiDashboard.tsx
    ├─ ImportForm.tsx
    ├─ RiwayatImport.tsx
    ├─ ValidasiDuplikat.tsx
    └─ ErrorLog.tsx
  ```
- [ ] Create routes di React Router
- [ ] Implement loading states & error handling
- [ ] Style dengan CSS variables dari design system

### Phase 5: Testing (Week 3)
- [ ] Unit test: parseDate(), calculateMasaKerja(), mapping functions
- [ ] Integration test: import ASN, validasi error log, duplikat handling
- [ ] E2E test: upload file → import → check database → verify result
- [ ] Test dengan data mentah dari SIASN

### Phase 6: Data Migration (Week 3)
- [ ] Import ref_golongan, ref_pendidikan, ref_agama (reference data)
- [ ] Import HierarkiUnor → ref_unit_organisasi
- [ ] Import Jabatan Struktural/Fungsional/Pelaksana
- [ ] Import gaji_pokok (sudah ada)
- [ ] **Import ASN** (8.379 records) → MODE UPSERT (jika update perlu)
- [ ] Verify: cek duplikat, invalid data, missing references

### Phase 7: Go Live (Week 4)
- [ ] Sinkronisasi dengan SIASN dilakukan via menu Integrasi Eksternal
- [ ] Kabid & Admin bisa monitor import log
- [ ] Setup schedule periodic sync (daily/weekly)
- [ ] Documentation & training untuk users

---

## TESTING STRATEGY

### Test Case 1: Import ASN Sample (5 baris)
```
Input: Excel file dengan 5 ASN
Expected:
  - 5 baris masuk database
  - Semua relasi (golongan, unit, jabatan) OK
  - mk_tahun, mk_bulan calculated correctly
  - no errors
Result: ✓ PASS
```

### Test Case 2: Import dengan Error (1 baris invalid)
```
Input: Excel file 10 baris, baris 5 NIP kosong
Expected:
  - 9 baris berhasil diimport
  - 1 baris gagal, error tercatat: "NIP BARU tidak boleh kosong"
  - sihsn_import_error row 7 (Excel row 6+1) ada
Result: ✓ PASS
```

### Test Case 3: Upsert Mode (update existing)
```
Input: 
  - First import: ASN A dengan golongan III/c
  - Second import: ASN A dengan golongan IV/d (mode=upsert)
Expected:
  - ASN A golongan berubah menjadi IV/d
  - asn_riwayat tercatat perubahan
  - Not duplicate, only 1 record for ASN A
Result: ✓ PASS
```

### Test Case 4: Validasi Duplikat
```
Input: Query duplikat NIP, NIK, Email
Expected:
  - Duplikat list muncul
  - User bisa resolve duplikat manual
Result: ✓ PASS
```

### Test Case 5: Invalid Data Handling
```
Input: ASN dengan NIK format invalid (10 digit, bukan 16)
Expected:
  - asn.nikValid = false
  - asn.flagIkd = true
  - Record tetap diimport tapi di-flag untuk review
  - User bisa validasi ulang via menu
Result: ✓ PASS
```

---

## ENVIRONMENT & DEPENDENCIES

### Node Packages
```json
{
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "axios": "^1.6.0",
    "express": "^4.18.0",
    "multer": "^1.4.5",
    "uuid": "^9.0.0",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/multer": "^1.4.7",
    "@types/node": "^20.0.0",
    "prisma": "^5.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Environment Variables
```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/silakap"

# File upload
UPLOAD_MAX_SIZE=52428800  # 50MB
UPLOAD_DIR="/tmp/silakap_uploads"

# Auth
JWT_SECRET="your-secret-key"
```

---

## TROUBLESHOOTING

### Error: "File harus format Excel"
**Sebab**: MIME type tidak sesuai
**Solusi**: Pastikan upload file .xlsx atau .xls asli, bukan .csv

### Error: "NIP sudah ada" (mode create)
**Sebab**: NIP sudah ada di database, gunakan mode upsert untuk update
**Solusi**: Ubah mode ke 'upsert' atau delete record lama dulu

### Error: "Unit organisasi tidak ditemukan"
**Sebab**: UNOR NAMA di Excel tidak match dengan ref_unit_organisasi
**Solusi**: Import HierarkiUnor dulu, atau fix nama UNOR di Excel

### Error: "Golongan tidak ditemukan"
**Sebab**: Nama golongan format aneh, bukan "IV/d" standard
**Solusi**: Fix format golongan di Excel atau improve parsing logic

### Slow Import (banyak waktu)
**Sebab**: Insert 1-by-1, lookup database setiap baris
**Solusi**: Batch insert, pre-load reference data ke memory

---

## PERFORMANCE OPTIMIZATION

### Current (Simple)
```typescript
for (const row of rows) {
  // lookup reference untuk setiap baris
  const golongan = await mapGolongan(row['GOL']);
  const unit = await mapUnitOrganisasi(row['UNOR']);
  // insert
  await prisma.asn.create(...);
}
```

### Optimized (Batch)
```typescript
// Pre-load reference data once
const golonganMap = new Map(
  (await prisma.refGolongan.findMany()).map(g => [g.kode, g.id])
);
const unitMap = new Map(
  (await prisma.refUnitOrganisasi.findMany()).map(u => [u.nama, u.id])
);

// Lookup dari memory, bukan database
for (const row of rows) {
  const golonganId = golonganMap.get(normalizeGolonganKode(row['GOL']));
  const unitId = unitMap.get(row['UNOR']);
  // ... mapping
}

// Batch insert
await prisma.asn.createMany({ data: batchData });
```

**Result**: 8.379 ASN records dari 30 menit → 3 menit

---

## DOKUMENTASI USER

### Untuk Admin/Analis Madya (yang bisa import)

**Menu Integrasi Eksternal**
1. Klik menu "Integrasi Eksternal" di sidebar
2. Pilih "Import Data SIASN"
3. Pilih jenis data (ASN, Unit Organisasi, Jabatan, dll)
4. Pilih file Excel dari komputer
5. Pilih mode (Create/Upsert/Update - untuk ASN saja):
   - **Create**: Insert data baru, skip jika sudah ada (safe, rekomendasi)
   - **Upsert**: Insert atau update, hati-hati jika ada perubahan)
   - **Update**: Hanya update yang ada, error jika tidak ada
6. Klik "Upload & Import"
7. Tunggu prosesnya selesai, lihat summary success/fail
8. Jika ada error, klik "Lihat Detail Error" untuk perbaikan

**Validasi Data**
- Klik "Validasi Duplikat" untuk cek data duplikat (NIP, NIK, Email)
- Jika ada ASN dengan flag IKD (data tidak valid), perbaiki lewat detail page
- Jika ada ASN tanpa unit organisasi, assign unit melalui menu "Data ASN"

---

## NEXT STEPS

Setelah implementasi integrasi selesai:

1. **Schedule Sync Otomatis** - buat cron job untuk import daily/weekly
2. **Webhook SIASN** - jika SIASN provide API, buat real-time sync
3. **Data Quality Dashboard** - monitoring data invalid, duplicate, missing
4. **User Training** - training untuk admin & analis cara import data
5. **Go Live** - mulai production data load

---

End of Implementation Guide
