"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  useNotifikasiCount,
  useNotifikasiList,
  useReadNotifikasi,
} from "@/hooks/useNotifikasi";
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

const getNotificationTone = (type: string, isRead: boolean) => {
  if (type.includes("OVERDUE")) {
    return {
      icon: "timer_off",
      wrapper: isRead ? "bg-danger-50 text-danger-500" : "bg-danger-100 text-danger-600",
      badge: "bg-danger-50 text-danger-600",
      label: "SLA kritis",
    };
  }
  if (type.includes("WARNING")) {
    return {
      icon: "running_with_errors",
      wrapper: isRead ? "bg-warning-50 text-warning-600" : "bg-warning-100 text-warning-700",
      badge: "bg-warning-50 text-warning-700",
      label: "Mendekati SLA",
    };
  }
  if (type.includes("PEREMAJAAN")) {
    return {
      icon: "manage_accounts",
      wrapper: isRead ? "bg-primary-50 text-primary-500" : "bg-primary-100 text-primary-600",
      badge: "bg-primary-50 text-primary-700",
      label: "Peremajaan",
    };
  }
  return {
    icon: "notifications",
    wrapper: isRead ? "bg-gray-100 text-gray-500" : "bg-primary-50 text-primary-500",
    badge: "bg-gray-100 text-gray-600",
    label: "Sistem",
  };
};

export default function NotifikasiPage() {
  const router = useRouter();
  const [isRead, setIsRead] = useState<string>("");
  const [page, setPage] = useState(1);
  const list = useNotifikasiList({
    isRead: isRead === "" ? undefined : isRead === "true",
    page,
    limit: 20,
  });
  const count = useNotifikasiCount();
  const actions = useReadNotifikasi();

  const openNotification = (item: Notifikasi) => {
    const navigate = () => {
      if (item.link) {
        router.push(item.link);
      }
    };

    if (!item.isRead) {
      actions.readOne.mutate(item.id, { onSuccess: navigate });
    } else {
      navigate();
    }
  };

  return (
    <div className="space-y-[25px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="!mb-1">Notifikasi</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {count.data?.belumDibaca ?? 0} notifikasi belum dibaca
          </p>
        </div>
        <button
          type="button"
          className="py-[10px] px-[20px] bg-primary-500 text-white rounded-md disabled:opacity-70"
          disabled={!count.data?.belumDibaca || actions.readAll.isPending}
          onClick={() => actions.readAll.mutate()}
        >
          Tandai Semua Dibaca
        </button>
      </div>

      <div className="flex gap-2">
        {[
          ["", "Semua"],
          ["false", "Belum Dibaca"],
        ].map(([value, label]) => (
          <button
            type="button"
            className={`px-4 py-2 rounded-md border ${
              isRead === value
                ? "bg-primary-500 border-primary-500 text-white"
                : "bg-white dark:bg-[#0c1427] border-gray-100 dark:border-[#172036]"
            }`}
            key={value}
            onClick={() => {
              setIsRead(value);
              setPage(1);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {list.isError ? (
        <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">
          Gagal memuat data
        </div>
      ) : null}

      <div className="space-y-3">
        {list.isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div
              className="animate-pulse rounded-md bg-gray-200 dark:bg-[#172036] h-24"
              key={index}
            />
          ))
        ) : list.data?.data.length ? (
          list.data.data.map((item) => {
            const tone = getNotificationTone(item.type, item.isRead);
            return (
              <div
                className="relative bg-white dark:bg-[#0c1427] rounded-md p-[20px] border border-gray-100 dark:border-[#172036] hover:border-primary-500 transition-all"
                key={item.id}
              >
              <button
                type="button"
                className="w-full text-left flex gap-4 pr-8"
                onClick={() => openNotification(item)}
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${tone.wrapper}`}
                >
                  <i className="material-symbols-outlined">{tone.icon}</i>
                </div>
                <div className="min-w-0">
                  <span
                    className={`mb-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone.badge}`}
                  >
                    {tone.label}
                  </span>
                  <h5
                    className={`!mb-1 ${item.isRead ? "!font-medium" : "!font-bold"}`}
                  >
                    {item.judul}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {item.isi}
                  </p>
                  <span suppressHydrationWarning className="text-xs text-gray-500">
                    {relativeTime(item.createdAt)}
                  </span>
                </div>
              </button>
              <button
                type="button"
                className="absolute right-4 top-4 text-gray-400 hover:text-danger-500"
                onClick={() => actions.remove.mutate(item.id)}
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            );
          })
        ) : (
          <div className="text-center py-[45px] bg-white dark:bg-[#0c1427] rounded-md">
            <h5>Tidak ada notifikasi</h5>
          </div>
        )}
      </div>

      {list.data?.meta.totalPages ? (
        <div className="flex justify-end gap-2">
          {Array.from({ length: list.data.meta.totalPages }).map((_, index) => {
            const pageNumber = index + 1;
            return (
              <button
                className={`w-9 h-9 rounded-md border ${
                  page === pageNumber
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
          })}
        </div>
      ) : null}
    </div>
  );
}
