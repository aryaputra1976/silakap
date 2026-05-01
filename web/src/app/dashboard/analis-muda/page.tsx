"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import StatCard from "@/components/silakap/StatCard";
import { AktivitasTable } from "@/components/silakap/AktivitiasTable";
import {
  useDashboardAktivitas,
  useDashboardAntrian,
  useDashboardLaporan,
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

export default function DashboardAnalisMudaPage() {
  const ringkasan = useDashboardRingkasan();
  const antrian = useDashboardAntrian();
  const laporan = useDashboardLaporan();
  const aktivitas = useDashboardAktivitas();

  const isLoading =
    ringkasan.isLoading ||
    antrian.isLoading ||
    laporan.isLoading ||
    aktivitas.isLoading;
  const isError =
    ringkasan.isError || antrian.isError || laporan.isError || aktivitas.isError;
  const amQueue =
    antrian.data?.find((item) => item.tahapSaatIni === "AM")?._count._all ?? 0;
  const laporanData = laporan.data ?? [];

  const chartOptions: ApexOptions = {
    chart: { toolbar: { show: true }, zoom: { enabled: false } },
    colors: ["#605DFF"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    fill: { opacity: 0.2 },
    xaxis: {
      categories: laporanData.map((item) => formatDateLabel(item.tanggalLaporan)),
      labels: { style: { colors: "#8695AA", fontSize: "12px" } },
    },
    yaxis: { labels: { style: { colors: "#64748B", fontSize: "12px" } } },
    grid: { borderColor: "#ECEEF2" },
  };

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">Dashboard Analis Muda</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Monitoring verifikasi tahap AM
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
            <StatCard label="Antrian AM" value={amQueue} icon="fact_check" color="blue" />
            <StatCard
              label="SLA Warning"
              value={ringkasan.data?.totalSlaWarning ?? 0}
              icon="warning"
              color="yellow"
            />
            <StatCard
              label="SLA Overdue"
              value={ringkasan.data?.totalSlaOverdue ?? 0}
              icon="error"
              color="red"
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
              <h5 className="!mb-0">Usulan Masuk 7 Hari</h5>
            </div>
            <Chart
              options={chartOptions}
              series={[
                {
                  name: "Usulan Masuk",
                  data: laporanData.map((item) => item.usulanMasuk),
                },
              ]}
              type="area"
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
