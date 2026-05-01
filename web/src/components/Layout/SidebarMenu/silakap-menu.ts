import type { RoleName } from "@/types/models";

export interface MenuItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  children?: { label: string; href: string }[];
}

export const SILAKAP_MENUS: Record<RoleName, MenuItem[]> = {
  Pengelola_OPD: [
    { label: "Dashboard", href: "/dashboard/opd", icon: "dashboard" },
    {
      label: "Layanan Kepegawaian",
      href: "#",
      icon: "folder_open",
      children: [
        { label: "Buat Usulan", href: "/layanan/buat" },
        { label: "Draft Saya", href: "/layanan/draft" },
        { label: "Pengajuan Aktif", href: "/layanan/aktif" },
        { label: "Dikembalikan", href: "/layanan/dikembalikan" },
        { label: "Download Hasil", href: "/layanan/selesai" },
        { label: "Riwayat Selesai", href: "/layanan/selesai" },
        { label: "Semua Usulan", href: "/layanan" },
      ],
    },
    { label: "Data ASN", href: "/asn", icon: "people" },
    { label: "Peremajaan ASN", href: "/asn/peremajaan", icon: "manage_accounts" },
    { label: "Notifikasi", href: "/notifikasi", icon: "notifications" },
  ],

  Analis_Pertama: [
    { label: "Dashboard", href: "/dashboard/analis-pertama", icon: "dashboard" },
    {
      label: "Antrian Verifikasi",
      href: "#",
      icon: "assignment",
      children: [
        { label: "Semua Antrian", href: "/layanan?tahap=AP" },
        { label: "Overdue SLA", href: "/layanan?tahap=AP&sla=overdue" },
        { label: "Riwayat", href: "/layanan?status=Selesai" },
      ],
    },
    { label: "Referensi", href: "/referensi", icon: "dataset" },
    { label: "Statistik", href: "/statistik", icon: "monitoring" },
    { label: "Reject Counter", href: "/reject-counter", icon: "rule" },
    { label: "Data ASN", href: "/asn", icon: "people" },
    { label: "Notifikasi", href: "/notifikasi", icon: "notifications" },
  ],

  Analis_Muda: [
    { label: "Dashboard", href: "/dashboard/analis-muda", icon: "dashboard" },
    {
      label: "Antrian Verifikasi",
      href: "#",
      icon: "fact_check",
      children: [
        { label: "Semua Antrian", href: "/layanan?tahap=AM" },
        { label: "Overdue SLA", href: "/layanan?tahap=AM&sla=overdue" },
        { label: "Riwayat", href: "/layanan?status=Selesai" },
      ],
    },
    { label: "Referensi", href: "/referensi", icon: "dataset" },
    { label: "Statistik", href: "/statistik", icon: "monitoring" },
    { label: "Reject Counter", href: "/reject-counter", icon: "rule" },
    { label: "Data ASN", href: "/asn", icon: "people" },
    { label: "Peremajaan ASN", href: "/asn/peremajaan", icon: "manage_accounts" },
    { label: "Notifikasi", href: "/notifikasi", icon: "notifications" },
  ],

  Analis_Madya: [
    { label: "Dashboard", href: "/dashboard/analis-madya", icon: "dashboard" },
    {
      label: "Quality Control",
      href: "#",
      icon: "verified",
      children: [
        { label: "Semua Antrian", href: "/layanan?tahap=AD" },
        { label: "Overdue SLA", href: "/layanan?tahap=AD&sla=overdue" },
        { label: "Riwayat", href: "/layanan?status=Selesai" },
      ],
    },
    { label: "Referensi", href: "/referensi", icon: "dataset" },
    { label: "Statistik", href: "/statistik", icon: "monitoring" },
    { label: "Reject Counter", href: "/reject-counter", icon: "rule" },
    { label: "Data ASN", href: "/asn", icon: "people" },
    { label: "Notifikasi", href: "/notifikasi", icon: "notifications" },
  ],

  Kabid: [
    { label: "Dashboard", href: "/dashboard/kabid", icon: "dashboard" },
    {
      label: "Approval",
      href: "#",
      icon: "approval",
      children: [
        { label: "Antrian Approval", href: "/layanan?tahap=Kabid" },
        { label: "Overdue SLA", href: "/layanan?tahap=Kabid&sla=overdue" },
        { label: "Sudah Disetujui", href: "/layanan?status=Selesai" },
        { label: "Semua Usulan", href: "/layanan" },
      ],
    },
    {
      label: "Laporan",
      href: "#",
      icon: "assessment",
      children: [
        { label: "Laporan Harian", href: "/laporan/harian" },
        { label: "Laporan Bulanan", href: "/laporan/bulanan" },
      ],
    },
    {
      label: "Monitoring",
      href: "#",
      icon: "monitoring",
      children: [
        { label: "Beban Kerja", href: "/dashboard/beban-kerja" },
        { label: "SLA Tahapan", href: "/dashboard/sla-tahapan" },
        { label: "Analytics Kabid", href: "/dashboard/analytics-kabid" },
        { label: "Reject Counter", href: "/reject-counter" },
      ],
    },
    { label: "Data ASN", href: "/asn", icon: "people" },
    { label: "Perencanaan Pensiun", href: "/perencanaan", icon: "event" },
    { label: "Arsip", href: "/arsip", icon: "archive" },
    { label: "Pengaturan SLA", href: "/admin/pengaturan", icon: "schedule" },
    { label: "Notifikasi", href: "/notifikasi", icon: "notifications" },
  ],

  Kepala_Badan: [
    { label: "Dashboard", href: "/dashboard/kepala-badan", icon: "dashboard" },
    {
      label: "TTE & Approval",
      href: "#",
      icon: "draw",
      children: [
        { label: "Menunggu TTE", href: "/layanan?tahap=KepalaBadan" },
        { label: "Riwayat TTE", href: "/layanan?status=Selesai" },
        { label: "Semua Usulan", href: "/layanan" },
      ],
    },
    {
      label: "Laporan",
      href: "#",
      icon: "assessment",
      children: [
        { label: "Laporan Harian", href: "/laporan/harian" },
        { label: "Laporan Bulanan", href: "/laporan/bulanan" },
      ],
    },
    { label: "Data ASN", href: "/asn", icon: "people" },
    { label: "Perencanaan Pensiun", href: "/perencanaan", icon: "event" },
    { label: "Notifikasi", href: "/notifikasi", icon: "notifications" },
  ],

  Admin_Sistem: [
    { label: "Dashboard", href: "/dashboard/admin", icon: "admin_panel_settings" },
    { label: "Health Dashboard", href: "/admin/health", icon: "health_and_safety" },
    {
      label: "Layanan",
      href: "#",
      icon: "folder_open",
      children: [
        { label: "Semua Usulan", href: "/layanan" },
        { label: "Arsip", href: "/arsip" },
      ],
    },
    {
      label: "User & Role",
      href: "#",
      icon: "manage_accounts",
      children: [
        { label: "Users", href: "/admin/users" },
        { label: "Roles & Permission", href: "/admin/roles" },
      ],
    },
    {
      label: "Integrasi SIASN",
      href: "#",
      icon: "sync",
      children: [
        { label: "Status & Validasi", href: "/admin/integrasi" },
        { label: "Import ASN", href: "/admin/integrasi#import-asn" },
        { label: "Log Import", href: "/admin/integrasi#log" },
      ],
    },
    {
      label: "Konfigurasi",
      href: "#",
      icon: "settings",
      children: [
        { label: "Pengaturan SLA", href: "/admin/pengaturan" },
        { label: "Pengaturan Email", href: "/admin/pengaturan/email" },
        { label: "Notifikasi", href: "/admin/pengaturan/notifikasi" },
        { label: "Laporan Otomatis", href: "/admin/pengaturan/laporan-otomatis" },
        { label: "Referensi Data", href: "/admin/referensi" },
      ],
    },
    { label: "Laporan", href: "/laporan", icon: "assessment" },
    { label: "Perencanaan Pensiun", href: "/perencanaan", icon: "event" },
    { label: "Audit Log", href: "/audit", icon: "policy" },
    { label: "Data ASN", href: "/asn", icon: "people" },
    { label: "Notifikasi", href: "/notifikasi", icon: "notifications" },
  ],
};
