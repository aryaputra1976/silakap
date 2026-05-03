"use client";

import { useState } from "react";
import {
  downloadImportErrors,
  useIntegrasiLog,
  useIntegrasiStatus,
  useRunValidasi,
  useValidasiData,
} from "@/hooks/useAdmin";

const statusClass = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized.includes("sukses") || normalized.includes("success")) return "bg-success-100 text-success-700";
  if (normalized.includes("gagal") || normalized.includes("fail")) return "bg-danger-100 text-danger-700";
  if (normalized.includes("proses") || normalized.includes("processing")) return "bg-warning-100 text-warning-700";
  return "bg-gray-100 text-gray-700";
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));

export default function AdminIntegrasiPage() {
  const [page, setPage] = useState(1);
  const status = useIntegrasiStatus();
  const validasi = useValidasiData();
  const runValidasi = useRunValidasi();
  const log = useIntegrasiLog({ page, limit: 10 });

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">Integrasi & Validasi Data</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Monitoring import SIASN dan kualitas data ASN
        </p>
      </div>

      <div>
        <h5>Status Import</h5>
        {status.isLoading ? (
          <div className="animate-pulse h-32 bg-gray-200 dark:bg-[#172036] rounded-md" />
        ) : status.isError ? (
          <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">
            Gagal memuat status import
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
            {(status.data ?? []).map((item) => (
              <div
                className="bg-white dark:bg-[#0c1427] rounded-md p-[20px] border border-gray-100 dark:border-[#172036]"
                key={item.id}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h6 className="!mb-0">{item.jenisData}</h6>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${statusClass(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <p>Sukses: {item.successBaris}</p>
                <p>Gagal: {item.failedBaris}</p>
                <p className="text-sm text-gray-500">{formatDateTime(item.createdAt)}</p>
              </div>
            ))}
            {!status.data?.length ? (
              <div className="bg-white dark:bg-[#0c1427] rounded-md p-[20px]">
                Belum ada status import.
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-[20px]">
          <h5 className="!mb-0">Validasi Data</h5>
          <button
            type="button"
            className="py-[10px] px-[20px] bg-primary-500 text-white rounded-md disabled:opacity-70"
            disabled={runValidasi.isPending}
            onClick={() => runValidasi.mutate()}
          >
            Jalankan Validasi Ulang
          </button>
        </div>
        {validasi.isLoading ? (
          <div className="animate-pulse h-24 bg-gray-200 dark:bg-[#172036] rounded-md" />
        ) : validasi.isError ? (
          <div className="text-danger-500">Gagal memuat validasi</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-[20px]">
            <div className={validasi.data?.asnTanpaUnit ? "text-danger-500" : ""}>
              <span className="block text-sm text-gray-500">ASN tanpa Unit</span>
              <strong className="text-2xl">{validasi.data?.asnTanpaUnit ?? 0}</strong>
            </div>
            <div className={validasi.data?.duplikatNik ? "text-danger-500" : ""}>
              <span className="block text-sm text-gray-500">Duplikat NIK</span>
              <strong className="text-2xl">{validasi.data?.duplikatNik ?? 0}</strong>
            </div>
            <div className={validasi.data?.duplikatNip ? "text-danger-500" : ""}>
              <span className="block text-sm text-gray-500">Duplikat NIP</span>
              <strong className="text-2xl">{validasi.data?.duplikatNip ?? 0}</strong>
            </div>
            <div>
              <span className="block text-sm text-gray-500">Dicek pada</span>
              <strong>
                {validasi.data?.checkedAt ? formatDateTime(validasi.data.checkedAt) : "-"}
              </strong>
            </div>
          </div>
        )}
      </div>

      <div id="log" className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <h5>Log Import</h5>
        {log.isLoading ? (
          <div className="animate-pulse h-48 bg-gray-200 dark:bg-[#172036] rounded-md" />
        ) : log.isError ? (
          <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">
            Gagal memuat log import
          </div>
        ) : (
          <>
            <div className="table-responsive overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {["Jenis Data", "Status", "Sukses", "Gagal", "Waktu", "Error"].map((heading) => (
                      <th className="font-medium text-left px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c]" key={heading}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(log.data?.data ?? []).map((item) => (
                    <tr key={item.id}>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.jenisData}</td>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${statusClass(item.status)}`}>{item.status}</span>
                      </td>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.successBaris}</td>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.failedBaris}</td>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{formatDateTime(item.createdAt)}</td>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
                        {item.failedBaris > 0 ? (
                          <button
                            type="button"
                            className="text-primary-500 font-medium"
                            onClick={() => void downloadImportErrors(item.id)}
                          >
                            Excel error
                          </button>
                        ) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {log.data?.meta.totalPages ? (
              <div className="flex justify-end gap-2 mt-[20px]">
                {Array.from({ length: log.data.meta.totalPages }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`w-9 h-9 rounded-md border ${page === index + 1 ? "bg-primary-500 text-white border-primary-500" : "border-gray-200 dark:border-[#172036]"}`}
                    onClick={() => setPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
