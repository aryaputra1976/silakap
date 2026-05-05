"use client";

import { useState } from "react";
import StatusBadge from "@/components/silakap/StatusBadge";
import type { RecentUsulanItem } from "@/hooks/useDashboard";

interface RecentUsulanTableProps {
  data: RecentUsulanItem[] | undefined;
}

const PAGE_SIZE = 5;

const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));

const COLUMNS = ["NIP", "Nama ASN", "Jenis Layanan", "Status", "Tanggal"];

export default function RecentUsulanTable({ data }: RecentUsulanTableProps) {
  const [page, setPage] = useState(1);
  const rows = data ?? [];
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paginatedRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
      <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-start justify-between flex-wrap gap-3">
        <div>
          <h5 className="!mb-0">Usulan Terbaru</h5>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {rows.length} usulan terakhir dalam sistem
          </p>
        </div>
        {rows.length > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400 self-center">
            Halaman {page} / {totalPages}
          </span>
        )}
      </div>

      <div className="table-responsive overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {COLUMNS.map((col, i) => (
                <th
                  key={col}
                  className={`font-medium text-left px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c] text-black dark:text-white whitespace-nowrap text-sm ${
                    i === 0 ? "rounded-tl-md" : ""
                  } ${i === COLUMNS.length - 1 ? "rounded-tr-md" : ""}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors"
                >
                  <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] text-sm text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap">
                    {item.asn?.nipBaru ?? "—"}
                  </td>
                  <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] text-sm font-medium text-black dark:text-white whitespace-nowrap">
                    {item.asn?.nama ?? "—"}
                  </td>
                  <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] text-sm text-gray-600 dark:text-gray-400">
                    {item.jenisLayanan?.nama ?? "—"}
                  </td>
                  <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatDate(item.createdAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="text-center px-[20px] py-[50px] text-gray-400"
                  colSpan={COLUMNS.length}
                >
                  <div className="flex flex-col items-center gap-2">
                    <i className="material-symbols-outlined !text-[40px]">
                      inbox
                    </i>
                    <p className="text-sm">Belum ada usulan.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 dark:border-[#172036] flex-wrap gap-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Menampilkan{" "}
            <span className="font-medium text-black dark:text-white">
              {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, rows.length)}
            </span>{" "}
            dari{" "}
            <span className="font-medium text-black dark:text-white">
              {rows.length}
            </span>{" "}
            data
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs rounded-md border border-gray-200 dark:border-[#172036] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors text-gray-700 dark:text-gray-300"
            >
              ‹ Prev
            </button>
            {pageNumbers.map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                  p === page
                    ? "bg-primary-500 text-white border-primary-500 font-semibold"
                    : "border-gray-200 dark:border-[#172036] hover:bg-gray-50 dark:hover:bg-[#15203c] text-gray-700 dark:text-gray-300"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs rounded-md border border-gray-200 dark:border-[#172036] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors text-gray-700 dark:text-gray-300"
            >
              Next ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
