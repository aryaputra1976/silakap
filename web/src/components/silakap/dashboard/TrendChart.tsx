"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface TrendChartProps {
  data: Record<string, number> | undefined;
  days?: number;
}

const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(
    new Date(dateStr),
  );

export default function TrendChart({ data, days = 7 }: TrendChartProps) {
  const sorted = Object.entries(data ?? {}).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const categories = sorted.map(([date]) => formatDate(date));
  const seriesData = sorted.map(([, count]) => count);

  const options: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "Inter, sans-serif",
      sparkline: { enabled: false },
    },
    colors: ["#605DFF"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.02,
        stops: [0, 90, 100],
      },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
      categories,
      labels: { style: { colors: "#8695AA", fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      labels: {
        style: { colors: "#64748B", fontSize: "11px" },
        formatter: (v) => String(Math.round(v)),
      },
    },
    grid: {
      borderColor: "#F0F4F8",
      strokeDashArray: 4,
      padding: { left: 10, right: 10 },
    },
    tooltip: {
      y: { formatter: (v) => `${v} usulan` },
    },
    markers: { size: 4, strokeWidth: 0 },
  };

  return (
    <div className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036] h-full">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h5 className="!mb-0">Tren Usulan Masuk</h5>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {days} hari terakhir
          </p>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 dark:bg-[#15203c] dark:text-primary-400">
          Harian
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[280px] gap-2 text-gray-400">
          <i className="material-symbols-outlined !text-[40px]">bar_chart</i>
          <p className="text-sm">Belum ada data tren.</p>
        </div>
      ) : (
        <Chart
          options={options}
          series={[{ name: "Usulan Masuk", data: seriesData }]}
          type="area"
          height={280}
          width="100%"
        />
      )}
    </div>
  );
}
