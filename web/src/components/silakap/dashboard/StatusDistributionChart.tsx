"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface StatusDistributionChartProps {
  byStatus: Record<string, number> | undefined;
}

const STATUS_CHART_COLORS: Record<string, string> = {
  Draft: "#94A3B8",
  Diajukan: "#605DFF",
  VerifikasiAP: "#6366F1",
  VerifikasiAM: "#8B5CF6",
  QualityControl: "#AD63F6",
  ApprovalKabid: "#F97316",
  ApprovalKepalaBadan: "#FFC107",
  Selesai: "#37D80A",
  Dikembalikan: "#FB923C",
  Ditolak: "#FF4023",
  Diarsipkan: "#CBD5E1",
};

export default function StatusDistributionChart({
  byStatus,
}: StatusDistributionChartProps) {
  const entries = Object.entries(byStatus ?? {}).filter(([, count]) => count > 0);
  const labels = entries.map(([status]) => status);
  const series = entries.map(([, count]) => count);
  const colors = labels.map((l) => STATUS_CHART_COLORS[l] ?? "#94A3B8");

  const options: ApexOptions = {
    chart: { fontFamily: "Inter, sans-serif" },
    labels,
    colors,
    dataLabels: { enabled: false },
    legend: {
      position: "bottom",
      labels: { colors: "#64748B" },
      fontSize: "12px",
      itemMargin: { horizontal: 8, vertical: 4 },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            name: { show: true, fontSize: "12px", color: "#64748B" },
            value: {
              show: true,
              fontSize: "22px",
              fontWeight: 700,
              color: "#1a202c",
              formatter: (v) => v,
            },
            total: {
              show: true,
              label: "Total",
              color: "#64748B",
              fontSize: "12px",
              formatter: (w) =>
                String(
                  (w.globals.seriesTotals as number[]).reduce(
                    (a, b) => a + b,
                    0,
                  ),
                ),
            },
          },
        },
      },
    },
    stroke: { show: false },
    tooltip: { y: { formatter: (v) => `${v} usulan` } },
  };

  return (
    <div className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036] h-full">
      <div className="mb-4">
        <h5 className="!mb-0">Distribusi Status Usulan</h5>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Komposisi seluruh usulan berdasarkan status
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[280px] gap-2 text-gray-400">
          <i className="material-symbols-outlined !text-[40px]">donut_large</i>
          <p className="text-sm">Belum ada data.</p>
        </div>
      ) : (
        <Chart options={options} series={series} type="donut" height={300} width="100%" />
      )}
    </div>
  );
}
