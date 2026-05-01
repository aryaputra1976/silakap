# SILAKAP Phase 6 - Admin Guide

Panduan ini untuk Admin Sistem dan operator teknis saat UAT dan go-live.

## 1. Pemeriksaan Harian

1. Buka `/admin/health`.
2. Pastikan status DB `ok`.
3. Pastikan upload directory dan backup directory `Ready`.
4. Periksa audit ENV.
5. Periksa jumlah backup terbaru.
6. Buka notifikasi admin untuk melihat error operasional.

## 2. User dan Role

Tugas utama:

- Membuat akun UAT dan production.
- Mengaktifkan atau menonaktifkan akun.
- Reset password.
- Memastikan role sesuai tugas pengguna.

Prinsip:

- Satu orang satu akun.
- Jangan memakai akun admin untuk pekerjaan OPD/analis.
- Nonaktifkan akun pegawai yang pindah tugas.

## 3. Referensi Data

Admin dapat mengelola:

- Unit organisasi.
- Golongan.
- Jenis layanan.
- Persyaratan layanan.
- SLA per tahap.

Setelah mengubah referensi, lakukan smoke test buat usulan baru agar persyaratan dan alur muncul benar.

## 4. SIASN Import

1. Buka `/admin/integrasi#import-asn`.
2. Upload Excel `.xlsx` atau `.xls`.
3. Tunggu proses selesai.
4. Periksa log import.
5. Jika ada error, unduh Excel error.
6. Perbaiki data sumber dan import ulang.

Kolom minimal:

- NIP.
- Nama.

Kolom yang disarankan:

- NIK.
- Email.
- Nomor HP.
- Unit Organisasi ID.

Validasi wajib:

- NIP tidak kosong.
- NIK valid jika diisi.
- Unit organisasi terdaftar.

## 5. Email dan Notifikasi

### SMTP

1. Buka Pengaturan Email.
2. Pastikan host, port, dan sender terisi.
3. Kirim test email ke alamat internal.

### Multi-Channel

Channel tersedia:

- InApp.
- Email.
- WhatsApp jika env gateway aktif.
- SMS disiapkan sebagai konfigurasi, integrasi vendor dapat ditambahkan kemudian.

Gunakan template singkat dan mencantumkan aksi yang perlu dilakukan pengguna.

## 6. Backup dan Restore

### Backup Manual

1. Buka `/admin/health`.
2. Klik Backup Manual.
3. Pastikan file backup baru muncul.
4. Catat waktu dan ukuran file.

### Backup via Cron

Lihat `api/docs/cpanel-cron-phase3.md`.

### Restore Smoke Test

Restore sebaiknya diuji di environment staging:

```bash
mysql -u DB_USER -p DB_NAME_STAGING < backup-file.sql
npx prisma migrate status
```

Jangan melakukan restore langsung ke production tanpa window maintenance dan persetujuan owner proses.

## 7. Maintenance Tools

### Arsip >1 Tahun

- Mengarsipkan usulan selesai/ditolak yang lebih tua dari satu tahun.
- Batch maksimal 50 data per eksekusi.
- Jalankan ulang jika `remainingBatchLimit` bernilai true.

### Cleanup Orphan File

1. Jalankan Scan Orphan File terlebih dahulu.
2. Review jumlah dan contoh path.
3. Jalankan Cleanup Orphan File hanya jika yakin file tidak direferensikan.

## 8. Performance Baseline

API:

```bash
cd api
PERF_BASE_URL="https://domain-anda.go.id" PERF_TOKEN="JWT_UAT" npm run perf:baseline
```

Frontend bundle:

```bash
cd web
npm run build
npm run bundle:check
```

Target:

- API p95 kurang dari 500 ms.
- Concurrent 20.
- Bundle kurang dari 5 MB.

## 9. Go-Live Checklist Admin

- `.env` production sudah audit.
- PM2 API dan web online.
- SSL valid dan force HTTPS aktif.
- Cron SLA, laporan, dan backup aktif.
- Backup terakhir tersedia.
- Admin health tidak memiliki critical error.
- SMTP test berhasil.
- SIASN import sample berhasil.
- Akun stakeholder production sudah siap.
- Rollback plan tersedia.
