"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuditDetail } from "@/hooks/useAudit";
import { useAuthStore } from "@/store/auth.store";

export default function AuditDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const query = useAuditDetail(params.id);
  const item = query.data;
  useEffect(() => { if (user?.roleNama && user.roleNama !== "Admin_Sistem") router.replace("/"); }, [router, user]);

  return (
    <div className="space-y-[25px]">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-gray-500 dark:text-gray-400">Audit / Detail</p><h1 className="!mb-0">Detail Audit Log</h1></div><Link href="/audit" className="py-[10px] px-[20px] border border-gray-200 dark:border-[#172036] rounded-md">← Kembali</Link></div>
      {query.isLoading ? <div className="animate-pulse rounded-xl bg-gray-200 dark:bg-[#172036] h-72" /> : query.isError || !item ? <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">Gagal memuat data</div> : (
        <>
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md"><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[20px]"><p><span className="block text-gray-500">User</span><strong>{item.userNama ?? "-"} ({item.userId ?? "-"})</strong></p><p><span className="block text-gray-500">Aksi</span><strong>{item.action}</strong></p><p><span className="block text-gray-500">Entity</span><strong>{item.entityType ?? "-"} / {item.entityId ?? "-"}</strong></p><p><span className="block text-gray-500">IP Address</span><strong>{item.ipAddress ?? "-"}</strong></p><p><span className="block text-gray-500">Waktu</span><strong>{new Date(item.createdAt).toLocaleString("id-ID")}</strong></p></div></div>
          {item.newValues ? <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md"><h5>Data Baru</h5><pre className="bg-gray-50 dark:bg-[#15203c] rounded-md p-4 overflow-x-auto text-sm">{JSON.stringify(item.newValues, null, 2)}</pre></div> : null}
          {item.oldValues ? <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md"><h5>Data Lama</h5><pre className="bg-gray-50 dark:bg-[#15203c] rounded-md p-4 overflow-x-auto text-sm">{JSON.stringify(item.oldValues, null, 2)}</pre></div> : null}
        </>
      )}
    </div>
  );
}
