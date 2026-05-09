"use client";

import { FormEvent, useState } from "react";
import { useConfigLaporanOtomatis, useConfigLaporanOtomatisActions } from "@/hooks/useAdmin";
import { displayRoleLabel } from "@/lib/display-labels";

const roles = ["Kabid", "Kepala_Badan", "Admin_Sistem"];

export default function LaporanOtomatisPage() {
  const config = useConfigLaporanOtomatis();
  const actions = useConfigLaporanOtomatisActions();
  const [form, setForm] = useState({ jenisLaporan: "Harian", jadwalPengiriman: "0 7 * * *", formatLaporan: "PDF", penerimaRole: "Kabid", isActive: true });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    actions.upsert.mutate(form);
  };

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">Laporan Otomatis</h1>
        <p className="text-gray-500 dark:text-gray-400">Konfigurasi jadwal pengiriman laporan berkala</p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[25px]">
        <form className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036] space-y-3" onSubmit={submit}>
          <h5>Tambah Jadwal</h5>
          <select className="h-[45px] w-full rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={form.jenisLaporan} onChange={(event) => setForm((current) => ({ ...current, jenisLaporan: event.target.value }))}>
            <option>Harian</option>
            <option>Bulanan</option>
          </select>
          <input className="h-[45px] w-full rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={form.jadwalPengiriman} onChange={(event) => setForm((current) => ({ ...current, jadwalPengiriman: event.target.value }))} />
          <select className="h-[45px] w-full rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={form.formatLaporan} onChange={(event) => setForm((current) => ({ ...current, formatLaporan: event.target.value }))}>
            <option>PDF</option>
            <option>Excel</option>
          </select>
          <select className="h-[45px] w-full rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={form.penerimaRole} onChange={(event) => setForm((current) => ({ ...current, penerimaRole: event.target.value }))}>
            {roles.map((item) => <option key={item} value={item}>{displayRoleLabel(item)}</option>)}
          </select>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} /> Aktif</label>
          <button type="submit" className="w-full py-[10px] px-[20px] bg-primary-500 text-white rounded-md">Simpan</button>
        </form>
        <div className="xl:col-span-2 bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036]">
          <h5>Jadwal Aktif</h5>
          <div className="table-responsive overflow-x-auto">
            <table className="w-full">
              <thead><tr>{["Jenis", "Jadwal", "Format", "Penerima", "Status", "Terakhir Kirim"].map((heading) => <th className="font-medium text-left px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c]" key={heading}>{heading}</th>)}</tr></thead>
              <tbody>
                {(config.data ?? []).map((item) => (
                  <tr key={item.id}>
                    <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.jenisLaporan ?? "-"}</td>
                    <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.jadwalPengiriman ?? "-"}</td>
                    <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.formatLaporan ?? "-"}</td>
                    <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{displayRoleLabel(item.penerimaRole)}</td>
                    <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.isActive ? "Aktif" : "Nonaktif"}</td>
                    <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.lastSent ? new Date(item.lastSent).toLocaleString("id-ID") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
