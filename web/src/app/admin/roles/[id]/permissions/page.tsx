"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Toast from "@/components/silakap/Toast";
import { useRoleActions, useRolePermissions } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/useToast";
import type { Permission } from "@/types/models";

export default function RolePermissionsPage() {
  const params = useParams<{ id: string }>();
  const query = useRolePermissions(params.id);
  const actions = useRoleActions();
  const { toast, showToast, hideToast } = useToast();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (query.data) {
      setChecked(new Set(query.data.permissions.map((permission) => permission.id)));
    }
  }, [query.data]);

  const grouped = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    (query.data?.permissions ?? []).forEach((permission) => {
      const prefix = permission.nama.split(":")[0] || "lainnya";
      groups[prefix] = [...(groups[prefix] ?? []), permission];
    });
    return groups;
  }, [query.data?.permissions]);

  const save = () => {
    const permissionIds = Array.from(checked)
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id));
    actions.setPermissions.mutate(
      { id: params.id, permissionIds },
      { onSuccess: () => showToast("Permissions berhasil disimpan", "success") },
    );
  };

  return (
    <div className="space-y-[25px]">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-gray-500 dark:text-gray-400">Roles / Edit Permissions</p><h1 className="!mb-0">Permissions — {query.data?.nama ?? ""}</h1></div><Link href="/admin/roles" className="py-[10px] px-[20px] border border-gray-200 dark:border-[#172036] rounded-md">← Kembali</Link></div>
      {query.isLoading ? <div className="animate-pulse rounded-xl bg-gray-200 dark:bg-[#172036] h-72" /> : query.isError || !query.data ? <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">Gagal memuat data</div> : <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md space-y-5">{Object.entries(grouped).map(([group, permissions]) => <div key={group}><h5 className="capitalize">{group}</h5><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">{permissions.map((permission) => <label key={permission.id} className="rounded-md border border-gray-100 dark:border-[#172036] p-3 flex items-start gap-3"><input type="checkbox" checked={checked.has(permission.id)} onChange={(event) => setChecked((current) => { const next = new Set(current); if (event.target.checked) next.add(permission.id); else next.delete(permission.id); return next; })} /><span><span className="block font-medium text-black dark:text-white">{permission.nama}</span><span className="text-sm text-gray-500">{permission.deskripsi ?? "-"}</span></span></label>)}</div></div>)}<button type="button" className="py-[10px] px-[20px] bg-primary-500 text-white rounded-md" onClick={save} disabled={actions.setPermissions.isPending}>Simpan</button></div>}
      {toast.visible ? <Toast message={toast.message} type={toast.type} onClose={hideToast} /> : null}
    </div>
  );
}
