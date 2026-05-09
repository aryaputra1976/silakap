"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import KpiStrip from "@/components/silakap/dashboard/KpiStrip";
import AntrianTable from "@/components/silakap/dashboard/AntrianTable";
import { AktivitasTable } from "@/components/silakap/AktivitiasTable";
import {
  useDashboardAktivitas,
  useDashboardLaporan,
  useDashboardRingkasan,
} from "@/hooks/useDashboard";
import { useAuthStore } from "@/store/auth.store";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const formatDateLabel = (value: string) =>
  new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "2-digit" }).format(new Date(value));

export default function DashboardKabidPage() {
  const user = useAuthStore((s) => s.user);
  const ringkasan = useDashboardRingkasan();
  const laporan = useDashboardLaporan();
  const aktivitas = useDashboardAktivitas();

  const laporanData = laporan.data ?? [];
  const r = ringkasan.data;

  const lineOptions: ApexOptions = {
    chart: { toolbar: { show: false }, zoom: { enabled: false } },
    colors: ["#605DFF", "#37D80A", "#FF4023"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
      categories: laporanData.map((d) => formatDateLabel(d.tanggalLaporan)),
      labels: { style: { colors: "#8695AA", fontSize: "11px" } },
    },
    yaxis: { labels: { style: { colors: "#64748B", fontSize: "11px" } } },
    grid: { borderColor: "#ECEEF2" },
    legend: { position: "top", labels: { colors: "#64748B" }, fontSize: "12px" },
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="!mb-0.5">Dashboard — Kepala Bidang</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {user?.namaLengkap ?? "—"} ·{" "}
          {new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}
        </p>
      </div>

      {(ringkasan.isError || aktivitas.isError) && (
        <div className="py-3 px-4 text-sm text-danger-600 bg-danger-50 border border-danger-200 rounded-lg">
          Gagal memuat sebagian data dashboard
        </div>
      )}

      {/* KPI singkat */}
      {ringkasan.isLoading ? (
        <div className="h-24 rounded-xl bg-gray-100 dark:bg-[#172036] animate-pulse" />
      ) : (
        <KpiStrip
          items={[
            { label: "Dalam proses",   value: r?.totalDalamProses ?? 0, color: "blue"   },
            { label: "SLA warning",    value: r?.totalSlaWarning ?? 0,  color: "orange" },
            { label: "SLA overdue",    value: r?.totalSlaOverdue ?? 0,  color: "red"    },
            { label: "Selesai",        value: r?.totalSelesai ?? 0,     color: "green"  },
          ]}
        />
      )}

      {/* Antrian — utama untuk Kabid */}
      <div className="bg-white dark:bg-[#0c1427] rounded-xl border border-gray-100 dark:border-[#172036] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h5 className="!mb-0.5">Antrian aktif</h5>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Filter &quot;overdue&quot; untuk melihat yang kritis — klik baris untuk buka detail
            </p>
          </div>
        </div>
        <AntrianTable />
      </div>

      {/* Laporan harian — secondary */}
      {laporanData.length > 0 && (
        <div className="bg-white dark:bg-[#0c1427] rounded-xl border border-gray-100 dark:border-[#172036] p-5">
          <h5 className="!mb-4">Tren 7 hari terakhir</h5>
          <Chart
            options={lineOptions}
            series={[
              { name: "Masuk",       data: laporanData.map((d) => d.usulanMasuk) },
              { name: "Selesai",     data: laporanData.map((d) => d.usulanSelesai) },
              { name: "Lewat SLA",   data: laporanData.map((d) => d.melampauiSla) },
            ]}
            type="line"
            height={220}
            width="100%"
          />
        </div>
      )}

      {/* Aktivitas terakhir */}
      <AktivitasTable data={aktivitas.data ?? []} limit={10} />
    </div>
  );
}
