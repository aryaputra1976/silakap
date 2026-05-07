"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import type { SlaTracker } from "@/types/models";
import { displayTahapLabel } from "@/lib/display-labels";

interface SlaCountdownProps {
  slaTracker: SlaTracker[];
}

const formatRemaining = (target: string, now: number, overdue: boolean) => {
  const diffHours = Math.abs(dayjs(target).diff(dayjs(now), "hour"));
  const days = Math.floor(diffHours / 24);
  const hours = diffHours % 24;

  if (overdue) {
    return `Terlambat ${Math.max(diffHours, 1)} jam`;
  }

  if (days > 0) {
    return `Sisa ${days} hari ${hours} jam`;
  }

  return `Sisa ${Math.max(diffHours, 1)} jam`;
};

export default function SlaCountdown({ slaTracker }: SlaCountdownProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(interval);
  }, []);

  const activeTracker = useMemo(
    () => slaTracker.find((tracker) => tracker.selesaiAt === null),
    [slaTracker],
  );

  if (!activeTracker) {
    return null;
  }

  const overdue =
    activeTracker.statusSla === "Overdue" ||
    dayjs(activeTracker.slaHabisAt).isBefore(dayjs(now));
  const color =
    activeTracker.statusSla === "Overdue"
      ? "text-danger-500 bg-danger-50 border-danger-200"
      : activeTracker.statusSla === "Warning"
        ? "text-warning-700 bg-warning-50 border-warning-200"
        : "text-success-700 bg-success-50 border-success-200";

  return (
    <div className={`rounded-md border px-4 py-3 ${color}`}>
      <div className="flex items-center gap-2">
        <i className="material-symbols-outlined !text-[20px]">timer</i>
        <span className="font-semibold">
          {formatRemaining(activeTracker.slaHabisAt, now, overdue)}
        </span>
      </div>
      <p className="mt-1 text-sm">
        Tahap {displayTahapLabel(activeTracker.tahapSaat)} berakhir{" "}
        {dayjs(activeTracker.slaHabisAt).format("DD/MM/YYYY HH:mm")}
      </p>
    </div>
  );
}
