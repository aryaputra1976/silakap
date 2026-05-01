"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import StatCard from "@/components/silakap/StatCard";
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

export default function DashboardAnalisPertamaPage() {
  const ringkasan = useDashboardRingkasan();
  const perJenis = useDashboardPerJenis();
  const antrian = useDashboardAntrian();
  const aktivitas = useDashboardAktivitas();

  const isLoading =
    ringkasan.isLoading ||
    perJenis.isLoading ||
    antrian.isLoading ||
    aktivitas.isLoading;
  const isError =
    ringkasan.isError || perJenis.isError || antrian.isError || aktivitas.isError;
  const apQueue =
    antrian.data?.find((item) => item.tahapSaatIni === "AP")?._count._all ?? 0;

  const chartOptions: ApexOptions = {
    labels: (perJenis.data ?? []).map(
      (item) => item.jenisLayanan?.nama ?? "Tanpa jenis",
    ),
    colors: ["#605DFF", "#37D80A", "#AD63F6", "#FFC107", "#FF4023"],
    dataLabels: { enabled: false },
    legend: { position: "bottom", labels: { colors: "#64748B" } },
  };
  const chartSeries = (perJenis.data ?? []).map((item) => item.total);

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">Dashboard Analis Pertama</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Ringkasan verifikasi tahap AP
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
            <StatCard label="Antrian AP" value={apQueue} icon="assignment" color="blue" />
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

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-[25px]">
            <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
              <div className="trezo-card-header mb-[20px] md:mb-[25px]">
                <h5 className="!mb-0">Jenis Layanan</h5>
              </div>
              <Chart
                options={chartOptions}
                series={chartSeries}
                type="pie"
                height={320}
                width="100%"
              />
            </div>

            <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
              <div className="trezo-card-header mb-[20px] md:mb-[25px]">
                <h5 className="!mb-0">Antrian Tahap AP</h5>
              </div>
              <div className="table-responsive overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    {(antrian.data ?? [])
                      .filter((item) => item.tahapSaatIni === "AP")
                      .slice(0, 5)
                      .map((item) => (
                        <tr key={item.tahapSaatIni ?? "AP"}>
                          <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] font-medium">
                            {item.tahapSaatIni}
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
          </div>

          <AktivitasTable data={aktivitas.data ?? []} />
        </>
      )}
    </div>
  );
}
