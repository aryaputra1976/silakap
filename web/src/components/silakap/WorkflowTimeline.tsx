"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import type { WorkflowLog } from "@/types/models";
import { displayTahapLabel, displayWorkflowActionLabel } from "@/lib/display-labels";

dayjs.extend(relativeTime);
dayjs.locale("id");

interface WorkflowTimelineProps {
  logs: WorkflowLog[];
}

type ActionStyle = { bg: string; icon: string; color: string };

const ACTION_STYLES: Record<string, ActionStyle> = {
  SUBMIT:    { bg: "bg-primary-100 dark:bg-primary-900/40",  icon: "send",           color: "text-primary-600 dark:text-primary-400" },
  TERIMA:    { bg: "bg-success-100 dark:bg-success-900/30",  icon: "check_circle",   color: "text-success-600 dark:text-success-400" },
  TERUSKAN:  { bg: "bg-success-100 dark:bg-success-900/30",  icon: "arrow_forward",  color: "text-success-600 dark:text-success-400" },
  KEMBALIKAN:{ bg: "bg-warning-100 dark:bg-warning-900/30",  icon: "undo",           color: "text-warning-600 dark:text-warning-400" },
  SETUJUI:   { bg: "bg-success-100 dark:bg-success-900/30",  icon: "verified",       color: "text-success-600 dark:text-success-400" },
  BATAL:     { bg: "bg-danger-100 dark:bg-danger-900/30",    icon: "cancel",         color: "text-danger-600 dark:text-danger-400"   },
  RESUBMIT:  { bg: "bg-primary-100 dark:bg-primary-900/40",  icon: "replay",         color: "text-primary-600 dark:text-primary-400" },
};
const DEFAULT_STYLE: ActionStyle = {
  bg: "bg-gray-100 dark:bg-[#172036]",
  icon: "radio_button_checked",
  color: "text-gray-500",
};

export default function WorkflowTimeline({ logs }: WorkflowTimelineProps) {
  // Chronological — oldest first so the timeline reads top→bottom
  const sorted = [...logs].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <div className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036]">
      <h5 className="!mb-5">Riwayat aktivitas</h5>

      {sorted.length > 0 ? (
        <div>
          {sorted.map((log, idx) => {
            const style = ACTION_STYLES[log.aksi] ?? DEFAULT_STYLE;
            const isLast = idx === sorted.length - 1;

            return (
              <div key={log.id} className="relative flex gap-3 pb-5 last:pb-0">
                {/* Vertical connector */}
                {!isLast && (
                  <span className="absolute left-[17px] top-9 bottom-0 w-0.5 bg-gray-100 dark:bg-[#172036]" />
                )}

                {/* Icon bubble */}
                <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${style.bg}`}>
                  <i className={`material-symbols-outlined !text-[18px] ${style.color}`}>
                    {style.icon}
                  </i>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm text-black dark:text-white">
                      {displayWorkflowActionLabel(log.aksi)}
                    </span>
                    {(log.dariTahap || log.keTahap) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#172036] text-[11px] text-gray-600 dark:text-gray-400">
                        {log.dariTahap ? displayTahapLabel(log.dariTahap) : "—"}
                        <i className="material-symbols-outlined !text-[11px]">arrow_right_alt</i>
                        {log.keTahap ? displayTahapLabel(log.keTahap) : "Selesai"}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {log.dilakukanOleh?.namaLengkap ?? "Sistem"}
                    </span>
                    {" · "}
                    <span title={dayjs(log.createdAt).format("DD MMMM YYYY, HH:mm")}>
                      {dayjs(log.createdAt).fromNow()}
                    </span>
                    {" · "}
                    {dayjs(log.createdAt).format("DD/MM/YYYY HH:mm")}
                  </p>

                  {log.catatan ? (
                    <div className="mt-2 border-l-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#15203c] pl-3 pr-3 py-2 rounded-r-md">
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
                        &ldquo;{log.catatan}&rdquo;
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-3 py-8 text-gray-400">
          <i className="material-symbols-outlined !text-[28px]">timeline</i>
          <p className="text-sm">Belum ada aktivitas tercatat.</p>
        </div>
      )}
    </div>
  );
}
