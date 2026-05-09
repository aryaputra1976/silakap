"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface WorkloadChartProps {
  byTahap: Record<string, number> | undefined;
}

const TAHAP_LABELS: Record<string, string> = {
  AP: "Analis Pertama",
  AM: "Analis Muda",
  AD: "Analis Madya",
  Kabid: "Kepala Bidang",
  KepalaBadan: "Kepala Badan",
  null: "Belum Bertahap",
};

export default function WorkloadChart({ byTahap }: WorkloadChartProps) {
  const entries = Object.entries(byTahap ?? {});
  const categories = entries.map(([tahap]) => TAHAP_LABELS[tahap] ?? tahap);
  const seriesData = entries.map(([, count]) => count);

  const options: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 5,
        barHeight: "55%",
        dataLabels: { position: "top" },
      },
    },
    colors: ["#605DFF"],
    dataLabels: {
      enabled: true,
      offsetX: 24,
      style: { colors: ["#64748B"], fontSize: "11px", fontWeight: 500 },
    },
    xaxis: {
      categories,
      labels: {
        style: { colors: "#8695AA", fontSize: "11px" },
        formatter: (v) => String(Math.round(Number(v))),
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: "#64748B", fontSize: "12px" } },
    },
    grid: {
      borderColor: "#F0F4F8",
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    tooltip: { y: { formatter: (v) => `${v} usulan` } },
  };

  return (
    <div className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036] h-full">
      <div className="mb-4">
        <h5 className="!mb-0">Workload per Tahap</h5>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Jumlah usulan aktif di setiap tahap proses
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[240px] gap-2 text-gray-400">
          <i className="material-symbols-outlined !text-[40px]">bar_chart</i>
          <p className="text-sm">Belum ada data workload.</p>
        </div>
      ) : (
        <Chart
          options={options}
          series={[{ name: "Jumlah Usulan", data: seriesData }]}
          type="bar"
          height={240}
          width="100%"
        />
      )}
    </div>
  );
}
