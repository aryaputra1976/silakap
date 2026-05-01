# SILAKAP Phase 6 - UAT & Go-Live Runbook

Dokumen ini menjadi pegangan Week 1 internal UAT, Week 2 stakeholder testing, baseline performa, training, dan keputusan go-live.

## Target Kelulusan

- Semua skenario prioritas P0/P1 lulus atau memiliki workaround yang disetujui.
- Semua role bisa login, melihat menu sesuai kewenangan, dan menyelesaikan alur kerjanya.
- API p95 kurang dari 500 ms pada 20 concurrent user untuk endpoint baseline.
- Bundle frontend produksi kurang dari 5 MB untuk aset JS/CSS terkompilasi.
- Stakeholder OPD sample menandatangani sign-off.
- Admin operasional mampu menjalankan backup, health check, SIASN import, dan recovery dasar.

## Jadwal

| Minggu | Agenda | Output |
| --- | --- | --- |
| Week 1 | UAT internal per role, edge case, mobile responsive, smoke deploy | Log defect, status pass/fail, build candidate |
| Week 2 | Stakeholder testing OPD sample, training, feedback, sign-off | Berita acara UAT, daftar perubahan final, go/no-go |

## Role & Akun UAT

Siapkan akun non-produksi untuk:

| Role | Fokus Uji |
| --- | --- |
| Pengelola_OPD | Buat usulan, upload dokumen, revisi, download hasil |
| Analis_Pertama | Verifikasi awal, reject/revisi, SLA |
| Analis_Muda | Verifikasi lanjutan, ASN peremajaan |
| Analis_Madya | Quality control, approve peremajaan |
| Kabid | Approval, analytics, laporan, arsip |
| Kepala_Badan | TTE/approval akhir dan hasil layanan |
| Admin_Sistem | User/role, referensi, SIASN import, health, maintenance |

## Week 1 - Internal UAT Matrix

Gunakan status: `Pass`, `Fail`, `Blocked`, `N/A`.

| ID | Role | Skenario | Expected Result | Status | Catatan |
| --- | --- | --- | --- | --- | --- |
| UAT-001 | Semua | Login, logout, refresh session | Session aman, menu sesuai role |  |  |
| UAT-002 | Semua | Ganti password dari `/settings/change-password` | Password berubah, login ulang sukses |  |  |
| UAT-003 | Pengelola_OPD | Buat draft usulan | Nomor usulan/draft tersimpan |  |  |
| UAT-004 | Pengelola_OPD | Upload dokumen valid | Dokumen muncul di detail usulan |  |  |
| UAT-005 | Pengelola_OPD | Upload dokumen invalid | Validasi menolak file |  |  |
| UAT-006 | Pengelola_OPD | Submit usulan lengkap | Status menjadi diajukan, notifikasi terkirim |  |  |
| UAT-007 | Analis_Pertama | Verifikasi AP approve | Tahap berpindah ke AM |  |  |
| UAT-008 | Analis_Pertama | Kembalikan/reject berkas | Alasan tercatat, OPD menerima notifikasi |  |  |
| UAT-009 | Analis_Muda | Verifikasi AM approve | Tahap berpindah ke AD/Kabid sesuai SOP |  |  |
| UAT-010 | Analis_Madya | Quality control approve | Tahap berpindah ke Kabid |  |  |
| UAT-011 | Kabid | Approval layanan | Tahap berpindah ke Kepala Badan atau selesai |  |  |
| UAT-012 | Kepala_Badan | Approval/TTE akhir | Dokumen output dibuat dan status selesai |  |  |
| UAT-013 | Pengelola_OPD | Download hasil di `/layanan/selesai` | File hasil dapat diunduh |  |  |
| UAT-014 | Admin_Sistem | Import ASN Excel 100 baris | Data upsert, log import dan error Excel tersedia |  |  |
| UAT-015 | Admin_Sistem | Pengaturan SMTP + test email | Email test terkirim |  |  |
| UAT-016 | Admin_Sistem | Pengaturan notifikasi Email/WhatsApp | Channel aktif sesuai konfigurasi |  |  |
| UAT-017 | Admin_Sistem | Health dashboard | DB, storage, backup, ENV tampil |  |  |
| UAT-018 | Admin_Sistem | Manual backup | File backup baru muncul dan audit log tercatat |  |  |
| UAT-019 | Admin_Sistem | Scan orphan file dry-run | Tidak menghapus file, jumlah orphan tampil |  |  |
| UAT-020 | Kabid | Analytics Kabid | SLA trend, throughput, bottleneck, ranking OPD tampil |  |  |
| UAT-021 | Kabid | Laporan harian/bulanan | Data, filter, dan export berjalan |  |  |
| UAT-022 | Semua | Notifikasi dibaca | Counter turun dan status read tersimpan |  |  |

## Edge Case Checklist

- Login salah 5 kali: akun terkunci atau throttle sesuai konfigurasi.
- Token kedaluwarsa: pengguna diarahkan login/refresh tanpa crash.
- File upload terlalu besar, ekstensi salah, dan nama file panjang.
- Excel SIASN dengan NIP duplikat, NIK invalid, kolom wajib kosong.
- Usulan dikembalikan lalu dikirim ulang.
- Layanan selesai tanpa output: tombol download tidak muncul atau pesan jelas.
- SLA warning/overdue berubah setelah job cron dijalankan.
- Backup gagal karena permission folder: error tampil di health/admin log.
- Role mencoba URL terlarang: API memberi 403 dan UI tidak membuka data.

## Mobile Responsive Checklist

Viewport wajib:

- 360 x 800 Android kecil.
- 390 x 844 iPhone.
- 768 x 1024 tablet.
- 1366 x 768 laptop.

Halaman wajib:

- Login.
- Dashboard OPD, Kabid, Admin.
- Daftar layanan dan detail layanan.
- Buat usulan + upload dokumen.
- `/admin/integrasi`.
- `/admin/health`.
- `/dashboard/analytics-kabid`.
- `/settings/change-password`.

Kriteria:

- Tidak ada teks/tombol saling tumpang tindih.
- Sidebar/menu bisa dibuka dan ditutup.
- Tabel bisa discroll horizontal.
- Form bisa disubmit dengan keyboard virtual.
- File input dapat memilih file dari perangkat.

## Week 2 - Stakeholder Testing

Sample minimal:

- 3 OPD dengan karakteristik berbeda.
- 1 Kabid atau perwakilan pengambil keputusan.
- 1 admin operasional BKPSDM.
- 1 perwakilan analis tiap jenjang.

Sesi:

| Sesi | Durasi | Agenda |
| --- | --- | --- |
| Kickoff | 30 menit | Tujuan UAT, batasan, data uji |
| Guided test | 90 menit | Alur OPD sampai selesai/TTE |
| Free test | 60 menit | Stakeholder mencoba sendiri |
| Feedback triage | 45 menit | Klasifikasi blocker/non-blocker |
| Sign-off | 30 menit | Keputusan go/no-go |

Klasifikasi defect:

- P0: data hilang, akses bocor, login tidak bisa, alur layanan utama berhenti.
- P1: alur utama terganggu tetapi ada workaround.
- P2: masalah tampilan, copywriting, filter, atau kenyamanan.
- P3: enhancement setelah go-live.

## Performance Baseline

API target: p95 kurang dari 500 ms, 20 concurrent.

Jalankan API dan database production-like, lalu:

```bash
cd api
PERF_BASE_URL="https://domain-anda.go.id" \
PERF_API_PREFIX="/api/v1" \
PERF_CONCURRENCY=20 \
PERF_REQUESTS=200 \
PERF_TOKEN="JWT_UAT" \
npm run perf:baseline
```

Tanpa token, script tetap menguji `/health` dan endpoint yang mengembalikan 401 dianggap respons valid untuk smoke latency.

Endpoint tambahan:

```bash
PERF_ENDPOINTS="/health,/dashboard/ringkasan,/layanan,/notifikasi/count,/pengaturan/health" npm run perf:baseline
```

Bundle target: total aset JS/CSS kurang dari 5 MB.

```bash
cd web
npm run build
npm run bundle:check
```

Jika `.next/trace` terkunci di Windows lokal, gunakan:

```bash
set NEXT_DIST_DIR=.next-uat
npm run build
npm run bundle:check
```

## Training & Dokumentasi

Materi yang wajib disiapkan:

- PDF user guide dari `api/docs/training-user-guide-phase6.md`.
- PDF admin guide dari `api/docs/training-admin-guide-phase6.md`.
- Video 5-10 menit: login, buat usulan, verifikasi, approval, download hasil.
- Video 5-10 menit: admin health, backup, SIASN import, user/role.

Rekomendasi export PDF:

```bash
pandoc api/docs/training-user-guide-phase6.md -o SILAKAP-User-Guide.pdf
pandoc api/docs/training-admin-guide-phase6.md -o SILAKAP-Admin-Guide.pdf
```

## Go/No-Go Checklist

| Item | Status | PIC | Catatan |
| --- | --- | --- | --- |
| UAT internal selesai |  |  |  |
| Stakeholder sign-off diterima |  |  |  |
| P0/P1 defect tertutup |  |  |  |
| Backup restore smoke test selesai |  |  |  |
| Cron SLA/laporan/backup aktif |  |  |  |
| SMTP dan notifikasi aktif |  |  |  |
| SIASN import sample berhasil |  |  |  |
| Performance p95 < 500 ms |  |  |  |
| Bundle < 5 MB |  |  |  |
| Training selesai |  |  |  |
| Admin guide diserahkan |  |  |  |
| Rollback plan disetujui |  |  |  |

## Keputusan Rilis

Rilis final dapat dilakukan jika:

- Semua item go/no-go berstatus lulus.
- Stakeholder menandatangani template `api/docs/stakeholder-signoff-phase6.md`.
- Jadwal rilis, PIC on-call, dan window rollback sudah dikunci.
