ALTER TABLE `asn_peremajaan`
  ADD COLUMN `ditugaskan_kepada_id` VARCHAR(36) NULL,
  ADD COLUMN `ditugaskan_at` DATETIME(3) NULL;

CREATE INDEX `asn_peremajaan_ditugaskan_kepada_id_idx` ON `asn_peremajaan`(`ditugaskan_kepada_id`);
CREATE INDEX `asn_peremajaan_status_assignment_idx` ON `asn_peremajaan`(`status_approval`, `ditugaskan_kepada_id`);

ALTER TABLE `asn_peremajaan`
  ADD CONSTRAINT `asn_peremajaan_ditugaskan_kepada_id_fkey`
  FOREIGN KEY (`ditugaskan_kepada_id`) REFERENCES `user`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
