import type { StatusUsulan } from "@/types/models";
import { displayStatusLabel } from "@/lib/display-labels";

const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  Draft:               { badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",              dot: "bg-gray-400" },
  Diajukan:            { badge: "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300", dot: "bg-primary-500" },
  VerifikasiAP:        { badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",    dot: "bg-indigo-500" },
  VerifikasiAM:        { badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",    dot: "bg-violet-500" },
  QualityControl:      { badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",    dot: "bg-purple-500" },
  ApprovalKabid:       { badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",    dot: "bg-orange-500" },
  ApprovalKepalaBadan: { badge: "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300",dot: "bg-warning-500" },
  Selesai:             { badge: "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300",dot: "bg-success-500" },
  Dikembalikan:        { badge: "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300",dot: "bg-warning-400" },
  Ditolak:             { badge: "bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300",    dot: "bg-danger-500" },
  Diarsipkan:          { badge: "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400",               dot: "bg-gray-400" },
};

const PULSE_STATUSES = new Set(["Diajukan", "VerifikasiAP", "VerifikasiAM", "QualityControl", "ApprovalKabid", "ApprovalKepalaBadan"]);

interface StatusBadgeProps {
  status: StatusUsulan | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const s = STATUS_STYLES[status] ?? { badge: "bg-gray-100 text-gray-700", dot: "bg-gray-400" };
  const isPulsing = PULSE_STATUSES.has(status);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.badge}`}>
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        {isPulsing && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${s.dot}`} />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${s.dot}`} />
      </span>
      {displayStatusLabel(status)}
    </span>
  );
}
