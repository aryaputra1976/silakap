"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  useNotifikasiCount,
  useNotifikasiList,
  useReadNotifikasi,
} from "@/hooks/useNotifikasi";
import { getVisiblePages } from "@/lib/pagination";
import type { Notifikasi } from "@/types/models";

const relativeTime = (value: string) => {
  const minutes = Math.max(
    Math.floor((Date.now() - new Date(value).getTime()) / 60000),
    0,
  );
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
};

const toneConfig = (type: string, isRead: boolean) => {
  if (type.includes("OVERDUE"))
    return { icon: "timer_off", iconClass: "text-danger-500 bg-danger-50 dark:bg-danger-900/20", label: "SLA kritis", labelClass: "bg-danger-50 text-danger-600 dark:bg-danger-900/20 dark:text-danger-400" };
  if (type.includes("WARNING"))
    return { icon: "running_with_errors", iconClass: "text-warning-600 bg-warning-50 dark:bg-warning-900/20", label: "Mendekati SLA", labelClass: "bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400" };
  if (type.includes("PEREMAJAAN"))
    return { icon: "manage_accounts", iconClass: "text-primary-500 bg-primary-50 dark:bg-primary-900/20", label: "Peremajaan", labelClass: "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400" };
  return { icon: "notifications", iconClass: isRead ? "text-gray-400 bg-gray-100 dark:bg-[#172036]" : "text-primary-500 bg-primary-50 dark:bg-primary-900/20", label: "Sistem", labelClass: "bg-gray-100 text-gray-600 dark:bg-[#172036] dark:text-gray-400" };
};

export default function NotifikasiPage() {
  const router = useRouter();
  const [filterRead, setFilterRead] = useState<"" | "false">("");
  const [page, setPage] = useState(1);

  const list = useNotifikasiList({
    isRead: filterRead === "" ? undefined : false,
    page,
    limit: 20,
  });
  const count = useNotifikasiCount();
  const actions = useReadNotifikasi();

  const totalPages = list.data?.meta.totalPages ?? 1;
  const visiblePages = getVisiblePages(page, totalPages);

  const openItem = (item: Notifikasi) => {
    if (!item.isRead) {
      actions.readOne.mutate(item.id, {
        onSuccess: () => { if (item.link) router.push(item.link); },
      });
    } else if (item.link) {
      router.push(item.link);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="!mb-0.5">Notifikasi</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {count.data?.belumDibaca ?? 0} belum dibaca · {count.data?.total ?? 0} total
          </p>
        </div>
        <button
          type="button"
          disabled={!count.data?.belumDibaca || actions.readAll.isPending}
          onClick={() => actions.readAll.mutate()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <i className="material-symbols-outlined !text-[16px]">done_all</i>
          Tandai semua dibaca
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {([["", "Semua"], ["false", "Belum dibaca"]] as const).map(([val, label]) => (
          <button
            key={val}
            type="button"
            onClick={() => { setFilterRead(val); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filterRead === val
                ? "bg-primary-500 text-white"
                : "bg-white dark:bg-[#0c1427] border border-gray-200 dark:border-[#172036] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#15203c]"
            }`}
          >
            {label}
            {val === "false" && count.data?.belumDibaca ? (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-danger-500 text-white text-[10px] font-bold leading-none">
                {count.data.belumDibaca}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-[#0c1427] rounded-xl border border-gray-100 dark:border-[#172036] overflow-hidden">
        {list.isError ? (
          <div className="py-4 px-4 text-sm text-danger-600 bg-danger-50">Gagal memuat data</div>
        ) : list.isLoading ? (
          <div className="divide-y divide-gray-100 dark:divide-[#172036]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#172036] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-100 dark:bg-[#172036] rounded w-2/3" />
                  <div className="h-3 bg-gray-100 dark:bg-[#172036] rounded w-full" />
                  <div className="h-3 bg-gray-100 dark:bg-[#172036] rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : list.data?.data.length ? (
          <div className="divide-y divide-gray-100 dark:divide-[#172036]">
            {list.data.data.map((item) => {
              const tone = toneConfig(item.type, item.isRead);
              return (
                <div
                  key={item.id}
                  className={`relative flex items-start gap-4 p-4 group transition-colors hover:bg-gray-50 dark:hover:bg-[#15203c] ${!item.isRead ? "bg-primary-50/30 dark:bg-primary-900/5" : ""}`}
                >
                  <button
                    type="button"
                    className="flex items-start gap-4 flex-1 min-w-0 text-left"
                    onClick={() => openItem(item)}
                  >
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${tone.iconClass}`}>
                      <i className="material-symbols-outlined !text-[20px]">{tone.icon}</i>
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${tone.labelClass}`}>
                          {tone.label}
                        </span>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                        )}
                      </div>
                      <p className={`text-sm leading-snug ${item.isRead ? "text-gray-600 dark:text-gray-400" : "text-black dark:text-white font-medium"}`}>
                        {item.judul}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {item.isi}
                      </p>
                      <span suppressHydrationWarning className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 block">
                        {relativeTime(item.createdAt)}
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    aria-label="Hapus"
                    onClick={() => actions.remove.mutate(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-danger-400 dark:text-gray-600 dark:hover:text-danger-400 shrink-0 mt-0.5"
                  >
                    <i className="material-symbols-outlined !text-[18px]">close</i>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-14 text-center">
            <i className="material-symbols-outlined !text-[32px] text-gray-300 dark:text-gray-600">notifications_off</i>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {filterRead === "false" ? "Semua notifikasi sudah dibaca" : "Tidak ada notifikasi"}
            </p>
            {filterRead === "false" && (
              <button
                type="button"
                onClick={() => { setFilterRead(""); setPage(1); }}
                className="mt-2 text-xs text-primary-500 hover:underline"
              >
                Lihat semua
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Hal {page} dari {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#172036] flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#15203c]"
            >
              <i className="material-symbols-outlined !text-[16px]">chevron_left</i>
            </button>
            {visiblePages.map((p, i) =>
              p === "ellipsis" ? (
                <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">…</span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    p === page
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
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#172036] flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#15203c]"
            >
              <i className="material-symbols-outlined !text-[16px]">chevron_right</i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
