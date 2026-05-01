"use client";

import { useConfigSla } from "@/hooks/useAdmin";
import { useDashboardRingkasan } from "@/hooks/useDashboard";

export default function SlaTahapanPage() {
  const sla = useConfigSla();
  const ringkasan = useDashboardRingkasan();

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">SLA Tahapan</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Batas waktu per tahap dan kondisi SLA berjalan
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
        <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
          <span className="block text-gray-500">Warning SLA</span>
          <strong className="text-3xl">{ringkasan.data?.totalSlaWarning ?? 0}</strong>
        </div>
        <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
          <span className="block text-gray-500">Overdue SLA</span>
          <strong className="text-3xl text-danger-500">{ringkasan.data?.totalSlaOverdue ?? 0}</strong>
        </div>
      </div>
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <div className="table-responsive overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {["Tahap", "Jenis Layanan", "SLA", "Eskalasi"].map((heading) => (
                  <th className="font-medium text-left px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c]" key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(sla.data ?? []).map((item) => (
                <tr key={item.id}>
                  <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.jabatan}</td>
                  <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.jenisLayanan?.nama ?? "Semua Jenis"}</td>
                  <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.slaHari} hari {item.slaJam} jam</td>
                  <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.eskalasiHari ? `${item.eskalasiHari} hari` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
