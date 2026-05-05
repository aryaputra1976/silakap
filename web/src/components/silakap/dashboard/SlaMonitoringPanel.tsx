interface SlaSummary {
  total: number;
  overdue: number;
  selesai: number;
}

interface SlaMonitoringPanelProps {
  sla: SlaSummary | undefined;
}

export default function SlaMonitoringPanel({ sla }: SlaMonitoringPanelProps) {
  const total = sla?.total ?? 0;
  const overdue = sla?.overdue ?? 0;
  const selesai = sla?.selesai ?? 0;

  const overduePercent = total > 0 ? Math.round((overdue / total) * 100) : 0;
  const selesaiPercent = total > 0 ? Math.round((selesai / total) * 100) : 0;
  const ontimePercent = Math.max(0, 100 - overduePercent - selesaiPercent);

  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md h-full flex flex-col">
      <div className="trezo-card-header mb-[20px] md:mb-[25px]">
        <h5 className="!mb-0">SLA Monitoring</h5>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Status kepatuhan waktu layanan
        </p>
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#15203c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-500 dark:bg-[#ffffff14] flex items-center justify-center shrink-0">
              <i className="material-symbols-outlined !text-[20px]">assignment</i>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-none mb-1">
                Total SLA Aktif
              </p>
              <p className="text-2xl font-bold text-black dark:text-white leading-none">
                {total}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border bg-danger-50 border-danger-100 dark:bg-[#15203c] dark:border-[#2a1a1a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-danger-100 text-danger-500 flex items-center justify-center shrink-0">
              <i className="material-symbols-outlined !text-[20px]">timer_off</i>
            </div>
            <div>
              <p className="text-xs text-danger-600 dark:text-danger-400 leading-none mb-1">
                Overdue
              </p>
              <p className="text-2xl font-bold text-danger-600 dark:text-danger-400 leading-none">
                {overdue}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-danger-600 bg-danger-100 dark:bg-danger-900/40 dark:text-danger-400 px-2.5 py-1 rounded-full">
            {overduePercent}%
          </span>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border bg-success-50 border-success-100 dark:bg-[#15203c] dark:border-[#1a2a1a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success-100 text-success-600 flex items-center justify-center shrink-0">
              <i className="material-symbols-outlined !text-[20px]">task_alt</i>
            </div>
            <div>
              <p className="text-xs text-success-600 leading-none mb-1">Selesai</p>
              <p className="text-2xl font-bold text-success-600 leading-none">
                {selesai}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-success-600 bg-success-100 dark:bg-success-900/40 px-2.5 py-1 rounded-full">
            {selesaiPercent}%
          </span>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#15203c]">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2.5">
            Distribusi SLA
          </p>
          <div className="w-full h-2.5 bg-gray-200 dark:bg-[#1d2c4d] rounded-full overflow-hidden flex">
            {total > 0 && (
              <>
                <div
                  className="h-full bg-success-500 transition-all duration-500"
                  style={{ width: `${selesaiPercent}%` }}
                />
                <div
                  className="h-full bg-primary-400 transition-all duration-500"
                  style={{ width: `${ontimePercent}%` }}
                />
                <div
                  className="h-full bg-danger-500 transition-all duration-500"
                  style={{ width: `${overduePercent}%` }}
                />
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <span className="w-2 h-2 rounded-full bg-success-500 inline-block shrink-0" />
              Selesai
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <span className="w-2 h-2 rounded-full bg-primary-400 inline-block shrink-0" />
              On-time
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <span className="w-2 h-2 rounded-full bg-danger-500 inline-block shrink-0" />
              Overdue
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
