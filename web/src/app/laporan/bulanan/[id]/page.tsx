"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useGenerateLaporan, useLaporanBulananList } from "@/hooks/useLaporan";
import { useAuthStore } from "@/store/auth.store";

const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default function LaporanBulananPage() {
  const user = useAuthStore((state) => state.user);
  const [tahun, setTahun] = useState("");
  const [bulan, setBulan] = useState("");
  const canGenerate = user?.roleNama === "Kabid" || user?.roleNama === "Admin_Sistem";
  const generate = useGenerateLaporan();
  const params = useMemo(() => ({ tahun: tahun || undefined, bulan: bulan || undefined, limit: 20 }), [bulan, tahun]);
  const bulanan = useLaporanBulananList(params);

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">Laporan Bulanan</h1>
        <p className="text-gray-500 dark:text-gray-400">Rekap capaian layanan per bulan</p>
      </div>
      <div className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036]">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-col md:flex-row gap-3">
            <select className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={tahun} onChange={(event) => setTahun(event.target.value)}>
              <option value="">Semua Tahun</option>
              {[2024, 2025, 2026].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            <select className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={bulan} onChange={(event) => setBulan(event.target.value)}>
              <option value="">Semua Bulan</option>
              {monthNames.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
            </select>
          </div>
          {canGenerate ? (
            <button className="py-[10px] px-[20px] bg-primary-500 text-white rounded-md disabled:opacity-70" type="button" disabled={generate.generateBulanan.isPending} onClick={() => generate.generateBulanan.mutate()}>
              Generate Bulan Ini
            </button>
          ) : null}
        </div>
      </div>
      <div className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036]">
        <div className="table-responsive overflow-x-auto">
          <table className="w-full">
            <thead><tr>{["Tahun", "Bulan", "Selesai", "Capaian SLA", "Overdue", "Aksi"].map((heading) => <th className="font-medium text-left px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c]" key={heading}>{heading}</th>)}</tr></thead>
            <tbody>
              {(bulanan.data?.data ?? []).map((item) => (
                <tr key={item.id}>
                  <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.tahun}</td>
                  <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{monthNames[item.bulan - 1]}</td>
                  <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.totalLayananSelesai ?? item.totalSelesai ?? 0}</td>
                  <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.capaiSlaPercent ?? "-"}</td>
                  <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.melampauiSlaCount ?? item.totalMelampauiSla ?? 0}</td>
                  <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]"><Link className="text-primary-500" href={`/laporan/bulanan/${item.id}`}>Lihat</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!bulanan.data?.data.length ? <div className="text-center py-[35px] text-gray-500">Belum ada laporan bulanan.</div> : null}
      </div>
    </div>
  );
}
