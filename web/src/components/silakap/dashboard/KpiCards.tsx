import StatCard from "@/components/silakap/StatCard";
import type { DashboardSummary } from "@/hooks/useDashboard";
import type { InsightsSummary } from "@/hooks/useInsights";

interface KpiCardsProps {
  summary: DashboardSummary | undefined;
  insights: InsightsSummary | undefined;
}

export default function KpiCards({ summary, insights }: KpiCardsProps) {
  const overdueCount = summary?.sla.overdue ?? 0;
  const highRiskCount = insights?.totalHighRisk ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[25px]">
      <StatCard
        label="Total Usulan"
        value={summary?.totalUsulan ?? 0}
        icon="description"
        color="blue"
        description="Semua usulan yang ada di sistem"
      />
      <StatCard
        label="SLA Overdue"
        value={overdueCount}
        icon="timer_off"
        color="red"
        highlight={overdueCount > 0}
        description="Melampaui batas waktu layanan"
      />
      <StatCard
        label="High Risk (AI)"
        value={highRiskCount}
        icon="emergency_home"
        color="red"
        highlight={highRiskCount > 0}
        description="Usulan terdeteksi melampaui SLA"
      />
      <StatCard
        label="Medium Risk (AI)"
        value={insights?.totalMediumRisk ?? 0}
        icon="warning"
        color="yellow"
        description="Usulan mendekati batas SLA"
      />
    </div>
  );
}
