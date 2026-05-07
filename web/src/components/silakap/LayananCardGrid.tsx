"use client";

import { useRouter } from "next/navigation";
import type { RefJenisLayanan } from "@/types/models";

interface Props {
  items: RefJenisLayanan[];
}

function SlaBadge({ hari }: { hari?: number }) {
  if (!hari) return null;
  const isLong = hari >= 5;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        isLong
          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      }`}
    >
      SLA {hari} hari
    </span>
  );
}

export default function LayananCardGrid({ items }: Props) {
  const router = useRouter();
  const aktif = items.filter((i) => i.isActive);

  if (!aktif.length) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">
        Belum ada jenis layanan aktif
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {aktif.map((item) => (
        <button
          key={item.id}
          onClick={() => router.push(`/layanan/buat?jenisLayananId=${item.id}`)}
          className="text-left bg-white dark:bg-[#0c1427] border border-gray-100 dark:border-[#172036] rounded-xl p-5 shadow-sm hover:shadow-md hover:border-primary-200 dark:hover:border-primary-700 transition-all group"
        >
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 mb-1">
            {item.nama}
          </h3>
          {item.deskripsi && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
              {item.deskripsi}
            </p>
          )}
          <SlaBadge hari={item.totalSlaHari} />
        </button>
      ))}
    </div>
  );
}
