interface SlaBarProps {
  ok: number;
  warning: number;
  overdue: number;
}

const toPercent = (value: number, total: number) =>
  total > 0 ? `${Math.max((value / total) * 100, value > 0 ? 6 : 0)}%` : "0%";

export default function SlaBar({ ok, warning, overdue }: SlaBarProps) {
  const total = ok + warning + overdue;

  return (
    <div className="bg-white dark:bg-[#0c1427] shadow-sm rounded-xl p-6 border border-gray-100 dark:border-[#172036]">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h5 className="!mb-1">Status SLA</h5>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            OK, Warning, dan Overdue
          </p>
        </div>
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          {total} usulan
        </span>
      </div>

      <div className="h-4 w-full rounded-full bg-gray-100 dark:bg-[#172036] overflow-hidden flex">
        <div
          className="h-full bg-success-500"
          style={{ width: toPercent(ok, total) }}
        />
        <div
          className="h-full bg-warning-500"
          style={{ width: toPercent(warning, total) }}
        />
        <div
          className="h-full bg-danger-500"
          style={{ width: toPercent(overdue, total) }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3 mt-5">
        <div>
          <span className="block text-xs text-gray-500 dark:text-gray-400">
            OK
          </span>
          <span className="font-semibold text-success-600">{ok}</span>
        </div>
        <div>
          <span className="block text-xs text-gray-500 dark:text-gray-400">
            Warning
          </span>
          <span className="font-semibold text-warning-600">{warning}</span>
        </div>
        <div>
          <span className="block text-xs text-gray-500 dark:text-gray-400">
            Overdue
          </span>
          <span className="font-semibold text-danger-500">{overdue}</span>
        </div>
      </div>
    </div>
  );
}
