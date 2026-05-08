"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import StatusBadge from "@/components/silakap/StatusBadge";
import { useLayananList } from "@/hooks/useLayanan";
import { displayStatusLabel, displayTahapLabel } from "@/lib/display-labels";
import { getVisiblePages } from "@/lib/pagination";
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

const STATUS_TO_TAHAP: Record<string, string | null> = {
  Draft: null,
  Diajukan: "AP",
  VerifikasiAP: "AP",
  VerifikasiAM: "AM",
  QualityControl: "AD",
  ApprovalKabid: "Kabid",
  ApprovalKepalaBadan: "KepalaBadan",
  Selesai: null,
  Ditolak: null,
  Dikembalikan: null,
  Diarsipkan: null,
};

const toQueryValue = (value: string) => value.toLowerCase();

const normalizeOption = (value: string | null, options: string[]) => {
  if (!value) return "";
  return (
    options.find((option) => option.toLowerCase() === value.toLowerCase()) ??
    ""
  );
};

const normalizePage = (value: string | null) => {
  const page = Number(value ?? 1);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
};


export default function LayananPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const status = normalizeOption(searchParams.get("status"), STATUS_OPTIONS);
  const tahap = normalizeOption(searchParams.get("tahap"), TAHAP_OPTIONS);
  const search = searchParams.get("q") ?? searchParams.get("search") ?? "";
  const page = normalizePage(searchParams.get("page"));

  const updateQuery = useCallback(
    (
      changes: Record<string, string | number | null>,
      mode: "push" | "replace" = "push",
    ) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(changes).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      if (!("page" in changes)) {
        params.delete("page");
      }
      params.delete("search");

      const queryString = params.toString();
      const href = queryString ? `${pathname}?${queryString}` : pathname;
      if (mode === "replace") {
        router.replace(href, { scroll: false });
        return;
      }
      router.push(href, { scroll: false });
    },
    [pathname, router, searchParams],
  );

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
  const totalPages = layanan.data?.meta.totalPages ?? 1;
  const currentPage = Math.min(page, totalPages);
  const hasFilter = Boolean(status || tahap || search.trim());
  const expectedTahap = status ? STATUS_TO_TAHAP[status] : undefined;
  const contradictoryFilter =
    Boolean(status && tahap) &&
    (expectedTahap === null || (expectedTahap !== undefined && expectedTahap !== tahap));
  const visiblePages = getVisiblePages(currentPage, totalPages);

  useEffect(() => {
    if (!layanan.data || page <= totalPages) return;
    updateQuery({ page: totalPages }, "replace");
  }, [layanan.data, page, totalPages, updateQuery]);

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
            onChange={(event) => {
              const value = event.target.value;
              updateQuery({ status: value ? toQueryValue(value) : null });
            }}
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
            onChange={(event) => {
              const value = event.target.value;
              updateQuery({ tahap: value ? toQueryValue(value) : null });
            }}
          >
            {TAHAP_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option ? displayTahapLabel(option) : "Semua Tahap"}
              </option>
            ))}
          </select>
          <input
            className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] outline-0"
            placeholder="Cari nomor usulan atau kata kunci"
            value={search}
            onChange={(event) =>
              updateQuery({ q: event.target.value }, "replace")
            }
          />
        </div>
        {contradictoryFilter ? (
          <div className="mt-4 rounded-md border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-800 dark:border-warning-800/40 dark:bg-warning-900/20 dark:text-warning-200">
            Kombinasi status dan tahap terlihat tidak selaras. Coba kosongkan salah satu filter jika hasil tidak muncul.
          </div>
        ) : null}
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

            {totalPages > 1 ? (
              <div className="flex flex-wrap items-center justify-end gap-2 mt-[20px]">
                {visiblePages.map((pageItem, index) => {
                  if (pageItem === "ellipsis") {
                    return (
                      <span
                        className="inline-flex h-9 min-w-9 items-center justify-center px-2 text-gray-400"
                        key={`ellipsis-${index}`}
                      >
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      className={`w-9 h-9 rounded-md border ${
                        pageItem === currentPage
                          ? "bg-primary-500 text-white border-primary-500"
                          : "border-gray-200 dark:border-[#172036]"
                      }`}
                      key={pageItem}
                      type="button"
                      onClick={() => updateQuery({ page: pageItem })}
                    >
                      {pageItem}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </>
        ) : (
          <div className="text-center py-[45px]">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary-50 text-primary-500 flex items-center justify-center mb-4">
              <i className="material-symbols-outlined !text-[34px]">
                folder_open
              </i>
            </div>
            <h5 className="!mb-1">
              {hasFilter ? "Tidak ada usulan sesuai filter" : "Belum ada usulan"}
            </h5>
            <p className="text-gray-500 dark:text-gray-400">
              {hasFilter
                ? "Tidak ada usulan sesuai filter. Coba ubah status/tahap/pencarian."
                : "Usulan layanan akan tampil di sini."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
