"use client";

import { useRouter } from "next/navigation";
import type { RefJenisLayanan } from "@/types/models";

interface Props {
  items: RefJenisLayanan[];
}

type CardTheme = {
  icon: string;
  iconBg: string;
  iconColor: string;
  accent: string;
  hoverBorder: string;
  hoverShadow: string;
};

const THEME_MAP: Record<string, CardTheme> = {
  CUTI: {
    icon: "beach_access",
    iconBg: "bg-sky-100 dark:bg-sky-900/30",
    iconColor: "text-sky-600 dark:text-sky-400",
    accent: "border-l-sky-400",
    hoverBorder: "hover:border-sky-300 dark:hover:border-sky-700",
    hoverShadow: "hover:shadow-sky-100 dark:hover:shadow-sky-900/20",
  },
  KGB: {
    icon: "trending_up",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    accent: "border-l-emerald-400",
    hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-700",
    hoverShadow: "hover:shadow-emerald-100 dark:hover:shadow-emerald-900/20",
  },
  KP: {
    icon: "military_tech",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    accent: "border-l-indigo-400",
    hoverBorder: "hover:border-indigo-300 dark:hover:border-indigo-700",
    hoverShadow: "hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20",
  },
  MUTASI: {
    icon: "swap_horiz",
    iconBg: "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-600 dark:text-violet-400",
    accent: "border-l-violet-400",
    hoverBorder: "hover:border-violet-300 dark:hover:border-violet-700",
    hoverShadow: "hover:shadow-violet-100 dark:hover:shadow-violet-900/20",
  },
  BINA: {
    icon: "school",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    accent: "border-l-amber-400",
    hoverBorder: "hover:border-amber-300 dark:hover:border-amber-700",
    hoverShadow: "hover:shadow-amber-100 dark:hover:shadow-amber-900/20",
  },
  PENS: {
    icon: "elderly",
    iconBg: "bg-rose-100 dark:bg-rose-900/30",
    iconColor: "text-rose-600 dark:text-rose-400",
    accent: "border-l-rose-400",
    hoverBorder: "hover:border-rose-300 dark:hover:border-rose-700",
    hoverShadow: "hover:shadow-rose-100 dark:hover:shadow-rose-900/20",
  },
  PRMJ: {
    icon: "sync",
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    accent: "border-l-cyan-400",
    hoverBorder: "hover:border-cyan-300 dark:hover:border-cyan-700",
    hoverShadow: "hover:shadow-cyan-100 dark:hover:shadow-cyan-900/20",
  },
  PROM: {
    icon: "workspace_premium",
    iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    accent: "border-l-yellow-400",
    hoverBorder: "hover:border-yellow-300 dark:hover:border-yellow-700",
    hoverShadow: "hover:shadow-yellow-100 dark:hover:shadow-yellow-900/20",
  },
  SOPDATA: {
    icon: "edit_document",
    iconBg: "bg-slate-100 dark:bg-slate-900/30",
    iconColor: "text-slate-600 dark:text-slate-400",
    accent: "border-l-slate-400",
    hoverBorder: "hover:border-slate-300 dark:hover:border-slate-600",
    hoverShadow: "hover:shadow-slate-100 dark:hover:shadow-slate-900/20",
  },
  TB: {
    icon: "menu_book",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600 dark:text-orange-400",
    accent: "border-l-orange-400",
    hoverBorder: "hover:border-orange-300 dark:hover:border-orange-700",
    hoverShadow: "hover:shadow-orange-100 dark:hover:shadow-orange-900/20",
  },
};

const DEFAULT_THEME: CardTheme = {
  icon: "description",
  iconBg: "bg-gray-100 dark:bg-gray-800",
  iconColor: "text-gray-500 dark:text-gray-400",
  accent: "border-l-gray-300",
  hoverBorder: "hover:border-gray-300 dark:hover:border-gray-600",
  hoverShadow: "hover:shadow-gray-100",
};

function SlaBadge({ hari }: { hari?: number }) {
  if (!hari) return null;
  const isLong = hari >= 5;
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
        isLong
          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      }`}
    >
      <i className="material-symbols-outlined !text-[10px]">schedule</i>
      SLA {hari} hari
    </span>
  );
}

export default function LayananCardGrid({ items }: Props) {
  const router = useRouter();
  const aktif = items.filter((i) => i.isActive);

  if (!aktif.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <i className="material-symbols-outlined !text-[48px] text-gray-300 dark:text-gray-600 mb-3">inbox</i>
        <p className="text-sm text-gray-400 dark:text-gray-500">Belum ada jenis layanan aktif</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {aktif.map((item) => {
        const theme = THEME_MAP[item.kode] ?? DEFAULT_THEME;
        return (
          <button
            key={item.id}
            onClick={() => router.push(`/layanan/buat?jenisLayananId=${item.id}`)}
            className={`group text-left bg-white dark:bg-[#0c1427] border border-l-4 border-gray-100 dark:border-[#172036] ${theme.accent} ${theme.hoverBorder} rounded-xl px-4 py-3.5 shadow-sm hover:shadow-md ${theme.hoverShadow} transition-all duration-200`}
          >
            {/* Icon + arrow row */}
            <div className="flex items-center justify-between mb-2.5">
              <div className={`w-8 h-8 rounded-lg ${theme.iconBg} flex items-center justify-center shrink-0`}>
                <i className={`material-symbols-outlined !text-[17px] ${theme.iconColor}`}>
                  {theme.icon}
                </i>
              </div>
              <i className="material-symbols-outlined !text-[15px] text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </i>
            </div>

            {/* Name */}
            <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 leading-snug mb-2">
              {item.nama}
            </p>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5">
              <SlaBadge hari={item.totalSlaHari} />
              {item.butuhTteKepalaBadan && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  <i className="material-symbols-outlined !text-[10px]">draw</i>
                  TTE Kepala Badan
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
