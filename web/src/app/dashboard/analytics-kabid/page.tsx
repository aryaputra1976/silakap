"use client";

import {
  useBottleneck,
  useRankingOpd,
  useSlaTrend,
  useThroughput,
} from "@/hooks/useDashboard";
import { displayTahapLabel } from "@/lib/display-labels";

const toNum = (v: number | string | null | undefined) => Number(v ?? 0);

const fmtDate = (v: string) =>
  new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(v));

const SLA_COLOR: Record<string, string> = {
  OK:      "bg-success-500",
  Warning: "bg-warning-500",
  Overdue: "bg-danger-500",
};
const SLA_LABEL_CLS: Record<string, string> = {
  OK:      "bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400",
  Warning: "bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400",
  Overdue: "bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400",
};

function Card({ title, children, loading }: { title: string; children: React.ReactNode; loading?: boolean }) {
  return (
    <section className="bg-white dark:bg-[#0c1427] rounded-xl border border-gray-100 dark:border-[#172036] p-5">
      <h5 className="!mb-4">{title}</h5>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 dark:bg-[#172036] rounded animate-pulse" />
          ))}
        </div>
      ) : children}
    </section>
  );
}

function Empty() {
  return (
    <div className="py-8 text-center">
      <i className="material-symbols-outlined !text-[28px] text-gray-300 dark:text-gray-600">bar_chart</i>
      <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">Belum ada data untuk periode ini</p>
    </div>
  );
}

export default function AnalyticsKabidPage() {
  const slaTrend  = useSlaTrend(14);
  const throughput = useThroughput(30);
  const bottleneck = useBottleneck();
  const ranking   = useRankingOpd(10);

  const maxThroughput = Math.max(1, ...(throughput.data ?? []).map((d) => toNum(d.masuk) + toNum(d.selesai)));
  const maxRanking    = Math.max(1, ...(ranking.data ?? []).map((d) => toNum(d.totalUsulan)));

  type SlaDay = { tanggal: string; OK?: number; Warning?: number; Overdue?: number };
  // Group SLA trend by date → [{tanggal, OK, Warning, Overdue}]
  const slaTrendGrouped: SlaDay[] = (() => {
    const map: Record<string, Omit<SlaDay, "tanggal">> = {};
    for (const item of slaTrend.data ?? []) {
      if (!map[item.tanggal]) map[item.tanggal] = {};
      (map[item.tanggal] as Record<string, number>)[item.statusSla] = Number(item.total);
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([tanggal, counts]) => ({ tanggal, ...counts }));
  })();

  const maxSla = Math.max(1, ...slaTrendGrouped.map((d) => (d.OK ?? 0) + (d.Warning ?? 0) + (d.Overdue ?? 0)));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="!mb-0.5">Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Trend SLA, throughput, bottleneck tahapan, dan ranking OPD
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* SLA Trend */}
        <Card title="SLA Trend — 14 hari terakhir" loading={slaTrend.isLoading}>
          {slaTrendGrouped.length ? (
            <div className="space-y-2.5">
              {slaTrendGrouped.map((d) => {
                const total = (d.OK ?? 0) + (d.Warning ?? 0) + (d.Overdue ?? 0);
                return (
                  <div key={d.tanggal}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium w-14 shrink-0">
                        {fmtDate(d.tanggal)}
                      </span>
                      <div className="flex items-center gap-1.5 flex-1 mx-3">
                        {/* Stacked bar */}
                        <div className="flex-1 h-3 bg-gray-100 dark:bg-[#172036] rounded-full overflow-hidden flex">
                          {(["OK", "Warning", "Overdue"] as const).map((s) =>
                            (d[s] ?? 0) > 0 ? (
                              <div
                                key={s}
                                className={`h-full ${SLA_COLOR[s]}`}
                                style={{ width: `${((d[s] ?? 0) / maxSla) * 100}%` }}
                              />
                            ) : null,
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 w-8 text-right shrink-0">
                        {total}
                      </span>
                    </div>
                    {/* Mini badges */}
                    <div className="flex gap-1.5 ml-14 pl-3">
                      {(["OK", "Warning", "Overdue"] as const).map((s) =>
                        (d[s] ?? 0) > 0 ? (
                          <span key={s} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${SLA_LABEL_CLS[s]}`}>
                            {s} {d[s]}
                          </span>
                        ) : null,
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <Empty />}
        </Card>

        {/* Throughput */}
        <Card title="Throughput — 30 hari terakhir" loading={throughput.isLoading}>
          {throughput.data?.length ? (
            <div className="space-y-3">
              {throughput.data.map((item) => {
                const masuk   = toNum(item.masuk);
                const selesai = toNum(item.selesai);
                const total   = masuk + selesai;
                return (
                  <div key={item.tanggal}>
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300 w-14 shrink-0">
                        {fmtDate(item.tanggal)}
                      </span>
                      <div className="flex-1 h-3 bg-gray-100 dark:bg-[#172036] rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-primary-500"
                          style={{ width: `${Math.max(4, (masuk / maxThroughput) * 100)}%` }}
                        />
                        <div
                          className="h-full bg-success-400"
                          style={{ width: `${Math.max(4, (selesai / maxThroughput) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-500 w-8 text-right shrink-0">{total}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 ml-14">
                      <span className="text-primary-500 font-medium">{masuk} masuk</span>
                      {" · "}
                      <span className="text-success-600 font-medium">{selesai} selesai</span>
                    </p>
                  </div>
                );
              })}
              {/* Legend */}
              <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100 dark:border-[#172036]">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded-sm bg-primary-500 inline-block" /> Masuk
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded-sm bg-success-400 inline-block" /> Selesai
                </span>
              </div>
            </div>
          ) : <Empty />}
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Bottleneck */}
        <Card title="Bottleneck tahapan" loading={bottleneck.isLoading}>
          {bottleneck.data?.length ? (
            <div className="space-y-3">
              {bottleneck.data
                .sort((a, b) => toNum(b.rataJamMenunggu) - toNum(a.rataJamMenunggu))
                .map((item) => {
                  const jam = Math.round(toNum(item.rataJamMenunggu));
                  const isCritical = jam > 48;
                  return (
                    <div
                      key={item.tahap}
                      className={`flex items-center justify-between gap-4 rounded-lg border px-4 py-3 ${
                        isCritical
                          ? "border-danger-200 bg-danger-50 dark:border-danger-800/40 dark:bg-danger-900/10"
                          : "border-gray-100 dark:border-[#172036]"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-black dark:text-white">
                          {displayTahapLabel(item.tahap)}
                        </p>
                        <p className={`text-xs mt-0.5 ${isCritical ? "text-danger-600 dark:text-danger-400" : "text-gray-500 dark:text-gray-400"}`}>
                          Rata-rata menunggu {jam} jam
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-xl font-bold ${isCritical ? "text-danger-500" : "text-primary-500"}`}>
                          {item.total}
                        </p>
                        <p className="text-[11px] text-gray-400">berkas</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : <Empty />}
        </Card>

        {/* Ranking OPD */}
        <Card title="Ranking OPD — 10 teratas" loading={ranking.isLoading}>
          {ranking.data?.length ? (
            <div className="space-y-3">
              {ranking.data.map((item, idx) => {
                const total = toNum(item.totalUsulan);
                return (
                  <div key={item.unitOrganisasiId}>
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-gray-400 w-4 shrink-0">{idx + 1}</span>
                        <span className="text-sm font-medium text-black dark:text-white truncate">
                          {item.unitOrganisasi}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200 shrink-0">
                        {total}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-[#172036] rounded-full overflow-hidden ml-6">
                      <div
                        className="h-full rounded-full bg-primary-500"
                        style={{ width: `${Math.max(4, (total / maxRanking) * 100)}%` }}
                      />
                    </div>
                    <div className="flex gap-3 mt-1 ml-6">
                      <span className="text-[10px] text-success-600 dark:text-success-400">
                        ✓ {item.totalSelesai} selesai
                      </span>
                      <span className="text-[10px] text-warning-600 dark:text-warning-400">
                        ↩ {item.totalDikembalikan} dikembalikan
                      </span>
                      {toNum(item.totalOverdue) > 0 && (
                        <span className="text-[10px] text-danger-500">
                          ⚠ {item.totalOverdue} overdue
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <Empty />}
        </Card>
      </div>
    </div>
  );
}
