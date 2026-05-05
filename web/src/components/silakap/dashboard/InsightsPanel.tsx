import type { InsightRiskItem, InsightsSummary } from "@/hooks/useInsights";

interface InsightsPanelProps {
  data: InsightsSummary | undefined;
}

type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

const RISK_BADGE_CLASSES: Record<RiskLevel, string> = {
  HIGH: "bg-danger-100 text-danger-700 dark:bg-[#ffffff14] dark:text-danger-400",
  MEDIUM: "bg-warning-100 text-warning-700 dark:bg-[#ffffff14] dark:text-warning-400",
  LOW: "bg-gray-100 text-gray-600 dark:bg-[#ffffff14] dark:text-gray-400",
};

const RISK_DOT_CLASSES: Record<RiskLevel, string> = {
  HIGH: "bg-danger-500",
  MEDIUM: "bg-warning-500",
  LOW: "bg-gray-400",
};

function RiskBadge({ risk }: { risk: RiskLevel }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${RISK_BADGE_CLASSES[risk]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${RISK_DOT_CLASSES[risk]}`} />
      {risk}
    </span>
  );
}

function RiskRow({ item }: { item: InsightRiskItem }) {
  const isOverdue = (item.remainingDays ?? 1) <= 0;

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors">
      <td className="px-4 py-3 border-b border-gray-100 dark:border-[#172036] text-sm font-medium text-black dark:text-white whitespace-nowrap">
        {item.nomorUsulan}
      </td>
      <td className="px-4 py-3 border-b border-gray-100 dark:border-[#172036]">
        <p className="text-sm font-medium text-black dark:text-white leading-tight">
          {item.namaAsn}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
          {item.nip}
        </p>
      </td>
      <td className="px-4 py-3 border-b border-gray-100 dark:border-[#172036] text-sm text-gray-600 dark:text-gray-400">
        {item.layanan}
      </td>
      <td className="px-4 py-3 border-b border-gray-100 dark:border-[#172036] whitespace-nowrap">
        {item.remainingDays !== null ? (
          <span
            className={
              isOverdue
                ? "text-sm font-semibold text-danger-600 dark:text-danger-400"
                : "text-sm text-gray-600 dark:text-gray-400"
            }
          >
            {isOverdue ? "Terlampaui" : `${item.remainingDays} hari`}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        )}
      </td>
      <td className="px-4 py-3 border-b border-gray-100 dark:border-[#172036]">
        <RiskBadge risk={item.risk as RiskLevel} />
      </td>
    </tr>
  );
}

export default function InsightsPanel({ data }: InsightsPanelProps) {
  const atRiskItems = (data?.riskItems ?? []).filter((r) => r.risk !== "LOW");

  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
      <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 dark:bg-[#ffffff14] flex items-center justify-center shrink-0">
          <i className="material-symbols-outlined !text-[22px]">psychology</i>
        </div>
        <div>
          <h5 className="!mb-0">AI Insights</h5>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Analisis risiko SLA berbasis kecerdasan buatan
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[25px] mb-[25px]">
        <div>
          <p className="text-sm font-semibold text-black dark:text-white mb-3">
            Ringkasan Risiko
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-danger-50 dark:bg-[#15203c] border border-danger-100 dark:border-transparent">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-danger-500 shrink-0" />
                <span className="text-sm font-medium text-danger-700 dark:text-danger-400">
                  High Risk
                </span>
              </div>
              <span className="text-2xl font-bold text-danger-600 dark:text-danger-400">
                {data?.totalHighRisk ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-warning-50 dark:bg-[#15203c] border border-warning-100 dark:border-transparent">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-warning-500 shrink-0" />
                <span className="text-sm font-medium text-warning-700 dark:text-warning-400">
                  Medium Risk
                </span>
              </div>
              <span className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                {data?.totalMediumRisk ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-black dark:text-white mb-3">
            Rekomendasi Sistem
          </p>
          <div className="space-y-2">
            {data?.recommendations.length ? (
              data.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-[#15203c]"
                >
                  <i className="material-symbols-outlined !text-[17px] text-primary-500 mt-0.5 shrink-0">
                    info
                  </i>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {rec}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic">
                Tidak ada rekomendasi saat ini.
              </p>
            )}
          </div>
        </div>
      </div>

      {atRiskItems.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-black dark:text-white">
              Usulan Berisiko
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {atRiskItems.length} usulan terdeteksi
            </span>
          </div>
          <div className="table-responsive overflow-x-auto rounded-lg border border-gray-100 dark:border-[#172036]">
            <table className="w-full">
              <thead>
                <tr>
                  {["No. Usulan", "ASN", "Jenis Layanan", "Sisa SLA", "Risiko"].map(
                    (col, i, arr) => (
                      <th
                        key={col}
                        className={`font-medium text-left px-4 py-2.5 bg-gray-50 dark:bg-[#15203c] text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap ${
                          i === 0 ? "rounded-tl-lg" : ""
                        } ${i === arr.length - 1 ? "rounded-tr-lg" : ""}`}
                      >
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {atRiskItems.slice(0, 5).map((item) => (
                  <RiskRow key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {atRiskItems.length === 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-success-50 dark:bg-[#15203c] border border-success-100 dark:border-transparent">
          <i className="material-symbols-outlined !text-[24px] text-success-600">
            check_circle
          </i>
          <p className="text-sm text-success-700 dark:text-success-400 font-medium">
            Tidak ada usulan berisiko. Semua layanan berjalan sesuai SLA.
          </p>
        </div>
      )}
    </div>
  );
}
