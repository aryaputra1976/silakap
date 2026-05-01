"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import StatCard from "@/components/silakap/StatCard";
import {
  useDashboardLaporan,
  useDashboardPerJenis,
  useDashboardRingkasan,
} from "@/hooks/useDashboard";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const formatDateLabel = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));

const LoadingCards = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[25px]">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        className="animate-pulse rounded-xl bg-gray-200 dark:bg-[#172036] h-24"
        key={index}
      />
    ))}
  </div>
);

export default function DashboardKepalaBadanPage() {
  const ringkasan = useDashboardRingkasan();
  const laporan = useDashboardLaporan();
  const perJenis = useDashboardPerJenis();

  const isLoading = ringkasan.isLoading || laporan.isLoading || perJenis.isLoading;
  const isError = ringkasan.isError || laporan.isError || perJenis.isError;
  const laporanData = laporan.data ?? [];

  const areaOptions: ApexOptions = {
    chart: { toolbar: { show: true }, zoom: { enabled: false } },
    colors: ["#37D80A", "#FF4023"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    fill: { opacity: 0.18 },
    xaxis: {
      categories: laporanData.map((item) => formatDateLabel(item.tanggalLaporan)),
      labels: { style: { colors: "#8695AA", fontSize: "12px" } },
    },
    yaxis: { labels: { style: { colors: "#64748B", fontSize: "12px" } } },
    grid: { borderColor: "#ECEEF2" },
    legend: { position: "top", labels: { colors: "#64748B" } },
  };

  const pieOptions: ApexOptions = {
    labels: (perJenis.data ?? []).map(
      (item) => item.jenisLayanan?.nama ?? "Tanpa jenis",
    ),
    colors: ["#605DFF", "#37D80A", "#AD63F6", "#FFC107", "#FF4023"],
    dataLabels: { enabled: false },
    legend: { position: "bottom", labels: { colors: "#64748B" } },
  };

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">Dashboard Eksekutif</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Ringkasan strategis layanan kepegawaian
        </p>
      </div>

      {isError ? (
        <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">
          Gagal memuat data
        </div>
      ) : null}

      {isLoading ? (
        <LoadingCards />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[25px]">
            <StatCard
              label="Selesai"
              value={ringkasan.data?.totalSelesai ?? 0}
              icon="task_alt"
              color="green"
            />
            <StatCard
              label="Dalam Proses"
              value={ringkasan.data?.totalDalamProses ?? 0}
              icon="pending_actions"
              color="blue"
            />
            <StatCard
              label="SLA Overdue"
              value={ringkasan.data?.totalSlaOverdue ?? 0}
              icon="error"
              color="red"
            />
            <StatCard
              label="Draft"
              value={ringkasan.data?.totalDraft ?? 0}
              icon="draft"
              color="gray"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-[25px]">
            <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
              <div className="trezo-card-header mb-[20px] md:mb-[25px]">
                <h5 className="!mb-0">Kinerja Penyelesaian</h5>
              </div>
              <Chart
                options={areaOptions}
                series={[
                  {
                    name: "Usulan Selesai",
                    data: laporanData.map((item) => item.usulanSelesai),
                  },
                  {
                    name: "Melampaui SLA",
                    data: laporanData.map((item) => item.melampauiSla),
                  },
                ]}
                type="area"
                height={350}
                width="100%"
              />
            </div>

            <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
              <div className="trezo-card-header mb-[20px] md:mb-[25px]">
                <h5 className="!mb-0">Jenis Layanan</h5>
              </div>
              <Chart
                options={pieOptions}
                series={(perJenis.data ?? []).map((item) => item.total)}
                type="pie"
                height={350}
                width="100%"
              />
            </div>
          </div>

          <div className="py-[1rem] px-[1rem] text-primary-500 bg-primary-50 border border-primary-100 rounded-md">
            Lihat laporan bulanan di menu Laporan
          </div>
        </>
      )}
    </div>
  );
}
