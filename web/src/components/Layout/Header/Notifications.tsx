"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useNotifikasiCount,
  useNotifikasiList,
  useReadNotifikasi,
} from "@/hooks/useNotifikasi";
import { useAuthStore } from "@/store/auth.store";
import type { Notifikasi } from "@/types/models";

const relativeTime = (value: string) => {
  const minutes = Math.max(
    Math.floor((Date.now() - new Date(value).getTime()) / 60000),
    0,
  );
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes}m lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}j lalu`;
  return `${Math.floor(hours / 24)}h lalu`;
};

const toneIcon = (type: string) => {
  if (type.includes("OVERDUE")) return { icon: "timer_off", color: "text-danger-500 bg-danger-50 dark:bg-danger-900/20" };
  if (type.includes("WARNING")) return { icon: "running_with_errors", color: "text-warning-600 bg-warning-50 dark:bg-warning-900/20" };
  if (type.includes("PEREMAJAAN")) return { icon: "manage_accounts", color: "text-primary-500 bg-primary-50 dark:bg-primary-900/20" };
  return { icon: "notifications", color: "text-gray-500 bg-gray-100 dark:bg-[#172036]" };
};

const NotifItem: React.FC<{
  item: Notifikasi;
  onOpen: (item: Notifikasi) => void;
  onRemove: (id: string) => void;
}> = ({ item, onOpen, onRemove }) => {
  const tone = toneIcon(item.type);
  return (
    <div className={`flex items-start gap-3 px-4 py-3 group transition-colors hover:bg-gray-50 dark:hover:bg-[#15203c] ${!item.isRead ? "bg-primary-50/40 dark:bg-primary-900/10" : ""}`}>
      <button
        type="button"
        className="flex items-start gap-3 flex-1 min-w-0 text-left"
        onClick={() => onOpen(item)}
      >
        <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${tone.color}`}>
          <i className="material-symbols-outlined !text-[16px]">{tone.icon}</i>
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-sm leading-snug line-clamp-2 ${item.isRead ? "text-gray-600 dark:text-gray-400" : "text-black dark:text-white font-medium"}`}>
            {item.judul}
          </p>
          <span suppressHydrationWarning className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 block">
            {relativeTime(item.createdAt)}
          </span>
        </div>
        {!item.isRead && (
          <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" />
        )}
      </button>
      <button
        type="button"
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-danger-400 dark:text-gray-600 dark:hover:text-danger-400 shrink-0 mt-0.5"
        onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
        aria-label="Hapus"
      >
        <i className="material-symbols-outlined !text-[16px]">close</i>
      </button>
    </div>
  );
};

const Notifications: React.FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const count = useNotifikasiCount(isAuthenticated);
  const list = useNotifikasiList({ limit: 8, isRead: false }, open && isAuthenticated);
  const unreadList = list.data?.data ?? [];
  const actions = useReadNotifikasi();
  const unread = count.data?.belumDibaca ?? 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = (item: Notifikasi) => {
    setOpen(false);
    if (!item.isRead) {
      actions.readOne.mutate(item.id, {
        onSuccess: () => { if (item.link) router.push(item.link); },
      });
    } else if (item.link) {
      router.push(item.link);
    }
  };

  return (
    <div
      ref={ref}
      className="relative notifications-menu mx-[8px] md:mx-[10px] lg:mx-[12px]"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="leading-none inline-block transition-all relative top-[2px] hover:text-primary-500"
        aria-label="Notifikasi"
      >
        <i className="material-symbols-outlined !text-[22px] md:!text-[24px]">
          notifications
        </i>
        {unread > 0 && (
          <span className="absolute -top-[8px] -right-[10px] min-w-[18px] h-[18px] rounded-full bg-danger-500 text-white text-[10px] leading-[18px] text-center font-semibold px-[4px]">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full mt-[13px] ltr:right-0 rtl:left-0 w-[340px] max-w-[calc(100vw-2rem)] z-[10] bg-white dark:bg-[#0c1427] rounded-xl border border-gray-100 dark:border-[#172036] shadow-3xl dark:shadow-none overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#172036]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-black dark:text-white">Notifikasi</span>
              {unread > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-danger-500 text-white text-[10px] font-bold leading-none">
                  {unread}
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                type="button"
                disabled={actions.readAll.isPending}
                onClick={() => actions.readAll.mutate()}
                className="text-xs text-primary-500 hover:underline disabled:opacity-60"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* List */}
          <div className="divide-y divide-gray-100 dark:divide-[#172036] max-h-[360px] overflow-y-auto">
            {list.isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#172036] shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-100 dark:bg-[#172036] rounded w-3/4" />
                    <div className="h-3 bg-gray-100 dark:bg-[#172036] rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : unreadList.length > 0 ? (
              unreadList.map((item) => (
                <NotifItem
                  key={item.id}
                  item={item}
                  onOpen={handleOpen}
                  onRemove={(id) => actions.remove.mutate(id)}
                />
              ))
            ) : (
              <div className="py-10 text-center">
                <i className="material-symbols-outlined !text-[28px] text-gray-300 dark:text-gray-600">notifications_off</i>
                <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">Tidak ada notifikasi baru</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 dark:border-[#172036] px-4 py-2.5">
            <Link
              href="/notifikasi"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1 text-xs text-primary-500 hover:underline font-medium"
            >
              Lihat semua notifikasi
              <i className="material-symbols-outlined !text-[14px]">chevron_right</i>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
