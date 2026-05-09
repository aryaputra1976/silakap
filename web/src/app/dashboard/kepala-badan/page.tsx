"use client";

import { useState } from "react";
import KpiStrip from "@/components/silakap/dashboard/KpiStrip";
import VolumePerLayananChart from "@/components/silakap/dashboard/VolumePerLayananChart";
import KepatuhanOperatorList from "@/components/silakap/dashboard/KepatuhanOperatorList";
import AntrianStatusBoxes from "@/components/silakap/dashboard/AntrianStatusBoxes";
import EskalasiPeremajaanPanel from "@/components/silakap/dashboard/EskalasiPeremajaanPanel";
import { useDashboardPimpinan, useEskalasiPeremajaan } from "@/hooks/useDashboard";
import { useAuthStore } from "@/store/auth.store";

const TABS = ["SLA & layanan", "Statistik ASN", "Eskalasi aktif"] as const;
type Tab = (typeof TABS)[number];

function formatBulan() {
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date());
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 rounded-xl bg-gray-100 dark:bg-[#172036] animate-pulse" />
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 h-64 rounded-xl bg-gray-100 dark:bg-[#172036] animate-pulse" />
        <div className="xl:col-span-2 h-64 rounded-xl bg-gray-100 dark:bg-[#172036] animate-pulse" />
      </div>
    </div>
  );
}

export default function DashboardKepalaBadanPage() {
  const [activeTab, setActiveTab] = useState<Tab>("SLA & layanan");
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError } = useDashboardPimpinan();
  const { data: eskalasi, isLoading: eskalasiLoading } = useEskalasiPeremajaan();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="!mb-1 text-xl font-bold text-gray-900 dark:text-white">
            Monitoring kepegawaian - Pimpinan BKD
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user?.namaLengkap ? `Kepala BKD: ${user.namaLengkap}` : "Kepala BKD"} |{" "}
            {formatBulan()}
          </p>
          <p className="mt-1 text-xs font-medium text-primary-600 dark:text-primary-400">
            Data gabungan dari portal pengajuan, antrian operator, dan hasil verifikasi.
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-2 shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                activeTab === tab
                  ? "bg-white dark:bg-[#0c1427] border-gray-200 dark:border-[#172036] text-gray-900 dark:text-white shadow-sm"
                  : "bg-transparent border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {isError && (
        <div className="py-3 px-4 text-danger-500 bg-danger-50 border border-danger-200 rounded-md text-sm">
          Gagal memuat data dashboard
        </div>
      )}

      {/* Tab: SLA & layanan */}
      {activeTab === "SLA & layanan" && (
        <>
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              {/* 4 KPI */}
              <KpiStrip
                items={[
                  { label: "Total pengajuan bulan ini", value: data?.totalBulanIni ?? 0 },
                  { label: "Tingkat penyelesaian SLA", value: `${data?.slaCompliancePercent ?? 0}%`, color: "green" },
                  { label: "Rata-rata waktu selesai", value: `${data?.avgWaktuSelesaiHari ?? 0} hari` },
                  { label: "Eskalasi menunggu keputusan", value: data?.eskalasiMenunggu ?? 0, color: data?.eskalasiMenunggu ? "red" : "default" },
                ]}
              />

              {/* Main content split */}
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                {/* Volume per layanan */}
                <div className="xl:col-span-3 bg-white dark:bg-[#0c1427] p-6 rounded-xl border border-gray-100 dark:border-[#172036]">
                  <h5 className="!mb-5 font-semibold text-gray-800 dark:text-white">
                    Volume pengajuan per layanan dan peremajaan (bulan ini)
                  </h5>
                  <VolumePerLayananChart items={data?.volumePerLayanan ?? []} />
                </div>

                {/* Right column */}
                <div className="xl:col-span-2 flex flex-col gap-5">
                  {/* Kepatuhan per operator */}
                  <div className="bg-white dark:bg-[#0c1427] p-6 rounded-xl border border-gray-100 dark:border-[#172036] flex-1">
                    <h5 className="!mb-4 font-semibold text-gray-800 dark:text-white">
                      Kepatuhan SLA per operator
                    </h5>
                    <KepatuhanOperatorList items={data?.kepatuhanPerOperator ?? []} />
                  </div>

                  {/* Antrian status */}
                  <div className="bg-white dark:bg-[#0c1427] p-6 rounded-xl border border-gray-100 dark:border-[#172036]">
                    <h5 className="!mb-4 font-semibold text-gray-800 dark:text-white">
                      Status antrian saat ini
                    </h5>
                    <AntrianStatusBoxes
                      menunggu={data?.antrianStatus.menunggu ?? 0}
                      diproses={data?.antrianStatus.diproses ?? 0}
                      slaKritis={data?.antrianStatus.slaKritis ?? 0}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Tab: Statistik ASN */}
      {activeTab === "Statistik ASN" && (
        <div className="bg-white dark:bg-[#0c1427] p-6 rounded-xl border border-gray-100 dark:border-[#172036] text-center py-16">
          <i className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">
            bar_chart
          </i>
          <p className="mt-3 text-gray-400 dark:text-gray-500">
            Statistik ASN — segera hadir
          </p>
        </div>
      )}

      {/* Tab: Eskalasi aktif */}
      {activeTab === "Eskalasi aktif" && (
        <div className="bg-white dark:bg-[#0c1427] p-6 rounded-xl border border-gray-100 dark:border-[#172036]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h5 className="font-semibold text-gray-800 dark:text-white">
                Eskalasi peremajaan kritis
              </h5>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Tiket peremajaan yang mendekati atau melewati batas SLA
              </p>
            </div>
            {eskalasi && eskalasi.length > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-400">
                {eskalasi.filter((i) => i.statusSla === "Overdue").length} overdue
                {" · "}
                {eskalasi.filter((i) => i.statusSla === "Warning").length} warning
              </span>
            )}
          </div>
          <EskalasiPeremajaanPanel items={eskalasi ?? []} isLoading={eskalasiLoading} />
        </div>
      )}
    </div>
  );
}
