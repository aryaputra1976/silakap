"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import StatCard from "@/components/silakap/StatCard";
import { AktivitasTable } from "@/components/silakap/AktivitiasTable";
import {
  useDashboardAktivitas,
  useDashboardLaporan,
  useDashboardRingkasan,
} from "@/hooks/useDashboard";
import { useAuthStore } from "@/store/auth.store";

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

export default function DashboardOpdPage() {
  const user = useAuthStore((state) => state.user);
  const ringkasan = useDashboardRingkasan(user?.unitOrganisasiId ?? undefined);
  const laporan = useDashboardLaporan();
  const aktivitas = useDashboardAktivitas();

  const isLoading =
    ringkasan.isLoading || laporan.isLoading || aktivitas.isLoading;
  const isError = ringkasan.isError || laporan.isError || aktivitas.isError;
  const laporanData = laporan.data ?? [];

  const chartOptions: ApexOptions = {
    chart: { toolbar: { show: true } },
    colors: ["#605DFF", "#37D80A"],
    dataLabels: { enabled: false },
    plotOptions: { bar: { columnWidth: "45%" } },
    xaxis: {
      categories: laporanData.map((item) => formatDateLabel(item.tanggalLaporan)),
      labels: { style: { colors: "#8695AA", fontSize: "12px" } },
    },
    yaxis: { labels: { style: { colors: "#64748B", fontSize: "12px" } } },
    grid: { borderColor: "#ECEEF2" },
    legend: { position: "top", labels: { colors: "#64748B" } },
  };

  const chartSeries = [
    { name: "Usulan Masuk", data: laporanData.map((item) => item.usulanMasuk) },
    {
      name: "Usulan Selesai",
      data: laporanData.map((item) => item.usulanSelesai),
    },
  ];

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">Dashboard OPD</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Unit organisasi: {user?.unitOrganisasiId ?? "Belum tersedia"}
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
              label="Draft"
              value={ringkasan.data?.totalDraft ?? 0}
              icon="draft"
              color="gray"
            />
            <StatCard
              label="Dalam Proses"
              value={ringkasan.data?.totalDalamProses ?? 0}
              icon="pending_actions"
              color="blue"
            />
            <StatCard
              label="Dikembalikan"
              value={ringkasan.data?.totalDikembalikan ?? 0}
              icon="keyboard_return"
              color="yellow"
            />
            <StatCard
              label="Selesai"
              value={ringkasan.data?.totalSelesai ?? 0}
              icon="task_alt"
              color="green"
            />
          </div>

          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <div className="trezo-card-header mb-[20px] md:mb-[25px]">
              <h5 className="!mb-0">Usulan 7 Hari Terakhir</h5>
            </div>
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="bar"
              height={350}
              width="100%"
            />
          </div>

          <AktivitasTable data={aktivitas.data ?? []} />
        </>
      )}
    </div>
  );
}
