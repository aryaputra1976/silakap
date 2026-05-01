# Panduan Manual Aplikasi SILAKAP
## Sistem Informasi Layanan Kepegawaian

**Versi:** 1.0  
**Tanggal:** Mei 2026  
**Instansi:** BKPSDM

---

## Daftar Isi

1. [Pendahuluan](#pendahuluan)
2. [Login dan Pengaturan Akun](#login-dan-pengaturan-akun)
3. [Panduan Per Role](#panduan-per-role)
   - [Pengelola OPD](#pengelola-opd)
   - [Analis Pertama](#analis-pertama)
   - [Analis Muda](#analis-muda)
   - [Analis Madya](#analis-madya)
   - [Kepala Bidang (Kabid)](#kepala-bidang-kabid)
   - [Kepala Badan](#kepala-badan)
   - [Admin Sistem](#admin-sistem)
4. [Fitur Bersama Semua Role](#fitur-bersama-semua-role)
5. [Alur Kerja Lengkap](#alur-kerja-lengkap)
6. [Troubleshooting](#troubleshooting)

---

## Pendahuluan

SILAKAP adalah sistem informasi berbasis web untuk mengelola layanan kepegawaian di lingkungan pemerintah daerah. Sistem ini mendigitalisasi proses pengajuan, verifikasi, persetujuan, hingga penerbitan dokumen hasil layanan kepegawaian ASN.

### Jenis Layanan yang Didukung
- Kenaikan Pangkat
- Kenaikan Jabatan
- Mutasi/Pindah Tugas
- Pensiun
- Peremajaan Data ASN
- Dan layanan kepegawaian lainnya yang dikonfigurasi oleh Admin Sistem

### Role Pengguna

| Role | Fungsi Utama |
|---|---|
| Pengelola_OPD | Mengajukan dan memantau usulan layanan kepegawaian |
| Analis_Pertama | Verifikasi awal berkas usulan |
| Analis_Muda | Verifikasi lanjutan berkas usulan |
| Analis_Madya | Quality control dan persetujuan teknis |
| Kabid | Persetujuan akhir, monitoring, dan pelaporan |
| Kepala_Badan | Tanda Tangan Elektronik (TTE) dan persetujuan eksekutif |
| Admin_Sistem | Pengelolaan sistem, pengguna, dan konfigurasi |

---

## Login dan Pengaturan Akun

### Cara Login

1. Buka browser dan akses alamat domain SILAKAP yang diberikan instansi.
2. Masukkan **Username** dan **Password** pada form login.
3. Klik tombol **Masuk**.
4. Sistem akan mengarahkan ke dashboard sesuai role akun Anda.

### Lupa Password

1. Klik tautan **Lupa Password** di halaman login.
2. Masukkan alamat email yang terdaftar.
3. Periksa kotak masuk email untuk tautan reset password.
4. Ikuti instruksi pada email untuk membuat password baru.
5. Login kembali menggunakan password baru.

### Ganti Password

1. Setelah login, klik menu **Pengaturan** atau navigasi ke `/settings/change-password`.
2. Masukkan **Password Lama** untuk verifikasi.
3. Masukkan **Password Baru** dan **Konfirmasi Password Baru**.
4. Klik **Simpan**. Sistem akan mengkonfirmasi perubahan berhasil.

> **Tips Keamanan:** Gunakan kombinasi huruf besar, huruf kecil, angka, dan karakter khusus minimal 8 karakter.

### Profil Akun

1. Akses menu **Profil Saya** atau navigasi ke `/my-profile`.
2. Tampil informasi akun: nama lengkap, NIP, email, nomor HP, unit organisasi, dan role.
3. Hubungi Admin Sistem jika ada data yang perlu diperbarui.

### Logout

Klik ikon profil di pojok kanan atas → pilih **Logout** untuk keluar dari sistem. Selalu logout setelah selesai menggunakan komputer bersama.

---

## Panduan Per Role

---

## Pengelola OPD

Role ini digunakan oleh petugas kepegawaian di Organisasi Perangkat Daerah (OPD) untuk mengajukan dan memantau layanan kepegawaian ASN di lingkungan OPD-nya.

---

### Dashboard OPD

**Menu:** Dashboard → `/dashboard/opd`

Halaman utama yang menampilkan ringkasan status usulan OPD Anda:

- **Jumlah Draft** — Usulan yang belum dikirim
- **Pengajuan Aktif** — Usulan sedang dalam proses verifikasi
- **Dikembalikan** — Usulan yang perlu diperbaiki
- **Selesai** — Usulan yang telah selesai diproses
- **Notifikasi Terbaru** — Pemberitahuan terkini dari sistem

Gunakan dashboard sebagai titik awal untuk memantau status keseluruhan usulan OPD.

---

### Layanan Kepegawaian

**Menu:** Layanan Kepegawaian (menu grup dengan submenu)

#### Buat Usulan

**Submenu:** Buat Usulan → `/layanan/buat`

Digunakan untuk mengajukan usulan layanan kepegawaian baru.

**Langkah-langkah:**
1. Klik **Buat Usulan** di sidebar.
2. Pilih **ASN** yang akan diajukan usulannya. Gunakan kolom pencarian berdasarkan nama atau NIP.
3. Pilih **Jenis Layanan** dari daftar layanan yang tersedia.
4. Isi **Data Pendukung** sesuai persyaratan jenis layanan yang dipilih.
5. **Upload Dokumen** — Lampirkan semua dokumen wajib yang ditampilkan sistem:
   - Format file yang diterima: PDF, JPG, PNG (maksimal ukuran per file ditentukan Admin)
   - Pastikan dokumen terbaca jelas dan tidak terpotong
6. Pilih salah satu:
   - **Simpan Draft** — Usulan tersimpan, belum dikirim, dapat diedit kembali
   - **Submit Usulan** — Usulan langsung dikirim ke antrian analis

**Checklist sebelum submit:**
- [ ] ASN yang dipilih sudah benar
- [ ] Jenis layanan sudah sesuai kebutuhan
- [ ] Semua dokumen wajib sudah diunggah dan terbaca jelas
- [ ] Data pendukung sudah dilengkapi
- [ ] Nomor kontak dan email ASN aktif dan benar

> **Catatan:** Setelah di-submit, usulan tidak dapat diedit. Jika ada kesalahan, hubungi Analis atau tunggu pengembalian berkas.

---

#### Draft Saya

**Submenu:** Draft Saya → `/layanan/draft`

Menampilkan semua usulan yang disimpan sebagai draft dan belum dikirim.

**Yang bisa dilakukan:**
- **Edit Draft** — Klik usulan untuk melanjutkan pengisian dan submit
- **Hapus Draft** — Menghapus draft yang tidak diperlukan
- **Submit** — Mengirim draft langsung dari daftar

Gunakan fitur draft untuk menyimpan usulan yang dokumennya belum lengkap, kemudian dilanjutkan di lain waktu.

---

#### Pengajuan Aktif

**Submenu:** Pengajuan Aktif → `/layanan/aktif`

Menampilkan semua usulan yang sudah disubmit dan sedang dalam proses verifikasi atau persetujuan.

**Informasi yang ditampilkan:**
- Nomor usulan dan nama ASN
- Jenis layanan
- Tahap proses saat ini (Analis Pertama → Analis Muda → Analis Madya → Kabid → Kepala Badan)
- Status SLA (Normal / Warning / Overdue)
- Tanggal submit

**Yang bisa dilakukan:**
- Klik baris usulan untuk melihat **Detail Usulan** termasuk riwayat proses
- Pantau status SLA — jika berstatus Overdue, segera konfirmasi ke Analis terkait

---

#### Dikembalikan

**Submenu:** Dikembalikan → `/layanan/dikembalikan`

Menampilkan usulan yang dikembalikan oleh analis karena ada kekurangan berkas atau data.

**Langkah revisi:**
1. Klik usulan yang berstatus dikembalikan.
2. Baca **Catatan Pengembalian** dari analis dengan saksama.
3. Klik **Revisi Usulan**.
4. Perbaiki data atau ganti/tambahkan dokumen sesuai catatan.
5. Klik **Submit Ulang** untuk mengirim kembali ke analis.

> **Penting:** Bacalah catatan pengembalian dengan teliti. Jika ada yang tidak jelas, hubungi Analis yang menangani untuk klarifikasi.

---

#### Download Hasil

**Submenu:** Download Hasil → `/layanan/selesai`

Menampilkan usulan yang telah selesai diproses dan memiliki dokumen hasil.

**Cara download:**
1. Cari usulan yang sudah selesai dari daftar.
2. Klik **Download Hasil** atau ikon unduh pada baris usulan.
3. Dokumen hasil akan terunduh ke perangkat Anda.

> **Catatan:** Tombol download hanya muncul jika dokumen hasil sudah diunggah oleh Kepala Badan atau admin. Jika status sudah Selesai namun tombol belum muncul, hubungi Admin Sistem.

---

#### Semua Usulan

**Submenu:** Semua Usulan → `/layanan`

Menampilkan seluruh riwayat usulan OPD Anda tanpa filter status — dari draft, aktif, dikembalikan, hingga selesai.

Gunakan menu ini untuk pencarian, filter, atau rekap seluruh usulan yang pernah dibuat.

---

### Data ASN

**Menu:** Data ASN → `/asn`

Menampilkan daftar ASN di lingkungan OPD Anda.

**Fitur:**
- Pencarian berdasarkan nama, NIP, atau unit organisasi
- Lihat detail data ASN: nama, NIP, NIK, golongan, jabatan, unit
- Filter berdasarkan unit organisasi

Gunakan menu ini untuk memverifikasi data ASN sebelum membuat usulan layanan.

---

### Peremajaan ASN

**Menu:** Peremajaan ASN → `/asn/peremajaan`

Digunakan untuk mengajukan permintaan perbaruan data ASN yang tidak sesuai dengan kondisi aktual.

**Langkah:**
1. Pilih ASN yang datanya perlu diperbarui.
2. Isi formulir perubahan data yang diperlukan.
3. Upload dokumen pendukung perubahan data.
4. Submit permintaan.

Permintaan akan diproses oleh Analis Muda untuk verifikasi dan Analis Madya untuk persetujuan.

---

### Notifikasi

**Menu:** Notifikasi → `/notifikasi`

Menampilkan semua pemberitahuan yang dikirim sistem kepada akun Anda.

**Jenis notifikasi:**
- Usulan Anda diterima dan diproses ke tahap berikutnya
- Usulan Anda dikembalikan untuk revisi
- Usulan Anda selesai dan dokumen hasil tersedia
- Pengingat dokumen yang belum dilengkapi

**Cara menggunakan:**
- Klik notifikasi untuk membaca detail dan navigasi ke usulan terkait
- Klik **Tandai Semua Dibaca** untuk mengosongkan penanda notifikasi baru
- Badge angka di ikon lonceng menunjukkan jumlah notifikasi belum dibaca

---

## Analis Pertama

Role ini melakukan verifikasi awal terhadap berkas usulan layanan kepegawaian yang masuk dari OPD.

---

### Dashboard Analis Pertama

**Menu:** Dashboard → `/dashboard/analis-pertama`

Ringkasan antrian kerja:
- Jumlah usulan menunggu verifikasi
- Usulan overdue SLA hari ini
- Statistik verifikasi minggu ini (approve, kembalikan)
- Notifikasi sistem terbaru

---

### Antrian Verifikasi

**Menu:** Antrian Verifikasi (menu grup dengan submenu)

#### Semua Antrian

**Submenu:** Semua Antrian → `/layanan?tahap=AP`

Menampilkan seluruh usulan yang masuk ke tahap Analis Pertama dan menunggu tindakan.

**Informasi per baris:**
- Nomor usulan dan nama ASN
- Jenis layanan
- OPD pengirim
- Tanggal masuk dan SLA tersisa
- Status (Menunggu / SLA Warning / Overdue)

**Cara verifikasi:**
1. Klik baris usulan untuk membuka **Detail Usulan**.
2. Periksa data ASN — pastikan sesuai dengan dokumen yang dilampirkan.
3. Periksa jenis layanan — pastikan ASN memenuhi syarat.
4. Periksa semua **Dokumen Lampiran** satu per satu:
   - Klik dokumen untuk membuka/unduh
   - Pastikan dokumen terbaca, tidak terpotong, dan masih berlaku
5. Periksa kelengkapan seluruh persyaratan yang diwajibkan untuk jenis layanan tersebut.
6. Pilih tindakan:
   - **Setujui / Teruskan** — Berkas lengkap, usulan dilanjutkan ke Analis Muda
   - **Kembalikan** — Berkas kurang/tidak sesuai, isi catatan yang jelas dan spesifik

**Panduan mengisi catatan pengembalian yang baik:**
- Sebutkan dokumen spesifik yang perlu diperbaiki: *"Fotokopi SK terakhir belum dilampirkan"*
- Sebutkan data yang perlu diperbaiki: *"Nomor NIP tidak sesuai dengan nama yang tertera"*
- Hindari catatan umum seperti *"berkas belum lengkap"* tanpa penjelasan

---

#### Overdue SLA

**Submenu:** Overdue SLA → `/layanan?tahap=AP&sla=overdue`

Menampilkan hanya usulan yang telah melewati batas waktu SLA verifikasi Analis Pertama.

Prioritaskan penanganan usulan di menu ini. SLA yang overdue berpotensi menghambat layanan kepegawaian ASN dan mempengaruhi laporan kinerja.

---

#### Riwayat

**Submenu:** Riwayat → `/layanan?status=Selesai`

Menampilkan usulan yang telah selesai diproses (disetujui atau ditolak) oleh Analis Pertama.

Gunakan untuk referensi atau audit keputusan verifikasi sebelumnya.

---

### Referensi

**Menu:** Referensi → `/referensi`

Menampilkan data referensi yang digunakan dalam proses verifikasi:
- Daftar jenis layanan dan persyaratannya
- Daftar golongan ASN
- Unit organisasi terdaftar
- SLA yang berlaku per tahap

Gunakan sebagai acuan saat memeriksa kelengkapan persyaratan dokumen.

---

### Statistik

**Menu:** Statistik → `/statistik`

Menampilkan statistik kinerja verifikasi Analis Pertama:
- Jumlah usulan disetujui per periode
- Jumlah usulan dikembalikan per periode
- Rata-rata waktu verifikasi
- Tren beban kerja

---

### Reject Counter

**Menu:** Reject Counter → `/reject-counter`

Monitoring pengembalian/penolakan berkas yang pernah dilakukan.

Gunakan untuk evaluasi apakah banyak usulan dikembalikan dengan alasan yang sama — jika ya, pertimbangkan untuk berkoordinasi dengan OPD terkait penyiapan berkas.

---

### Data ASN

**Menu:** Data ASN → `/asn`

Akses data referensi ASN untuk verifikasi silang saat memeriksa berkas usulan.

---

### Notifikasi

Sama seperti Pengelola OPD — menampilkan pemberitahuan masuknya usulan baru, pengingat SLA, dan update sistem.

---

## Analis Muda

Role ini melakukan verifikasi lanjutan terhadap usulan yang telah lolos dari Analis Pertama, dengan tambahan kewenangan memproses peremajaan data ASN.

Panduan menu yang sama dengan Analis Pertama, dengan perbedaan berikut:

---

### Dashboard Analis Muda

**Menu:** Dashboard → `/dashboard/analis-muda`

Sama dengan Analis Pertama namun menampilkan data antrian tahap **Analis Muda (AM)**.

---

### Antrian Verifikasi

**Submenu:** Semua Antrian → `/layanan?tahap=AM`

Usulan yang masuk ke tahap Analis Muda setelah lolos dari Analis Pertama. Proses verifikasi lebih mendalam:
- Cek substansi data, bukan hanya kelengkapan dokumen
- Verifikasi kesesuaian jenis layanan dengan kondisi aktual ASN
- Cek riwayat layanan sebelumnya untuk ASN yang sama

---

### Peremajaan ASN

**Menu:** Peremajaan ASN → `/asn/peremajaan`

Menampilkan permintaan peremajaan data ASN dari OPD yang perlu diverifikasi oleh Analis Muda.

**Proses verifikasi peremajaan:**
1. Buka permintaan peremajaan.
2. Bandingkan data lama dengan data baru yang diajukan.
3. Periksa dokumen pendukung perubahan data.
4. Verifikasi keabsahan dokumen.
5. Pilih:
   - **Setujui** — Diteruskan ke Analis Madya untuk persetujuan akhir
   - **Tolak** — Isi alasan penolakan yang jelas

---

## Analis Madya

Role ini melakukan quality control akhir sebelum usulan naik ke Kabid untuk persetujuan, dan bertanggung jawab menyetujui peremajaan data ASN.

---

### Dashboard Analis Madya

**Menu:** Dashboard → `/dashboard/analis-madya`

Ringkasan antrian quality control tahap **Analis Madya (AD)**.

---

### Quality Control

**Menu:** Quality Control (menu grup)

#### Semua Antrian

**Submenu:** Semua Antrian → `/layanan?tahap=AD`

Usulan yang masuk ke tahap Quality Control setelah lolos dari Analis Muda.

**Fokus quality control:**
- Konsistensi data antara dokumen dan sistem
- Kesesuaian jenis layanan dengan peraturan yang berlaku
- Kelengkapan dan kebenaran riwayat verifikasi dari tahap sebelumnya
- Potensi masalah yang perlu ditandai sebelum naik ke Kabid

**Tindakan:**
- **Approve** — Usulan diteruskan ke Kabid untuk persetujuan akhir
- **Kembalikan ke Analis Muda** — Jika ada hal yang perlu diklarifikasi ulang
- **Tolak** — Jika ada ketidaksesuaian substansial (isi catatan lengkap)

---

#### Overdue SLA

**Submenu:** Overdue SLA → `/layanan?tahap=AD&sla=overdue`

Antrian yang telah melewati batas SLA Quality Control.

---

#### Riwayat

Riwayat tindakan QC yang telah dilakukan.

---

### Referensi, Statistik, Reject Counter, Data ASN

Sama seperti Analis Pertama dan Analis Muda — gunakan sebagai referensi dan pemantauan kinerja.

---

## Kepala Bidang (Kabid)

Role ini bertanggung jawab memberikan persetujuan akhir atas usulan yang telah melalui seluruh tahap verifikasi analis, memantau kinerja layanan, dan menghasilkan laporan.

---

### Dashboard Kabid

**Menu:** Dashboard → `/dashboard/kabid`

Ringkasan eksekutif layanan kepegawaian:
- Total usulan aktif di semua tahap
- Jumlah menunggu approval Kabid
- Ringkasan SLA hari ini (Normal / Warning / Overdue)
- Statistik penyelesaian periode ini

---

### Approval

**Menu:** Approval (menu grup)

#### Antrian Approval

**Submenu:** Antrian Approval → `/layanan?tahap=Kabid`

Menampilkan usulan yang telah selesai melalui seluruh tahap verifikasi analis dan menunggu persetujuan Kabid.

**Proses approval:**
1. Buka detail usulan.
2. Tinjau **Ringkasan Verifikasi** dari seluruh tahap analis.
3. Periksa dokumen kunci jika diperlukan.
4. Pilih tindakan:
   - **Setujui** — Usulan diteruskan ke Kepala Badan untuk TTE (jika diperlukan) atau selesai
   - **Tolak/Kembalikan** — Isi alasan keputusan dengan jelas

**Catatan:** Keputusan Kabid bersifat final sebelum TTE Kepala Badan. Pastikan seluruh substansi usulan telah diperiksa dengan saksama.

---

#### Overdue SLA

**Submenu:** Overdue SLA → `/layanan?tahap=Kabid&sla=overdue`

Usulan yang telah melewati batas waktu SLA persetujuan Kabid. Prioritaskan penanganan segera.

---

#### Sudah Disetujui

**Submenu:** Sudah Disetujui → `/layanan?status=Selesai`

Riwayat usulan yang telah mendapat persetujuan Kabid.

---

#### Semua Usulan

**Submenu:** Semua Usulan → `/layanan`

Seluruh usulan dari semua OPD dalam semua status untuk pemantauan menyeluruh.

---

### Laporan

**Menu:** Laporan (menu grup)

#### Laporan Harian

**Submenu:** Laporan Harian → `/laporan/harian`

Laporan ringkasan layanan kepegawaian dalam satu hari:
- Jumlah usulan masuk, diproses, dan selesai
- Distribusi per jenis layanan dan per OPD
- Status SLA hari itu
- Filter berdasarkan tanggal

**Export:** Tersedia opsi export ke PDF atau Excel untuk keperluan pelaporan.

---

#### Laporan Bulanan

**Submenu:** Laporan Bulanan → `/laporan/bulanan`

Laporan rekapitulasi bulanan layanan kepegawaian:
- Tren usulan per bulan
- Perbandingan kinerja antar bulan
- Ringkasan per OPD dan per jenis layanan
- SLA achievement rate bulan berjalan

**Export:** Tersedia export PDF dan Excel.

---

### Monitoring

**Menu:** Monitoring (menu grup)

#### Beban Kerja

**Submenu:** Beban Kerja → `/dashboard/beban-kerja`

Menampilkan distribusi beban kerja analis secara real-time:
- Jumlah usulan di antrian masing-masing analis per tahap
- Perbandingan beban kerja antar analis
- Usulan overdue per analis

Gunakan untuk mengidentifikasi bottleneck dan meratakan beban kerja tim.

---

#### SLA Tahapan

**Submenu:** SLA Tahapan → `/dashboard/sla-tahapan`

Monitoring SLA per tahap proses:
- Konfigurasi SLA yang berlaku (dalam jam/hari) per tahap
- Jumlah usulan di masing-masing tahap
- Persentase kepatuhan SLA per tahap
- Usulan yang warning dan overdue per tahap

---

#### Analytics Kabid

**Submenu:** Analytics Kabid → `/dashboard/analytics-kabid`

Dashboard analitik mendalam untuk pengambilan keputusan:
- **SLA Trend** — Grafik tren kepatuhan SLA dari waktu ke waktu
- **Throughput** — Jumlah usulan yang berhasil diselesaikan per periode
- **Bottleneck** — Tahap mana yang paling sering menjadi hambatan
- **Ranking OPD** — OPD dengan usulan terbanyak, terlambat, atau paling efisien
- **Jenis Layanan Terpopuler** — Distribusi jenis layanan yang paling banyak diajukan

---

#### Reject Counter

**Submenu:** Reject Counter → `/reject-counter`

Pemantauan pengembalian berkas di seluruh tahap:
- OPD dengan tingkat pengembalian tertinggi
- Alasan pengembalian yang paling sering terjadi
- Tren pengembalian per periode

Gunakan untuk koordinasi dengan OPD yang sering mengajukan berkas tidak lengkap.

---

### Data ASN

**Menu:** Data ASN → `/asn`

Akses data referensi ASN untuk kebutuhan monitoring dan pengambilan keputusan approval.

---

### Perencanaan Pensiun

**Menu:** Perencanaan Pensiun → `/perencanaan`

Menampilkan proyeksi ASN yang akan memasuki masa pensiun:
- Daftar ASN berdasarkan estimasi tanggal pensiun
- Filter berdasarkan unit organisasi, golongan, atau jangka waktu
- Notifikasi ASN yang akan pensiun dalam 1, 3, atau 6 bulan ke depan

Gunakan untuk perencanaan kebutuhan SDM dan penyiapan dokumen pensiun lebih awal.

---

### Arsip

**Menu:** Arsip → `/arsip`

Menampilkan usulan layanan yang telah diarsipkan (selesai atau ditolak lebih dari 1 tahun):
- Pencarian arsip berdasarkan nama ASN, nomor usulan, atau jenis layanan
- Lihat detail dan dokumen arsip
- Filter berdasarkan tahun dan jenis layanan

---

### Pengaturan SLA

**Menu:** Pengaturan SLA → `/admin/pengaturan`

Kabid dapat melihat dan mengusulkan perubahan konfigurasi SLA per tahap.

> **Catatan:** Perubahan SLA yang berlaku memerlukan konfirmasi Admin Sistem.

---

### Notifikasi

Menampilkan pemberitahuan: usulan baru masuk antrian approval, usulan overdue, laporan otomatis siap, dan update sistem.

---

## Kepala Badan

Role ini memberikan persetujuan eksekutif tertinggi dan Tanda Tangan Elektronik (TTE) atas usulan yang telah disetujui Kabid.

---

### Dashboard Kepala Badan

**Menu:** Dashboard → `/dashboard/kepala-badan`

Ringkasan eksekutif:
- Jumlah usulan menunggu TTE
- Total usulan selesai periode berjalan
- Ringkasan status SLA keseluruhan

---

### TTE & Approval

**Menu:** TTE & Approval (menu grup)

#### Menunggu TTE

**Submenu:** Menunggu TTE → `/layanan?tahap=KepalaBadan`

Usulan yang telah disetujui Kabid dan menunggu TTE atau persetujuan Kepala Badan.

**Proses TTE/Approval:**
1. Buka detail usulan.
2. Tinjau ringkasan verifikasi dari seluruh tahap.
3. Periksa keabsahan dokumen dan keputusan Kabid.
4. Pilih tindakan:
   - **Setujui/TTE** — Proses selesai, dokumen hasil akan digenerate atau diunggah Admin
   - **Kembalikan** — Isi alasan jika ada hal yang perlu dikaji ulang

---

#### Riwayat TTE

**Submenu:** Riwayat TTE → `/layanan?status=Selesai`

Riwayat semua usulan yang telah mendapat TTE atau persetujuan Kepala Badan.

---

#### Semua Usulan

**Submenu:** Semua Usulan → `/layanan`

Visibilitas seluruh usulan dari semua OPD untuk monitoring.

---

### Laporan

Sama seperti Kabid — Laporan Harian dan Laporan Bulanan tersedia untuk pemantauan dan keperluan pelaporan eksekutif.

---

### Data ASN

Akses data referensi ASN untuk kebutuhan verifikasi.

---

### Perencanaan Pensiun

Menampilkan proyeksi pensiunan ASN untuk pertimbangan kebijakan SDM.

---

### Notifikasi

Pemberitahuan: usulan baru menunggu TTE, laporan siap, dan update sistem penting.

---

## Admin Sistem

Role ini mengelola seluruh aspek teknis dan konfigurasi sistem SILAKAP.

---

### Dashboard Admin

**Menu:** Dashboard → `/dashboard/admin`

Ringkasan status sistem secara keseluruhan:
- Statistik penggunaan sistem hari ini
- Status kesehatan sistem (DB, storage, backup)
- Jumlah pengguna aktif
- Usulan yang sedang berjalan lintas semua OPD

---

### Health Dashboard

**Menu:** Health Dashboard → `/admin/health`

Monitoring kesehatan sistem secara real-time.

**Informasi yang ditampilkan:**
- **Database** — Status koneksi, ukuran database
- **Storage** — Kapasitas direktori upload dan penggunaan saat ini
- **Backup** — File backup terakhir, tanggal, dan ukuran
- **ENV Audit** — Validasi konfigurasi environment (JWT kuat, CORS benar, dll.)
- **Error Log** — Log error operasional terbaru

**Aksi yang tersedia:**
- **Backup Manual** — Jalankan backup database sekarang. File backup tersimpan di direktori backup yang dikonfigurasi
- **Scan Orphan File (Dry Run)** — Temukan file di storage yang tidak terhubung ke database. Mode dry-run tidak menghapus file, hanya menampilkan daftarnya
- **Cleanup Orphan File** — Hapus file orphan setelah dikonfirmasi dari hasil scan dry-run
- **Arsip Data Lama** — Arsipkan usulan selesai/ditolak yang berusia lebih dari 1 tahun (batch 50 data per eksekusi)

> **Peringatan:** Jalankan **Scan Orphan File (Dry Run)** terlebih dahulu sebelum **Cleanup**. Pastikan file yang akan dihapus memang tidak diperlukan.

---

### Layanan

**Menu:** Layanan (menu grup)

#### Semua Usulan

**Submenu:** Semua Usulan → `/layanan`

Visibilitas penuh seluruh usulan dari semua OPD dan semua status. Admin dapat memantau, mencari, dan mengakses detail usulan apapun dalam sistem.

---

#### Arsip

**Submenu:** Arsip → `/arsip`

Kelola data arsip usulan yang sudah diarsipkan. Admin dapat melihat, mencari, dan mengelola arsip.

---

### User & Role

**Menu:** User & Role (menu grup)

#### Users

**Submenu:** Users → `/admin/users`

Manajemen akun pengguna sistem.

**Fitur:**
- **Daftar Pengguna** — Lihat semua akun dengan informasi role, unit, dan status aktif/nonaktif
- **Tambah Pengguna** — Buat akun baru dengan mengisi: nama, NIP, username, email, nomor HP, unit organisasi, dan role
- **Edit Pengguna** — Ubah data profil pengguna
- **Aktifkan/Nonaktifkan** — Toggle status akun tanpa menghapus data
- **Reset Password** — Kirim email reset password ke pengguna

**Best practice:**
- Satu orang satu akun
- Nonaktifkan akun pegawai yang pindah tugas atau pensiun (jangan hapus, untuk menjaga riwayat data)
- Jangan memakai akun Admin untuk pekerjaan operasional

---

#### Roles & Permission

**Submenu:** Roles & Permission → `/admin/roles`

Manajemen role dan hak akses yang berlaku dalam sistem.

**Yang bisa dilihat:**
- Daftar role yang tersedia dan deskripsinya
- Hak akses yang dimiliki setiap role (menu, endpoint, tindakan)

> **Catatan:** Perubahan struktur role memerlukan modifikasi kode dan tidak dapat dilakukan melalui UI. Hubungi tim pengembang jika diperlukan perubahan role.

---

### Integrasi SIASN

**Menu:** Integrasi SIASN (menu grup)

Menu untuk sinkronisasi dan import data ASN dari sistem SIASN.

#### Status & Validasi

**Submenu:** Status & Validasi → `/admin/integrasi`

Menampilkan status integrasi SIASN saat ini:
- Tanggal import terakhir
- Jumlah data berhasil diimport
- Jumlah error import
- Status validasi data

---

#### Import ASN

**Submenu:** Import ASN → `/admin/integrasi#import-asn`

Melakukan import data ASN dari file Excel.

**Langkah import:**
1. Siapkan file Excel (`.xlsx` atau `.xls`) dengan kolom yang diperlukan.
2. Kolom **wajib:** NIP, Nama
3. Kolom **disarankan:** NIK, Email, Nomor HP, Unit Organisasi ID, Golongan, Jabatan
4. Klik **Upload File** dan pilih file Excel.
5. Klik **Mulai Import** — sistem akan memproses baris per baris.
6. Tunggu proses selesai.
7. Periksa ringkasan: berapa baris berhasil, berapa error.
8. Jika ada error, klik **Unduh Log Error** untuk melihat baris mana yang bermasalah beserta alasannya.
9. Perbaiki data di Excel dan import ulang hanya baris yang error.

**Validasi otomatis:**
- NIP tidak boleh kosong
- NIK harus valid jika diisi (16 digit)
- Unit Organisasi harus terdaftar di sistem
- Import menggunakan `upsert` — data yang sudah ada akan diperbarui, data baru akan ditambahkan

---

#### Log Import

**Submenu:** Log Import → `/admin/integrasi#log`

Riwayat semua sesi import yang pernah dilakukan:
- Tanggal dan waktu import
- Nama file yang diimport
- Jumlah berhasil dan error
- Status import (Selesai / Gagal / Parsial)

Klik log import tertentu untuk melihat detail error per baris.

---

### Konfigurasi

**Menu:** Konfigurasi (menu grup)

#### Pengaturan SLA

**Submenu:** Pengaturan SLA → `/admin/pengaturan`

Konfigurasi batas waktu SLA per tahap proses.

**Yang bisa dikonfigurasi:**
- Batas waktu (dalam jam) untuk setiap tahap: Analis Pertama, Analis Muda, Analis Madya, Kabid, Kepala Badan
- Threshold warning (berapa jam sebelum deadline agar status menjadi "Warning")

**Langkah:**
1. Pilih tahap yang akan diubah SLA-nya.
2. Masukkan nilai batas waktu baru.
3. Klik **Simpan**.

> **Perubahan SLA berlaku untuk usulan baru.** Usulan yang sedang berjalan tetap menggunakan SLA lama.

---

#### Pengaturan Email

**Submenu:** Pengaturan Email → `/admin/pengaturan/email`

Konfigurasi SMTP untuk pengiriman email notifikasi sistem.

**Konfigurasi yang diperlukan:**
- **SMTP Host** — Server SMTP (contoh: `mail.domain.go.id`)
- **SMTP Port** — Port SMTP (biasanya 587 untuk STARTTLS, 465 untuk SSL)
- **Username** — Alamat email pengirim
- **Password** — Password email
- **From Name** — Nama pengirim yang tampil di email penerima

**Cara test:**
1. Isi semua konfigurasi SMTP.
2. Klik **Test Email** dan masukkan alamat email penerima test.
3. Periksa apakah email test diterima.
4. Jika berhasil, klik **Simpan Konfigurasi**.

---

#### Notifikasi

**Submenu:** Notifikasi → `/admin/pengaturan/notifikasi`

Konfigurasi channel notifikasi yang aktif dan template pesan.

**Channel yang tersedia:**
- **In-App** — Notifikasi di dalam aplikasi (selalu aktif)
- **Email** — Notifikasi via email (memerlukan konfigurasi SMTP)
- **WhatsApp** — Notifikasi via WhatsApp gateway (jika vendor diintegrasi)

**Yang bisa dikonfigurasi:**
- Channel mana yang aktif untuk jenis event tertentu
- Template pesan notifikasi per event
- Event yang memicu notifikasi (usulan disubmit, disetujui, dikembalikan, dll.)

---

#### Laporan Otomatis

**Submenu:** Laporan Otomatis → `/admin/pengaturan/laporan-otomatis`

Konfigurasi jadwal pengiriman laporan otomatis via email.

**Jenis laporan otomatis:**
- **Laporan Harian** — Dikirim setiap hari pada jam yang ditentukan
- **Laporan Bulanan** — Dikirim tanggal 1 setiap bulan

**Yang bisa dikonfigurasi:**
- Aktif/nonaktifkan laporan otomatis
- Jam pengiriman laporan harian
- Daftar email penerima laporan
- Format laporan (ringkasan atau detail)

---

#### Referensi Data

**Submenu:** Referensi Data → `/admin/referensi`

Kelola data referensi yang digunakan di seluruh sistem.

**Data referensi yang bisa dikelola:**

| Referensi | Keterangan |
|---|---|
| Unit Organisasi | Daftar unit/OPD yang terdaftar |
| Golongan ASN | Golongan kepangkatan yang berlaku |
| Jenis Layanan | Jenis layanan kepegawaian yang tersedia |
| Persyaratan Layanan | Dokumen wajib per jenis layanan |
| SLA Tahapan | Konfigurasi SLA per tahap |

**Langkah menambah referensi:**
1. Pilih jenis referensi yang akan dikelola.
2. Klik **Tambah**.
3. Isi formulir data referensi.
4. Klik **Simpan**.

> **Penting:** Setelah mengubah referensi (terutama jenis layanan dan persyaratan), lakukan uji coba buat usulan baru untuk memastikan persyaratan muncul dengan benar.

---

### Laporan

**Menu:** Laporan → `/laporan`

Admin memiliki akses ke seluruh laporan: harian, bulanan, dan laporan khusus lintas OPD.

Fitur export laporan tersedia dalam format PDF dan Excel.

---

### Perencanaan Pensiun

**Menu:** Perencanaan Pensiun → `/perencanaan`

Admin dapat melihat dan mengelola proyeksi pensiun seluruh ASN lintas OPD.

---

### Audit Log

**Menu:** Audit Log → `/audit`

Rekaman seluruh aktivitas penting dalam sistem untuk keperluan audit dan keamanan.

**Informasi yang dicatat:**
- Siapa yang melakukan tindakan (username dan role)
- Tindakan apa yang dilakukan (login, create, update, delete, approve, reject, dll.)
- Pada data/objek apa
- Kapan (timestamp tepat)
- Dari IP address mana

**Filter audit log:**
- Berdasarkan pengguna
- Berdasarkan jenis tindakan
- Berdasarkan rentang tanggal
- Berdasarkan modul/menu

Audit log bersifat **read-only** — tidak dapat dihapus atau dimodifikasi.

---

### Data ASN

**Menu:** Data ASN → `/asn`

Admin memiliki akses penuh ke data ASN seluruh OPD, termasuk kemampuan edit data manual jika diperlukan untuk koreksi.

---

### Notifikasi

Menampilkan notifikasi sistem: error operasional, backup gagal, import SIASN selesai, dan peringatan konfigurasi.

---

## Fitur Bersama Semua Role

### Notifikasi Sistem

Setiap role memiliki akses ke halaman Notifikasi (`/notifikasi`) yang menampilkan:
- Pemberitahuan relevan dengan role masing-masing
- Badge jumlah notifikasi belum dibaca di ikon lonceng
- Kemampuan tandai satu atau semua notifikasi sebagai dibaca

### Profil dan Pengaturan Akun

| Fitur | Path |
|---|---|
| Profil Saya | `/my-profile` |
| Ganti Password | `/settings/change-password` |

### Pencarian Global

Tersedia di header — gunakan untuk mencari usulan berdasarkan nomor usulan atau nama ASN dari mana saja dalam aplikasi.

---

## Alur Kerja Lengkap

```
[Pengelola OPD]
Buat Usulan → Submit
        ↓
[Analis Pertama]
Verifikasi Awal
  ├─ Setujui → [Analis Muda]
  └─ Kembalikan → [Pengelola OPD: Dikembalikan]

[Analis Muda]
Verifikasi Lanjutan
  ├─ Setujui → [Analis Madya]
  └─ Kembalikan → [Pengelola OPD: Dikembalikan]

[Analis Madya]
Quality Control
  ├─ Approve → [Kabid]
  └─ Kembalikan → [Analis Muda / OPD]

[Kabid]
Persetujuan Bidang
  ├─ Setujui → [Kepala Badan]
  └─ Tolak/Kembalikan → [OPD]

[Kepala Badan]
TTE & Persetujuan Akhir
  ├─ Setujui/TTE → Selesai ✓
  └─ Kembalikan → [Kabid]

[Admin Sistem]
Upload Dokumen Hasil → [Pengelola OPD: Download Hasil]
```

### Notifikasi Otomatis di Setiap Tahap

| Event | Penerima Notifikasi |
|---|---|
| Usulan disubmit OPD | Analis Pertama |
| Usulan disetujui AP | Analis Muda |
| Usulan disetujui AM | Analis Madya |
| Usulan disetujui AD | Kabid |
| Usulan disetujui Kabid | Kepala Badan |
| Usulan dikembalikan | Pengelola OPD |
| Usulan selesai/TTE | Pengelola OPD |
| SLA Warning/Overdue | Analis yang bertanggung jawab + Kabid |

---

## Troubleshooting

### Tidak Bisa Login
- Pastikan username dan password benar (perhatikan huruf besar/kecil)
- Jika lupa password, gunakan fitur **Lupa Password**
- Jika akun terkunci, hubungi Admin Sistem untuk reset

### Menu Tidak Sesuai Role
- Logout kemudian login kembali untuk refresh session
- Jika masalah berlanjut, hubungi Admin Sistem untuk verifikasi role akun

### File Tidak Bisa Diupload
- Pastikan format file sesuai: PDF, JPG, PNG
- Pastikan ukuran file tidak melebihi batas (biasanya 10 MB per file)
- Coba gunakan browser lain (Chrome atau Firefox versi terbaru)
- Pastikan koneksi internet stabil

### Dokumen Hasil Tidak Bisa Diunduh
- Pastikan status usulan sudah **Selesai**
- Dokumen hasil baru tersedia setelah Admin/Kepala Badan mengunggahnya
- Hubungi Admin Sistem jika status sudah Selesai namun dokumen belum tersedia

### Halaman Lambat atau Tidak Merespons
- Refresh halaman (Ctrl+F5)
- Periksa koneksi internet
- Hapus cache browser
- Hubungi Admin Sistem jika masalah terjadi pada banyak pengguna

### Data ASN Tidak Ditemukan atau Salah
- Ajukan permintaan **Peremajaan ASN** melalui menu yang tersedia
- Admin Sistem dapat melakukan koreksi data langsung jika diperlukan

### Notifikasi Email Tidak Masuk
- Periksa folder Spam/Junk di email Anda
- Pastikan alamat email di profil sudah benar
- Hubungi Admin Sistem untuk verifikasi konfigurasi SMTP

---

## Kontak Bantuan

Jika mengalami masalah teknis yang tidak tercakup dalam panduan ini:

1. **Lapor ke Admin Sistem** di instansi Anda terlebih dahulu
2. Sertakan informasi:
   - Screenshot halaman yang bermasalah
   - Langkah yang dilakukan sebelum masalah terjadi
   - Waktu kejadian
   - Username akun yang digunakan (jangan sertakan password)

---

*Panduan ini dibuat berdasarkan versi SILAKAP 1.0. Fitur dapat berubah seiring pembaruan sistem.*
