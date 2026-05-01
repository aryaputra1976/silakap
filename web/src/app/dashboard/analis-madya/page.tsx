"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import StatCard from "@/components/silakap/StatCard";
import SlaBar from "@/components/silakap/SlaBar";
import { AktivitasTable } from "@/components/silakap/AktivitiasTable";
import {
  useDashboardAktivitas,
  useDashboardAntrian,
  useDashboardPerJenis,
  useDashboardRingkasan,
} from "@/hooks/useDashboard";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

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

export default function DashboardAnalisMadyaPage() {
  const ringkasan = useDashboardRingkasan();
  const antrian = useDashboardAntrian();
  const perJenis = useDashboardPerJenis();
  const aktivitas = useDashboardAktivitas();

  const isLoading =
    ringkasan.isLoading ||
    antrian.isLoading ||
    perJenis.isLoading ||
    aktivitas.isLoading;
  const isError =
    ringkasan.isError || antrian.isError || perJenis.isError || aktivitas.isError;
  const adQueue =
    antrian.data?.find((item) => item.tahapSaatIni === "AD")?._count._all ?? 0;
  const okCount = Math.max(
    (ringkasan.data?.totalDalamProses ?? 0) -
      (ringkasan.data?.totalSlaWarning ?? 0) -
      (ringkasan.data?.totalSlaOverdue ?? 0),
    0,
  );

  const chartOptions: ApexOptions = {
    chart: { toolbar: { show: true } },
    colors: ["#605DFF"],
    dataLabels: { enabled: false },
    plotOptions: { bar: { columnWidth: "45%" } },
    xaxis: {
      categories: (perJenis.data ?? []).map(
        (item) => item.jenisLayanan?.nama ?? "Tanpa jenis",
      ),
      labels: { style: { colors: "#8695AA", fontSize: "12px" } },
    },
    yaxis: { labels: { style: { colors: "#64748B", fontSize: "12px" } } },
    grid: { borderColor: "#ECEEF2" },
  };

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">Dashboard Analis Madya (Quality Control)</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Monitoring quality control dan SLA
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
            <StatCard label="Antrian AD" value={adQueue} icon="verified" color="blue" />
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

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-[25px]">
            <div className="xl:col-span-1">
              <SlaBar
                ok={okCount}
                warning={ringkasan.data?.totalSlaWarning ?? 0}
                overdue={ringkasan.data?.totalSlaOverdue ?? 0}
              />
            </div>
            <div className="xl:col-span-2 trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
              <div className="trezo-card-header mb-[20px] md:mb-[25px]">
                <h5 className="!mb-0">Jenis Layanan</h5>
              </div>
              <Chart
                options={chartOptions}
                series={[
                  {
                    name: "Total",
                    data: (perJenis.data ?? []).map((item) => item.total),
                  },
                ]}
                type="bar"
                height={350}
                width="100%"
              />
            </div>
          </div>

          <AktivitasTable data={aktivitas.data ?? []} />
        </>
      )}
    </div>
  );
}
