import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface DashboardRingkasan {
  totalDraft: number;
  totalDalamProses: number;
  totalSelesai: number;
  totalDikembalikan: number;
  totalBatal: number;
  totalSlaWarning: number;
  totalSlaOverdue: number;
}

export interface DashboardPerJenis {
  jenisLayananId: string;
  jenisLayanan: { nama: string } | null;
  total: number;
}

export interface DashboardAntrian {
  tahapSaatIni: string | null;
  _count: { _all: number };
}

export interface DashboardLaporanHarian {
  tanggalLaporan: string;
  usulanMasuk: number;
  usulanSelesai: number;
  usulanDikembalikan: number;
  melampauiSla: number;
}

export interface DashboardAktivitas {
  id: string;
  aksi: string;
  catatan: string | null;
  createdAt: string;
  usulanLayanan: { nomorUsulan: string } | null;
  dilakukanOleh: { namaLengkap: string } | null;
}

export interface DashboardSlaTrend {
  tanggal: string;
  statusSla: string;
  total: number | string;
}

export interface DashboardThroughput {
  tanggal: string;
  masuk: number | string;
  selesai: number | string;
}

export interface DashboardBottleneck {
  tahap: string;
  total: number | string;
  rataJamMenunggu: number | string | null;
}

export interface DashboardRankingOpd {
  unitOrganisasiId: string;
  unitOrganisasi: string;
  totalUsulan: number | string;
  totalSelesai: number | string;
  totalDikembalikan: number | string;
  totalOverdue: number | string;
}

export const useDashboardRingkasan = (unitOrganisasiId?: string) =>
  useQuery({
    queryKey: ["dashboard", "ringkasan", unitOrganisasiId],
    queryFn: async () => {
      const params = unitOrganisasiId ? { unitOrganisasiId } : {};
      const { data } = await api.get<{ data: DashboardRingkasan }>(
        "/dashboard/ringkasan",
        { params },
      );
      return data.data;
    },
  });

export const useDashboardPerJenis = () =>
  useQuery({
    queryKey: ["dashboard", "per-jenis"],
    queryFn: async () => {
      const { data } = await api.get<{ data: DashboardPerJenis[] }>(
        "/dashboard/per-jenis-layanan",
      );
      return data.data;
    },
  });

export const useDashboardAntrian = () =>
  useQuery({
    queryKey: ["dashboard", "antrian"],
    queryFn: async () => {
      const { data } = await api.get<{ data: DashboardAntrian[] }>(
        "/dashboard/antrian-per-tahap",
      );
      return data.data;
    },
  });

export const useDashboardLaporan = () =>
  useQuery({
    queryKey: ["dashboard", "laporan-harian"],
    queryFn: async () => {
      const { data } = await api.get<{ data: DashboardLaporanHarian[] }>(
        "/dashboard/laporan-harian",
      );
      return data.data;
    },
  });

export const useDashboardAktivitas = () =>
  useQuery({
    queryKey: ["dashboard", "aktivitas"],
    queryFn: async () => {
      const { data } = await api.get<{ data: DashboardAktivitas[] }>(
        "/dashboard/aktivitas",
      );
      return data.data;
    },
  });

export const useSlaTrend = (days = 14) =>
  useQuery({
    queryKey: ["dashboard", "analytics", "sla-trend", days],
    queryFn: async () => {
      const { data } = await api.get<{ data: DashboardSlaTrend[] }>(
        "/dashboard/analytics/sla-trend",
        { params: { days } },
      );
      return data.data;
    },
  });

export const useThroughput = (days = 30) =>
  useQuery({
    queryKey: ["dashboard", "analytics", "throughput", days],
    queryFn: async () => {
      const { data } = await api.get<{ data: DashboardThroughput[] }>(
        "/dashboard/analytics/throughput",
        { params: { days } },
      );
      return data.data;
    },
  });

export const useBottleneck = () =>
  useQuery({
    queryKey: ["dashboard", "analytics", "bottleneck"],
    queryFn: async () => {
      const { data } = await api.get<{ data: DashboardBottleneck[] }>(
        "/dashboard/analytics/bottleneck",
      );
      return data.data;
    },
  });

export const useRankingOpd = (limit = 10) =>
  useQuery({
    queryKey: ["dashboard", "analytics", "ranking-opd", limit],
    queryFn: async () => {
      const { data } = await api.get<{ data: DashboardRankingOpd[] }>(
        "/dashboard/analytics/ranking-opd",
        { params: { limit } },
      );
      return data.data;
    },
  });

// ─── Enterprise Dashboard hooks ─────────────────────────────────────────────

export interface DashboardSummary {
  totalUsulan: number;
  byStatus: Record<string, number>;
  byTahap: Record<string, number>;
  sla: { total: number; overdue: number; selesai: number };
}

export interface RecentUsulanItem {
  id: string;
  nomorUsulan: string;
  status: string;
  tahapSaatIni: string | null;
  tanggalUsulan: string;
  createdAt: string;
  asn: { nama: string; nipBaru: string } | null;
  jenisLayanan: { nama: string } | null;
  unitOrganisasi?: { nama: string } | null;
}

export const useDashboardSummary = () =>
  useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: async () => {
      const { data } = await api.get<{ data: DashboardSummary }>("/dashboard/summary");
      return data.data;
    },
  });

export const useDashboardTrend = (days = 7) =>
  useQuery({
    queryKey: ["dashboard", "trend", days],
    queryFn: async () => {
      const { data } = await api.get<{ data: Record<string, number> }>(
        "/dashboard/trend",
        { params: { days } },
      );
      return data.data;
    },
  });

export const useDashboardRecent = () =>
  useQuery({
    queryKey: ["dashboard", "recent"],
    queryFn: async () => {
      const { data } = await api.get<{ data: RecentUsulanItem[] }>("/dashboard/recent");
      return data.data;
    },
  });

// ─── New Dashboard Views hooks ──────────────────────────────────────────────

export interface DashboardPimpinan {
  totalBulanIni: number;
  slaCompliancePercent: number;
  avgWaktuSelesaiHari: number;
  eskalasiMenunggu: number;
  volumePerLayanan: { nama: string; total: number }[];
  kepatuhanPerOperator: { nama: string; persen: number }[];
  antrianStatus: { menunggu: number; diproses: number; slaKritis: number };
}

export interface DashboardOperatorKpi {
  menungguVerifikasi: number;
  sedangDiproses: number;
  mendekatiSla: number;
  selesaiHariIni: number;
}

export interface AntrianDetailItem {
  id: string;
  source?: "layanan" | "peremajaan";
  detailHref?: string;
  nomorUsulan: string;
  asn: { nama: string };
  jenisLayanan: { nama: string };
  unitOrganisasi: { singkatan: string };
  tanggalUsulan: string;
  status: string;
  sla: { hariKe: number; totalSla: number; statusSla: "OK" | "Warning" | "Overdue" } | null;
}

export interface AntrianDetailResponse {
  total: number;
  page: number;
  limit: number;
  data: AntrianDetailItem[];
}

export const useDashboardPimpinan = () =>
  useQuery({
    queryKey: ["dashboard", "pimpinan"],
    queryFn: async () => {
      const { data } = await api.get<{ data: DashboardPimpinan }>("/dashboard/pimpinan");
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
  });

export const useDashboardOperatorKpi = (tahap: string) =>
  useQuery({
    queryKey: ["dashboard", "operator-kpi", tahap],
    queryFn: async () => {
      const { data } = await api.get<{ data: DashboardOperatorKpi }>(
        "/dashboard/operator-kpi",
        { params: { tahap } },
      );
      return data.data;
    },
    staleTime: 60 * 1000,
  });

export interface EskalasiPeremajaanItem {
  id: string;
  namaAsn: string;
  nipBaru: string;
  unitOrganisasi: string;
  namaLayanan: string;
  tanggalPengajuan: string;
  hariKe: number;
  totalSla: number;
  statusSla: "Warning" | "Overdue";
  operator: string | null;
}

export const useEskalasiPeremajaan = () =>
  useQuery({
    queryKey: ["dashboard", "eskalasi-peremajaan"],
    queryFn: async () => {
      const { data } = await api.get<{ data: EskalasiPeremajaanItem[] }>(
        "/dashboard/eskalasi-peremajaan",
      );
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
  });

export const useAntrianDetail = (params: {
  jenisLayananId?: string;
  unitOrganisasiId?: string;
  urutan?: string;
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: ["dashboard", "antrian-detail", params],
    queryFn: async () => {
      const { data } = await api.get<{ data: AntrianDetailResponse }>(
        "/dashboard/antrian-detail",
        { params },
      );
      return data.data;
    },
    staleTime: 60 * 1000,
  });
