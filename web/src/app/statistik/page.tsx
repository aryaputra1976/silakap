"use client";

import StatCard from "@/components/silakap/StatCard";
import {
  useDashboardAntrian,
  useDashboardPerJenis,
  useDashboardRingkasan,
} from "@/hooks/useDashboard";

export default function StatistikPage() {
  const ringkasan = useDashboardRingkasan();
  const perJenis = useDashboardPerJenis();
  const antrian = useDashboardAntrian();

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">Statistik Layanan</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Ringkasan volume layanan, antrian, dan distribusi jenis usulan
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[20px]">
        <StatCard label="Dalam Proses" value={ringkasan.data?.totalDalamProses ?? 0} icon="pending_actions" color="blue" />
        <StatCard label="Selesai" value={ringkasan.data?.totalSelesai ?? 0} icon="task_alt" color="green" />
        <StatCard label="Dikembalikan" value={ringkasan.data?.totalDikembalikan ?? 0} icon="assignment_return" color="yellow" />
        <StatCard label="Overdue SLA" value={ringkasan.data?.totalSlaOverdue ?? 0} icon="timer_off" color="red" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-[25px]">
        <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
          <h5>Antrian Per Tahap</h5>
          <div className="space-y-3">
            {(antrian.data ?? []).map((item) => (
              <div className="flex items-center justify-between rounded-md bg-gray-50 dark:bg-[#15203c] px-4 py-3" key={item.tahapSaatIni ?? "Diajukan"}>
                <span>{item.tahapSaatIni ?? "Diajukan"}</span>
                <strong>{item._count._all}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
          <h5>Usulan Per Jenis Layanan</h5>
          <div className="space-y-3">
            {(perJenis.data ?? []).map((item) => (
              <div className="flex items-center justify-between rounded-md bg-gray-50 dark:bg-[#15203c] px-4 py-3" key={item.jenisLayananId}>
                <span>{item.jenisLayanan?.nama ?? "Jenis tidak ditemukan"}</span>
                <strong>{item.total}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
