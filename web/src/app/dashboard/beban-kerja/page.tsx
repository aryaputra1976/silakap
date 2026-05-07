"use client";

import { useDashboardAntrian } from "@/hooks/useDashboard";
import { displayTahapLabel } from "@/lib/display-labels";

export default function BebanKerjaPage() {
  const antrian = useDashboardAntrian();
  const max = Math.max(1, ...(antrian.data ?? []).map((item) => item._count._all));

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">Beban Kerja</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Distribusi antrian aktif berdasarkan tahap pemrosesan
        </p>
      </div>
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <div className="space-y-4">
          {(antrian.data ?? []).map((item) => {
            const value = item._count._all;
            const width = `${Math.max(8, (value / max) * 100)}%`;
            return (
              <div key={item.tahapSaatIni ?? "Diajukan"}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{item.tahapSaatIni ? displayTahapLabel(item.tahapSaatIni) : "Diajukan"}</span>
                  <strong>{value} berkas</strong>
                </div>
                <div className="h-3 rounded-full bg-gray-100 dark:bg-[#172036] overflow-hidden">
                  <div className="h-full rounded-full bg-primary-500" style={{ width }} />
                </div>
              </div>
            );
          })}
          {!antrian.data?.length ? <p className="text-gray-500">Belum ada antrian aktif.</p> : null}
        </div>
      </div>
    </div>
  );
}
