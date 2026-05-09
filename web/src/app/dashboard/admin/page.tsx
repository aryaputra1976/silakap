"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
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

const TAHAP_LABEL: Record<string, string> = {
  AP: "Analis Pertama",
  AM: "Analis Muda",
  AD: "Analis Madya (QC)",
  Kabid: "Kepala Bidang",
  KepalaBadan: "Kepala Badan",
};

const quickActions = [
  {
    label: "Manajemen User",
    href: "/admin/users",
    icon: "manage_accounts",
    className: "bg-blue-50 text-blue-700",
  },
  {
    label: "Data Referensi",
    href: "/admin/referensi",
    icon: "tune",
    className: "bg-purple-50 text-purple-700",
  },
  {
    label: "Pengaturan SLA",
    href: "/admin/pengaturan",
    icon: "schedule",
    className: "bg-amber-50 text-amber-700",
  },
  {
    label: "Audit Log",
    href: "/audit",
    icon: "policy",
    className: "bg-gray-50 text-gray-700",
  },
];

const formatDateLabel = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));

const getTahapLabel = (tahap: string | null | undefined) =>
  tahap ? TAHAP_LABEL[tahap] ?? tahap : "Tanpa tahap";

const LoadingCards = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-[25px]">
    {Array.from({ length: 7 }).map((_, index) => (
      <div
        className="animate-pulse rounded-xl bg-gray-200 dark:bg-[#172036] h-24"
        key={index}
      />
    ))}
  </div>
);

export default function DashboardAdminPage() {
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

  const isEmptySystem =
    ringkasan.data &&
    ringkasan.data.totalDraft +
      ringkasan.data.totalDalamProses +
      ringkasan.data.totalSelesai ===
      0;

  const columnOptions: ApexOptions = {
    chart: { toolbar: { show: true } },
    colors: ["#605DFF", "#37D80A", "#FFC107", "#FF4023"],
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

  const donutOptions: ApexOptions = {
    labels: (perJenis.data ?? []).map(
      (item) => item.jenisLayanan?.nama ?? "Tanpa jenis",
    ),
    colors: ["#605DFF", "#37D80A", "#AD63F6", "#FFC107", "#FF4023"],
    dataLabels: { enabled: false },
    legend: { position: "bottom", labels: { colors: "#64748B" } },
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="!mb-1">Dashboard Administrator</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Monitoring keseluruhan sistem SILAKAP
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
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            <StatCard
              label="Draft"
              value={ringkasan.data?.totalDraft ?? 0}
              icon="draft"
              color="gray"
              href="/layanan?status=Draft"
            />
            <StatCard
              label="Dalam Proses"
              value={ringkasan.data?.totalDalamProses ?? 0}
              icon="pending_actions"
              color="blue"
              href="/layanan?status=DalamProses"
            />
            <StatCard
              label="Selesai"
              value={ringkasan.data?.totalSelesai ?? 0}
              icon="task_alt"
              color="green"
              href="/layanan?status=Selesai"
            />
            <StatCard
              label="Dikembalikan"
              value={ringkasan.data?.totalDikembalikan ?? 0}
              icon="keyboard_return"
              color="yellow"
              href="/layanan?status=Dikembalikan"
            />
            <StatCard
              label="Batal"
              value={ringkasan.data?.totalBatal ?? 0}
              icon="cancel"
              color="gray"
              href="/layanan?status=Batal"
            />
            <StatCard
              label="SLA Warning"
              value={ringkasan.data?.totalSlaWarning ?? 0}
              icon="warning"
              color="orange"
              href="/layanan"
              highlight
            />
            <StatCard
              label="SLA Overdue"
              value={ringkasan.data?.totalSlaOverdue ?? 0}
              icon="error"
              color="red"
              href="/layanan"
              highlight
            />
          </div>

          {isEmptySystem ? (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3">
              <i className="material-symbols-outlined text-blue-500">info</i>
              <p className="text-sm text-blue-900">
                Sistem baru aktif. Mulai dengan menambahkan Data ASN dan membuat
                usulan layanan pertama.{" "}
                <Link
                  href="/layanan/buat"
                  className="font-medium text-blue-600 underline"
                >
                  → Buat Usulan
                </Link>
              </p>
            </div>
          ) : null}

          <div className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036]">
            <h5 className="!mb-4">Aksi Cepat</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action) => (
                <Link
                  href={action.href}
                  className="w-full rounded-xl border border-gray-100 dark:border-[#172036] p-4 flex items-center gap-3 hover:shadow-sm transition-shadow"
                  key={action.href}
                >
                  <span
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${action.className}`}
                  >
                    <i className="material-symbols-outlined">{action.icon}</i>
                  </span>
                  <span className="font-medium text-black dark:text-white">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036]">
              <h5 className="!mb-4">Laporan Harian</h5>
              <Chart
                options={columnOptions}
                series={[
                  {
                    name: "Masuk",
                    data: laporanData.map((item) => item.usulanMasuk),
                  },
                  {
                    name: "Selesai",
                    data: laporanData.map((item) => item.usulanSelesai),
                  },
                  {
                    name: "Dikembalikan",
                    data: laporanData.map((item) => item.usulanDikembalikan),
                  },
                  {
                    name: "Melampaui SLA",
                    data: laporanData.map((item) => item.melampauiSla),
                  },
                ]}
                type="bar"
                height={350}
                width="100%"
              />
            </div>

            <div className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036]">
              <h5 className="!mb-4">Jenis Layanan</h5>
              <Chart
                options={donutOptions}
                series={(perJenis.data ?? []).map((item) => item.total)}
                type="donut"
                height={350}
                width="100%"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036]">
            <h5 className="!mb-4">Antrian Per Tahap</h5>
            <div className="table-responsive overflow-x-auto">
              <table className="w-full">
                <thead className="text-black dark:text-white">
                  <tr>
                    <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c] whitespace-nowrap rounded-tl-md">
                      Tahap
                    </th>
                    <th className="font-medium ltr:text-right rtl:text-left px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c] whitespace-nowrap rounded-tr-md">
                      Jumlah
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(antrian.data ?? []).map((item) => (
                    <tr key={item.tahapSaatIni ?? "tanpa-tahap"}>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] font-medium">
                        {getTahapLabel(item.tahapSaatIni)}
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

          <AktivitasTable data={aktivitas.data ?? []} limit={20} />
        </>
      )}
    </div>
  );
}
