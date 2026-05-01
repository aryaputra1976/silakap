export const ROLES = {
  PENGELOLA_OPD: 'Pengelola_OPD',
  ANALIS_PERTAMA: 'Analis_Pertama',
  ANALIS_MUDA: 'Analis_Muda',
  ANALIS_MADYA: 'Analis_Madya',
  KABID: 'Kabid',
  KEPALA_BADAN: 'Kepala_Badan',
  ADMIN_SISTEM: 'Admin_Sistem',
} as const

export const SLA_DEFAULT = {
  AP: { hari: 1, jam: 0 },
  AM: { hari: 2, jam: 0 },
  AD: { hari: 2, jam: 0 },
  Kabid: { hari: 1, jam: 0 },
  KepalaBadan: { hari: 1, jam: 0 },
} as const

export const MAX_REVISI = 3
export const NOTIF_SLA_WARNING_JAM = 4
