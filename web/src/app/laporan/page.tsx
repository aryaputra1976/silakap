"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  useGenerateLaporan,
  useLaporanBulananList,
  useLaporanHarianList,
} from "@/hooks/useLaporan";
import { useAuthStore } from "@/store/auth.store";

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

export default function LaporanPage() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<"harian" | "bulanan">("harian");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [tahun, setTahun] = useState("");
  const [bulan, setBulan] = useState("");
  const [pageHarian, setPageHarian] = useState(1);
  const [pageBulanan, setPageBulanan] = useState(1);
  const canGenerate =
    user?.roleNama === "Kabid" || user?.roleNama === "Admin_Sistem";
  const generate = useGenerateLaporan();
  const harianParams = useMemo(
    () => ({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, page: pageHarian, limit: 10 }),
    [dateFrom, dateTo, pageHarian],
  );
  const bulananParams = useMemo(
    () => ({ tahun: tahun || undefined, bulan: bulan || undefined, page: pageBulanan, limit: 10 }),
    [bulan, pageBulanan, tahun],
  );
  const harian = useLaporanHarianList(harianParams);
  const bulanan = useLaporanBulananList(bulananParams);

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">Laporan</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Rekap layanan harian dan bulanan
        </p>
      </div>

      <div className="flex gap-2">
        <button
          className={`px-4 py-2 rounded-md border ${activeTab === "harian" ? "bg-primary-500 text-white border-primary-500" : "bg-white dark:bg-[#0c1427] border-gray-100 dark:border-[#172036]"}`}
          type="button"
          onClick={() => setActiveTab("harian")}
        >
          Laporan Harian
        </button>
        <button
          className={`px-4 py-2 rounded-md border ${activeTab === "bulanan" ? "bg-primary-500 text-white border-primary-500" : "bg-white dark:bg-[#0c1427] border-gray-100 dark:border-[#172036]"}`}
          type="button"
          onClick={() => setActiveTab("bulanan")}
        >
          Laporan Bulanan
        </button>
      </div>

      {activeTab === "harian" ? (
        <div className="space-y-[20px]">
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="flex flex-col md:flex-row gap-3">
                <input type="date" className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPageHarian(1); }} />
                <input type="date" className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPageHarian(1); }} />
              </div>
              {canGenerate ? (
                <button className="py-[10px] px-[20px] bg-primary-500 text-white rounded-md disabled:opacity-70" type="button" disabled={generate.generateHarian.isPending} onClick={() => generate.generateHarian.mutate()}>
                  Generate Laporan Hari Ini
                </button>
              ) : null}
            </div>
          </div>
          {harian.isError ? <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">Gagal memuat data</div> : null}
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            {harian.isLoading ? <div className="animate-pulse rounded-md bg-gray-200 dark:bg-[#172036] h-48" /> : (
              <>
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
                {!harian.data?.data.length ? <div className="text-center py-[35px]">Belum ada laporan harian</div> : null}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-[20px]">
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="flex flex-col md:flex-row gap-3">
                <select className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={tahun} onChange={(event) => { setTahun(event.target.value); setPageBulanan(1); }}><option value="">Semua Tahun</option>{[2023, 2024, 2025, 2026].map((value) => <option key={value} value={value}>{value}</option>)}</select>
                <select className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={bulan} onChange={(event) => { setBulan(event.target.value); setPageBulanan(1); }}><option value="">Semua Bulan</option>{monthNames.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}</select>
              </div>
              {canGenerate ? (
                <button className="py-[10px] px-[20px] bg-primary-500 text-white rounded-md disabled:opacity-70" type="button" disabled={generate.generateBulanan.isPending} onClick={() => generate.generateBulanan.mutate()}>
                  Generate Laporan Bulan Ini
                </button>
              ) : null}
            </div>
          </div>
          {bulanan.isError ? <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">Gagal memuat data</div> : null}
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            {bulanan.isLoading ? <div className="animate-pulse rounded-md bg-gray-200 dark:bg-[#172036] h-48" /> : (
              <>
                <div className="table-responsive overflow-x-auto">
                  <table className="w-full">
                    <thead><tr>{["Tahun", "Bulan", "Masuk", "Selesai", "Dikembalikan", "Batal", "Melampaui SLA", "Rata² Hari", "Aksi"].map((heading) => <th className="font-medium text-left px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c]" key={heading}>{heading}</th>)}</tr></thead>
                    <tbody>{(bulanan.data?.data ?? []).map((item) => <tr key={item.id}><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.tahun}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{monthNames[item.bulan - 1]}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.totalMasuk}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.totalSelesai}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.totalDikembalikan}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.totalBatal}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.totalMelampauiSla}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.rataRataHariPenyelesaian ?? "-"}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]"><Link className="text-primary-500" href={`/laporan/bulanan/${item.id}`}>Lihat</Link></td></tr>)}</tbody>
                  </table>
                </div>
                {!bulanan.data?.data.length ? <div className="text-center py-[35px]">Belum ada laporan bulanan</div> : null}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
