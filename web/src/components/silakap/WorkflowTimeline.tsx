"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import type { WorkflowLog } from "@/types/models";
import {
  displayTahapLabel,
  displayWorkflowActionLabel,
} from "@/lib/display-labels";

dayjs.extend(relativeTime);
dayjs.locale("id");

interface WorkflowTimelineProps {
  logs: WorkflowLog[];
}

const ACTION_ICONS: Record<string, string> = {
  SUBMIT: "upload",
  TERIMA: "check",
  TERUSKAN: "arrow_right_alt",
  KEMBALIKAN: "keyboard_return",
  SETUJUI: "verified",
  BATAL: "cancel",
  RESUBMIT: "refresh",
};

export default function WorkflowTimeline({ logs }: WorkflowTimelineProps) {
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
      <div className="trezo-card-header mb-[20px] md:mb-[25px]">
        <h5 className="!mb-0">Timeline Workflow</h5>
      </div>
      <div className="trezo-card-content">
        {sortedLogs.length > 0 ? (
          <div className="space-y-0">
            {sortedLogs.map((log, index) => (
              <div className="relative flex gap-4 pb-6 last:pb-0" key={log.id}>
                {index < sortedLogs.length - 1 ? (
                  <span className="absolute left-[18px] top-10 bottom-0 w-px bg-gray-100 dark:bg-[#172036]" />
                ) : null}
                <div className="relative z-[1] w-9 h-9 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center shrink-0">
                  <i className="material-symbols-outlined !text-[20px]">
                    {ACTION_ICONS[log.aksi] ?? "radio_button_checked"}
                  </i>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h6 className="!mb-0">{displayWorkflowActionLabel(log.aksi)}</h6>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {dayjs(log.createdAt).fromNow()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {log.dilakukanOleh?.namaLengkap ?? "Sistem"}
                    {log.dariTahap || log.keTahap
                      ? `: ${displayTahapLabel(log.dariTahap)} -> ${displayTahapLabel(log.keTahap)}`
                      : ""}
                  </p>
                  {log.catatan ? (
                    <p className="mt-2 rounded-md bg-gray-50 dark:bg-[#15203c] px-3 py-2 text-sm">
                      {log.catatan}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Belum ada log workflow.</p>
        )}
      </div>
    </div>
  );
}
