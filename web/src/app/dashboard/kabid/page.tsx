"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import StatCard from "@/components/silakap/StatCard";
import { AktivitasTable } from "@/components/silakap/AktivitiasTable";
import {
  useDashboardAktivitas,
  useDashboardAntrian,
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
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-[25px]">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        className="animate-pulse rounded-xl bg-gray-200 dark:bg-[#172036] h-24"
        key={index}
      />
    ))}
  </div>
);

export default function DashboardKabidPage() {
  const ringkasan = useDashboardRingkasan();
  const laporan = useDashboardLaporan();
  const perJenis = useDashboardPerJenis();
  const antrian = useDashboardAntrian();
  const aktivitas = useDashboardAktivitas();

  const isLoading =
    ringkasan.isLoading ||
    laporan.isLoading ||
    perJenis.isLoading ||
    antrian.isLoading ||
    aktivitas.isLoading;
  const isError =
    ringkasan.isError ||
    laporan.isError ||
    perJenis.isError ||
    antrian.isError ||
    aktivitas.isError;
  const laporanData = laporan.data ?? [];

  const lineOptions: ApexOptions = {
    chart: { toolbar: { show: true }, zoom: { enabled: false } },
    colors: ["#605DFF", "#37D80A", "#FF4023"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    xaxis: {
      categories: laporanData.map((item) => formatDateLabel(item.tanggalLaporan)),
      labels: { style: { colors: "#8695AA", fontSize: "12px" } },
    },
    yaxis: { labels: { style: { colors: "#64748B", fontSize: "12px" } } },
    grid: { borderColor: "#ECEEF2" },
    legend: { position: "top", labels: { colors: "#64748B" } },
  };

  const donutOptions: ApexOptions = {
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
        <h1 className="!mb-1">Dashboard Kepala Bidang</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Monitoring approval dan performa layanan
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-[25px]">
            <StatCard
              label="Dalam Proses"
              value={ringkasan.data?.totalDalamProses ?? 0}
              icon="pending_actions"
              color="blue"
            />
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
            <StatCard
              label="Dikembalikan"
              value={ringkasan.data?.totalDikembalikan ?? 0}
              icon="keyboard_return"
              color="yellow"
            />
            <StatCard
              label="Batal"
              value={ringkasan.data?.totalBatal ?? 0}
              icon="cancel"
              color="gray"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-[25px]">
            <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
              <div className="trezo-card-header mb-[20px] md:mb-[25px]">
                <h5 className="!mb-0">Laporan Harian</h5>
              </div>
              <Chart
                options={lineOptions}
                series={[
                  {
                    name: "Usulan Masuk",
                    data: laporanData.map((item) => item.usulanMasuk),
                  },
                  {
                    name: "Usulan Selesai",
                    data: laporanData.map((item) => item.usulanSelesai),
                  },
                  {
                    name: "Melampaui SLA",
                    data: laporanData.map((item) => item.melampauiSla),
                  },
                ]}
                type="line"
                height={350}
                width="100%"
              />
            </div>

            <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
              <div className="trezo-card-header mb-[20px] md:mb-[25px]">
                <h5 className="!mb-0">Jenis Layanan</h5>
              </div>
              <Chart
                options={donutOptions}
                series={(perJenis.data ?? []).map((item) => item.total)}
                type="donut"
                height={350}
                width="100%"
              />
            </div>
          </div>

          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <div className="trezo-card-header mb-[20px] md:mb-[25px]">
              <h5 className="!mb-0">Antrian Per Tahap</h5>
            </div>
            <div className="table-responsive overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {(antrian.data ?? []).slice(0, 5).map((item) => (
                    <tr key={item.tahapSaatIni ?? "tanpa-tahap"}>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] font-medium">
                        {item.tahapSaatIni ?? "Tanpa tahap"}
                      </td>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] text-right">
                        {item._count._all}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <AktivitasTable data={aktivitas.data ?? []} />
        </>
      )}
    </div>
  );
}
