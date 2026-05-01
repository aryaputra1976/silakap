-- CreateTable
CREATE TABLE `ref_golongan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(10) NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `roman` VARCHAR(10) NULL,
    `tingkat` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ref_golongan_kode_key`(`kode`),
    INDEX `ref_golongan_kode_idx`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_gaji_pokok` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `golonganId` BIGINT NOT NULL,
    `masaKerja` INTEGER NOT NULL,
    `gaji` DECIMAL(12, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ref_gaji_pokok_golonganId_idx`(`golonganId`),
    UNIQUE INDEX `ref_gaji_pokok_golonganId_masaKerja_key`(`golonganId`, `masaKerja`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_unit_organisasi` (
    `id` VARCHAR(36) NOT NULL,
    `nama` VARCHAR(255) NOT NULL,
    `idAtasan` VARCHAR(36) NULL,
    `level` INTEGER NOT NULL DEFAULT 1,
    `is_opd` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ref_unit_organisasi_nama_idx`(`nama`),
    INDEX `ref_unit_organisasi_idAtasan_idx`(`idAtasan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_jenis_jabatan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(50) NOT NULL,
    `keterangan` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ref_jenis_jabatan_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_jabatan_struktural` (
    `id` VARCHAR(36) NOT NULL,
    `nama` VARCHAR(255) NOT NULL,
    `unitOrganisasiId` VARCHAR(36) NOT NULL,
    `eselon_id` INTEGER NULL,
    `bup` INTEGER NOT NULL DEFAULT 58,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ref_jabatan_struktural_nama_idx`(`nama`),
    INDEX `ref_jabatan_struktural_unitOrganisasiId_idx`(`unitOrganisasiId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_jabatan_fungsional` (
    `id` VARCHAR(36) NOT NULL,
    `nama` VARCHAR(255) NOT NULL,
    `jenjang` VARCHAR(20) NULL,
    `bup` INTEGER NOT NULL DEFAULT 65,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ref_jabatan_fungsional_nama_idx`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_jabatan_pelaksana` (
    `id` VARCHAR(36) NOT NULL,
    `nama` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ref_jabatan_pelaksana_nama_idx`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_pendidikan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(20) NULL,
    `nama` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_bidang_pendidikan` (
    `id` VARCHAR(36) NOT NULL,
    `nama` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ref_bidang_pendidikan_nama_idx`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_agama` (
    `id` INTEGER NOT NULL,
    `nama` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ref_agama_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_status_kawin` (
    `id` INTEGER NOT NULL,
    `nama` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ref_status_kawin_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_jenis_kelamin` (
    `id` INTEGER NOT NULL,
    `nama` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ref_jenis_kelamin_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_jenis_layanan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(20) NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `deskripsi` TEXT NULL,
    `butuh_tte_kepala_badan` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ref_jenis_layanan_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_persyaratan_layanan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `jenisLayananId` BIGINT NOT NULL,
    `urutan` INTEGER NULL,
    `namaPersyaratan` VARCHAR(255) NOT NULL,
    `is_required` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ref_persyaratan_layanan_jenisLayananId_idx`(`jenisLayananId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asn` (
    `id` VARCHAR(36) NOT NULL,
    `nipBaru` VARCHAR(20) NOT NULL,
    `nipLama` VARCHAR(20) NULL,
    `nama` VARCHAR(255) NOT NULL,
    `gelarDepan` VARCHAR(50) NULL,
    `gelarBelakang` VARCHAR(100) NULL,
    `tempatLahir` VARCHAR(100) NULL,
    `tanggalLahir` DATETIME(3) NULL,
    `jenisKelaminId` INTEGER NULL,
    `agamaId` INTEGER NULL,
    `statusKawinId` INTEGER NULL,
    `nik` VARCHAR(20) NULL,
    `nomorHp` VARCHAR(20) NULL,
    `email` VARCHAR(100) NULL,
    `emailGov` VARCHAR(100) NULL,
    `alamat` TEXT NULL,
    `npwp` VARCHAR(20) NULL,
    `bpjs` VARCHAR(20) NULL,
    `foto` VARCHAR(255) NULL,
    `jenisPegawai` VARCHAR(100) NULL,
    `status_pegawai` ENUM('Aktif', 'Cuti', 'Pensiun', 'Meninggal', 'Berhenti', 'Diberhentikan') NOT NULL DEFAULT 'Aktif',
    `kedudukanHukum` VARCHAR(100) NULL,
    `nomorSkCpns` VARCHAR(100) NULL,
    `tanggalSkCpns` DATETIME(3) NULL,
    `tmtCpns` DATETIME(3) NULL,
    `nomorSkPns` VARCHAR(100) NULL,
    `tanggalSkPns` DATETIME(3) NULL,
    `tmtPns` DATETIME(3) NULL,
    `golonganId` BIGINT NULL,
    `tmtGolongan` DATETIME(3) NULL,
    `mkTahun` INTEGER NOT NULL DEFAULT 0,
    `mkBulan` INTEGER NOT NULL DEFAULT 0,
    `jenisJabatanId` BIGINT NULL,
    `jabatan_struktural_id` VARCHAR(36) NULL,
    `jabatan_fungsional_id` VARCHAR(36) NULL,
    `jabatan_pelaksana_id` VARCHAR(36) NULL,
    `tmtJabatan` DATETIME(3) NULL,
    `tingkatPendidikanId` BIGINT NULL,
    `bidang_pendidikan_id` VARCHAR(36) NULL,
    `namaSekolah` VARCHAR(255) NULL,
    `tahunLulus` INTEGER NULL,
    `unit_organisasi_id` VARCHAR(36) NULL,
    `lokasiKerja` VARCHAR(255) NULL,
    `nik_valid` BOOLEAN NOT NULL DEFAULT true,
    `flag_ikd` BOOLEAN NOT NULL DEFAULT false,
    `last_sync_siasn` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `asn_nipBaru_key`(`nipBaru`),
    INDEX `asn_nipBaru_idx`(`nipBaru`),
    INDEX `asn_nama_idx`(`nama`),
    INDEX `asn_unit_organisasi_id_idx`(`unit_organisasi_id`),
    INDEX `asn_golonganId_idx`(`golonganId`),
    INDEX `asn_status_pegawai_idx`(`status_pegawai`),
    INDEX `asn_tmtPns_idx`(`tmtPns`),
    INDEX `asn_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asn_riwayat` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `asnId` VARCHAR(36) NOT NULL,
    `tipePerubahan` VARCHAR(100) NOT NULL,
    `data_lama` JSON NULL,
    `data_baru` JSON NULL,
    `keterangan` TEXT NULL,
    `diubahOleh` VARCHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `asn_riwayat_asnId_idx`(`asnId`),
    INDEX `asn_riwayat_tipePerubahan_idx`(`tipePerubahan`),
    INDEX `asn_riwayat_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usulan_layanan` (
    `id` VARCHAR(36) NOT NULL,
    `nomorUsulan` VARCHAR(50) NOT NULL,
    `jenisLayananId` BIGINT NOT NULL,
    `asnId` VARCHAR(36) NOT NULL,
    `unitOrganisasiId` VARCHAR(36) NOT NULL,
    `diajukan_oleh_id` VARCHAR(36) NULL,
    `tanggalUsulan` DATETIME(3) NOT NULL,
    `status` ENUM('Draft', 'Diajukan', 'VerifikasiAP', 'VerifikasiAM', 'QualityControl', 'ApprovalKabid', 'ApprovalKepalaBadan', 'Selesai', 'Ditolak', 'Dikembalikan', 'Diarsipkan') NOT NULL DEFAULT 'Draft',
    `tahap_saat_ini` ENUM('AP', 'AM', 'AD', 'Kabid', 'KepalaBadan') NULL,
    `tgl_masuk_ap` DATETIME(3) NULL,
    `tgl_masuk_am` DATETIME(3) NULL,
    `tgl_masuk_ad` DATETIME(3) NULL,
    `tgl_masuk_kabid` DATETIME(3) NULL,
    `tgl_masuk_kepala_badan` DATETIME(3) NULL,
    `tgl_selesai` DATETIME(3) NULL,
    `catatanAp` TEXT NULL,
    `catatanAm` TEXT NULL,
    `catatanAd` TEXT NULL,
    `catatanKabid` TEXT NULL,
    `catatanKepalaBadan` TEXT NULL,
    `alasanPenolakan` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `usulan_layanan_nomorUsulan_key`(`nomorUsulan`),
    INDEX `usulan_layanan_jenisLayananId_idx`(`jenisLayananId`),
    INDEX `usulan_layanan_asnId_idx`(`asnId`),
    INDEX `usulan_layanan_unitOrganisasiId_idx`(`unitOrganisasiId`),
    INDEX `usulan_layanan_status_idx`(`status`),
    INDEX `usulan_layanan_tahap_saat_ini_idx`(`tahap_saat_ini`),
    INDEX `usulan_layanan_tanggalUsulan_idx`(`tanggalUsulan`),
    INDEX `usulan_layanan_status_tahap_saat_ini_idx`(`status`, `tahap_saat_ini`),
    INDEX `usulan_layanan_tahap_saat_ini_tanggalUsulan_idx`(`tahap_saat_ini`, `tanggalUsulan`),
    INDEX `usulan_layanan_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usulan_dokumen` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `usulanLayananId` VARCHAR(36) NOT NULL,
    `jenisDokumen` VARCHAR(100) NULL,
    `namaFile` VARCHAR(255) NOT NULL,
    `pathFile` VARCHAR(500) NOT NULL,
    `ukuran` BIGINT NULL,
    `mimeType` VARCHAR(100) NULL,
    `hash_file` VARCHAR(64) NULL,
    `versi` INTEGER NOT NULL DEFAULT 1,
    `upload_oleh_id` VARCHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `usulan_dokumen_usulanLayananId_idx`(`usulanLayananId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usulan_workflow_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `usulanLayananId` VARCHAR(36) NOT NULL,
    `dari_tahap` ENUM('AP', 'AM', 'AD', 'Kabid', 'KepalaBadan') NULL,
    `ke_tahap` ENUM('AP', 'AM', 'AD', 'Kabid', 'KepalaBadan') NULL,
    `aksi` VARCHAR(50) NULL,
    `dilakukan_oleh_id` VARCHAR(36) NULL,
    `catatan` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `usulan_workflow_log_usulanLayananId_idx`(`usulanLayananId`),
    INDEX `usulan_workflow_log_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usulan_dokumen_output` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `usulanLayananId` VARCHAR(36) NOT NULL,
    `template_id` BIGINT NULL,
    `jenisDokumen` VARCHAR(100) NULL,
    `nomorDokumen` VARCHAR(100) NULL,
    `tanggalDokumen` DATETIME(3) NULL,
    `namaFile` VARCHAR(255) NULL,
    `pathFile` VARCHAR(500) NULL,
    `hash_file` VARCHAR(64) NULL,
    `tte_oleh_id` VARCHAR(36) NULL,
    `tgl_tte` DATETIME(3) NULL,
    `status_tte` ENUM('Draft', 'PendingTte', 'Signed') NOT NULL DEFAULT 'Draft',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `usulan_dokumen_output_usulanLayananId_idx`(`usulanLayananId`),
    INDEX `usulan_dokumen_output_status_tte_idx`(`status_tte`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(50) NOT NULL,
    `deskripsi` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `role_nama_key`(`nama`),
    INDEX `role_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(36) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `namaLengkap` VARCHAR(255) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `nomorHp` VARCHAR(20) NULL,
    `unitOrganisasiId` VARCHAR(36) NULL,
    `asnId` VARCHAR(36) NULL,
    `roleId` BIGINT NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `email_verified_at` DATETIME(3) NULL,
    `must_change_password` BOOLEAN NOT NULL DEFAULT false,
    `login_attempts` INTEGER NOT NULL DEFAULT 0,
    `locked_at` DATETIME(3) NULL,
    `last_login` DATETIME(3) NULL,
    `password_changed_at` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `user_username_key`(`username`),
    UNIQUE INDEX `user_email_key`(`email`),
    INDEX `user_username_idx`(`username`),
    INDEX `user_email_idx`(`email`),
    INDEX `user_unitOrganisasiId_idx`(`unitOrganisasiId`),
    INDEX `user_roleId_idx`(`roleId`),
    INDEX `user_is_active_idx`(`is_active`),
    INDEX `user_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_token` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(36) NOT NULL,
    `token` VARCHAR(500) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `revoked_at` DATETIME(3) NULL,
    `ip_address` VARCHAR(50) NULL,
    `user_agent` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `refresh_token_token_key`(`token`),
    INDEX `refresh_token_userId_idx`(`userId`),
    INDEX `refresh_token_token_idx`(`token`),
    INDEX `refresh_token_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_password_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(36) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_password_history_userId_idx`(`userId`),
    INDEX `user_password_history_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permission` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `roleId` BIGINT NOT NULL,
    `module` VARCHAR(100) NULL,
    `permission` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `role_permission_roleId_idx`(`roleId`),
    UNIQUE INDEX `role_permission_roleId_module_permission_key`(`roleId`, `module`, `permission`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifikasi` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(36) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `judul` VARCHAR(255) NULL,
    `isi` TEXT NULL,
    `link` VARCHAR(500) NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `read_at` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifikasi_userId_idx`(`userId`),
    INDEX `notifikasi_is_read_idx`(`is_read`),
    INDEX `notifikasi_createdAt_idx`(`createdAt`),
    INDEX `notifikasi_userId_is_read_idx`(`userId`, `is_read`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `laporan_harian` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tanggalLaporan` DATETIME(3) NOT NULL,
    `usulanMasuk` INTEGER NOT NULL DEFAULT 0,
    `usulanSelesai` INTEGER NOT NULL DEFAULT 0,
    `usulanDikembalikan` INTEGER NOT NULL DEFAULT 0,
    `melampauiSla` INTEGER NOT NULL DEFAULT 0,
    `rataRataProsesHari` DECIMAL(5, 2) NULL,
    `dataJson` JSON NULL,
    `generatedAt` DATETIME(3) NULL,
    `sent_at` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `laporan_harian_tanggalLaporan_key`(`tanggalLaporan`),
    INDEX `laporan_harian_tanggalLaporan_idx`(`tanggalLaporan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `laporan_bulanan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tahun` INTEGER NOT NULL,
    `bulan` INTEGER NOT NULL,
    `totalLayananSelesai` INTEGER NOT NULL DEFAULT 0,
    `capaiSlaPercent` DECIMAL(5, 2) NULL,
    `melampauiSlaCount` INTEGER NOT NULL DEFAULT 0,
    `dataJson` JSON NULL,
    `generatedAt` DATETIME(3) NULL,
    `sent_at` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `laporan_bulanan_tahun_bulan_idx`(`tahun`, `bulan`),
    UNIQUE INDEX `laporan_bulanan_tahun_bulan_key`(`tahun`, `bulan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `config_sla` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `jenisLayananId` BIGINT NULL,
    `jabatan` VARCHAR(50) NULL,
    `slaHari` INTEGER NOT NULL,
    `sla_jam` INTEGER NOT NULL DEFAULT 0,
    `eskalasi_hari` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `config_sla_jenisLayananId_idx`(`jenisLayananId`),
    UNIQUE INDEX `config_sla_jenisLayananId_jabatan_key`(`jenisLayananId`, `jabatan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `config_notifikasi` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `event_type` VARCHAR(100) NULL,
    `channel` ENUM('InApp', 'Email', 'WhatsApp', 'SMS') NULL,
    `penerima_role` VARCHAR(50) NULL,
    `template_message` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `config_laporan_otomatis` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `jenis_laporan` ENUM('Harian', 'Bulanan') NULL,
    `jadwal_pengiriman` VARCHAR(100) NULL,
    `format_laporan` ENUM('PDF', 'Excel') NULL,
    `penerima_role` VARCHAR(50) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_sent` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(36) NULL,
    `user_nama` VARCHAR(255) NULL,
    `action` VARCHAR(100) NULL,
    `entity_type` VARCHAR(100) NULL,
    `entity_id` VARCHAR(36) NULL,
    `old_values` JSON NULL,
    `new_values` JSON NULL,
    `ip_address` VARCHAR(50) NULL,
    `user_agent` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_log_userId_idx`(`userId`),
    INDEX `audit_log_action_idx`(`action`),
    INDEX `audit_log_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `audit_log_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `siasn_import_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `filename` VARCHAR(255) NOT NULL,
    `jenisData` VARCHAR(100) NOT NULL,
    `totalBaris` INTEGER NOT NULL,
    `success_baris` INTEGER NOT NULL DEFAULT 0,
    `failed_baris` INTEGER NOT NULL DEFAULT 0,
    `error_details` JSON NULL,
    `imported_oleh_id` VARCHAR(36) NULL,
    `status` ENUM('Pending', 'Processing', 'Success', 'PartialFail', 'Failed') NOT NULL DEFAULT 'Pending',
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `siasn_import_log_jenisData_idx`(`jenisData`),
    INDEX `siasn_import_log_status_idx`(`status`),
    INDEX `siasn_import_log_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `siasn_import_error` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `import_log_id` BIGINT NOT NULL,
    `nomor_baris` INTEGER NOT NULL,
    `nomor_id` VARCHAR(100) NULL,
    `data_asli` JSON NOT NULL,
    `error_message` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `siasn_import_error_import_log_id_idx`(`import_log_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sla_tracker` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `usulanId` VARCHAR(36) NOT NULL,
    `tahap_saat` ENUM('AP', 'AM', 'AD', 'Kabid', 'KepalaBadan') NOT NULL,
    `masuk_tahap` DATETIME(3) NOT NULL,
    `sla_hari` INTEGER NOT NULL,
    `sla_jam` INTEGER NOT NULL DEFAULT 0,
    `sla_habis_at` DATETIME(3) NOT NULL,
    `status_sla` ENUM('OK', 'Warning', 'Overdue', 'Selesai') NOT NULL DEFAULT 'OK',
    `eskalasi` BOOLEAN NOT NULL DEFAULT false,
    `eskalasi_buat` DATETIME(3) NULL,
    `selesai_at` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `sla_tracker_usulanId_idx`(`usulanId`),
    INDEX `sla_tracker_status_sla_idx`(`status_sla`),
    INDEX `sla_tracker_sla_habis_at_idx`(`sla_habis_at`),
    INDEX `sla_tracker_tahap_saat_status_sla_idx`(`tahap_saat`, `status_sla`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usulan_revisi` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `usulanId` VARCHAR(36) NOT NULL,
    `nomor_revisi` INTEGER NOT NULL,
    `dari_tahap` ENUM('AP', 'AM', 'AD', 'Kabid', 'KepalaBadan') NOT NULL,
    `ke_tahap` ENUM('AP', 'AM', 'AD', 'Kabid', 'KepalaBadan') NULL,
    `alasan_dikembalikan` TEXT NOT NULL,
    `dikembalikan_oleh_id` VARCHAR(36) NOT NULL,
    `tgl_dikembalikan` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status_revisi` ENUM('Menunggu', 'Direvisi', 'Selesai') NOT NULL DEFAULT 'Menunggu',
    `catatan_perbaikan` TEXT NULL,
    `tgl_resubmit` DATETIME(3) NULL,
    `resubmit_oleh_id` VARCHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `usulan_revisi_usulanId_idx`(`usulanId`),
    INDEX `usulan_revisi_status_revisi_idx`(`status_revisi`),
    INDEX `usulan_revisi_dikembalikan_oleh_id_idx`(`dikembalikan_oleh_id`),
    UNIQUE INDEX `usulan_revisi_usulanId_nomor_revisi_key`(`usulanId`, `nomor_revisi`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asn_peremajaan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `asnId` VARCHAR(36) NOT NULL,
    `jenis_perubahan` VARCHAR(100) NOT NULL,
    `data_lama` JSON NULL,
    `data_baru` JSON NULL,
    `dokumen_bukti` VARCHAR(500) NULL,
    `status_approval` ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    `diajukan_oleh_id` VARCHAR(36) NOT NULL,
    `disetujui_oleh_id` VARCHAR(36) NULL,
    `catatan` TEXT NULL,
    `approved_at` DATETIME(3) NULL,
    `rejected_at` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `asn_peremajaan_asnId_idx`(`asnId`),
    INDEX `asn_peremajaan_jenis_perubahan_idx`(`jenis_perubahan`),
    INDEX `asn_peremajaan_status_approval_idx`(`status_approval`),
    INDEX `asn_peremajaan_diajukan_oleh_id_idx`(`diajukan_oleh_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `template_dokumen` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `jenis_layanan_id` BIGINT NULL,
    `kode` VARCHAR(50) NOT NULL,
    `nama` VARCHAR(255) NOT NULL,
    `deskripsi` TEXT NULL,
    `konten` LONGTEXT NOT NULL,
    `variabel` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `template_dokumen_kode_key`(`kode`),
    INDEX `template_dokumen_jenis_layanan_id_idx`(`jenis_layanan_id`),
    INDEX `template_dokumen_is_active_idx`(`is_active`),
    INDEX `template_dokumen_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `perencanaan_pensiun` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `asn_id` VARCHAR(36) NOT NULL,
    `tanggal_bup` DATETIME(3) NOT NULL,
    `tahun_bup` INTEGER NOT NULL,
    `bup_usia` INTEGER NOT NULL,
    `keterangan` TEXT NULL,
    `sudah_diproses` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `perencanaan_pensiun_asn_id_key`(`asn_id`),
    INDEX `perencanaan_pensiun_tanggal_bup_idx`(`tanggal_bup`),
    INDEX `perencanaan_pensiun_tahun_bup_idx`(`tahun_bup`),
    INDEX `perencanaan_pensiun_sudah_diproses_idx`(`sudah_diproses`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `arsip_usulan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `usulan_layanan_id` VARCHAR(36) NOT NULL,
    `alasan_arsip` TEXT NULL,
    `diarsipkan_oleh_id` VARCHAR(36) NULL,
    `data_snapshot` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `arsip_usulan_usulan_layanan_id_idx`(`usulan_layanan_id`),
    INDEX `arsip_usulan_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifikasi_template` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `config_id` BIGINT NOT NULL,
    `event_type` VARCHAR(100) NOT NULL,
    `subject` VARCHAR(255) NULL,
    `body` TEXT NOT NULL,
    `channels` VARCHAR(200) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `notifikasi_template_config_id_idx`(`config_id`),
    INDEX `notifikasi_template_event_type_idx`(`event_type`),
    INDEX `notifikasi_template_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `laporan_daily_breakdown` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `laporan_harian_id` BIGINT NOT NULL,
    `dimensi` VARCHAR(50) NOT NULL,
    `dimensi_value` VARCHAR(255) NOT NULL,
    `usulan_masuk` INTEGER NOT NULL DEFAULT 0,
    `usulan_selesai` INTEGER NOT NULL DEFAULT 0,
    `usulan_dikembalikan` INTEGER NOT NULL DEFAULT 0,
    `melampaui_sla` INTEGER NOT NULL DEFAULT 0,
    `rata_rata_hari` DECIMAL(5, 2) NULL,
    `data_json` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `laporan_daily_breakdown_laporan_harian_id_idx`(`laporan_harian_id`),
    INDEX `laporan_daily_breakdown_dimensi_idx`(`dimensi`),
    INDEX `laporan_daily_breakdown_dimensi_dimensi_value_idx`(`dimensi`, `dimensi_value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ref_gaji_pokok` ADD CONSTRAINT `ref_gaji_pokok_golonganId_fkey` FOREIGN KEY (`golonganId`) REFERENCES `ref_golongan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ref_unit_organisasi` ADD CONSTRAINT `ref_unit_organisasi_idAtasan_fkey` FOREIGN KEY (`idAtasan`) REFERENCES `ref_unit_organisasi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ref_jabatan_struktural` ADD CONSTRAINT `ref_jabatan_struktural_unitOrganisasiId_fkey` FOREIGN KEY (`unitOrganisasiId`) REFERENCES `ref_unit_organisasi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ref_persyaratan_layanan` ADD CONSTRAINT `ref_persyaratan_layanan_jenisLayananId_fkey` FOREIGN KEY (`jenisLayananId`) REFERENCES `ref_jenis_layanan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asn` ADD CONSTRAINT `asn_golonganId_fkey` FOREIGN KEY (`golonganId`) REFERENCES `ref_golongan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asn` ADD CONSTRAINT `asn_jenisJabatanId_fkey` FOREIGN KEY (`jenisJabatanId`) REFERENCES `ref_jenis_jabatan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asn` ADD CONSTRAINT `asn_jabatan_struktural_id_fkey` FOREIGN KEY (`jabatan_struktural_id`) REFERENCES `ref_jabatan_struktural`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asn` ADD CONSTRAINT `asn_jabatan_fungsional_id_fkey` FOREIGN KEY (`jabatan_fungsional_id`) REFERENCES `ref_jabatan_fungsional`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asn` ADD CONSTRAINT `asn_jabatan_pelaksana_id_fkey` FOREIGN KEY (`jabatan_pelaksana_id`) REFERENCES `ref_jabatan_pelaksana`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asn` ADD CONSTRAINT `asn_unit_organisasi_id_fkey` FOREIGN KEY (`unit_organisasi_id`) REFERENCES `ref_unit_organisasi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asn` ADD CONSTRAINT `asn_tingkatPendidikanId_fkey` FOREIGN KEY (`tingkatPendidikanId`) REFERENCES `ref_pendidikan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asn` ADD CONSTRAINT `asn_bidang_pendidikan_id_fkey` FOREIGN KEY (`bidang_pendidikan_id`) REFERENCES `ref_bidang_pendidikan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asn` ADD CONSTRAINT `asn_jenisKelaminId_fkey` FOREIGN KEY (`jenisKelaminId`) REFERENCES `ref_jenis_kelamin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asn` ADD CONSTRAINT `asn_agamaId_fkey` FOREIGN KEY (`agamaId`) REFERENCES `ref_agama`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asn` ADD CONSTRAINT `asn_statusKawinId_fkey` FOREIGN KEY (`statusKawinId`) REFERENCES `ref_status_kawin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asn_riwayat` ADD CONSTRAINT `asn_riwayat_asnId_fkey` FOREIGN KEY (`asnId`) REFERENCES `asn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usulan_layanan` ADD CONSTRAINT `usulan_layanan_jenisLayananId_fkey` FOREIGN KEY (`jenisLayananId`) REFERENCES `ref_jenis_layanan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usulan_layanan` ADD CONSTRAINT `usulan_layanan_asnId_fkey` FOREIGN KEY (`asnId`) REFERENCES `asn`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usulan_layanan` ADD CONSTRAINT `usulan_layanan_unitOrganisasiId_fkey` FOREIGN KEY (`unitOrganisasiId`) REFERENCES `ref_unit_organisasi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usulan_layanan` ADD CONSTRAINT `usulan_layanan_diajukan_oleh_id_fkey` FOREIGN KEY (`diajukan_oleh_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usulan_dokumen` ADD CONSTRAINT `usulan_dokumen_usulanLayananId_fkey` FOREIGN KEY (`usulanLayananId`) REFERENCES `usulan_layanan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usulan_dokumen` ADD CONSTRAINT `usulan_dokumen_upload_oleh_id_fkey` FOREIGN KEY (`upload_oleh_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usulan_workflow_log` ADD CONSTRAINT `usulan_workflow_log_usulanLayananId_fkey` FOREIGN KEY (`usulanLayananId`) REFERENCES `usulan_layanan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usulan_workflow_log` ADD CONSTRAINT `usulan_workflow_log_dilakukan_oleh_id_fkey` FOREIGN KEY (`dilakukan_oleh_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usulan_dokumen_output` ADD CONSTRAINT `usulan_dokumen_output_usulanLayananId_fkey` FOREIGN KEY (`usulanLayananId`) REFERENCES `usulan_layanan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usulan_dokumen_output` ADD CONSTRAINT `usulan_dokumen_output_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `template_dokumen`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usulan_dokumen_output` ADD CONSTRAINT `usulan_dokumen_output_tte_oleh_id_fkey` FOREIGN KEY (`tte_oleh_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_unitOrganisasiId_fkey` FOREIGN KEY (`unitOrganisasiId`) REFERENCES `ref_unit_organisasi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_asnId_fkey` FOREIGN KEY (`asnId`) REFERENCES `asn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_token` ADD CONSTRAINT `refresh_token_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_password_history` ADD CONSTRAINT `user_password_history_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permission` ADD CONSTRAINT `role_permission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifikasi` ADD CONSTRAINT `notifikasi_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `config_sla` ADD CONSTRAINT `config_sla_jenisLayananId_fkey` FOREIGN KEY (`jenisLayananId`) REFERENCES `ref_jenis_layanan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `siasn_import_log` ADD CONSTRAINT `siasn_import_log_imported_oleh_id_fkey` FOREIGN KEY (`imported_oleh_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `siasn_import_error` ADD CONSTRAINT `siasn_import_error_import_log_id_fkey` FOREIGN KEY (`import_log_id`) REFERENCES `siasn_import_log`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sla_tracker` ADD CONSTRAINT `sla_tracker_usulanId_fkey` FOREIGN KEY (`usulanId`) REFERENCES `usulan_layanan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usulan_revisi` ADD CONSTRAINT `usulan_revisi_usulanId_fkey` FOREIGN KEY (`usulanId`) REFERENCES `usulan_layanan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usulan_revisi` ADD CONSTRAINT `usulan_revisi_dikembalikan_oleh_id_fkey` FOREIGN KEY (`dikembalikan_oleh_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usulan_revisi` ADD CONSTRAINT `usulan_revisi_resubmit_oleh_id_fkey` FOREIGN KEY (`resubmit_oleh_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asn_peremajaan` ADD CONSTRAINT `asn_peremajaan_asnId_fkey` FOREIGN KEY (`asnId`) REFERENCES `asn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asn_peremajaan` ADD CONSTRAINT `asn_peremajaan_diajukan_oleh_id_fkey` FOREIGN KEY (`diajukan_oleh_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asn_peremajaan` ADD CONSTRAINT `asn_peremajaan_disetujui_oleh_id_fkey` FOREIGN KEY (`disetujui_oleh_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `template_dokumen` ADD CONSTRAINT `template_dokumen_jenis_layanan_id_fkey` FOREIGN KEY (`jenis_layanan_id`) REFERENCES `ref_jenis_layanan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `perencanaan_pensiun` ADD CONSTRAINT `perencanaan_pensiun_asn_id_fkey` FOREIGN KEY (`asn_id`) REFERENCES `asn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `arsip_usulan` ADD CONSTRAINT `arsip_usulan_usulan_layanan_id_fkey` FOREIGN KEY (`usulan_layanan_id`) REFERENCES `usulan_layanan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `arsip_usulan` ADD CONSTRAINT `arsip_usulan_diarsipkan_oleh_id_fkey` FOREIGN KEY (`diarsipkan_oleh_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifikasi_template` ADD CONSTRAINT `notifikasi_template_config_id_fkey` FOREIGN KEY (`config_id`) REFERENCES `config_notifikasi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laporan_daily_breakdown` ADD CONSTRAINT `laporan_daily_breakdown_laporan_harian_id_fkey` FOREIGN KEY (`laporan_harian_id`) REFERENCES `laporan_harian`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
