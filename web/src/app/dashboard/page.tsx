"use client";

import { useCallback } from "react";
import {
  useDashboardSummary,
  useDashboardTrend,
  useDashboardRecent,
} from "@/hooks/useDashboard";
import { useInsightsSummary } from "@/hooks/useInsights";
import KpiCards from "@/components/silakap/dashboard/KpiCards";
import TrendChart from "@/components/silakap/dashboard/TrendChart";
import SlaMonitoringPanel from "@/components/silakap/dashboard/SlaMonitoringPanel";
import StatusDistributionChart from "@/components/silakap/dashboard/StatusDistributionChart";
import WorkloadChart from "@/components/silakap/dashboard/WorkloadChart";
import InsightsPanel from "@/components/silakap/dashboard/InsightsPanel";
import RecentUsulanTable from "@/components/silakap/dashboard/RecentUsulanTable";
import DashboardSkeleton from "@/components/silakap/dashboard/DashboardSkeleton";

const TREND_DAYS = 7;

export default function DashboardEnterprisePage() {
  const summary = useDashboardSummary();
  const trend = useDashboardTrend(TREND_DAYS);
  const recent = useDashboardRecent();
  const insights = useInsightsSummary();

  const isLoading =
    summary.isLoading ||
    trend.isLoading ||
    recent.isLoading ||
    insights.isLoading;

  const isError =
    summary.isError ||
    trend.isError ||
    recent.isError ||
    insights.isError;

  const refetchAll = useCallback(() => {
    void summary.refetch();
    void trend.refetch();
    void recent.refetch();
    void insights.refetch();
  }, [summary.refetch, trend.refetch, recent.refetch, insights.refetch]);

  const isRefetching =
    summary.isRefetching ||
    trend.isRefetching ||
    recent.isRefetching ||
    insights.isRefetching;

  return (
    <div className="space-y-[25px]">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="!mb-1">Dashboard Enterprise</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Monitoring menyeluruh sistem layanan kepegawaian SILAKAP
          </p>
        </div>
        <button
          onClick={refetchAll}
          disabled={isRefetching}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 dark:bg-[#15203c] dark:text-primary-400 dark:hover:bg-[#1d2c4d] rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <i
            className={`material-symbols-outlined !text-[18px] ${isRefetching ? "animate-spin" : ""}`}
          >
            refresh
          </i>
          {isRefetching ? "Memperbarui..." : "Refresh Data"}
        </button>
      </div>

      {isError && (
        <div className="flex items-center gap-3 py-3 px-4 text-danger-600 bg-danger-50 dark:bg-[#15203c] border border-danger-200 dark:border-[#2a1a1a] rounded-lg">
          <i className="material-symbols-outlined !text-[18px] shrink-0">error</i>
          <p className="text-sm">
            Beberapa data gagal dimuat. Periksa koneksi atau coba refresh
            halaman.
          </p>
        </div>
      )}

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <KpiCards summary={summary.data} insights={insights.data} />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-[25px]">
            <div className="xl:col-span-2">
              <TrendChart data={trend.data} days={TREND_DAYS} />
            </div>
            <SlaMonitoringPanel sla={summary.data?.sla} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-[25px]">
            <StatusDistributionChart byStatus={summary.data?.byStatus} />
            <WorkloadChart byTahap={summary.data?.byTahap} />
          </div>

          <InsightsPanel data={insights.data} />

          <RecentUsulanTable data={recent.data} />
        </>
      )}
    </div>
  );
}
