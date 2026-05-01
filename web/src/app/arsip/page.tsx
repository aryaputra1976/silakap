"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useArsipList } from "@/hooks/useArsip";

const textValue = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value) : "-";

export default function ArsipPage() {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const params = useMemo(
    () => ({
      search: search || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      limit: 10,
    }),
    [dateFrom, dateTo, page, search],
  );
  const list = useArsipList(params);

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">Arsip Usulan</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Daftar usulan layanan yang telah diarsipkan
        </p>
      </div>
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" placeholder="Cari nomor usulan / nama ASN" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
          <input type="date" className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(1); }} />
          <input type="date" className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(1); }} />
        </div>
      </div>
      {list.isError ? <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">Gagal memuat data</div> : null}
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        {list.isLoading ? <div className="animate-pulse rounded-md bg-gray-200 dark:bg-[#172036] h-48" /> : list.data?.data.length ? (
          <>
            <div className="table-responsive overflow-x-auto">
              <table className="w-full">
                <thead><tr>{["Nomor Usulan", "ASN", "Jenis Layanan", "Status", "Diarsipkan Oleh", "Tanggal Arsip", "Aksi"].map((heading) => <th className="font-medium text-left px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c]" key={heading}>{heading}</th>)}</tr></thead>
                <tbody>{list.data.data.map((item) => <tr key={item.id}><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.usulanLayanan?.nomorUsulan ?? textValue(item.dataSnapshot.nomorUsulan)}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{textValue(item.dataSnapshot.asnNama)}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{textValue(item.dataSnapshot.jenisLayanan)}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.usulanLayanan?.status ?? textValue(item.dataSnapshot.status)}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.diarsipkanOleh?.namaLengkap ?? "-"}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{new Date(item.createdAt).toLocaleDateString("id-ID")}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]"><Link className="text-primary-500" href={`/arsip/${item.id}`}>Lihat</Link></td></tr>)}</tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2 mt-[20px]">{Array.from({ length: list.data.meta.totalPages }).map((_, index) => <button key={index} type="button" className={`w-9 h-9 rounded-md border ${page === index + 1 ? "bg-primary-500 text-white border-primary-500" : "border-gray-200 dark:border-[#172036]"}`} onClick={() => setPage(index + 1)}>{index + 1}</button>)}</div>
          </>
        ) : <div className="text-center py-[35px]">Belum ada arsip</div>}
      </div>
    </div>
  );
}
