"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  useRefUnitAdmin,
  useRoleList,
  useUserActions,
  useUserList,
} from "@/hooks/useAdmin";
import type { UserAdmin } from "@/types/models";

interface UserForm {
  id: string;
  username: string;
  namaLengkap: string;
  email: string;
  nomorHp: string;
  roleId: string;
  unitOrganisasiId: string;
  asnId: string;
  password: string;
  isActive: boolean;
}

const emptyForm: UserForm = {
  id: "",
  username: "",
  namaLengkap: "",
  email: "",
  nomorHp: "",
  roleId: "",
  unitOrganisasiId: "",
  asnId: "",
  password: "",
  isActive: true,
};

const toPayload = (form: UserForm, mode: "create" | "edit") => {
  const payload: Record<string, unknown> = {
    username: form.username,
    namaLengkap: form.namaLengkap,
    email: form.email,
    nomorHp: form.nomorHp || null,
    roleId: form.roleId,
    unitOrganisasiId: form.unitOrganisasiId || null,
    asnId: form.asnId || null,
    isActive: form.isActive,
  };
  if (mode === "create") payload.password = form.password;
  return payload;
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleId, setRoleId] = useState("");
  const [isActive, setIsActive] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [newPassword, setNewPassword] = useState("");
  const roles = useRoleList();
  const units = useRefUnitAdmin();
  const actions = useUserActions();
  const params = useMemo(
    () => ({
      search: search || undefined,
      roleId: roleId || undefined,
      isActive: isActive === "" ? undefined : isActive === "true",
      page,
      limit: 10,
    }),
    [isActive, page, roleId, search],
  );
  const users = useUserList(params);

  const openCreate = () => {
    setModalMode("create");
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (user: UserAdmin) => {
    setModalMode("edit");
    setForm({
      id: user.id,
      username: user.username,
      namaLengkap: user.namaLengkap,
      email: user.email ?? "",
      nomorHp: user.nomorHp ?? "",
      roleId: user.roleId,
      unitOrganisasiId: user.unitOrganisasiId ?? "",
      asnId: user.asnId ?? "",
      password: "",
      isActive: user.isActive,
    });
    setModalOpen(true);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = toPayload(form, modalMode);
    const onSuccess = () => setModalOpen(false);
    if (modalMode === "create") {
      actions.create.mutate(payload, { onSuccess });
    } else {
      actions.update.mutate({ id: form.id, body: payload }, { onSuccess });
    }
  };

  const resetPassword = (id: string) => {
    if (!window.confirm("Reset password user ini?")) return;
    actions.resetPassword.mutate(id, {
      onSuccess: (response) => setNewPassword(response.data.data.newPassword),
    });
  };

  return (
    <div className="space-y-[25px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="!mb-1">Manajemen Pengguna</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Kelola akses pengguna SILAKAP
          </p>
        </div>
        <button
          type="button"
          className="py-[10px] px-[20px] bg-primary-500 text-white rounded-md"
          onClick={openCreate}
        >
          + Tambah User
        </button>
      </div>
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" placeholder="Cari nama/username" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
          <select className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={roleId} onChange={(event) => { setRoleId(event.target.value); setPage(1); }}><option value="">Semua Role</option>{(roles.data ?? []).map((role) => <option key={role.id} value={role.id}>{role.nama}</option>)}</select>
          <select className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={isActive} onChange={(event) => { setIsActive(event.target.value); setPage(1); }}><option value="">Semua Status</option><option value="true">Aktif</option><option value="false">Nonaktif</option></select>
        </div>
      </div>
      {users.isError ? <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">Gagal memuat data</div> : null}
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        {users.isLoading ? <div className="animate-pulse rounded-md bg-gray-200 dark:bg-[#172036] h-48" /> : (
          <>
            <div className="table-responsive overflow-x-auto">
              <table className="w-full"><thead><tr>{["Username", "Nama", "Role", "Unit", "Status", "Last Login", "Aksi"].map((heading) => <th className="font-medium text-left px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c]" key={heading}>{heading}</th>)}</tr></thead><tbody>{(users.data?.data ?? []).map((user) => <tr key={user.id}><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] font-medium">{user.username}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{user.namaLengkap}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{user.roleNama}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{user.unitOrganisasi?.nama ?? "-"}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${user.isActive ? "bg-success-100 text-success-700" : "bg-danger-100 text-danger-700"}`}>{user.isActive ? "Aktif" : "Nonaktif"}</span></td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{user.lastLogin ? new Date(user.lastLogin).toLocaleString("id-ID") : "-"}</td><td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]"><div className="flex flex-wrap gap-2"><Link className="text-primary-500" href={`/admin/users/${user.id}`}>Lihat</Link><button className="text-warning-700" type="button" onClick={() => openEdit(user)}>Edit</button><button className="text-purple-500" type="button" onClick={() => resetPassword(user.id)}>Reset</button>{!user.isActive ? <button className="text-success-600" type="button" onClick={() => actions.unlock.mutate(user.id)}>Aktifkan</button> : null}<button className="text-danger-500" type="button" onClick={() => window.confirm("Hapus user ini?") && actions.remove.mutate(user.id)}>Hapus</button></div></td></tr>)}</tbody></table>
            </div>
            {!users.data?.data.length ? <div className="text-center py-[35px]">Belum ada pengguna</div> : null}
            {users.data?.meta.totalPages ? <div className="flex justify-end gap-2 mt-[20px]">{Array.from({ length: users.data.meta.totalPages }).map((_, index) => <button key={index} type="button" className={`w-9 h-9 rounded-md border ${page === index + 1 ? "bg-primary-500 text-white border-primary-500" : "border-gray-200 dark:border-[#172036]"}`} onClick={() => setPage(index + 1)}>{index + 1}</button>)}</div> : null}
          </>
        )}
      </div>
      {modalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form className="bg-white dark:bg-[#0c1427] rounded-md p-[25px] w-full max-w-[720px] space-y-4" onSubmit={submit}><h5>{modalMode === "create" ? "Tambah User" : "Edit User"}</h5><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><input required pattern="[a-z0-9_]+" className="h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427]" placeholder="username" value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value.toLowerCase() }))} /><input required className="h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427]" placeholder="Nama lengkap" value={form.namaLengkap} onChange={(event) => setForm((current) => ({ ...current, namaLengkap: event.target.value }))} /><input required type="email" className="h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427]" placeholder="Email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /><input className="h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427]" placeholder="Nomor HP" value={form.nomorHp} onChange={(event) => setForm((current) => ({ ...current, nomorHp: event.target.value }))} /><select required className="h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427]" value={form.roleId} onChange={(event) => setForm((current) => ({ ...current, roleId: event.target.value }))}><option value="">Pilih Role</option>{(roles.data ?? []).map((role) => <option key={role.id} value={role.id}>{role.nama}</option>)}</select><select className="h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427]" value={form.unitOrganisasiId} onChange={(event) => setForm((current) => ({ ...current, unitOrganisasiId: event.target.value }))}><option value="">Pilih Unit</option>{(units.data ?? []).map((unit) => <option key={unit.id} value={unit.id}>{unit.nama}</option>)}</select><input className="h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427]" placeholder="ASN ID" value={form.asnId} onChange={(event) => setForm((current) => ({ ...current, asnId: event.target.value }))} />{modalMode === "create" ? <input required minLength={8} pattern="(?=.*[A-Z])(?=.*\\d).{8,}" className="h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427]" placeholder="Password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} /> : null}<label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} /> Aktif</label></div><div className="flex justify-end gap-3"><button type="button" className="px-5 py-2 rounded-md border" onClick={() => setModalOpen(false)}>Batal</button><button type="submit" className="px-5 py-2 rounded-md bg-primary-500 text-white">Simpan</button></div></form>
        </div>
      ) : null}
      {newPassword ? <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"><div className="bg-white dark:bg-[#0c1427] rounded-md p-[25px] max-w-[420px] w-full"><h5>Password Baru</h5><p className="select-all font-mono bg-gray-50 dark:bg-[#15203c] p-3 rounded-md">{newPassword}</p><button type="button" className="mt-4 px-5 py-2 bg-primary-500 text-white rounded-md" onClick={() => setNewPassword("")}>Tutup</button></div></div> : null}
    </div>
  );
}
