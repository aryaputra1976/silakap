"use client";

import Link from "next/link";
import StatusBadge from "@/components/silakap/StatusBadge";
import { downloadDokumenOutput, useLayananList } from "@/hooks/useLayanan";
import { useState } from "react";
import { displayTahapLabel } from "@/lib/display-labels";

export default function LayananFilteredList({
  title,
  description,
  status,
  emptyText,
  showDownload = false,
}: {
  title: string;
  description: string;
  status: string;
  emptyText: string;
  showDownload?: boolean;
}) {
  const layanan = useLayananList({ status, limit: 20 });
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (id: string) => {
    setDownloadingId(id);
    try {
      await downloadDokumenOutput(id);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-[25px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="!mb-1">{title}</h1>
          <p className="text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <Link
          href="/layanan"
          className="inline-flex items-center gap-2 rounded-md border border-gray-200 dark:border-[#172036] px-4 py-2"
        >
          <i className="material-symbols-outlined !text-[18px]">list</i>
          Semua Usulan
        </Link>
      </div>

      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        {layanan.isLoading ? (
          <div className="animate-pulse rounded-xl bg-gray-200 dark:bg-[#172036] h-40" />
        ) : layanan.isError ? (
          <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">
            Gagal memuat data
          </div>
        ) : layanan.data?.data.length ? (
          <div className="table-responsive overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {["Nomor", "ASN", "Jenis Layanan", "Status", "Tahap", "Tanggal", "Aksi"].map((heading) => (
                    <th
                      className="font-medium text-left px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c]"
                      key={heading}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {layanan.data.data.map((item) => (
                  <tr key={item.id}>
                    <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] font-medium">
                      {item.nomorUsulan}
                    </td>
                    <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
                      <span className="block font-medium">{item.asn?.nama ?? "-"}</span>
                      <span className="text-sm text-gray-500">{item.asn?.nipBaru ?? "-"}</span>
                    </td>
                    <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
                      {item.jenisLayanan?.nama ?? "-"}
                    </td>
                    <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
                      {displayTahapLabel(item.tahapSaatIni)}
                    </td>
                    <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] whitespace-nowrap">
                      {new Date(item.tanggalUsulan).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/layanan/${item.id}`}
                          className="py-[8px] px-[12px] rounded-md border border-gray-200 dark:border-[#172036]"
                        >
                          Detail
                        </Link>
                        {showDownload ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 py-[8px] px-[12px] bg-primary-500 text-white rounded-md disabled:opacity-70"
                            disabled={downloadingId === item.id}
                            onClick={() => void handleDownload(item.id)}
                          >
                            <i className="material-symbols-outlined !text-[18px]">download</i>
                            {downloadingId === item.id ? "Mengunduh..." : "Download"}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-[45px] text-gray-500">{emptyText}</div>
        )}
      </div>
    </div>
  );
}
