# INTEGRASI EKSTERNAL SILAKAP - Import Data dari SIASN

## 1. OVERVIEW FLOW INTEGRASI

Karena data mentah dari SIASN, proses integrasi harus:
1. **Validate** - Cek format dan kevalidasi data
2. **Map** - Konversi kolom SIASN ke schema SILAKAP
3. **Transform** - Clean data, split, standardize
4. **Enrich** - Tambah calculated fields (mk_tahun, mk_bulan, usia, dll)
5. **Load** - Insert ke database
6. **Log** - Catat success/error untuk troubleshooting

---

## 2. MENU INTEGRASI EKSTERNAL (UI)

### Struktur Menu di Sidebar (untuk Admin & Analis Madya)
```
Integrasi Eksternal
  └─ Import Data SIASN
  └─ Job Sinkronisasi
  └─ Riwayat Sinkronisasi
  └─ Validasi Data Duplikat
  └─ Error Log Import
```

### Dashboard Integrasi Eksternal

```
┌─────────────────────────────────────────────────────┐
│ INTEGRASI EKSTERNAL - IMPORT DATA SIASN             │
└─────────────────────────────────────────────────────┘

Status Terakhir:
┌───────────────────┬──────────────────┬──────────────┐
│ Jenis Data        │ Import Terakhir   │ Total Record │
├───────────────────┼──────────────────┼──────────────┤
│ ASN               │ 28/04/2026 10:45  │ 8.379        │
│ Unit Organisasi   │ 28/04/2026 11:00  │ 946          │
│ Jabatan Struktur  │ 28/04/2026 11:15  │ 946          │
│ Jabatan Fungsional│ 28/04/2026 11:30  │ 1.315        │
│ Jabatan Pelaksana │ 28/04/2026 11:45  │ 316          │
└───────────────────┴──────────────────┴──────────────┘

┌─────────────────────────────────────────────────────┐
│ PILIH DATA UNTUK IMPORT                             │
├─────────────────────────────────────────────────────┤
│ Jenis Data: [Dropdown]                              │
│ - ASN (Data_ASN_April_24.xlsx)                      │
│ - Unit Organisasi (HierarkiUnor__6_.xlsx)           │
│ - Jabatan Struktural (Referensi-Jabatan-Struktural)│
│ - Jabatan Fungsional (Referensi-Jabatan-Fungsional)│
│ - Jabatan Pelaksana (Referensi-Jabatan-Pelaksana)  │
│                                                      │
│ File: [Upload file atau pilih yang sudah ada]      │
│ Mode Import: (•) Create new  ( ) Update existing   │
│                                                      │
│ [Preview Data] [Jalankan Import]                   │
└─────────────────────────────────────────────────────┘
```

---

## 3. MAPPING DATA SIASN → SCHEMA SILAKAP

### 3.1 ASN (Data_ASN_April_24.xlsx)

| Kolom SIASN | Tipe | Kolom SILAKAP | Tipe | Catatan |
|---|---|---|---|---|
| PNS ID | String | asn.id | UUID | Generate jika null, gunakan PNS ID |
| NIP BARU | String | asn.nipBaru | String | Unique key, required |
| NIP LAMA | String | asn.nipLama | String | Optional |
| NAMA | String | asn.nama | String | Required |
| GELAR DEPAN | String | asn.gelarDepan | String | Optional |
| GELAR BELAKANG | String | asn.gelarBelakang | String | Optional |
| TEMPAT LAHIR NAMA | String | asn.tempatLahir | String | Optional |
| TANGGAL LAHIR | Date | asn.tanggalLahir | DateTime | Parse YYYY-MM-DD |
| JENIS KELAMIN | String (M/F) | asn.jenisKelaminId | Int | Map: M→1, F→2 (ref_jenis_kelamin) |
| AGAMA NAMA | String | asn.agamaId | Int | Map ke ref_agama (1=Islam, 2=Kristen, dll) |
| JENIS KAWIN NAMA | String | asn.statusKawinId | Int | Map ke ref_status_kawin |
| NIK | String | asn.nik | String | Required, untuk validasi |
| NOMOR HP | String | asn.nomorHp | String | Optional |
| EMAIL | String | asn.email | String | Optional |
| EMAIL GOV | String | asn.emailGov | String | Optional |
| ALAMAT | String | asn.alamat | String | Optional |
| NPWP NOMOR | String | asn.npwp | String | Optional |
| BPJS | String | asn.bpjs | String | Optional |
| JENIS PEGAWAI NAMA | String | asn.jenisPegawai | String | "PNS Daerah Kab./Kota", dll |
| STATUS CPNS PNS | String | asn.statusPegawai | String | "Aktif", "Non-Aktif", "Pensiun", dll |
| KEDUDUKAN HUKUM NAMA | String | asn.kedudukanHukum | String | "Tetap", "Sementara", dll |
| NOMOR SK CPNS | String | asn.nomorSkCpns | String | Optional |
| TANGGAL SK CPNS | Date | asn.tanggalSkCpns | DateTime | Parse date |
| TMT CPNS | Date | asn.tmtCpns | DateTime | Parse date |
| NOMOR SK PNS | String | asn.nomorSkPns | String | Optional |
| TANGGAL SK PNS | Date | asn.tanggalSkPns | DateTime | Parse date |
| TMT PNS | Date | asn.tmtPns | DateTime | Parse date, **CRITICAL untuk hitung mk_tahun** |
| GOL AKHIR NAMA | String | asn.golonganId | BigInt | Map ke ref_golongan.kode (I/a, II/b, dll) |
| TMT GOLONGAN | Date | asn.tmtGolongan | DateTime | Parse date |
| MK TAHUN | Int | asn.mkTahun | Int | Calculated: YEAR(NOW()) - YEAR(tmt_pns) |
| MK BULAN | Int | asn.mkBulan | Int | Calculated: MONTH(NOW()) - MONTH(tmt_pns) |
| JENIS JABATAN NAMA | String | asn.jenisJabatanId | BigInt | Map: "Jabatan Struktural"→1, "Jabatan Fungsional"→2, "Jabatan Pelaksana"→3 |
| JABATAN NAMA | String | asn.jabatan_struktural_id / jabatan_fungsional_id / jabatan_pelaksana_id | UUID/String | Map ke ref_jabatan_* berdasarkan jenis jabatan |
| TMT JABATAN | Date | asn.tmtJabatan | DateTime | Parse date |
| TINGKAT PENDIDIKAN NAMA | String | asn.tingkatPendidikanId | BigInt | Map ke ref_pendidikan |
| PENDIDIKAN NAMA | String | asn.bidangPendidikanId | UUID | Map ke ref_bidang_pendidikan |
| TAHUN LULUS | Int | asn.tahunLulus | Int | Numeric |
| NAMA SEKOLAH | String | asn.namaSekolah | String | Optional |
| UNOR NAMA | String | asn.unitOrganisasiId | UUID | Map ke ref_unit_organisasi.id dari HierarkiUnor |
| IS VALID NIK | Boolean | asn.nikValid | Boolean | Direct map |
| FLAG IKD | Boolean | asn.flagIkd | Boolean | Direct map |

**Validation Rules untuk ASN:**
- `nipBaru` tidak boleh null atau kosong
- `nama` tidak boleh null atau kosong
- `nik` harus valid format (16 digit) atau set flag_ikd=true
- `tanggalLahir` + golongan → hitung BUP (batas usia pensiun)
- `tmtPns` → hitung mk_tahun, mk_bulan
- `jenis_jabatan` harus ada (1 dari 3: Struktural, Fungsional, atau Pelaksana)

---

### 3.2 Unit Organisasi (HierarkiUnor__6_.xlsx)

| Kolom SIASN | Tipe | Kolom SILAKAP | Tipe | Catatan |
|---|---|---|---|---|
| ID | String | ref_unit_organisasi.id | UUID | PK, jangan generate |
| NAMA_UNOR | String | ref_unit_organisasi.nama | String | Required |
| ID_ATASAN | String | ref_unit_organisasi.idAtasan | UUID | Optional, self-referencing |
| - | - | ref_unit_organisasi.level | Int | Calculated dari depth ID_ATASAN |
| - | - | ref_unit_organisasi.isOpd | Boolean | true jika ini OPD utama (tidak ada atasan atau atasan adalah Pemkab) |

**Validation Rules:**
- Tidak boleh ada circular reference (A atasan B, B atasan A)
- Hitung level dari kedalaman hierarki
- Hitung is_opd: true jika langsung di bawah Pemkab atau tidak ada atasan

---

### 3.3 Jabatan Struktural (Referensi-Jabatan-Struktural__6_.xlsx)

| Kolom SIASN | Tipe | Kolom SILAKAP | Tipe | Catatan |
|---|---|---|---|---|
| ID | String | ref_jabatan_struktural.id | UUID | PK |
| Nama_unor | String | (lookup) | - | Cari unit_organisasi_id dari nama ini |
| Nama_jabatan | String | ref_jabatan_struktural.nama | String | Required |
| Eselon_id | Int | ref_jabatan_struktural.eselonId | Int | Optional (eselon I, II, III, IV) |
| - | - | ref_jabatan_struktural.bup | Int | Default 58 (usia pensiun struktural) |
| - | - | ref_jabatan_struktural.unitOrganisasiId | UUID | FK ke ref_unit_organisasi |

**Validation Rules:**
- Nama_unor harus ada di ref_unit_organisasi
- Nama_jabatan tidak boleh duplikat per unit organisasi

---

### 3.4 Jabatan Fungsional (Referensi-Jabatan-Fungsional__2_.xlsx)

| Kolom SIASN | Tipe | Kolom SILAKAP | Tipe | Catatan |
|---|---|---|---|---|
| ID | String | ref_jabatan_fungsional.id | UUID | PK |
| Nama | String | ref_jabatan_fungsional.nama | String | Required |
| Jenjang | String | ref_jabatan_fungsional.jenjang | String | UT, AH, AM, AT, TR, PY |
| BUP | Int | ref_jabatan_fungsional.bup | Int | Usia pensiun (default 65) |

**Validation Rules:**
- Nama tidak boleh duplikat
- Jenjang harus valid (UT, AH, AM, AT, TR, PY)

---

### 3.5 Jabatan Pelaksana (Referensi-Jabatan-Pelaksana__2_.xlsx)

| Kolom SIASN | Tipe | Kolom SILAKAP | Tipe | Catatan |
|---|---|---|---|---|
| ID | String | ref_jabatan_pelaksana.id | UUID | PK |
| Nama | String | ref_jabatan_pelaksana.nama | String | Required |

**Validation Rules:**
- Nama tidak boleh duplikat

---

## 4. PROSES IMPORT DETAIL

### 4.1 Step-by-step untuk Import ASN

```typescript
// Pseudo-code untuk proses import ASN

async function importAsnData(file: File, mode: 'create' | 'update') {
  const importLog = await db.sihasnImportLog.create({
    filename: file.name,
    jenisData: 'ASN',
    status: 'Processing',
    startedAt: new Date(),
  });

  try {
    // 1. READ EXCEL FILE
    const rows = readExcelFile(file); // returns array of row objects
    const totalBaris = rows.length;

    // 2. VALIDATE EACH ROW
    const errors = [];
    const validRows = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Excel row number (header is row 1)

      try {
        // BASIC VALIDATION
        if (!row['NIP BARU'] || !row['NAMA']) {
          throw new Error('NIP BARU atau NAMA tidak boleh kosong');
        }

        // NIK VALIDATION
        const nik = row['NIK']?.replace(/'/g, '').trim();
        const nikValid = /^\d{16}$/.test(nik);

        // CONVERT & MAP COLUMNS
        const asnData = {
          id: row['PNS ID'] || generateUUID(),
          nipBaru: row['NIP BARU'].trim(),
          nipLama: row['NIP LAMA'] || null,
          nama: row['NAMA'].trim(),
          gelarDepan: row['GELAR DEPAN'] || null,
          gelarBelakang: row['GELAR BELAKANG'] || null,
          tempatLahir: row['TEMPAT LAHIR NAMA'] || null,
          tanggalLahir: parseDate(row['TANGGAL LAHIR']),
          
          // MAP JENIS KELAMIN
          jenisKelaminId: mapJenisKelamin(row['JENIS KELAMIN']), // M→1, F→2
          
          // MAP AGAMA
          agamaId: await mapAgama(row['AGAMA NAMA']),
          
          // MAP STATUS KAWIN
          statusKawinId: await mapStatusKawin(row['JENIS KAWIN NAMA']),
          
          nik: nik || null,
          nomorHp: row['NOMOR HP'] || null,
          email: row['EMAIL'] || null,
          emailGov: row['EMAIL GOV'] || null,
          alamat: row['ALAMAT'] || null,
          npwp: row['NPWP NOMOR']?.replace(/'/g, '').trim() || null,
          bpjs: row['BPJS']?.replace(/'/g, '').trim() || null,
          
          jenisPegawai: row['JENIS PEGAWAI NAMA'] || null,
          statusPegawai: row['STATUS CPNS PNS'] || 'Aktif',
          kedudukanHukum: row['KEDUDUKAN HUKUM NAMA'] || null,
          
          nomorSkCpns: row['NOMOR SK CPNS'] || null,
          tanggalSkCpns: parseDate(row['TANGGAL SK CPNS']),
          tmtCpns: parseDate(row['TMT CPNS']),
          nomorSkPns: row['NOMOR SK PNS'] || null,
          tanggalSkPns: parseDate(row['TANGGAL SK PNS']),
          tmtPns: parseDate(row['TMT PNS']),
          
          // MAP GOLONGAN
          golonganId: await mapGolongan(row['GOL AKHIR NAMA']),
          tmtGolongan: parseDate(row['TMT GOLONGAN']),
          
          // CALCULATE MASA KERJA
          mkTahun: calculateYears(parseDate(row['TMT PNS'])),
          mkBulan: calculateMonths(parseDate(row['TMT PNS'])),
          
          // MAP JENIS & JABATAN
          jenisJabatanId: await mapJenisJabatan(row['JENIS JABATAN NAMA']),
          jabatanStrukturaId: row['JENIS JABATAN NAMA'] === 'Jabatan Struktural' 
            ? await mapJabatanStruktural(row['JABATAN NAMA'], row['UNOR NAMA']) 
            : null,
          jabatanFungsionalId: row['JENIS JABATAN NAMA'] === 'Jabatan Fungsional' 
            ? await mapJabatanFungsional(row['JABATAN NAMA']) 
            : null,
          jabatanPelaksanaId: row['JENIS JABATAN NAMA'] === 'Jabatan Pelaksana' 
            ? await mapJabatanPelaksana(row['JABATAN NAMA']) 
            : null,
          tmtJabatan: parseDate(row['TMT JABATAN']),
          
          // MAP PENDIDIKAN
          tingkatPendidikanId: await mapPendidikan(row['TINGKAT PENDIDIKAN NAMA']),
          bidangPendidikanId: await mapBidangPendidikan(row['PENDIDIKAN NAMA']),
          namaSekolah: row['NAMA SEKOLAH'] || null,
          tahunLulus: parseInt(row['TAHUN LULUS']) || null,
          
          // MAP UNIT ORGANISASI
          unitOrganisasiId: await mapUnitOrganisasi(row['UNOR NAMA']),
          lokasiKerja: row['LOKASI KERJA NAMA'] || null,
          
          nikValid: nikValid,
          flagIkd: row['FLAG IKD'] || false,
          lastSyncSiasn: new Date(),
        };

        validRows.push({
          rowNum,
          data: asnData,
        });

      } catch (error) {
        errors.push({
          nomorBaris: rowNum,
          nomorId: row['NIP BARU'],
          errorMessage: error.message,
          dataAsli: row,
        });
      }
    }

    // 3. INSERT VALID ROWS
    let successCount = 0;
    for (const { rowNum, data } of validRows) {
      try {
        if (mode === 'create') {
          await db.asn.create({ data });
        } else {
          await db.asn.upsert({
            where: { nipBaru: data.nipBaru },
            create: data,
            update: data,
          });
        }
        successCount++;
      } catch (error) {
        errors.push({
          nomorBaris: rowNum,
          nomorId: data.nipBaru,
          errorMessage: error.message,
          dataAsli: data,
        });
      }
    }

    // 4. LOG ERRORS
    for (const error of errors) {
      await db.sihasnImportError.create({
        importLogId: importLog.id,
        nomorBaris: error.nomorBaris,
        nomorId: error.nomorId,
        errorMessage: error.errorMessage,
        dataAsli: error.dataAsli,
      });
    }

    // 5. UPDATE IMPORT LOG
    await db.sihasnImportLog.update({
      where: { id: importLog.id },
      data: {
        status: errors.length === 0 ? 'Success' : 'PartialSuccess',
        totalBaris,
        successBaris: successCount,
        failedBaris: errors.length,
        errorDetails: errors.length > 0 ? { summary: `${errors.length} error`, errors } : null,
        completedAt: new Date(),
      },
    });

    return importLog;

  } catch (error) {
    await db.sihasnImportLog.update({
      where: { id: importLog.id },
      data: {
        status: 'Failed',
        completedAt: new Date(),
      },
    });
    throw error;
  }
}
```

---

## 5. VALIDASI DATA DUPLIKAT

Setelah import, perlu validasi duplikat:

```sql
-- Cek duplikat NIP BARU
SELECT nipBaru, COUNT(*) as count
FROM asn
GROUP BY nipBaru
HAVING count > 1;

-- Cek duplikat NIK
SELECT nik, COUNT(*) as count
FROM asn
WHERE nik IS NOT NULL
GROUP BY nik
HAVING count > 1;

-- Cek ASN tanpa unit organisasi (data invalid)
SELECT id, nipBaru, nama
FROM asn
WHERE unitOrganisasiId IS NULL
  AND statusPegawai = 'Aktif';
```

---

## 6. TESTING IMPORT

### Test Case 1: Import ASN Sample (5 baris)
```
✓ Create ref_golongan, ref_jenis_jabatan, ref_unit_organisasi dulu
✓ Import 5 ASN baris
✓ Cek semua ada di database dengan relasi benar
✓ Cek mk_tahun, mk_bulan calculate dengan benar
```

### Test Case 2: Update ASN (upsert)
```
✓ Import ASN pertama kali (8.379 baris)
✓ Edit 1 ASN (ubah golongan)
✓ Re-import dengan mode update
✓ Cek golongan updated, data lain tetap
✓ Cek asn_riwayat tercatat perubahan golongan
```

### Test Case 3: Error Handling
```
✓ Upload file dengan NIP BARU kosong → error
✓ Upload file dengan NIK invalid → flag_ikd = true
✓ Upload file dengan unit organisasi tidak ada → error
✓ Check error log detail per baris
```

---

## 7. MENU STRUKTUR (Routes & Components)

### Admin Integrasi Eksternal Routes
```
/integrasi/
  └─ dashboard                   # Index halaman integrasi
  └─ import                      # Form upload & import
  └─ riwayat                     # History import
  └─ error-log                   # Error detail per import
  └─ validasi-duplikat           # Cek duplikat data
```

### Components di React
```
<IntegrasiBreadcrumb />
<ImportForm
  jenisData="ASN | UnitOrganisasi | JabatanStruktural | ..."
  onUpload={handleImport}
/>
<PreviewData
  rows={previewRows}
  totalBaris={total}
/>
<ImportProgressBar
  totalBaris={total}
  processed={processed}
  success={success}
  failed={failed}
/>
<ErrorLogTable
  errors={importErrors}
/>
```

---

## 8. REFERENCE TABLE UNTUK MAPPING

Sebelum import ASN, pastikan sudah ada:

### ref_golongan (minimal)
```sql
INSERT INTO ref_golongan (kode, nama, roman, tingkat) VALUES
('I/a', 'Juru Muda', 'I/a', 1),
('I/b', 'Juru Muda Tingkat I', 'I/b', 2),
('I/c', 'Juru', 'I/c', 3),
('II/a', 'Pengatur Muda', 'II/a', 4),
...
('IV/e', 'Pembina Utama Madya', 'IV/e', 27);
```

### ref_jenis_jabatan
```sql
INSERT INTO ref_jenis_jabatan (nama) VALUES
('Jabatan Struktural'),
('Jabatan Fungsional'),
('Jabatan Pelaksana');
```

### ref_agama
```sql
INSERT INTO ref_agama (id, nama) VALUES
(1, 'Islam'),
(2, 'Kristen'),
(3, 'Katolik'),
(4, 'Hindu'),
(5, 'Budha'),
(6, 'Konghucu');
```

### ref_status_kawin
```sql
INSERT INTO ref_status_kawin (id, nama) VALUES
(1, 'Menikah'),
(2, 'Belum Menikah'),
(3, 'Cerai Hidup'),
(4, 'Cerai Mati');
```

### ref_jenis_kelamin
```sql
INSERT INTO ref_jenis_kelamin (id, nama) VALUES
(1, 'Laki-laki'),
(2, 'Perempuan');
```

---

## 9. ERROR HANDLING & ROLLBACK

Jika import gagal:

1. **Per-baris error**: Catat di sihsn_import_error, lanjut ke baris berikutnya
2. **Critical error** (database down, file corrupt): Rollback seluruh transaction
3. **Data conflict** (duplikat NIP): Skip atau update, tergantung mode

Untuk rollback yang safe, gunakan database transaction:

```typescript
async function importWithTransaction(file, mode) {
  return db.$transaction(async (tx) => {
    // Semua insert/update di sini
    // Jika ada error, otomatis rollback
  });
}
```

---

End of Integration Documentation
