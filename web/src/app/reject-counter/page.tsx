"use client";

import Link from "next/link";
import StatCard from "@/components/silakap/StatCard";
import { useDashboardRingkasan } from "@/hooks/useDashboard";
import { useLayananList } from "@/hooks/useLayanan";

export default function RejectCounterPage() {
  const ringkasan = useDashboardRingkasan();
  const dikembalikan = useLayananList({ status: "Dikembalikan", limit: 10 });
  const ditolak = useLayananList({ status: "Ditolak", limit: 10 });

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">Reject Counter</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Pantau pengembalian dan penolakan berkas layanan
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
        <StatCard label="Dikembalikan" value={ringkasan.data?.totalDikembalikan ?? 0} icon="assignment_return" color="yellow" />
        <StatCard label="Ditolak" value={ringkasan.data?.totalBatal ?? 0} icon="block" color="red" />
        <StatCard label="Total Koreksi" value={(ringkasan.data?.totalDikembalikan ?? 0) + (ringkasan.data?.totalBatal ?? 0)} icon="fact_check" color="blue" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-[25px]">
        <CounterList title="Terakhir Dikembalikan" data={dikembalikan.data?.data ?? []} />
        <CounterList title="Terakhir Ditolak" data={ditolak.data?.data ?? []} />
      </div>
    </div>
  );
}

function CounterList({
  title,
  data,
}: {
  title: string;
  data: { id: string; nomorUsulan: string; asn?: { nama: string }; alasanPenolakan: string | null }[];
}) {
  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
      <h5>{title}</h5>
      <div className="space-y-3">
        {data.length ? data.map((item) => (
          <Link
            href={`/layanan/${item.id}`}
            className="block rounded-md border border-gray-100 dark:border-[#172036] px-4 py-3 hover:border-primary-500"
            key={item.id}
          >
            <span className="block font-semibold">{item.nomorUsulan}</span>
            <span className="block text-sm text-gray-500">{item.asn?.nama ?? "-"} • {item.alasanPenolakan ?? "Tanpa catatan"}</span>
          </Link>
        )) : <p className="text-gray-500">Belum ada data.</p>}
      </div>
    </div>
  );
}
