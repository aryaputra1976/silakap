"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useLaporanBulananDetail } from "@/hooks/useLaporan";

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

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

export default function LaporanBulananDetailPage() {
  const params = useParams<{ id: string }>();
  const query = useLaporanBulananDetail(params.id);
  const item = query.data;

  return (
    <div className="space-y-[25px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Laporan / Bulanan
          </p>
          <h1 className="!mb-0">Detail Laporan Bulanan</h1>
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
            <Field label="Tahun" value={item.tahun} />
            <Field label="Bulan" value={monthNames[item.bulan - 1] ?? item.bulan} />
            <Field label="Total Masuk" value={item.totalMasuk} />
            <Field label="Total Selesai" value={item.totalSelesai} />
            <Field label="Total Dikembalikan" value={item.totalDikembalikan} />
            <Field label="Total Batal" value={item.totalBatal} />
            <Field label="Melampaui SLA" value={item.totalMelampauiSla} />
            <Field label="Rata-rata Hari" value={item.rataRataHariPenyelesaian ?? "-"} />
            <Field label="Dibuat Pada" value={new Date(item.createdAt).toLocaleString("id-ID")} />
          </div>
        </div>
      )}
    </div>
  );
}
