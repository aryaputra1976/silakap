-- Phase 3 hardening indexes for production list/filter/cron workloads.

CREATE INDEX `usulan_layanan_deleted_at_status_created_at_idx`
  ON `usulan_layanan` (`deleted_at`, `status`, `createdAt`);

CREATE INDEX `usulan_layanan_unit_organisasi_id_status_created_at_idx`
  ON `usulan_layanan` (`unitOrganisasiId`, `status`, `createdAt`);

CREATE INDEX `usulan_layanan_status_tgl_selesai_idx`
  ON `usulan_layanan` (`status`, `tgl_selesai`);

CREATE INDEX `usulan_dokumen_output_usulan_layanan_id_status_tte_idx`
  ON `usulan_dokumen_output` (`usulanLayananId`, `status_tte`);

CREATE INDEX `notifikasi_user_id_created_at_idx`
  ON `notifikasi` (`userId`, `createdAt`);

CREATE INDEX `config_notifikasi_event_type_idx`
  ON `config_notifikasi` (`event_type`);

CREATE INDEX `config_notifikasi_channel_idx`
  ON `config_notifikasi` (`channel`);

CREATE INDEX `config_notifikasi_penerima_role_idx`
  ON `config_notifikasi` (`penerima_role`);

CREATE INDEX `config_notifikasi_is_active_idx`
  ON `config_notifikasi` (`is_active`);

CREATE INDEX `config_laporan_otomatis_jenis_laporan_idx`
  ON `config_laporan_otomatis` (`jenis_laporan`);

CREATE INDEX `config_laporan_otomatis_penerima_role_idx`
  ON `config_laporan_otomatis` (`penerima_role`);

CREATE INDEX `config_laporan_otomatis_is_active_idx`
  ON `config_laporan_otomatis` (`is_active`);

CREATE INDEX `sla_tracker_selesai_at_status_sla_sla_habis_at_idx`
  ON `sla_tracker` (`selesai_at`, `status_sla`, `sla_habis_at`);
