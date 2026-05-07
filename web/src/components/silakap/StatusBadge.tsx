import type { StatusUsulan } from "@/types/models";
import { displayStatusLabel } from "@/lib/display-labels";

const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700 dark:bg-[#ffffff14] dark:text-gray-300",
  Diajukan: "bg-primary-50 text-primary-700 dark:bg-[#ffffff14]",
  VerifikasiAP: "bg-indigo-100 text-indigo-700 dark:bg-[#ffffff14]",
  VerifikasiAM: "bg-violet-100 text-violet-700 dark:bg-[#ffffff14]",
  QualityControl: "bg-purple-100 text-purple-700 dark:bg-[#ffffff14]",
  ApprovalKabid: "bg-orange-100 text-orange-700 dark:bg-[#ffffff14]",
  ApprovalKepalaBadan: "bg-warning-100 text-warning-700 dark:bg-[#ffffff14]",
  Selesai: "bg-success-100 text-success-700 dark:bg-[#ffffff14]",
  Dikembalikan: "bg-warning-100 text-warning-700 dark:bg-[#ffffff14]",
  Ditolak: "bg-danger-100 text-danger-700 dark:bg-[#ffffff14]",
  Diarsipkan: "bg-gray-200 text-gray-500 dark:bg-[#ffffff14]",
};

interface StatusBadgeProps {
  status: StatusUsulan | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {displayStatusLabel(status)}
    </span>
  );
}
