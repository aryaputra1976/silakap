"use client";

import { useDashboardAntrian } from "@/hooks/useDashboard";
import { displayTahapLabel } from "@/lib/display-labels";

const TAHAP_COLOR: Record<string, string> = {
  AP:          "bg-blue-500",
  AM:          "bg-indigo-500",
  AD:          "bg-purple-500",
  Kabid:       "bg-orange-500",
  KepalaBadan: "bg-red-500",
};

export default function BebanKerjaPage() {
  const antrian = useDashboardAntrian();
  const rows = antrian.data ?? [];
  const max = Math.max(1, ...rows.map((r) => r._count._all));
  const total = rows.reduce((sum, r) => sum + r._count._all, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="!mb-0.5">Beban Kerja</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Distribusi antrian aktif berdasarkan tahap pemrosesan
        </p>
      </div>

      {/* Total badge */}
      {!antrian.isLoading && total > 0 && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30">
          <i className="material-symbols-outlined !text-[16px] text-primary-500">inbox</i>
          <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">
            {total} berkas aktif dalam antrian
          </span>
        </div>
      )}

      <div className="bg-white dark:bg-[#0c1427] rounded-xl border border-gray-100 dark:border-[#172036] overflow-hidden">
        {antrian.isLoading ? (
          <div className="divide-y divide-gray-100 dark:divide-[#172036]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-5 py-4 animate-pulse space-y-2">
                <div className="h-3.5 bg-gray-100 dark:bg-[#172036] rounded w-1/3" />
                <div className="h-3 bg-gray-100 dark:bg-[#172036] rounded w-full" />
              </div>
            ))}
          </div>
        ) : rows.length ? (
          <div className="divide-y divide-gray-100 dark:divide-[#172036]">
            {rows
              .sort((a, b) => b._count._all - a._count._all)
              .map((item) => {
                const tahap = item.tahapSaatIni ?? null;
                const value = item._count._all;
                const pct   = Math.max(4, (value / max) * 100);
                const color = tahap ? (TAHAP_COLOR[tahap] ?? "bg-primary-500") : "bg-gray-400";
                const label = tahap ? displayTahapLabel(tahap) : "Baru Diajukan";
                const share = Math.round((value / total) * 100);

                return (
                  <div key={tahap ?? "diajukan"} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
                        <span className="font-semibold text-sm text-black dark:text-white">{label}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-400 dark:text-gray-500">{share}%</span>
                        <span className="font-bold text-base text-black dark:text-white">{value}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">berkas</span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-gray-100 dark:bg-[#172036] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="py-14 text-center">
            <i className="material-symbols-outlined !text-[32px] text-gray-300 dark:text-gray-600">inbox</i>
            <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">Tidak ada antrian aktif saat ini</p>
          </div>
        )}
      </div>
    </div>
  );
}
