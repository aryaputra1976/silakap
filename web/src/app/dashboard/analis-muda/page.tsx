"use client";

import KpiStrip from "@/components/silakap/dashboard/KpiStrip";
import AntrianTable from "@/components/silakap/dashboard/AntrianTable";
import { useDashboardOperatorKpi } from "@/hooks/useDashboard";
import { useAuthStore } from "@/store/auth.store";

const TAHAP = "AM";

export default function DashboardAnalisMudaPage() {
  const user = useAuthStore((s) => s.user);
  const { data: kpi, isLoading, isError } = useDashboardOperatorKpi(TAHAP);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="!mb-0.5">Antrian — Analis Muda</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {user?.namaLengkap ?? "—"} ·{" "}
          {new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}
        </p>
      </div>

      {isError && (
        <div className="py-3 px-4 text-sm text-danger-600 bg-danger-50 border border-danger-200 rounded-lg">
          Gagal memuat data KPI
        </div>
      )}

      {!isLoading ? (
        <KpiStrip
          items={[
            { label: "Menunggu verifikasi",  value: kpi?.menungguVerifikasi ?? 0, color: "blue"   },
            { label: "Sedang diproses",       value: kpi?.sedangDiproses ?? 0,    color: "orange" },
            { label: "Mendekati SLA",         value: kpi?.mendekatiSla ?? 0,      color: "red"    },
            { label: "Selesai hari ini",      value: kpi?.selesaiHariIni ?? 0,    color: "green"  },
          ]}
        />
      ) : (
        <div className="h-24 rounded-xl bg-gray-100 dark:bg-[#172036] animate-pulse" />
      )}

      <div className="bg-white dark:bg-[#0c1427] rounded-xl border border-gray-100 dark:border-[#172036] p-5">
        <AntrianTable />
      </div>
    </div>
  );
}
