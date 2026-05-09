"use client";

import { useConfigSla } from "@/hooks/useAdmin";
import { useDashboardRingkasan } from "@/hooks/useDashboard";

export default function SlaTahapanPage() {
  const sla      = useConfigSla();
  const ringkasan = useDashboardRingkasan();

  const warning = ringkasan.data?.totalSlaWarning ?? 0;
  const overdue = ringkasan.data?.totalSlaOverdue ?? 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="!mb-0.5">SLA Tahapan</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Batas waktu per tahap dan kondisi SLA berjalan
        </p>
      </div>

      {/* KPI strip */}
      <div className="bg-white dark:bg-[#0c1427] rounded-xl border border-gray-100 dark:border-[#172036] overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-[#172036]">
          <div className="px-6 py-5">
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-tight">Mendekati SLA</p>
            <p className={`mt-2 text-3xl font-bold leading-none ${warning > 0 ? "text-warning-600 dark:text-warning-400" : "text-gray-900 dark:text-white"}`}>
              {ringkasan.isLoading ? "—" : warning}
            </p>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-tight">Melampaui SLA</p>
            <p className={`mt-2 text-3xl font-bold leading-none ${overdue > 0 ? "text-danger-500" : "text-gray-900 dark:text-white"}`}>
              {ringkasan.isLoading ? "—" : overdue}
            </p>
          </div>
        </div>
      </div>

      {/* SLA config table */}
      <div className="bg-white dark:bg-[#0c1427] rounded-xl border border-gray-100 dark:border-[#172036] overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-[#172036]">
          <h5 className="!mb-0">Konfigurasi SLA per tahap</h5>
        </div>

        {sla.isLoading ? (
          <div className="divide-y divide-gray-100 dark:divide-[#172036]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 animate-pulse">
                <div className="h-3.5 bg-gray-100 dark:bg-[#172036] rounded w-1/4" />
                <div className="h-3.5 bg-gray-100 dark:bg-[#172036] rounded w-1/3 ml-auto" />
              </div>
            ))}
          </div>
        ) : sla.data?.length ? (
          <div className="divide-y divide-gray-100 dark:divide-[#172036]">
            {sla.data.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-black dark:text-white">{item.jabatan}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {item.jenisLayanan?.nama ?? "Semua jenis layanan"}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 dark:text-gray-500">Batas SLA</p>
                    <p className="font-semibold text-sm text-black dark:text-white">
                      {item.slaHari > 0 ? `${item.slaHari}h` : ""}
                      {item.slaHari > 0 && item.slaJam > 0 ? " " : ""}
                      {item.slaJam > 0 ? `${item.slaJam}j` : ""}
                    </p>
                  </div>
                  {item.eskalasiHari ? (
                    <div className="text-right">
                      <p className="text-xs text-gray-400 dark:text-gray-500">Eskalasi</p>
                      <p className="font-semibold text-sm text-warning-600 dark:text-warning-400">
                        {item.eskalasiHari}h
                      </p>
                    </div>
                  ) : (
                    <div className="text-right">
                      <p className="text-xs text-gray-400 dark:text-gray-500">Eskalasi</p>
                      <p className="text-sm text-gray-400 dark:text-gray-600">—</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <i className="material-symbols-outlined !text-[28px] text-gray-300 dark:text-gray-600">timer_off</i>
            <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">Belum ada konfigurasi SLA</p>
          </div>
        )}
      </div>
    </div>
  );
}
