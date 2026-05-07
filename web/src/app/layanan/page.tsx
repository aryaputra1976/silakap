"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import StatusBadge from "@/components/silakap/StatusBadge";
import { useLayananList } from "@/hooks/useLayanan";
import { displayStatusLabel, displayTahapLabel } from "@/lib/display-labels";
import { useAuthStore } from "@/store/auth.store";

const STATUS_OPTIONS = [
  "",
  "Draft",
  "Diajukan",
  "VerifikasiAP",
  "VerifikasiAM",
  "QualityControl",
  "ApprovalKabid",
  "ApprovalKepalaBadan",
  "Selesai",
  "Ditolak",
  "Dikembalikan",
  "Diarsipkan",
  "DalamProses",
];

const TAHAP_OPTIONS = ["", "AP", "AM", "AD", "Kabid", "KepalaBadan"];

export default function LayananPage() {
  const user = useAuthStore((state) => state.user);
  const [status, setStatus] = useState("");
  const [tahap, setTahap] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setStatus(params.get("status") ?? "");
    setTahap(params.get("tahap") ?? "");
    setSearch(params.get("search") ?? "");
    setPage(Number(params.get("page") ?? 1));
  }, []);

  const queryParams = useMemo(
    () => ({
      status: status || undefined,
      tahap: tahap || undefined,
      search: search || undefined,
      page,
      limit: 10,
    }),
    [page, search, status, tahap],
  );

  const layanan = useLayananList(queryParams);

  const handleFilterChange = (
    updater: (value: string) => void,
    value: string,
  ) => {
    updater(value);
    setPage(1);
  };

  return (
    <div className="space-y-[25px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="!mb-1">Layanan Kepegawaian</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Daftar usulan layanan dan status workflow
          </p>
        </div>
        {user?.roleNama === "Pengelola_OPD" ? (
          <Link
            href="/layanan/buat"
            className="inline-flex items-center gap-2 py-[10px] px-[20px] bg-primary-500 text-white transition-all hover:bg-primary-400 rounded-md"
          >
            <i className="material-symbols-outlined !text-[20px]">add</i>
            Buat Usulan
          </Link>
        ) : null}
      </div>

      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[15px]">
          <select
            className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px] outline-0"
            value={status}
            onChange={(event) =>
              handleFilterChange(setStatus, event.target.value)
            }
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option ? displayStatusLabel(option) : "Semua Status"}
              </option>
            ))}
          </select>
          <select
            className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px] outline-0"
            value={tahap}
            onChange={(event) =>
              handleFilterChange(setTahap, event.target.value)
            }
          >
            {TAHAP_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option ? displayTahapLabel(option) : "Semua Tahap"}
              </option>
            ))}
          </select>
          <input
            className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] outline-0"
            placeholder="Cari nomor usulan"
            value={search}
            onChange={(event) =>
              handleFilterChange(setSearch, event.target.value)
            }
          />
        </div>
      </div>

      {layanan.isError ? (
        <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">
          Gagal memuat data
        </div>
      ) : null}

      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        {layanan.isLoading ? (
          <div className="animate-pulse rounded-xl bg-gray-200 dark:bg-[#172036] h-40" />
        ) : layanan.data?.data.length ? (
          <>
            <div className="table-responsive overflow-x-auto">
              <table className="w-full">
                <thead className="text-black dark:text-white">
                  <tr>
                    {[
                      "Nomor Usulan",
                      "ASN",
                      "Jenis Layanan",
                      "Status",
                      "Tahap",
                      "Tanggal",
                      "Aksi",
                    ].map((heading) => (
                      <th
                        className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c] whitespace-nowrap"
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
                        <span className="block font-medium">
                          {item.asn?.nama ?? "-"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {item.asn?.nipBaru ?? "-"}
                        </span>
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
                        <Link
                          href={`/layanan/${item.id}`}
                          className="text-primary-500 font-medium hover:underline"
                        >
                          Lihat detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-2 mt-[20px]">
              {Array.from({ length: layanan.data.meta.totalPages }).map(
                (_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      className={`w-9 h-9 rounded-md border ${
                        pageNumber === page
                          ? "bg-primary-500 text-white border-primary-500"
                          : "border-gray-200 dark:border-[#172036]"
                      }`}
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                },
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-[45px]">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary-50 text-primary-500 flex items-center justify-center mb-4">
              <i className="material-symbols-outlined !text-[34px]">
                folder_open
              </i>
            </div>
            <h5 className="!mb-1">Belum ada usulan</h5>
            <p className="text-gray-500 dark:text-gray-400">
              Usulan layanan akan tampil di sini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
