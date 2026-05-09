"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useGenerateLaporan, useLaporanHarianList } from "@/hooks/useLaporan";
import { useAuthStore } from "@/store/auth.store";

export default function LaporanHarianPage() {
  const user = useAuthStore((state) => state.user);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const canGenerate = user?.roleNama === "Kabid" || user?.roleNama === "Admin_Sistem";
  const generate = useGenerateLaporan();
  const params = useMemo(() => ({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, limit: 20 }), [dateFrom, dateTo]);
  const harian = useLaporanHarianList(params);

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">Laporan Harian</h1>
        <p className="text-gray-500 dark:text-gray-400">Rekap layanan per tanggal</p>
      </div>
      <div className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036]">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-col md:flex-row gap-3">
            <input type="date" className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
            <input type="date" className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          </div>
          {canGenerate ? (
            <button className="py-[10px] px-[20px] bg-primary-500 text-white rounded-md disabled:opacity-70" type="button" disabled={generate.generateHarian.isPending} onClick={() => generate.generateHarian.mutate()}>
              Generate Hari Ini
            </button>
          ) : null}
        </div>
      </div>
      <div className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036]">
        <div className="table-responsive overflow-x-auto">
          <table className="w-full">
            <thead><tr>{["Tanggal", "Masuk", "Selesai", "Dikembalikan", "Melampaui SLA", "Aksi"].map((heading) => <th className="font-medium text-left px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c]" key={heading}>{heading}</th>)}</tr></thead>
            <tbody>
              {(harian.data?.data ?? []).map((item) => (
                <tr key={item.id}>
                  <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{new Date(item.tanggalLaporan).toLocaleDateString("id-ID")}</td>
                  <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.usulanMasuk}</td>
                  <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.usulanSelesai}</td>
                  <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.usulanDikembalikan}</td>
                  <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.melampauiSla}</td>
                  <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]"><Link className="text-primary-500" href={`/laporan/harian/${item.id}`}>Lihat</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!harian.data?.data.length ? <div className="text-center py-[35px] text-gray-500">Belum ada laporan harian.</div> : null}
      </div>
    </div>
  );
}
