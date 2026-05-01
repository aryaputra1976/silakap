# 📱 MENU SIDEBAR LENGKAP SILAKAP

## STRUKTUR MENU HIERARCHY & SUB-MENU

Dokumentasi lengkap struktur sidebar untuk setiap role dengan permission dan akses detail.

---

## 1️⃣ MENU SIDEBAR - PENGELOLA OPD (OPD User)

**Role**: `Pengelola_OPD`  
**Akses**: Hanya data unit organisasi sendiri  
**Hak**: View, Create usulan, Upload dokumen, Download hasil

```
SILAKAP - Dashboard OPD
├─ 📊 DASHBOARD
│  └─ Dashboard OPD (ringkasan pengajuan aktif, dikembalikan, menunggu)
│
├─ 📋 LAYANAN KEPEGAWAIAN
│  ├─ Buat Usulan Layanan (form wizard)
│  ├─ Draft Saya (list draft belum diajukan)
│  ├─ Pengajuan Aktif (sedang diproses, status real-time)
│  ├─ Berkas Dikembalikan (perlu revisi, lihat catatan)
│  ├─ Riwayat Selesai (sudah completed)
│  └─ Download Hasil (SK, Surat, Dokumen final)
│
├─ 👥 DATA ASN
│  ├─ Daftar ASN (search by NIP/nama, lihat profil)
│  ├─ Export Data ASN (ke Excel/PDF)
│  └─ Validasi Data Mandiri (cek NIK, format)
│
├─ 📞 NOTIFIKASI & INBOX
│  ├─ Inbox (pesan dari Bidang Kepegawaian)
│  ├─ Notifikasi (berkas dikembalikan, siap download)
│  └─ Arsip Notifikasi
│
├─ ⚙️ PENGATURAN (Limited)
│  ├─ Profil Organisasi (lihat info OPD)
│  └─ Kontak & Alamat
│
└─ ❓ BANTUAN
   ├─ User Manual OPD
   ├─ FAQ & Troubleshooting
   └─ Contact Helpdesk
```

**Total Menu Items**: 18 items

---

## 2️⃣ MENU SIDEBAR - ANALIS PERTAMA (Bidang Kepegawaian Staf)

**Role**: `Analis_Pertama`  
**Akses**: Semua pengajuan dari semua OPD  
**Hak**: View, Verify kelengkapan, Kembalikan/Teruskan, Lihat catatan

```
SILAKAP - Analis Pertama
├─ 📊 DASHBOARD
│  └─ Dashboard Analis Pertama (antrian hari ini, SLA countdown, beban kerja)
│
├─ 📋 LAYANAN KEPEGAWAIAN
│  ├─ 🔴 Antrian Verifikasi (berkas yang perlu dicek kelengkapan)
│  │  ├─ Hari Ini (filter by date)
│  │  ├─ Minggu Ini
│  │  ├─ Overdue (melampaui SLA)
│  │  └─ Selesai Hari Ini (sudah dicek)
│  │
│  ├─ 📝 Verifikasi (form cek kelengkapan)
│  │  ├─ Checklist dokumen persyaratan
│  │  ├─ Catatan masalah & perbaikan
│  │  └─ Tombol: Teruskan ke Analis Muda / Kembalikan ke OPD
│  │
│  ├─ 📊 Statistik Pekerjaan Saya
│  │  ├─ Berapa diproses hari ini
│  │  ├─ Berapa diselesaikan hari ini
│  │  ├─ Berapa dikembalikan hari ini
│  │  └─ Rata-rata waktu per berkas
│  │
│  └─ 📄 Riwayat Verifikasi
│     ├─ List berkas yang sudah dicek (selesai/returned)
│     └─ Detail hasil per berkas
│
├─ 👥 DATA ASN
│  ├─ Cari ASN (search by NIP/nama, lihat profil lengkap)
│  ├─ Data Per Unit Organisasi (browse OPD → ASN → detail)
│  └─ Export Data ASN (ke Excel/PDF)
│
├─ 🔔 NOTIFIKASI & INBOX
│  ├─ Inbox (pesan dari supervisor/admin)
│  ├─ Notifikasi (berkas baru masuk, SLA warning)
│  └─ Arsip Notifikasi
│
├─ 📖 REFERENSI
│  ├─ Jenis Layanan (list layanan yang bisa diproses)
│  ├─ Persyaratan Layanan (dokumen apa saja per jenis)
│  ├─ Unit Organisasi (hierarki OPD)
│  └─ Pangkat & Golongan (untuk reference)
│
├─ ⚙️ PENGATURAN (Very Limited)
│  └─ Preferensi Notifikasi (email/SMS on/off)
│
└─ ❓ BANTUAN
   ├─ User Manual Analis
   ├─ Video Tutorial Verifikasi
   └─ Contact Supervisor
```

**Total Menu Items**: 25 items

---

## 3️⃣ MENU SIDEBAR - ANALIS MUDA (Bidang Kepegawaian Staf)

**Role**: `Analis_Muda`  
**Akses**: Semua pengajuan yang sudah lolos AP  
**Hak**: Verifikasi data SIASN, Hitung kelayakan, Kembalikan/Teruskan, Input rekomendasi

```
SILAKAP - Analis Muda
├─ 📊 DASHBOARD
│  └─ Dashboard Analis Muda (antrian, SLA timer, beban kerja, performa bulanan)
│
├─ 📋 LAYANAN KEPEGAWAIAN
│  ├─ 🔴 Antrian Verifikasi Substansi
│  │  ├─ Hari Ini (filter by date, SLA countdown)
│  │  ├─ Minggu Ini
│  │  ├─ Overdue SLA (merah, urgent)
│  │  ├─ Selesai Hari Ini
│  │  └─ Reject Counter (lihat berapa kali dikembalikan)
│  │
│  ├─ 📝 Verifikasi Data ASN
│  │  ├─ Cek SIASN (data ASN sesuai BKN?)
│  │  ├─ Hitung Masa Kerja (dari TMT PNS)
│  │  ├─ Hitung Kelayakan (golongan, masa kerja sesuai aturan?)
│  │  ├─ Input Rekomendasi Teknis (form text)
│  │  └─ Tombol: Teruskan ke Analis Madya / Kembalikan ke AP atau OPD
│  │
│  ├─ 📊 Statistik Pekerjaan Saya
│  │  ├─ Diproses hari ini
│  │  ├─ Diselesaikan hari ini
│  │  ├─ Dikembalikan hari ini
│  │  ├─ Total diselesaikan bulan ini
│  │  └─ Rata-rata waktu per berkas
│  │
│  └─ 📄 Riwayat Verifikasi
│     ├─ List berkas yang sudah diverifikasi
│     └─ Detail hasil & rekomendasi per berkas
│
├─ 👥 DATA ASN
│  ├─ Cari ASN (search, lihat profil lengkap + riwayat)
│  ├─ Data Per Unit Organisasi (browse)
│  ├─ Sinkronisasi SIASN (lihat status last sync)
│  └─ Export Data ASN
│
├─ 📖 REFERENSI
│  ├─ Jenis Layanan & Persyaratan Kelayakan
│  ├─ Unit Organisasi
│  ├─ Pangkat & Golongan (dengan SLA update info)
│  ├─ Pendidikan & Jenjang
│  └─ SIASN Integration Status (last sync time)
│
├─ 🔔 NOTIFIKASI & INBOX
│  ├─ Inbox (pesan dari Kabid, Analis Madya)
│  ├─ Notifikasi (berkas baru, SLA warning, catatan Madya)
│  └─ Arsip Notifikasi
│
├─ ⚙️ PENGATURAN (Limited)
│  └─ Preferensi Notifikasi
│
└─ ❓ BANTUAN
   ├─ User Manual Analis Muda
   ├─ Video Tutorial Verifikasi & Hitung Kelayakan
   └─ Contact Supervisor / Kabid
```

**Total Menu Items**: 26 items

---

## 4️⃣ MENU SIDEBAR - ANALIS MADYA (Bidang Kepegawaian Staf)

**Role**: `Analis_Madya`  
**Akses**: Semua pengajuan untuk final QC  
**Hak**: Quality control, Susun rekomendasi, Draft SK/Surat, Approve/Reject, Persetujuan, Teruskan ke Kabid

```
SILAKAP - Analis Madya
├─ 📊 DASHBOARD
│  └─ Dashboard Analis Madya (antrian QC, SLA timer, draft dokumen pending, statistik)
│
├─ 📋 LAYANAN KEPEGAWAIAN
│  ├─ 🔴 Antrian Quality Control
│  │  ├─ Hari Ini (SLA 2 hari countdown)
│  │  ├─ Minggu Ini
│  │  ├─ Overdue SLA (urgent)
│  │  └─ Selesai Hari Ini
│  │
│  ├─ 📝 Quality Control & Rekomendasi
│  │  ├─ Review hasil dari Analis Muda (lihat hasil verifikasi)
│  │  ├─ Form QC Checklist
│  │  │  ├─ Data konsisten semua sheet?
│  │  │  ├─ Rekomendasi Muda sudah benar?
│  │  │  └─ Adakah pertimbangan lain?
│  │  ├─ Input Rekomendasi Final (form text panjang)
│  │  ├─ Draft Dokumen Output
│  │  │  ├─ Pilih template SK/Surat sesuai layanan
│  │  │  ├─ Preview SK dengan data ASN
│  │  │  └─ Save draft
│  │  └─ Tombol: Teruskan ke Kabid / Kembalikan ke Analis Muda
│  │
│  ├─ 📄 Draft Dokumen (Draft SK/Surat yang sedang dibuat)
│  │  ├─ List draft pending approval
│  │  ├─ Edit draft
│  │  ├─ Preview final
│  │  └─ Kirim ke Kabid untuk approval
│  │
│  ├─ 📊 Statistik Pekerjaan Saya
│  │  ├─ Diproses hari ini
│  │  ├─ Diselesaikan hari ini
│  │  ├─ Draft pending (menunggu Kabid)
│  │  ├─ Dikembalikan hari ini
│  │  └─ Total bulan ini
│  │
│  └─ 📄 Riwayat QC & Rekomendasi
│     ├─ List berkas yang sudah di-QC
│     └─ Detail rekomendasi & dokumen final per berkas
│
├─ 👥 DATA ASN
│  ├─ Cari ASN (search, profil lengkap, riwayat lengkap)
│  ├─ Peremajaan Data (update ASN yg salah tanpa workflow)
│  │  ├─ Buat Permintaan Peremajaan (form: ASN, jenis perubahan, dokumen)
│  │  ├─ Approve Peremajaan dari OPD (list pending)
│  │  └─ Riwayat Peremajaan (sudah done)
│  ├─ Export Data ASN
│  └─ Data Per Unit Organisasi
│
├─ 📖 REFERENSI
│  ├─ Jenis Layanan & Persyaratan
│  ├─ Unit Organisasi (hierarki)
│  ├─ Jabatan Struktural/Fungsional/Pelaksana
│  ├─ Pangkat & Golongan
│  ├─ Pendidikan & Jenjang
│  ├─ Template Dokumen (SK, Surat, Nota Dinas)
│  └─ SIASN Integration Status
│
├─ 🔔 NOTIFIKASI & INBOX
│  ├─ Inbox (pesan dari Kabid, Kepala Badan)
│  ├─ Notifikasi (berkas baru, SLA warning, approval hasil)
│  └─ Arsip Notifikasi
│
├─ ⚙️ PENGATURAN (Limited)
│  └─ Preferensi Notifikasi
│
└─ ❓ BANTUAN
   ├─ User Manual Analis Madya
   ├─ Video Tutorial QC & Buat Dokumen
   └─ Contact Kabid
```

**Total Menu Items**: 28 items

---

## 5️⃣ MENU SIDEBAR - KEPALA BIDANG KEPEGAWAIAN (Kabid)

**Role**: `Kabid`  
**Akses**: Semua pengajuan, monitoring staf sendiri  
**Hak**: Approve/TTE dokumen, Monitor SLA, Lihat performa staf, Laporan harian

```
SILAKAP - Kepala Bidang
├─ 📊 DASHBOARD
│  └─ Dashboard Kabid (metrics: menunggu approval, melampaui SLA, beban kerja staf)
│
├─ 📋 LAYANAN KEPEGAWAIAN - APPROVAL
│  ├─ 🔴 Antrian Approval (dokumen dari Analis Madya siap TTE Kabid)
│  │  ├─ Hari Ini (SLA 1 hari countdown)
│  │  ├─ Minggu Ini
│  │  ├─ Overdue SLA (urgent - red)
│  │  └─ Sudah Diapprove Hari Ini
│  │
│  ├─ 📝 Approval & Tandatangan
│  │  ├─ Lihat rekomendasi dari Analis Madya
│  │  ├─ Preview dokumen final (SK/Surat)
│  │  ├─ Check: Apakah perlu TTE Kepala Badan atau bisa langsung final?
│  │  │  ├─ Jika SK Pemberhentian/Mutasi Strategis/Usulan Formasi → TTE KB
│  │  │  └─ Jika KGB, Cuti, TB, Mutasi rutin → TTE Kabid saja = Final
│  │  ├─ Input catatan (opsional)
│  │  └─ Tombol: TTE Tandatangan / Kembalikan ke Analis Madya
│  │
│  ├─ 📊 Monitoring SLA Per Tahap
│  │  ├─ Berapa melampaui SLA dari AP
│  │  ├─ Berapa melampaui SLA dari AM
│  │  ├─ Berapa melampaui SLA dari AD
│  │  └─ Action: Tekan staf yang lamban, eskalasi ke atasan
│  │
│  └─ 📊 Monitoring Beban Kerja Staf
│     ├─ List per staf: Analis Pertama, Analis Muda, Analis Madya
│     ├─ Per staf: Antrian hari ini, Selesai hari ini, Rata-rata waktu, Overdue count
│     └─ Identifikasi staf yang bottleneck → redistribute workload
│
├─ 📄 LAPORAN & MONITORING
│  ├─ 📊 Dashboard Harian (metrics real-time)
│  │  ├─ Berkas masuk hari ini (per jenis layanan)
│  │  ├─ Berkas selesai hari ini
│  │  ├─ Berkas dikembalikan hari ini
│  │  ├─ Melampaui SLA hari ini (count)
│  │  ├─ Rata-rata proses hari ini
│  │  └─ Per staf breakdown
│  │
│  ├─ 📋 Laporan Harian Otomatis (sent 16:00 daily)
│  │  ├─ Lihat laporan kemarin, minggu lalu, bulan lalu
│  │  ├─ Download PDF/Excel
│  │  └─ Forward ke Kepala Badan (manual)
│  │
│  ├─ 📊 Laporan Bulanan
│  │  ├─ Total layanan selesai
│  │  ├─ Capaian SLA %
│  │  ├─ Tren per jenis layanan
│  │  ├─ Produktivitas per staf
│  │  ├─ Performa per OPD
│  │  └─ Download PDF/Excel
│  │
│  └─ 📈 Analytics & Trend
│     ├─ SLA trend (bulanan, quarterly)
│     ├─ Throughput trend (berapa berkas per hari/minggu)
│     ├─ Bottleneck analysis (tahap mana yang lambat)
│     └─ OPD ranking (OPD mana paling banyak pengajuan)
│
├─ 👥 DATA ASN
│  ├─ Cari ASN (search, profil lengkap)
│  ├─ Data Per Unit Organisasi
│  ├─ Export Data ASN
│  └─ Sinkronisasi SIASN (lihat status, last sync time)
│
├─ 📖 REFERENSI
│  ├─ Jenis Layanan & Persyaratan
│  ├─ Unit Organisasi
│  ├─ Jabatan & Golongan
│  ├─ Template Dokumen
│  └─ SLA Configuration (readonly)
│
├─ ⚙️ PENGATURAN (Limited)
│  ├─ Preferensi Notifikasi
│  └─ Laporan Otomatis Schedule (edit waktu pengiriman)
│
├─ 🔔 NOTIFIKASI & INBOX
│  ├─ Inbox (pesan dari Kepala Badan, sistem)
│  ├─ Notifikasi (SLA warning, laporan ready, approval results)
│  └─ Arsip
│
└─ ❓ BANTUAN
   ├─ User Manual Kabid
   └─ Contact Kepala Badan / Admin
```

**Total Menu Items**: 30 items

---

## 6️⃣ MENU SIDEBAR - KEPALA BADAN (Pimpinan Tertinggi)

**Role**: `Kepala_Badan`  
**Akses**: Semua data, laporan agregat  
**Hak**: TTE final untuk dokumen tertentu, lihat laporan bulanan, monitoring eksekutif

```
SILAKAP - Kepala Badan (Eksekutif)
├─ 📊 DASHBOARD EKSEKUTIF
│  └─ Dashboard Kepala Badan (KPI bulanan, capaian SLA, tren, dokumen TTE pending)
│
├─ 📋 LAYANAN KEPEGAWAIAN - TTE FINAL
│  ├─ 🔴 Dokumen Menunggu TTE Kepala Badan
│  │  ├─ List dokumen dari Kabid (SK Pemberhentian, SK Mutasi Strategis, Usulan Formasi)
│  │  ├─ Per dokumen: ASN nama, jenis SK, tanggal dibuat, status approval
│  │  ├─ Preview dokumen final
│  │  └─ Tombol: TTE Tandatangan / Tolak (sangat jarang)
│  │
│  └─ 📄 Riwayat Dokumen TTE
│     ├─ List dokumen yang sudah TTE Kepala Badan
│     ├─ Tanggal TTE, jenis dokumen
│     └─ Status pengiriman ke OPD/Pusat
│
├─ 📄 LAPORAN & MONITORING EKSEKUTIF
│  ├─ 📊 Dashboard Bulanan (KPI agregat)
│  │  ├─ Total layanan selesai bulan ini
│  │  ├─ Capaian SLA %
│  │  ├─ Melampaui SLA count
│  │  ├─ Rata-rata proses hari
│  │  ├─ OPD paling aktif (ranking)
│  │  ├─ Jenis layanan tren
│  │  └─ Notifikasi calon pensiun (BUP dalam 2 tahun)
│  │
│  ├─ 📋 Laporan Bulanan Terkirim
│  │  ├─ Lihat laporan bulan lalu, quarter lalu, tahun lalu
│  │  ├─ Download PDF/Excel
│  │  └─ Forward/share ke stakeholder
│  │
│  ├─ 📈 Analytics Trend
│  │  ├─ Trend SLA capaian (12 bulan)
│  │  ├─ Trend throughput (berkas per bulan)
│  │  ├─ Trend per jenis layanan (line chart)
│  │  └─ Calon pensiun trend (jumlah per tahun ke depan)
│  │
│  └─ 🎯 Calon Pensiun & BUP Tracking
│     ├─ List ASN approaching BUP (dalam 2 tahun ke depan)
│     ├─ Per ASN: nama, NIP, tanggal lahir, BUP, jabatan, unit
│     └─ Export untuk perencanaan penggantian
│
├─ ⚙️ PENGATURAN (Very Limited)
│  ├─ Preferensi Notifikasi
│  └─ Jadwal Laporan Otomatis (readonly)
│
├─ 🔔 NOTIFIKASI & INBOX
│  ├─ Inbox (pesan dari Kabid, sistem)
│  ├─ Notifikasi (dokumen menunggu TTE, laporan ready, alert calon pensiun)
│  └─ Arsip
│
└─ ❓ BANTUAN
   ├─ User Manual Kepala Badan
   └─ Contact Admin
```

**Total Menu Items**: 16 items (eksekutif, simplified)

---

## 7️⃣ MENU SIDEBAR - ADMIN SISTEM

**Role**: `Admin_Sistem`  
**Akses**: FULL SYSTEM ACCESS  
**Hak**: Manage users, roles, permissions, settings, integrasi data, audit log

```
SILAKAP - Admin Sistem
├─ 📊 DASHBOARD ADMIN
│  └─ System Health (database status, API uptime, error rate, active users)
│
├─ 🔐 USER & ROLE MANAGEMENT
│  ├─ 👤 User Management
│  │  ├─ Daftar User (semua, per role, per unit organisasi)
│  │  ├─ Create User Baru (form: username, email, password, role, unit)
│  │  ├─ Edit User (nama, email, role, unit, status active/inactive)
│  │  ├─ Reset Password (admin bisa reset user password)
│  │  ├─ Deactivate/Delete User
│  │  └─ Lihat Last Login per user
│  │
│  ├─ 🔑 Role Management
│  │  ├─ Daftar Role (Pengelola_OPD, Analis_Pertama, Analis_Muda, dll)
│  │  ├─ Edit Role (edit deskripsi, edit permission)
│  │  └─ Create Role Baru (jarang digunakan, untuk custom roles)
│  │
│  └─ 📋 Permission Management
│     ├─ Permission per Module (Layanan, Data ASN, Dashboard, dll)
│     ├─ Permission per Action (View, Create, Edit, Delete, Approve)
│     ├─ Assign permission ke role
│     └─ Audit: Siapa ubah permission kapan
│
├─ 📤 INTEGRASI DATA SIASN
│  ├─ 📊 Dashboard Integrasi
│  │  └─ Status import terakhir (tanggal, jenis data, success/fail count)
│  │
│  ├─ 📤 Import Data SIASN
│  │  ├─ Upload & Import ASN (file Excel, mode: create/upsert/update)
│  │  ├─ Upload & Import Unit Organisasi
│  │  ├─ Upload & Import Jabatan (Struktural/Fungsional/Pelaksana)
│  │  ├─ Upload & Import Gaji Pokok
│  │  ├─ Upload & Import Golongan
│  │  └─ Preview data sebelum import
│  │
│  ├─ 📋 Riwayat Import
│  │  ├─ List semua import (tanggal, jenis data, total baris, success, fail)
│  │  ├─ Per import: lihat error detail
│  │  └─ Download error log (Excel)
│  │
│  ├─ ✓ Validasi Data
│  │  ├─ Cek duplikat NIP, NIK, Email
│  │  ├─ Cek ASN tanpa unit organisasi (invalid)
│  │  ├─ Cek ASN tanpa golongan
│  │  ├─ Cek reference broken (jabatan tidak ada, dll)
│  │  └─ Generate validation report
│  │
│  └─ 🔄 Job Sinkronisasi (Schedule)
│     ├─ Configure sync schedule (daily/weekly/manual)
│     ├─ Last sync status
│     └─ Manual trigger sync sekarang
│
├─ ⚙️ KONFIGURASI SISTEM
│  ├─ 🕐 SLA Configuration
│  │  ├─ Edit SLA per jenis layanan per jabatan
│  │  ├─ Default: AP 1 hari, AM 2 hari, AD 2 hari, Kabid 1 hari
│  │  └─ Edit eskalasi timing
│  │
│  ├─ 🔔 Notifikasi Configuration
│  │  ├─ List notification types (berkas masuk, SLA warning, laporan ready, dll)
│  │  ├─ Per type: configure channels (in-app, email, WhatsApp)
│  │  ├─ Edit template message per channel
│  │  ├─ Configure penerima (role) per notification type
│  │  └─ Test notification (send test email)
│  │
│  ├─ 📊 Laporan Otomatis Configuration
│  │  ├─ Configure laporan harian (jam berapa, format, penerima)
│  │  ├─ Configure laporan bulanan (tanggal berapa, format, penerima)
│  │  └─ View last sent, retry if failed
│  │
│  ├─ 🏢 Unit Organisasi & Hierarki
│  │  ├─ Manage unit organisasi (add, edit, delete)
│  │  ├─ Set unit parent/child (hierarki)
│  │  ├─ Mark OPD (mana yang bisa ajukan)
│  │  └─ Visualisasi hierarki
│  │
│  ├─ 🗂️ Reference Data Management
│  │  ├─ Golongan (add, edit, delete)
│  │  ├─ Pendidikan (add, edit, delete)
│  │  ├─ Jabatan Struktural/Fungsional/Pelaksana
│  │  ├─ Jenis Layanan (add, edit, enable/disable)
│  │  ├─ Persyaratan Layanan per jenis
│  │  ├─ Template Dokumen
│  │  └─ Master lainnya
│  │
│  └─ 📋 Email Configuration
│     ├─ SMTP server (host, port, auth)
│     ├─ From address, From name
│     └─ Test SMTP connection
│
├─ 📊 AUDIT & LOGGING
│  ├─ 📋 Audit Log (semua aksi user)
│  │  ├─ Filter by: user, action, entity type, date range
│  │  ├─ View: siapa aksi apa kapan ke entity mana
│  │  ├─ Detail: data lama, data baru (before/after)
│  │  └─ Export audit trail (Excel/PDF)
│  │
│  ├─ 📄 Error Log (sistem error)
│  │  ├─ List error & stack trace
│  │  ├─ Filter by level (info, warning, error, critical)
│  │  ├─ Per error: timestamp, user, action, message
│  │  └─ Export error log
│  │
│  └─ 🔐 Security Log (login, failed auth, suspicious activity)
│     ├─ Login history per user
│     ├─ Failed login attempts
│     └─ IP address tracking (optional)
│
├─ 🔧 MAINTENANCE & UTILITIES
│  ├─ 🗑️ Data Cleanup
│  │  ├─ Archive old completed usulan (>1 tahun)
│  │  ├─ Delete old temporary files
│  │  └─ Vacuum database (optimize)
│  │
│  ├─ 💾 Backup Management
│  │  ├─ Last backup time
│  │  ├─ Manual trigger backup now
│  │  ├─ Restore from backup (admin only)
│  │  └─ Backup schedule (automatic daily)
│  │
│  └─ 🚀 System Upgrade
│     ├─ Current version
│     ├─ Check for updates
│     └─ Upgrade log history
│
├─ 📊 MONITORING & HEALTH
│  ├─ 🏥 System Status
│  │  ├─ Database: uptime, queries/sec, connections
│  │  ├─ API: uptime, response time, error rate
│  │  ├─ Cache (Redis): hit rate, memory usage
│  │  ├─ Storage: disk usage, available space
│  │  └─ Email queue: pending, sent, failed
│  │
│  ├─ 👥 Active Users Right Now
│  │  ├─ List user yang sedang online
│  │  ├─ Per user: login time, last activity, IP
│  │  └─ Force logout user (jika needed)
│  │
│  ├─ 📈 Performance Metrics
│  │  ├─ API response time trend (24h, 7d, 30d)
│  │  ├─ Database query time trend
│  │  ├─ Error rate trend
│  │  └─ Concurrent users trend
│  │
│  └─ 🔔 Alerts & Monitoring
│     ├─ Configure alert thresholds (CPU, memory, disk, errors)
│     ├─ Alert history (kapan terjadi apa)
│     └─ Alert notification (email/sms ke admin)
│
├─ 🔔 NOTIFIKASI & INBOX
│  ├─ Inbox (system messages, alerts)
│  └─ Notifikasi (database full, backup failed, upgrade ready, dll)
│
└─ ❓ BANTUAN & DOKUMENTASI
   ├─ System Documentation
   ├─ API Documentation (Swagger)
   ├─ Database Schema Diagram
   ├─ Troubleshooting Guide
   └─ Contact Support
```

**Total Menu Items**: 45 items (comprehensive, untuk system control)

---

## SUMMARY TABLE - MENU COUNT PER ROLE

| Role | Total Items | Primary Focus |
|---|---|---|
| OPD | 18 | Ajukan layanan, monitor status |
| Analis Pertama | 25 | Cek kelengkapan dokumen |
| Analis Muda | 26 | Verifikasi substansi data |
| Analis Madya | 28 | Quality control & draft dokumen |
| Kabid | 30 | Monitoring staf & approval |
| Kepala Badan | 16 | Dashboard eksekutif & TTE |
| Admin | 45 | System configuration & audit |

**Total Unique Menu Items Across All Roles**: ~80 unique menu items

---

## PERMISSION MATRIX - SIAPA BISA AKSES APA?

### CREATE (Buat/Ajukan)
- **OPD**: Buat usulan layanan ✅
- **Analis Madya**: Buat permohonan peremajaan data ✅
- **Admin**: Create user, role, reference data ✅

### READ (Lihat)
- **OPD**: Data ASN milik unitnya, pengajuan miliknya
- **Analis**: Semua pengajuan, semua ASN
- **Kabid**: Semua pengajuan, monitoring staf
- **Kepala Badan**: Laporan agregat, dokumen TTE
- **Admin**: FULL ACCESS

### UPDATE (Edit/Ubah)
- **OPD**: Draft usulan sebelum diajukan
- **Analis Muda**: Verifikasi form, input rekomendasi
- **Analis Madya**: Draft dokumen, input rekomendasi final
- **Kabid**: TTE tandatangan dokumen
- **Admin**: Edit reference data, user, config

### DELETE (Hapus)
- **OPD**: Hapus draft sendiri
- **Admin**: Delete old data (dengan audit log)

### APPROVE (Persetujuan)
- **Analis Pertama**: Teruskan/kembalikan ke Analis Muda
- **Analis Muda**: Teruskan/kembalikan ke Analis Madya
- **Analis Madya**: Teruskan/kembalikan ke Kabid
- **Kabid**: TTE & teruskan ke Kepala Badan (jika perlu)
- **Kepala Badan**: TTE final dokumen tertentu

---

## NAVIGASI ANTAR ROLE

### Login → Redirect ke Dashboard Sesuai Role
```
OPD           → /dashboard/opd
Analis Pertama → /dashboard/analis-pertama
Analis Muda   → /dashboard/analis-muda
Analis Madya  → /dashboard/analis-madya
Kabid         → /dashboard/kabid
Kepala Badan  → /dashboard/kepala-badan
Admin         → /dashboard/admin
```

### Quick Links di Sidebar (Role-Based)
- OPD: "Buat Usulan Baru" prominent button di top
- Analis: "Buka Antrian Berikutnya" button
- Kabid: "Dokumen Pending Approval" notification badge
- Kepala Badan: "Dokumen TTE" notification badge
- Admin: "System Status" widget di dashboard

---

## RESPONSIVE DESIGN UNTUK MOBILE

### Desktop Sidebar (680px+)
Full sidebar dengan semua menu visible, sub-menu expand on click

### Tablet Sidebar (480-680px)
Sidebar collapsible, hamburger menu, main items visible

### Mobile Sidebar (<480px)
Hamburger menu only, full-screen overlay menu on open

**Mobile-First Consideration**:
- Touch targets: minimum 44px height
- No hover states (use active states instead)
- Vertical scroll preferred over horizontal
- Breadcrumb trail at top for location awareness

---

## DETAILED IMPLEMENTATION ROADMAP

### Phase 1: Core Menu Structure (Week 1-2)
- [ ] Define React component structure for Sidebar
- [ ] Create SidebarMenu, MenuItem, SubMenu components
- [ ] Implement role-based menu visibility (useAuth hook)
- [ ] Setup routing for each menu item

### Phase 2: Dashboard Pages (Week 3-6)
- [ ] Implement 6 dashboard pages (per role)
- [ ] Create dashboard components (metric cards, charts, tables)
- [ ] Connect to backend APIs

### Phase 3: CRUD Pages (Week 7-12)
- [ ] Implement each main menu section (Layanan, Data ASN, etc)
- [ ] Forms, tables, detail pages
- [ ] CRUD operations

### Phase 4: Admin Panel (Week 13-16)
- [ ] User management
- [ ] Role & permission management
- [ ] System configuration
- [ ] Integrasi data upload

---

**END OF SIDEBAR MENU DOCUMENTATION**

Dokumentasi ini lengkap untuk development phase dengan React component structure yang jelas.
