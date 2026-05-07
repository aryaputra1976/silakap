"use client";

import { useState } from "react";
import KpiStrip from "@/components/silakap/dashboard/KpiStrip";
import AntrianTable from "@/components/silakap/dashboard/AntrianTable";
import { useDashboardOperatorKpi } from "@/hooks/useDashboard";
import { useAuthStore } from "@/store/auth.store";

const TABS = ["Antrian", "Verifikasi aktif"] as const;
type Tab = (typeof TABS)[number];

const TAHAP = "AM";

function formatHariIni() {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function LoadingSkeleton() {
  return <div className="h-24 rounded-xl bg-gray-100 dark:bg-[#172036] animate-pulse" />;
}

export default function DashboardAnalisMudaPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Antrian");
  const user = useAuthStore((s) => s.user);
  const { data: kpi, isLoading, isError } = useDashboardOperatorKpi(TAHAP);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="!mb-1 text-xl font-bold text-gray-900 dark:text-white">
            Dashboard verifikasi - BKD
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Operator:{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {user?.namaLengkap ?? "—"}
            </span>{" "}
            | {formatHariIni()}
          </p>
          <p className="mt-1 text-xs font-medium text-primary-600 dark:text-primary-400">
            Antrian memuat usulan layanan dan pengajuan yang dikirim dari portal.
          </p>
        </div>

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

      {activeTab === "Antrian" && (
        <>
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <KpiStrip
              items={[
                { label: "Menunggu verifikasi", value: kpi?.menungguVerifikasi ?? 0, color: "blue" },
                { label: "Sedang diproses", value: kpi?.sedangDiproses ?? 0, color: "orange" },
                { label: "Mendekati SLA", value: kpi?.mendekatiSla ?? 0, color: "red" },
                { label: "Selesai hari ini", value: kpi?.selesaiHariIni ?? 0, color: "green" },
              ]}
            />
          )}
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-6 rounded-xl">
            <AntrianTable />
          </div>
        </>
      )}

      {activeTab === "Verifikasi aktif" && (
        <div className="trezo-card bg-white dark:bg-[#0c1427] p-6 rounded-xl text-center py-16">
          <i className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">fact_check</i>
          <p className="mt-3 text-gray-400 dark:text-gray-500">Verifikasi aktif — segera hadir</p>
        </div>
      )}
    </div>
  );
}
