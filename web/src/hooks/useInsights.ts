import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface InsightRiskItem {
  id: string;
  nomorUsulan: string;
  namaAsn: string;
  nip: string;
  layanan: string;
  status: string;
  tahap: string | null;
  slaHabisAt: string | null;
  remainingDays: number | null;
  risk: "LOW" | "MEDIUM" | "HIGH";
}

export interface InsightsSummary {
  totalActive: number;
  totalOverdue: number;
  totalHighRisk: number;
  totalMediumRisk: number;
  workloadByTahap: { tahap: string | null; total: number }[];
  recommendations: string[];
  riskItems: InsightRiskItem[];
}

export const useInsightsSummary = () =>
  useQuery({
    queryKey: ["insights", "summary"],
    queryFn: async () => {
      const { data } = await api.get<{ data: InsightsSummary }>("/insights/summary");
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
  });
