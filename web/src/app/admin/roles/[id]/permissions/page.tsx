"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import ConfirmModal from "@/components/silakap/ConfirmModal";
import { useRoleActions, useRoleList } from "@/hooks/useAdmin";
import type { Role } from "@/types/models";

interface RoleForm {
  id: string;
  nama: string;
  deskripsi: string;
  isActive: boolean;
}

const emptyForm: RoleForm = { id: "", nama: "", deskripsi: "", isActive: true };

export default function AdminRolesPage() {
  const roles = useRoleList();
  const actions = useRoleActions();
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<RoleForm>(emptyForm);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);

  const openCreate = () => {
    setMode("create");
    setForm(emptyForm);
    setModalOpen(true);
  };
  const openEdit = (role: Role) => {
    setMode("edit");
    setForm({
      id: role.id,
      nama: role.nama,
      deskripsi: role.deskripsi ?? "",
      isActive: role.isActive,
    });
    setModalOpen(true);
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = {
      nama: form.nama,
      deskripsi: form.deskripsi || null,
      isActive: form.isActive,
    };
    const onSuccess = () => setModalOpen(false);
    if (mode === "create") {
      actions.create.mutate({ nama: form.nama, deskripsi: form.deskripsi || undefined }, { onSuccess });
    } else {
      actions.update.mutate({ id: form.id, body }, { onSuccess });
    }
  };

  return (
    <div className="space-y-[25px]">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="!mb-1">Manajemen Role</h1><p className="text-gray-500 dark:text-gray-400">Kelola role dan hak akses</p></div><button type="button" className="py-[10px] px-[20px] bg-primary-500 text-white rounded-md" onClick={openCreate}>+ Tambah Role</button></div>
      {roles.isError ? <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">Gagal memuat data</div> : null}
      <div className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036]">
        {roles.isLoading ? <div className="animate-pulse rounded-md bg-gray-200 dark:bg-[#172036] h-48" /> : <div className="table-responsive overflow-x-auto"><table className="w-full"><thead><tr>{["Nama Role", "Deskripsi", "Status", "Aksi"].map((heading) => <th className="font-medium text-left px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c]" key={heading}>{heading}</th>)}</tr></thead><tbody>{(roles.data ?? []).map((role) => <tr key={role.id}><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] font-medium">{role.nama}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{role.deskripsi ?? "-"}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${role.isActive ? "bg-success-100 text-success-700" : "bg-danger-100 text-danger-700"}`}>{role.isActive ? "Aktif" : "Nonaktif"}</span></td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]"><div className="flex flex-wrap gap-2"><button type="button" className="text-warning-700" onClick={() => openEdit(role)}>Edit</button><button type="button" className="text-danger-500" onClick={() => setDeleteRole(role)}>Hapus</button><Link className="text-primary-500" href={`/admin/roles/${role.id}/permissions`}>Kelola Permissions</Link></div></td></tr>)}</tbody></table></div>}
      </div>
      {modalOpen ? <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"><form className="bg-white dark:bg-[#0c1427] rounded-md p-[25px] w-full max-w-[520px] space-y-4" onSubmit={submit}><h5>{mode === "create" ? "Tambah Role" : "Edit Role"}</h5><input required className="h-[45px] rounded-md border px-[14px] w-full bg-white dark:bg-[#0c1427]" placeholder="Nama role" value={form.nama} onChange={(event) => setForm((current) => ({ ...current, nama: event.target.value }))} /><textarea className="min-h-[90px] rounded-md border px-[14px] py-3 w-full bg-white dark:bg-[#0c1427]" placeholder="Deskripsi" value={form.deskripsi} onChange={(event) => setForm((current) => ({ ...current, deskripsi: event.target.value }))} /><label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} /> Aktif</label><div className="flex justify-end gap-3"><button type="button" className="px-5 py-2 rounded-md border" onClick={() => setModalOpen(false)}>Batal</button><button type="submit" className="px-5 py-2 rounded-md bg-primary-500 text-white">Simpan</button></div></form></div> : null}
      <ConfirmModal
        isOpen={Boolean(deleteRole)}
        title="Hapus Role"
        description={`Hapus role ${deleteRole?.nama ?? "ini"}? Pastikan tidak ada pengguna yang masih bergantung pada role ini.`}
        onClose={() => setDeleteRole(null)}
        onConfirm={() => {
          if (!deleteRole) return;
          actions.remove.mutate(deleteRole.id, {
            onSuccess: () => setDeleteRole(null),
          });
        }}
        showTextarea={false}
        confirmLabel="Hapus"
        confirmColor="red"
        loading={actions.remove.isPending}
      />
    </div>
  );
}
