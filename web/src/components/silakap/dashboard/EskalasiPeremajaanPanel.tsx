"use client";

import { EskalasiPeremajaanItem } from "@/hooks/useDashboard";

interface Props {
  items: EskalasiPeremajaanItem[];
  isLoading?: boolean;
}

function StatusBadge({ status }: { status: "Warning" | "Overdue" }) {
  if (status === "Overdue") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-400">
        <span className="w-1.5 h-1.5 rounded-full bg-danger-500 inline-block" />
        Overdue
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-400">
      <span className="w-1.5 h-1.5 rounded-full bg-warning-500 inline-block" />
      Mendekati SLA
    </span>
  );
}

export default function EskalasiPeremajaanPanel({ items, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-gray-100 dark:bg-[#172036] animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 dark:text-gray-500">
        <i className="material-symbols-outlined text-4xl">check_circle</i>
        <p className="mt-2 text-sm">Tidak ada peremajaan kritis saat ini</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 dark:border-[#172036]">
            <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">ASN</th>
            <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Layanan</th>
            <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">Unit</th>
            <th className="text-center py-2 px-3 font-medium text-gray-500 dark:text-gray-400">SLA</th>
            <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">Operator</th>
            <th className="text-center py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-[#172036]">
          {items.map((item) => (
            <tr
              key={item.id}
              className="hover:bg-gray-50 dark:hover:bg-[#0f1d35] transition-colors"
            >
              <td className="py-3 px-3">
                <p className="font-medium text-gray-900 dark:text-white leading-tight">{item.namaAsn}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.nipBaru}</p>
              </td>
              <td className="py-3 px-3 text-gray-700 dark:text-gray-300">{item.namaLayanan}</td>
              <td className="py-3 px-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell text-xs">{item.unitOrganisasi}</td>
              <td className="py-3 px-3 text-center">
                <span
                  className={`text-xs font-semibold ${
                    item.statusSla === "Overdue"
                      ? "text-danger-600 dark:text-danger-400"
                      : "text-warning-600 dark:text-warning-400"
                  }`}
                >
                  H-{item.hariKe}/{item.totalSla}
                </span>
              </td>
              <td className="py-3 px-3 text-gray-500 dark:text-gray-400 text-xs hidden md:table-cell">
                {item.operator ?? (
                  <span className="italic text-gray-400 dark:text-gray-600">Belum diambil</span>
                )}
              </td>
              <td className="py-3 px-3 text-center">
                <StatusBadge status={item.statusSla} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
