import type { RoleName } from "@/types/models";

export const DASHBOARD_BY_ROLE: Record<RoleName, string> = {
  Pengelola_OPD: "/dashboard",
  Analis_Pertama: "/dashboard",
  Analis_Muda: "/dashboard",
  Analis_Madya: "/dashboard",
  Kabid: "/dashboard",
  Kepala_Badan: "/dashboard",
  Admin_Sistem: "/dashboard",
};

const ROLE_ALIASES: Record<string, RoleName> = {
  pengelola_opd: "Pengelola_OPD",
  opd: "Pengelola_OPD",
  analis_pertama: "Analis_Pertama",
  ap: "Analis_Pertama",
  analis_muda: "Analis_Muda",
  am: "Analis_Muda",
  analis_madya: "Analis_Madya",
  ad: "Analis_Madya",
  kabid: "Kabid",
  kepala_bidang: "Kabid",
  kepala_bidang_mutasi: "Kabid",
  kepala_badan: "Kepala_Badan",
  admin: "Admin_Sistem",
  admin_sistem: "Admin_Sistem",
  administrator: "Admin_Sistem",
  administrator_sistem: "Admin_Sistem",
};

const toRoleKey = (roleName: string) =>
  roleName.trim().toLowerCase().replace(/[\s-]+/g, "_");

export const normalizeRoleName = (
  roleName: string | null | undefined,
): RoleName => ROLE_ALIASES[toRoleKey(roleName ?? "")] ?? "Pengelola_OPD";

export const resolveDashboardPath = (roleName: string | null | undefined) =>
  DASHBOARD_BY_ROLE[normalizeRoleName(roleName)];
