"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useLaporanHarianDetail } from "@/hooks/useLaporan";

const Field = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-md bg-gray-50 dark:bg-[#15203c] p-4">
    <span className="block text-sm text-gray-500 dark:text-gray-400">
      {label}
    </span>
    <span className="text-lg font-semibold text-black dark:text-white">
      {value}
    </span>
  </div>
);

export default function LaporanHarianDetailPage() {
  const params = useParams<{ id: string }>();
  const query = useLaporanHarianDetail(params.id);
  const item = query.data;

  return (
    <div className="space-y-[25px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Laporan / Harian
          </p>
          <h1 className="!mb-0">Detail Laporan Harian</h1>
        </div>
        <Link href="/laporan" className="py-[10px] px-[20px] border border-gray-200 dark:border-[#172036] rounded-md">
          ← Kembali
        </Link>
      </div>
      {query.isLoading ? (
        <div className="animate-pulse rounded-xl bg-gray-200 dark:bg-[#172036] h-72" />
      ) : query.isError || !item ? (
        <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">
          Gagal memuat data
        </div>
      ) : (
        <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[20px]">
            <Field label="Tanggal Laporan" value={new Date(item.tanggalLaporan).toLocaleDateString("id-ID")} />
            <Field label="Usulan Masuk" value={item.usulanMasuk} />
            <Field label="Usulan Selesai" value={item.usulanSelesai} />
            <Field label="Usulan Dikembalikan" value={item.usulanDikembalikan} />
            <Field label="Melampaui SLA" value={item.melampauiSla} />
            <Field label="Dibuat Pada" value={new Date(item.createdAt).toLocaleString("id-ID")} />
          </div>
        </div>
      )}
    </div>
  );
}
