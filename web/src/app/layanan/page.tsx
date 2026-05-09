"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import StatusBadge from "@/components/silakap/StatusBadge";
import { useLayananList } from "@/hooks/useLayanan";
import { displayStatusLabel, displayTahapLabel } from "@/lib/display-labels";
import { getVisiblePages } from "@/lib/pagination";
import { useAuthStore } from "@/store/auth.store";

const STATUS_OPTIONS = [
  "", "Draft", "Diajukan", "VerifikasiAP", "VerifikasiAM",
  "QualityControl", "ApprovalKabid", "ApprovalKepalaBadan",
  "Selesai", "Ditolak", "Dikembalikan", "Diarsipkan", "DalamProses",
];

const JENIS_ICON: Record<string, string> = {
  CUTI: "beach_access", KGB: "trending_up", KP: "military_tech",
  MUTASI: "swap_horiz", BINA: "school", PENS: "elderly",
  PRMJ: "sync", PROM: "workspace_premium", SOPDATA: "edit_document", TB: "menu_book",
};

const normalizeOption = (value: string | null, options: string[]) => {
  if (!value) return "";
  return options.find((o) => o.toLowerCase() === value.toLowerCase()) ?? "";
};

const normalizePage = (value: string | null) => {
  const page = Number(value ?? 1);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
};

export default function LayananPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);

  const status = normalizeOption(searchParams.get("status"), STATUS_OPTIONS);
  const search = searchParams.get("q") ?? "";
  const page = normalizePage(searchParams.get("page"));

  const updateQuery = useCallback(
    (changes: Record<string, string | number | null>, mode: "push" | "replace" = "push") => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(changes).forEach(([key, value]) => {
        if (value === null || value === "") params.delete(key);
        else params.set(key, String(value));
      });
      if (!("page" in changes)) params.delete("page");
      params.delete("search");
      const qs = params.toString();
      const href = qs ? `${pathname}?${qs}` : pathname;
      if (mode === "replace") {
        router.replace(href, { scroll: false });
      } else {
        router.push(href, { scroll: false });
      }
    },
    [pathname, router, searchParams],
  );

  const queryParams = useMemo(
    () => ({ status: status || undefined, search: search || undefined, page, limit: 15 }),
    [page, search, status],
  );

  const layanan = useLayananList(queryParams);
  const totalPages = layanan.data?.meta.totalPages ?? 1;
  const currentPage = Math.min(page, totalPages);
  const total = layanan.data?.meta.total ?? 0;
  const hasFilter = Boolean(status || search.trim());
  const visiblePages = getVisiblePages(currentPage, totalPages);

  useEffect(() => {
    if (!layanan.data || page <= totalPages) return;
    updateQuery({ page: totalPages }, "replace");
  }, [layanan.data, page, totalPages, updateQuery]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="!mb-0.5">Daftar Layanan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {layanan.isLoading ? "Memuat..." : `${total} usulan ditemukan`}
          </p>
        </div>
        {user?.roleNama === "Pengelola_OPD" && (
          <Link
            href="/layanan/buat"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <i className="material-symbols-outlined !text-[16px]">add</i>
            Buat Usulan
          </Link>
        )}
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-[#0c1427] rounded-xl border border-gray-100 dark:border-[#172036] p-3 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <i className="material-symbols-outlined !text-[16px] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            search
          </i>
          <input
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 dark:border-[#172036] bg-gray-50 dark:bg-[#15203c] text-sm text-black dark:text-white placeholder-gray-400 outline-none focus:border-primary-400"
            placeholder="Cari nomor / nama ASN..."
            value={search}
            onChange={(e) => updateQuery({ q: e.target.value || null }, "replace")}
            suppressHydrationWarning
          />
        </div>

        <select
          className="h-9 rounded-lg border border-gray-200 dark:border-[#172036] bg-gray-50 dark:bg-[#15203c] text-sm text-black dark:text-white px-3 outline-none focus:border-primary-400 min-w-[160px]"
          value={status}
          onChange={(e) => updateQuery({ status: e.target.value || null })}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt ? displayStatusLabel(opt) : "Semua Status"}
            </option>
          ))}
        </select>

        {hasFilter && (
          <button
            type="button"
            onClick={() => updateQuery({ status: null, q: null })}
            className="h-9 px-3 rounded-lg border border-gray-200 dark:border-[#172036] text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors inline-flex items-center gap-1"
          >
            <i className="material-symbols-outlined !text-[14px]">close</i>
            Reset
          </button>
        )}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-[#0c1427] rounded-xl border border-gray-100 dark:border-[#172036] overflow-hidden">
        {layanan.isLoading ? (
          <div className="divide-y divide-gray-100 dark:divide-[#172036]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-4 py-3.5 flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#172036] shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-100 dark:bg-[#172036] rounded w-1/3" />
                  <div className="h-3.5 bg-gray-100 dark:bg-[#172036] rounded w-1/2" />
                </div>
                <div className="h-5 w-20 bg-gray-100 dark:bg-[#172036] rounded-full" />
              </div>
            ))}
          </div>
        ) : layanan.isError ? (
          <div className="px-4 py-8 text-center">
            <i className="material-symbols-outlined !text-[32px] text-danger-400">error_outline</i>
            <p className="mt-2 text-sm text-danger-600 dark:text-danger-400">Gagal memuat data</p>
          </div>
        ) : layanan.data?.data.length ? (
          <div className="divide-y divide-gray-100 dark:divide-[#172036]">
            {layanan.data.data.map((item) => {
              const kode = item.jenisLayanan?.kode ?? "";
              const icon = JENIS_ICON[kode] ?? "description";
              return (
                <Link
                  key={item.id}
                  href={`/layanan/${item.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors group"
                >
                  {/* Icon */}
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                    <i className="material-symbols-outlined !text-[16px] text-primary-500 dark:text-primary-400">
                      {icon}
                    </i>
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="font-semibold text-sm text-black dark:text-white truncate">
                        {item.asn?.nama ?? "-"}
                      </span>
                      <span className="font-mono text-[11px] text-gray-400 dark:text-gray-500 shrink-0">
                        {item.nomorUsulan}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.jenisLayanan?.nama ?? "-"}
                      </span>
                      {item.tahapSaatIni && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">·</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {displayTahapLabel(item.tahapSaatIni)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: status + SLA dot + tanggal */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-1.5">
                      {(() => {
                        const sla = item.slaTracker?.[0];
                        if (!sla || sla.statusSla === "OK") return null;
                        return (
                          <span
                            title={sla.statusSla === "Overdue" ? "SLA terlampaui" : `Mendekati SLA · ${dayjs(sla.slaHabisAt).format("DD/MM HH:mm")}`}
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              sla.statusSla === "Overdue"
                                ? "bg-danger-500 animate-pulse"
                                : "bg-warning-500"
                            }`}
                          />
                        );
                      })()}
                      <StatusBadge status={item.status} />
                    </div>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      {dayjs(item.tanggalUsulan).format("DD MMM YYYY")}
                    </span>
                  </div>

                  <i className="material-symbols-outlined !text-[16px] text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors shrink-0">
                    chevron_right
                  </i>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-14 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-[#172036] flex items-center justify-center mb-3">
              <i className="material-symbols-outlined !text-[24px] text-gray-400">folder_open</i>
            </div>
            <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">
              {hasFilter ? "Tidak ada hasil" : "Belum ada usulan"}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {hasFilter ? "Coba ubah atau reset filter." : "Usulan akan muncul di sini."}
            </p>
            {hasFilter && (
              <button
                type="button"
                onClick={() => updateQuery({ status: null, q: null })}
                className="mt-3 text-xs text-primary-500 hover:underline"
              >
                Reset filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Hal {currentPage} dari {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => updateQuery({ page: currentPage - 1 })}
              className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#172036] flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors"
            >
              <i className="material-symbols-outlined !text-[16px]">chevron_left</i>
            </button>

            {visiblePages.map((p, i) =>
              p === "ellipsis" ? (
                <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => updateQuery({ page: p })}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    p === currentPage
                      ? "bg-primary-500 text-white"
                      : "border border-gray-200 dark:border-[#172036] hover:bg-gray-50 dark:hover:bg-[#15203c] text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {p}
                </button>
              ),
            )}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => updateQuery({ page: currentPage + 1 })}
              className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#172036] flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors"
            >
              <i className="material-symbols-outlined !text-[16px]">chevron_right</i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
