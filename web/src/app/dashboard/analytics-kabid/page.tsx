"use client";

import {
  useBottleneck,
  useRankingOpd,
  useSlaTrend,
  useThroughput,
} from "@/hooks/useDashboard";

const toNumber = (value: number | string | null | undefined) => Number(value ?? 0);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(value));

export default function AnalyticsKabidPage() {
  const slaTrend = useSlaTrend(14);
  const throughput = useThroughput(30);
  const bottleneck = useBottleneck();
  const ranking = useRankingOpd(10);
  const maxThroughput = Math.max(1, ...(throughput.data ?? []).map((item) => toNumber(item.masuk) + toNumber(item.selesai)));
  const maxRanking = Math.max(1, ...(ranking.data ?? []).map((item) => toNumber(item.totalUsulan)));

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">Analytics Kabid</h1>
        <p className="text-gray-500 dark:text-gray-400">Trend SLA, throughput, bottleneck tahapan, dan ranking OPD</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-[25px]">
        <section className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
          <h5 className="!mb-4">SLA Trend 14 Hari</h5>
          <div className="table-responsive overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {["Tanggal", "Status", "Total"].map((heading) => (
                    <th key={heading} className="font-medium text-left px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c]">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(slaTrend.data ?? []).map((item) => (
                  <tr key={`${item.tanggal}-${item.statusSla}`}>
                    <td className="px-[20px] py-[14px] border-b border-gray-100 dark:border-[#172036]">{formatDate(item.tanggal)}</td>
                    <td className="px-[20px] py-[14px] border-b border-gray-100 dark:border-[#172036]">{item.statusSla}</td>
                    <td className="px-[20px] py-[14px] border-b border-gray-100 dark:border-[#172036] font-semibold">{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!slaTrend.data?.length ? <Empty /> : null}
        </section>

        <section className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
          <h5 className="!mb-4">Throughput 30 Hari</h5>
          <div className="space-y-4">
            {(throughput.data ?? []).map((item) => {
              const total = toNumber(item.masuk) + toNumber(item.selesai);
              return (
                <div key={item.tanggal}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{formatDate(item.tanggal)}</span>
                    <span className="text-gray-500">Masuk {item.masuk} / Selesai {item.selesai}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-[#172036]">
                    <div className="h-full rounded-full bg-primary-500" style={{ width: `${Math.max(6, (total / maxThroughput) * 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          {!throughput.data?.length ? <Empty /> : null}
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-[25px]">
        <section className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
          <h5 className="!mb-4">Bottleneck Tahapan</h5>
          <div className="space-y-4">
            {(bottleneck.data ?? []).map((item) => (
              <div key={item.tahap} className="rounded-md border border-gray-100 dark:border-[#172036] p-4">
                <div className="flex items-center justify-between gap-3">
                  <strong>{item.tahap}</strong>
                  <span className="text-primary-500 font-semibold">{item.total} berkas</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">Rata-rata menunggu {Math.round(toNumber(item.rataJamMenunggu))} jam</p>
              </div>
            ))}
          </div>
          {!bottleneck.data?.length ? <Empty /> : null}
        </section>

        <section className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
          <h5 className="!mb-4">Ranking OPD</h5>
          <div className="space-y-4">
            {(ranking.data ?? []).map((item) => {
              const total = toNumber(item.totalUsulan);
              return (
                <div key={item.unitOrganisasiId}>
                  <div className="mb-2 flex items-start justify-between gap-3 text-sm">
                    <span className="font-medium">{item.unitOrganisasi}</span>
                    <span className="shrink-0 text-gray-500">{total} usulan</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-[#172036]">
                    <div className="h-full rounded-full bg-success-500" style={{ width: `${Math.max(6, (total / maxRanking) * 100)}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Selesai {item.totalSelesai} | Dikembalikan {item.totalDikembalikan} | Overdue {item.totalOverdue}
                  </p>
                </div>
              );
            })}
          </div>
          {!ranking.data?.length ? <Empty /> : null}
        </section>
      </div>
    </div>
  );
}

function Empty() {
  return <p className="mt-4 text-sm text-gray-500">Belum ada data untuk periode ini.</p>;
}
