"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { downloadAuditExport, useAuditList } from "@/hooks/useAudit";
import { useAuthStore } from "@/store/auth.store";

const entityTypes = ["User", "Asn", "UsulanLayanan", "PerencanaanPensiun", "ArsipUsulan"];

export default function AuditPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [entityType, setEntityType] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => { if (user?.roleNama && user.roleNama !== "Admin_Sistem") router.replace("/"); }, [router, user]);
  const params = useMemo(() => ({ search: search || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, entityType: entityType || undefined, page, limit: 20 }), [dateFrom, dateTo, entityType, page, search]);
  const list = useAuditList(params);

  return (
    <div className="space-y-[25px]">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="!mb-1">Audit Log</h1><p className="text-gray-500 dark:text-gray-400">Jejak aktivitas sistem</p></div><button type="button" className="py-[10px] px-[20px] bg-primary-500 text-white rounded-md" onClick={() => void downloadAuditExport(params)}>Export Excel</button></div>
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md"><div className="grid grid-cols-1 md:grid-cols-4 gap-3"><input className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" placeholder="Cari user/action/entity" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /><input type="date" className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(1); }} /><input type="date" className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(1); }} /><select className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={entityType} onChange={(event) => { setEntityType(event.target.value); setPage(1); }}><option value="">Semua Entity</option>{entityTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select></div></div>
      {list.isError ? <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">Gagal memuat data</div> : null}
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        {list.isLoading ? <div className="animate-pulse rounded-md bg-gray-200 dark:bg-[#172036] h-48" /> : (
          <>
            <div className="table-responsive overflow-x-auto"><table className="w-full"><thead><tr>{["Waktu", "User", "Aksi", "Entity Type", "Entity ID", "IP Address", "Detail"].map((heading) => <th className="font-medium text-left px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c]" key={heading}>{heading}</th>)}</tr></thead><tbody>{(list.data?.data ?? []).map((item) => <tr key={item.id}><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{new Date(item.createdAt).toLocaleString("id-ID")}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.userNama ?? "-"}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.action}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.entityType ?? "-"}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.entityId ?? "-"}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.ipAddress ?? "-"}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]"><Link className="text-primary-500" href={`/audit/${item.id}`}>Lihat</Link></td></tr>)}</tbody></table></div>
            {!list.data?.data.length ? <div className="text-center py-[35px]">Tidak ada audit log</div> : null}
            {list.data?.meta.totalPages ? <div className="flex justify-end gap-2 mt-[20px]">{Array.from({ length: list.data.meta.totalPages }).map((_, index) => <button key={index} type="button" className={`w-9 h-9 rounded-md border ${page === index + 1 ? "bg-primary-500 text-white border-primary-500" : "border-gray-200 dark:border-[#172036]"}`} onClick={() => setPage(index + 1)}>{index + 1}</button>)}</div> : null}
          </>
        )}
      </div>
    </div>
  );
}
