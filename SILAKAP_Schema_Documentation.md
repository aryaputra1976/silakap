# DOKUMENTASI DATABASE SCHEMA SILAKAP

## 1. OVERVIEW STRUKTUR DATABASE

Database SILAKAP terdiri dari 8 kategori tabel utama:

1. **Referensi Master Data** - Data statis yang sering direferensikan
2. **Data ASN Utama** - Master pegawai dan riwayat perubahannya
3. **Workflow Layanan Kepegawaian** - Pengajuan, dokumen, dan log workflow
4. **Pengguna & Role** - Sistem akses dan permission
5. **Notifikasi & Laporan** - Untuk komunikasi dan pelaporan
6. **Konfigurasi Sistem** - Setting SLA, notifikasi, laporan otomatis
7. **Audit Log** - Untuk tracking dan compliance
8. **Views** - Query siap pakai untuk dashboard dan laporan

Total: 35 tabel + 3 views

---

## 2. PENJELASAN TABEL PER KATEGORI

### A. REFERENSI MASTER DATA (11 tabel)

#### `ref_golongan`
Menyimpan data golongan/pangkat ASN.
- Kode: I/a, I/b, II/a, ..., IV/e
- Tingkat: 1-15 (untuk urutan)
- Hubungan: Di-reference oleh `ref_gaji_pokok` dan `asn`

#### `ref_gaji_pokok` ⭐ (Tabel yang sudah ada)
Menyimpan gaji pokok per golongan dan masa kerja.
- Unique key: (golongan_id, masaKerja)
- Digunakan untuk: Perhitungan KGB otomatis, laporan gaji
- Catatan: Tabel ini sudah ada di sistem Anda, tinggal integrate

#### `ref_unit_organisasi`
Menyimpan hierarki unit organisasi (OPD dan sub-unitnya).
- Self-referencing: id_atasan menunjuk ke unit organisasi parent
- level: 1=Pemerintah Daerah, 2=Dinas/Biro, 3=Bidang, 4=Sub-Bagian, dst
- is_opd: true jika ini OPD yang bisa mengajukan (bukan sub-unit)
- Catatan: Data dari file HierarkiUnor__6_.xlsx

#### `ref_jenis_jabatan`
Menyimpan kategori jenis jabatan: Struktural, Fungsional, Pelaksana.
- 3 record saja: "Struktural", "Fungsional", "Pelaksana"

#### `ref_jabatan_struktural`
Data jabatan struktural per unit organisasi.
- Dari file: Referensi-Jabatan-Struktural__6_.xlsx
- Fields: nama, unit_organisasi_id, eselon_id, bup (usia pensiun)
- Relasi: 1 unit organisasi bisa punya banyak jabatan struktural

#### `ref_jabatan_fungsional`
Data jabatan fungsional.
- Dari file: Referensi-Jabatan-Fungsional__2_.xlsx
- Fields: nama, jenjang (UT/AH/AM/AT/TR/PY), bup
- Catatan: Jabatan fungsional tidak terikat ke unit organisasi

#### `ref_jabatan_pelaksana`
Data jabatan pelaksana/tenaga pendukung.
- Dari file: Referensi-Jabatan-Pelaksana__2_.xlsx
- Fields: nama saja (simpel)

#### `ref_pendidikan`
Tingkat pendidikan: SMA, D3, S1, S2, S3, Profesi, dll.
- Master data statis, tidak sering berubah

#### `ref_bidang_pendidikan`
Bidang pendidikan (program studi): Teknik Informatika, Kedokteran, Hukum, dll.
- Dari file: Data_ASN_April_24.xlsx (kolom PENDIDIKAN NAMA)
- Fields: nama, tahun_lulus

#### `ref_agama`, `ref_status_kawin`, `ref_jenis_kelamin`
Data enum untuk pilihan: Islam/Kristen/Hindu/Budha/Konghucu, Menikah/Belum Menikah/Cerai, Laki-laki/Perempuan.
- ID sudah fixed dari SIASN

#### `ref_jenis_layanan` ⭐ PENTING
Master jenis layanan kepegawaian yang tersedia: KGB, Mutasi, Cuti, Tugas Belajar, Pemberhentian, dll.
- Fields:
  - kode: "KGB", "MUT", "CUTI", "TB", "PENS", dll
  - nama: "KGB Otomatis", "Mutasi", "Cuti Tahunan", dll
  - butuh_tte_kepala_badan: boolean (true jika perlu TTE Kepala Badan)
  - is_active: untuk disable layanan tertentu sementara

#### `ref_persyaratan_layanan`
Daftar dokumen yang diperlukan per jenis layanan.
- Relasi: 1 jenis layanan bisa punya banyak persyaratan
- Contoh: Untuk KGB diperlukan: SK Gaji Berkala, SK CPNS, Ijazah, KTP
- Digunakan oleh: Analis Pertama saat mengecek kelengkapan dokumen

---

### B. DATA ASN UTAMA (2 tabel)

#### `asn` ⭐ TABEL PALING PENTING
Master data setiap pegawai ASN.
- PK: id (UUID)
- Unique: nip_baru
- Dari file: Data_ASN_April_24.xlsx (8.379 baris)
- Fields major:
  - Personal: nama, tempat_lahir, tanggal_lahir, jenis_kelamin, agama, status_kawin, nik, hp, email, alamat
  - Status Kepegawaian: jenis_pegawai (PNS/PPPK), status_pegawai (Aktif/Cuti/Pensiun), kedudukan_hukum
  - CPNS & PNS: nomor_sk_cpns, tmt_cpns, nomor_sk_pns, tmt_pns
  - Golongan: golongan_id, tmt_golongan, mk_tahun, mk_bulan
  - Jabatan: jenis_jabatan_id, jabatan_struktural_id OR jabatan_fungsional_id OR jabatan_pelaksana_id, tmt_jabatan
  - Pendidikan: tingkat_pendidikan_id, bidang_pendidikan_id, tahun_lulus
  - Organisasi: unit_organisasi_id, lokasi_kerja
  - Validasi: nik_valid, flag_ikd (untuk data yang perlu diverifikasi)
  - Sinkronisasi: last_sync_siasn (kapan terakhir di-sync dari SIASN BKN)

**Index Penting:**
- PK: id
- UK: nip_baru
- idx_nama, idx_unit_organisasi, idx_golongan, idx_status_pegawai, idx_tmt_pns
- Composite: (status_pegawai, unit_organisasi_id)

**Relasi Foreign Key:**
- golongan_id → ref_golongan
- jenis_jabatan_id → ref_jenis_jabatan
- jabatan_struktural_id → ref_jabatan_struktural
- jabatan_fungsional_id → ref_jabatan_fungsional
- jabatan_pelaksana_id → ref_jabatan_pelaksana
- unit_organisasi_id → ref_unit_organisasi
- tingkat_pendidikan_id → ref_pendidikan
- bidang_pendidikan_id → ref_bidang_pendidikan

#### `asn_riwayat`
Log setiap perubahan data ASN.
- PK: id
- FK: asn_id
- Setiap kali Analis Muda update golongan, jabatan, unit, atau pendidikan → insert ke tabel ini
- Fields:
  - tipe_perubahan: "golongan", "jabatan", "unit_organisasi", "pendidikan"
  - data_lama: JSON (data sebelumnya)
  - data_baru: JSON (data sesudahnya)
  - keterangan: alasan perubahan
  - diubah_oleh: user_id siapa yang mengubah
  - createdAt: kapan berubah

**Gunanya:**
- Audit trail: bisa lihat siapa mengubah apa dan kapan
- Compliance: untuk verifikasi BKN
- Reconciliation: jika ada query tentang perubahan data ASN

---

### C. WORKFLOW LAYANAN KEPEGAWAIAN (4 tabel)

#### `usulan_layanan` ⭐ TABEL UTAMA WORKFLOW
Menyimpan setiap pengajuan layanan dari OPD.
- PK: id (UUID)
- UK: nomor_usulan (otomatis generate, misal: "SILAKAP-2026-0001")
- Dari OPD saat mereka klik "Buat Usulan Layanan"

**Status & Tahap:**
- status: "Draft" → "Diajukan" → "Proses_AP" → "Proses_AM" → "Proses_AD" → "Menunggu_Approval_Kabid" → "Approved_Kabid" → "Menunggu_TTE_Kepala_Badan" → "Selesai" OR "Ditolak" OR "Dikembalikan"
- tahap_saat_ini: "analis_pertama", "analis_muda", "analis_madya", "kabid", "kepala_badan"

**Timestamps per Tahap:**
- tgl_masuk_ap: kapan masuk ke Analis Pertama
- tgl_masuk_am: kapan masuk ke Analis Muda
- tgl_masuk_ad: kapan masuk ke Analis Madya
- tgl_masuk_kabid: kapan masuk ke Kabid
- tgl_masuk_kepala_badan: kapan masuk ke Kepala Badan
- tgl_selesai: kapan selesai

**Catatan per Tahap:**
- catatan_ap, catatan_am, catatan_ad, catatan_kabid, catatan_kepala_badan
- alasan_penolakan: jika ditolak

**Relasi FK:**
- jenis_layanan_id → ref_jenis_layanan
- asn_id → asn
- unit_organisasi_id → ref_unit_organisasi

**Index Penting:**
- (status, tahap_saat_ini) - untuk query antrian
- jenis_layanan_id, asn_id, unit_organisasi_id
- tgl_usulan - untuk filter berdasarkan tanggal

#### `usulan_dokumen`
Menyimpan file-file dokumen yang diupload untuk setiap usulan.
- FK: usulan_layanan_id
- Fields:
  - jenis_dokumen: "SK CPNS", "Ijazah", "KTP", "SK Gaji Berkala", dll
  - nama_file: "SK_CPNS_Budi.pdf"
  - path_file: "/uploads/usulan/2026/04/xxx.pdf"
  - versi: jika OPD re-upload dokumen, versi increment
  - upload_oleh: user_id yang upload

**Gunanya:**
- Menyimpan dokumen fisik yang diupload OPD
- Analis Pertama bisa download dari sini saat mengecek kelengkapan
- Tracking versi dokumen (jika ada revisi)

#### `usulan_workflow_log`
Log setiap perpindahan tahap dan aksi dalam workflow.
- PK: id
- FK: usulan_layanan_id
- Setiap kali ada "Teruskan", "Kembalikan", "Approve", "Reject", "TTE" → insert ke tabel ini
- Fields:
  - dari_tahap: "analis_pertama"
  - ke_tahap: "analis_muda"
  - aksi: "Teruskan", "Kembalikan", "Approve", "TTE"
  - dilakukan_oleh: user_id
  - catatan: keterangan singkat
  - createdAt: timestamp

**Gunanya:**
- Audit trail: bisa lihat history lengkap siapa ngapain di berkas ini
- SLA tracking: bisa hitung berapa lama di setiap tahap
- Compliance: untuk investigasi jika ada keluhan

#### `usulan_dokumen_output`
Menyimpan dokumen output yang dihasilkan (SK, Surat, Nota Dinas, dll).
- FK: usulan_layanan_id
- Fields:
  - jenis_dokumen: "SK", "Surat Persetujuan", "Nota Dinas"
  - nomor_dokumen: "821.3.PD/151-PEG/TT/2002"
  - tanggal_dokumen: tanggal SK/Surat
  - path_file: lokasi file dokumen final
  - tte_oleh: user_id yang menandatangani digital
  - tgl_tte: kapan di-TTE
  - status_tte: "Draft" → "TTE_Kabid" → "TTE_Kepala_Badan" → "Selesai"

**Gunanya:**
- Menyimpan dokumen final yang dihasilkan
- Tracking TTE: siapa yang TTE dan kapan
- OPD bisa download dokumen final dari sini
- Untuk sinkronisasi ke SIASN/BKN

---

### D. PENGGUNA & ROLE (3 tabel)

#### `user`
Menyimpan akun pengguna sistem.
- PK: id (UUID)
- UK: username, email
- Fields:
  - username: "budi.santoso"
  - password_hash: bcrypt hash
  - nama_lengkap: "Budi Santoso"
  - email: "budi@bkd.go.id"
  - nomor_hp: "+62812345678"
  - unit_organisasi_id: OPD tempat user bekerja (jika OPD) atau Bidang Kepegawaian (jika staf)
  - asn_id: link ke tabel asn (jika user adalah ASN)
  - role_id: FK ke tabel role
  - is_active: untuk non-aktifkan user tanpa delete
  - last_login: kapan terakhir login
  - password_changed_at: tracking password change

**User yang ada:**
- Pengelola OPD (per OPD, bisa 1-3 orang)
- Analis Pertama (staf bidang kepegawaian)
- Analis Muda (staf bidang kepegawaian)
- Analis Madya (staf bidang kepegawaian)
- Kabid (Kepala Bidang Kepegawaian)
- Kepala Badan
- Admin Sistem

#### `role`
Master role/jabatan dalam sistem.
- PK: id
- Record: "Pengelola_OPD", "Analis_Pertama", "Analis_Muda", "Analis_Madya", "Kabid", "Kepala_Badan", "Admin_Sistem"

#### `role_permission`
Master permission per role untuk setiap module.
- PK: id
- UK: (role_id, module, permission)
- Fields:
  - module: "Layanan_Kepegawaian", "Data_ASN", "Perencanaan_Pengadaan", "Dashboard", dll
  - permission: "view", "create", "edit", "delete", "approve", "tte"

**Contoh:**
- role: "Analis_Pertama", module: "Layanan_Kepegawaian", permission: "view_antrian"
- role: "Kabid", module: "Layanan_Kepegawaian", permission: "approve"
- role: "Kepala_Badan", module: "Layanan_Kepegawaian", permission: "tte"

---

### E. NOTIFIKASI & LAPORAN (3 tabel)

#### `notifikasi`
Menyimpan notifikasi untuk setiap user.
- FK: user_id
- Fields:
  - type: "berkas_baru", "berkas_dikembalikan", "berkas_approval", "sla_warning", "laporan_harian", dll
  - judul: "Berkas KGB Budi Santoso Masuk Antrian Anda"
  - isi: detail notifikasi
  - link: "/usulan_layanan/xxx" (link untuk buka berkas)
  - is_read: boolean
  - read_at: kapan dibaca

**Gunanya:**
- Real-time notification untuk user
- Notifikasi disimpan untuk bisa dilihat lagi
- Bisa dihapus atau di-mark sebagai read

#### `laporan_harian`
Menyimpan snapshot laporan harian yang di-generate otomatis.
- PK: id
- UK: tanggal_laporan (satu record per hari)
- Fields:
  - usulan_masuk: berapa berkas masuk hari ini
  - usulan_selesai: berapa berkas selesai hari ini
  - usulan_dikembalikan: berapa berkas dikembalikan hari ini
  - melampaui_sla: berapa berkas yang melampaui SLA hari ini
  - rata_rata_proses_hari: rata-rata hari proses keseluruhan
  - data_json: detail per staf (siapa proses berapa, dll)
  - generated_at: kapan laporan di-generate
  - sent_at: kapan laporan dikirim ke Kabid

**Gunanya:**
- Menyimpan history laporan harian
- Kabid bisa lihat laporan hari kemarin, seminggu lalu, dll
- Basis untuk laporan bulanan

#### `laporan_bulanan`
Laporan agregat bulanan.
- PK: id
- UK: (tahun, bulan)
- Fields:
  - total_layanan_selesai: total berkas selesai bulan ini
  - capaian_sla_percent: berapa % berkas on-time
  - melampaui_sla_count: berapa berkas melampaui SLA
  - data_json: detail agregat:
    - per_jenis_layanan: tabel KGB 32, Mutasi 18, Cuti 25, dll
    - per_opd: Dinas Pendidikan 45, Dinas Kesehatan 30, dll
    - produktivitas_staf: Budi 8, Sari 10, Hendra 7, dll
  - generated_at: kapan laporan di-generate

**Gunanya:**
- Laporan untuk Kepala Badan di akhir bulan
- Basis untuk keputusan strategis (perlu tambah staf? Perlu training?)
- Compliance reporting

---

### F. KONFIGURASI SISTEM (4 tabel)

#### `config_sla`
Master SLA per jenis layanan per jabatan.
- PK: id
- UK: (jenis_layanan_id, jabatan)
- Fields:
  - jabatan: "analis_pertama", "analis_muda", "analis_madya", "kabid"
  - sla_hari: contoh 1, 2, 2, 1
  - sla_jam: jam tambahan (opsional)
  - eskalasi_hari: kapan eskalasi dimulai (misal: 2 jam sebelum SLA habis)

**Contoh:**
- KGB untuk Analis Pertama: 1 hari
- KGB untuk Analis Muda: 2 hari
- Mutasi untuk Analis Madya: 2 hari
- Pemberhentian untuk Kabid: 1 hari (cepat karena sudah diverifikasi)

#### `config_notifikasi`
Master konfigurasi notifikasi otomatis.
- PK: id
- Fields:
  - event_type: "berkas_baru", "sla_warning", "laporan_harian", etc
  - channel: "in_app", "email", "whatsapp"
  - penerima_role: "Analis_Pertama", "Kabid", "Semua_Staf", dll
  - template_message: template SMS/email
  - is_active: enable/disable notifikasi

**Contoh:**
- event: "berkas_baru", channel: "in_app", penerima: "Analis_Pertama", template: "Berkas {asn_nama} - {layanan_nama} masuk antrian Anda"
- event: "sla_warning", channel: "email", penerima: "Kabid", template: "Berkas {nomor_usulan} akan melampaui SLA dalam 2 jam"

#### `config_laporan_otomatis`
Master konfigurasi pengiriman laporan otomatis.
- PK: id
- Fields:
  - jenis_laporan: "harian", "bulanan"
  - jadwal_pengiriman: cron expression (contoh: "0 16 * * *" = setiap hari jam 16:00)
  - format_laporan: "html", "pdf", "excel"
  - penerima_role: "Kabid", "Kepala_Badan"
  - is_active: enable/disable
  - last_sent: kapan terakhir dikirim

**Contoh:**
- Laporan harian dikirim Kabid: jam 16:00 (saat kerja selesai), format HTML + email
- Laporan bulanan dikirim Kepala Badan: hari 1 bulan berikutnya jam 08:00, format PDF + email

#### `audit_log`
Log setiap aksi penting untuk compliance dan security.
- PK: id
- Fields:
  - user_id: siapa yang aksi
  - action: "create_usulan", "approve_kabid", "tte_kepala_badan", "update_golongan", "delete_dokumen"
  - entity_type: "usulan_layanan", "asn", "user"
  - entity_id: ID yang diaksi
  - old_values, new_values: JSON untuk tracking perubahan
  - ip_address, user_agent: dari mana user aksi (security)

**Gunanya:**
- Compliance: untuk audit internal dan eksternal
- Security: untuk detect aktivitas mencurigakan
- Dispute resolution: jika ada keluhan tentang data berubah

---

### G. VIEWS (3 view)

#### `vw_calon_pensiun_bup`
View untuk melihat siapa saja ASN yang akan BUP dalam 2 tahun ke depan.
- Fields: nip, nama, usia_sekarang, bup_limit, tahun_hingga_bup, tanggal_bup, unit_organisasi
- Gunanya: Notifikasi otomatis ke OPD, perencanaan penggantian posisi

#### `vw_statistik_layanan_bulanan`
View untuk laporan bulanan per jenis layanan.
- Fields: tahun, bulan, jenis_layanan, jumlah_usulan, jumlah_selesai, rata_rata_proses, melampaui_sla
- Gunanya: Dashboard Kepala Badan, analisis tren

#### `vw_antrian_per_tahap`
View untuk melihat berapa banyak antrian di setiap tahap verifikasi.
- Fields: tahap, jumlah_antrian
- Gunanya: Dashboard Kabid, untuk redistribute beban kerja

---

## 3. RELASI ANTAR TABEL (FOREIGN KEY)

```
ref_golongan
  ↑
  ├── ref_gaji_pokok (golongan_id)
  └── asn (golongan_id)

ref_unit_organisasi
  ├── asn (unit_organisasi_id)
  ├── ref_jabatan_struktural (unit_organisasi_id)
  ├── user (unit_organisasi_id)
  ├── usulan_layanan (unit_organisasi_id)
  └── asn_riwayat (implicit, via asn_id)

ref_jenis_jabatan
  └── asn (jenis_jabatan_id)

ref_jabatan_struktural
  └── asn (jabatan_struktural_id)

ref_jabatan_fungsional
  └── asn (jabatan_fungsional_id)

ref_jabatan_pelaksana
  └── asn (jabatan_pelaksana_id)

asn
  ├── asn_riwayat (asn_id)
  ├── user (asn_id)
  ├── usulan_layanan (asn_id)
  ├── (ref_golongan, ref_jenis_jabatan, ref_unit_organisasi, dll)

usulan_layanan
  ├── usulan_dokumen (usulan_layanan_id)
  ├── usulan_workflow_log (usulan_layanan_id)
  ├── usulan_dokumen_output (usulan_layanan_id)
  ├── asn (asn_id)
  ├── unit_organisasi (unit_organisasi_id)
  └── ref_jenis_layanan (jenis_layanan_id)

ref_jenis_layanan
  ├── usulan_layanan (jenis_layanan_id)
  ├── ref_persyaratan_layanan (jenis_layanan_id)
  └── config_sla (jenis_layanan_id)

role
  ├── user (role_id)
  └── role_permission (role_id)

user
  ├── notifikasi (user_id)
  ├── usulan_workflow_log (dilakukan_oleh)
  ├── asn_riwayat (diubah_oleh)
  ├── usulan_dokumen (upload_oleh)
  └── usulan_dokumen_output (tte_oleh)
```

---

## 4. INDEXING STRATEGY

### Indeks Kritis (Harus Ada)
```
-- Workflow & antrian
usulan_layanan: (status, tahap_saat_ini)
usulan_layanan: (unit_organisasi_id, tanggal_usulan)
usulan_workflow_log: (usulan_layanan_id, createdAt)

-- ASN & Data
asn: (status_pegawai, unit_organisasi_id)
asn: (tmt_pns, golongan_id)
asn_riwayat: (asn_id, tipe_perubahan, createdAt)

-- User & Notifikasi
notifikasi: (user_id, is_read, createdAt)
user: (unit_organisasi_id, is_active)
```

### Indeks untuk Performa Dashboard
```
-- Per OPD
usulan_layanan: (unit_organisasi_id, status)

-- Per Staf (untuk tracking beban kerja)
usulan_workflow_log: (dilakukan_oleh, createdAt)

-- Laporan
laporan_harian: (tanggal_laporan)
laporan_bulanan: (tahun, bulan)
```

---

## 5. MIGRATION STRATEGY

### Phase 1: Setup Master Data (Week 1)
```sql
INSERT INTO ref_golongan (kode, nama, roman, tingkat)
-- Import dari SIASN

INSERT INTO ref_unit_organisasi (id, nama, id_atasan, level, is_opd)
-- Import dari HierarkiUnor__6_.xlsx

INSERT INTO ref_jenis_jabatan (nama)
VALUES ('Struktural'), ('Fungsional'), ('Pelaksana')

INSERT INTO ref_jabatan_struktural
-- Import dari Referensi-Jabatan-Struktural__6_.xlsx

INSERT INTO ref_jabatan_fungsional
-- Import dari Referensi-Jabatan-Fungsional__2_.xlsx

INSERT INTO ref_jabatan_pelaksana
-- Import dari Referensi-Jabatan-Pelaksana__2_.xlsx

INSERT INTO ref_gaji_pokok
-- Sudah ada, tinggal verify
```

### Phase 2: Load ASN Data (Week 1-2)
```sql
INSERT INTO asn (nip_baru, nama, golongan_id, unit_organisasi_id, ...)
-- Import dari Data_ASN_April_24.xlsx (8.379 records)
```

### Phase 3: Setup Users & Permissions (Week 2)
```sql
INSERT INTO role (nama) VALUES
  ('Pengelola_OPD'),
  ('Analis_Pertama'),
  ('Analis_Muda'),
  ('Analis_Madya'),
  ('Kabid'),
  ('Kepala_Badan'),
  ('Admin_Sistem')

INSERT INTO user (username, email, nama_lengkap, role_id, unit_organisasi_id)
-- Create setiap user per OPD dan staf bidang kepegawaian
```

### Phase 4: Setup Konfigurasi (Week 2-3)
```sql
INSERT INTO config_sla (jenis_layanan_id, jabatan, sla_hari)

INSERT INTO config_notifikasi (event_type, channel, template_message)

INSERT INTO config_laporan_otomatis (jenis_laporan, jadwal_pengiriman, penerima_role)
```

---

## 6. QUERY EXAMPLES UNTUK DEVELOPMENT

### Dashboard OPD - Lihat Status Pengajuan
```sql
SELECT 
  u.nomor_usulan,
  u.tanggal_usulan,
  jl.nama as jenis_layanan,
  a.nama as nama_asn,
  u.status,
  u.tahap_saat_ini,
  CASE 
    WHEN u.status = 'Ditolak' THEN 'Dikembalikan'
    WHEN u.tgl_selesai IS NOT NULL THEN DATEDIFF(u.tgl_selesai, u.tanggal_usulan)
    ELSE DATEDIFF(NOW(), u.tanggal_usulan)
  END as hari_proses
FROM usulan_layanan u
JOIN ref_jenis_layanan jl ON u.jenis_layanan_id = jl.id
JOIN asn a ON u.asn_id = a.id
WHERE u.unit_organisasi_id = '{opd_id}'
ORDER BY u.tanggal_usulan DESC
```

### Dashboard Analis - Antrian Verifikasi
```sql
SELECT 
  u.nomor_usulan,
  u.tanggal_usulan,
  a.nama,
  a.nip_baru,
  jl.nama as jenis_layanan,
  DATEDIFF(DATE_ADD(u.tgl_masuk_am, INTERVAL cs.sla_hari DAY), NOW()) as sisa_hari_sla
FROM usulan_layanan u
JOIN asn a ON u.asn_id = a.id
JOIN ref_jenis_layanan jl ON u.jenis_layanan_id = jl.id
LEFT JOIN config_sla cs ON jl.id = cs.jenis_layanan_id AND cs.jabatan = 'analis_muda'
WHERE u.tahap_saat_ini = 'analis_muda'
  AND u.status NOT IN ('Selesai', 'Ditolak')
ORDER BY sisa_hari_sla ASC
```

### Dashboard Kabid - Beban Kerja Staf
```sql
SELECT 
  u.username,
  u.nama_lengkap,
  COUNT(CASE WHEN u.tahap_saat_ini = 'analis_pertama' THEN 1 END) as antrian_ap,
  COUNT(CASE WHEN u.tahap_saat_ini = 'analis_muda' THEN 1 END) as antrian_am,
  COUNT(CASE WHEN u.tahap_saat_ini = 'analis_madya' THEN 1 END) as antrian_ad,
  COUNT(CASE WHEN ul.status = 'Selesai' AND MONTH(ul.tgl_selesai) = MONTH(NOW()) THEN 1 END) as selesai_bulan_ini
FROM user u
LEFT JOIN usulan_layanan ul ON u.id = ul.dilakukan_oleh OR ...
WHERE u.role_id IN (SELECT id FROM role WHERE nama IN ('Analis_Pertama', 'Analis_Muda', 'Analis_Madya'))
GROUP BY u.id
ORDER BY (antrian_ap + antrian_am + antrian_ad) DESC
```

### Calon Pensiun BUP
```sql
SELECT * FROM vw_calon_pensiun_bup
WHERE tahun_hingga_bup <= 2
ORDER BY tanggal_bup ASC
```

---

## 7. PERFORMANCE TIPS

### Untuk sistem dengan 8.000+ ASN
1. **Partition tabel besar**: `usulan_layanan`, `asn_riwayat`, `usulan_workflow_log` bisa di-partition by tahun
2. **Archive old data**: workflow yang sudah selesai >1 tahun bisa di-move ke tabel archive
3. **Denormalisasi untuk laporan**: buat tabel summary harian/bulanan yang pre-calculated
4. **Cache notifikasi**: gunakan Redis untuk cache antrian real-time

### Monitoring Queries
```sql
-- Monitor index usage
SELECT * FROM sys.schema_unused_indexes;

-- Slow queries
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

---

## 8. DATA INTEGRITY RULES

1. **Golongan & Masa Kerja**: Tidak boleh ada ASN dengan golongan lebih rendah dari golongan sebelumnya
2. **TMT (Tanggal Mulai Tugas)**: TMT jabatan tidak boleh sebelum TMT PNS
3. **Usia Pensiun**: Notifikasi otomatis jika usia mendekati BUP
4. **Unit Organisasi**: Tidak boleh ada sirkular reference (A menunjuk B, B menunjuk A)
5. **SLA**: Jangan ada berkas yang stuck >30 hari tanpa aktivitas

---

End of Documentation
