import type { RoleName, StatusUsulan, TahapUsulan } from "@/types/models";

export const ROLE_LABELS: Record<RoleName, string> = {
  Pengelola_OPD: "Pengelola OPD",
  Analis_Pertama: "Analis Pertama",
  Analis_Muda: "Analis Muda",
  Analis_Madya: "Analis Madya",
  Kabid: "Kabid",
  Kepala_Badan: "Kepala Badan",
  Admin_Sistem: "Administrator Sistem",
};

export const STATUS_USULAN_LABELS: Record<StatusUsulan | "DalamProses", string> = {
  Draft: "Draft",
  Diajukan: "Diajukan",
  VerifikasiAP: "Verifikasi Analis Pertama",
  VerifikasiAM: "Verifikasi Analis Muda",
  QualityControl: "Quality Control Analis Madya",
  ApprovalKabid: "Persetujuan Kabid",
  ApprovalKepalaBadan: "Persetujuan Kepala Badan",
  Selesai: "Selesai",
  Ditolak: "Ditolak",
  Dikembalikan: "Dikembalikan",
  Diarsipkan: "Diarsipkan",
  DalamProses: "Dalam Proses",
};

export const TAHAP_USULAN_LABELS: Record<TahapUsulan, string> = {
  AP: "Analis Pertama",
  AM: "Analis Muda",
  AD: "Analis Madya",
  Kabid: "Kabid",
  KepalaBadan: "Kepala Badan",
};

export const WORKFLOW_ACTION_LABELS: Record<string, string> = {
  SUBMIT: "Dikirim",
  TERIMA: "Diterima",
  TERUSKAN: "Diteruskan",
  KEMBALIKAN: "Dikembalikan",
  SETUJUI: "Disetujui",
  BATAL: "Dibatalkan",
  RESUBMIT: "Dikirim Ulang",
};

const fallbackLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\bAP\b/g, "Analis Pertama")
    .replace(/\bAM\b/g, "Analis Muda")
    .replace(/\bAD\b/g, "Analis Madya");

export const displayRoleLabel = (role?: string | null) =>
  role ? ROLE_LABELS[role as RoleName] ?? fallbackLabel(role) : "-";

export const displayStatusLabel = (status?: string | null) =>
  status ? STATUS_USULAN_LABELS[status as StatusUsulan | "DalamProses"] ?? fallbackLabel(status) : "-";

export const displayTahapLabel = (tahap?: string | null) =>
  tahap ? TAHAP_USULAN_LABELS[tahap as TahapUsulan] ?? fallbackLabel(tahap) : "-";

export const displayWorkflowActionLabel = (action?: string | null) =>
  action ? WORKFLOW_ACTION_LABELS[action] ?? fallbackLabel(action) : "-";
