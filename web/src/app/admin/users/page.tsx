"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import ConfirmModal from "@/components/silakap/ConfirmModal";
import {
  useRefUnitAdmin,
  useRoleList,
  useUserActions,
  useUserList,
} from "@/hooks/useAdmin";
import { displayRoleLabel } from "@/lib/display-labels";
import { getVisiblePages } from "@/lib/pagination";
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

type PendingConfirm =
  | { type: "reset"; id: string; name: string }
  | { type: "delete"; id: string; name: string }
  | null;

const TD = "px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]";
const INPUT_CLS = "h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px] w-full";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleId, setRoleId] = useState("");
  const [isActive, setIsActive] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [newPassword, setNewPassword] = useState("");
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null);

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

  const totalPages = users.data?.meta.totalPages ?? 1;
  const visiblePages = getVisiblePages(page, totalPages);

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

  const confirmAction = () => {
    if (!pendingConfirm) return;
    if (pendingConfirm.type === "reset") {
      actions.resetPassword.mutate(pendingConfirm.id, {
        onSuccess: (response) => {
          setNewPassword(response.data.data.newPassword);
          setPendingConfirm(null);
        },
      });
      return;
    }
    actions.remove.mutate(pendingConfirm.id, {
      onSuccess: () => setPendingConfirm(null),
    });
  };

  const setField = <K extends keyof UserForm>(key: K, value: UserForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-[25px]">
      {/* ── Header ── */}
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

      {/* ── Filter ── */}
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            suppressHydrationWarning
            className={INPUT_CLS}
            placeholder="Cari nama / username"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <select
            className={INPUT_CLS}
            value={roleId}
            onChange={(e) => { setRoleId(e.target.value); setPage(1); }}
          >
            <option value="">Semua Role</option>
            {(roles.data ?? []).map((role) => (
              <option key={role.id} value={role.id}>
                {displayRoleLabel(role.nama)}
              </option>
            ))}
          </select>
          <select
            className={INPUT_CLS}
            value={isActive}
            onChange={(e) => { setIsActive(e.target.value); setPage(1); }}
          >
            <option value="">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>
      </div>

      {users.isError ? (
        <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">
          Gagal memuat data
        </div>
      ) : null}

      {/* ── Table ── */}
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        {users.isLoading ? (
          <div className="animate-pulse rounded-md bg-gray-200 dark:bg-[#172036] h-48" />
        ) : (
          <>
            <div className="table-responsive overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {["Username", "Nama", "Role", "Unit", "Status", "Last Login", "Aksi"].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="font-medium text-left px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c] whitespace-nowrap"
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(users.data?.data ?? []).map((user) => (
                    <tr key={user.id}>
                      <td className={`${TD} font-medium`}>{user.username}</td>
                      <td className={TD}>{user.namaLengkap}</td>
                      <td className={TD}>{displayRoleLabel(user.roleNama)}</td>
                      <td className={TD}>{user.unitOrganisasi?.nama ?? "-"}</td>
                      <td className={TD}>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                            user.isActive
                              ? "bg-success-100 text-success-700"
                              : "bg-danger-100 text-danger-700"
                          }`}
                        >
                          {user.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className={`${TD} whitespace-nowrap`}>
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString("id-ID")
                          : "-"}
                      </td>
                      <td className={TD}>
                        <div className="flex flex-wrap gap-2 items-center">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="text-primary-500 hover:underline"
                          >
                            Lihat
                          </Link>
                          <button
                            type="button"
                            className="text-warning-700 hover:underline"
                            onClick={() => openEdit(user)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-purple-500 hover:underline"
                            onClick={() =>
                              setPendingConfirm({
                                type: "reset",
                                id: user.id,
                                name: user.namaLengkap,
                              })
                            }
                          >
                            Reset
                          </button>
                          {!user.isActive ? (
                            <button
                              type="button"
                              className="text-success-600 hover:underline"
                              onClick={() => actions.unlock.mutate(user.id)}
                            >
                              Aktifkan
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="text-danger-500 hover:underline"
                            onClick={() =>
                              setPendingConfirm({
                                type: "delete",
                                id: user.id,
                                name: user.namaLengkap,
                              })
                            }
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!users.data?.data.length ? (
              <div className="text-center py-[35px] text-gray-500">
                Belum ada pengguna
              </div>
            ) : null}

            {/* ── Smart Pagination ── */}
            {totalPages > 1 ? (
              <div className="flex items-center justify-end gap-1 mt-[20px]">
                {visiblePages.map((item, idx) =>
                  item === "ellipsis" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-9 h-9 flex items-center justify-center text-gray-400 select-none"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      className={`w-9 h-9 rounded-md border text-sm ${
                        page === item
                          ? "bg-primary-500 text-white border-primary-500"
                          : "border-gray-200 dark:border-[#172036] hover:border-primary-300"
                      }`}
                      onClick={() => setPage(item)}
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {modalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            className="bg-white dark:bg-[#0c1427] rounded-md p-[25px] w-full max-w-[720px] space-y-4 max-h-[90vh] overflow-y-auto"
            onSubmit={submit}
          >
            <h5>{modalMode === "create" ? "Tambah User" : "Edit User"}</h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                required
                pattern="[a-z0-9._]+"
                className={INPUT_CLS}
                placeholder="Username"
                value={form.username}
                onChange={(e) => setField("username", e.target.value.toLowerCase())}
              />
              <input
                required
                className={INPUT_CLS}
                placeholder="Nama lengkap"
                value={form.namaLengkap}
                onChange={(e) => setField("namaLengkap", e.target.value)}
              />
              <input
                required
                type="email"
                className={INPUT_CLS}
                placeholder="Email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
              />
              <input
                className={INPUT_CLS}
                placeholder="Nomor HP"
                value={form.nomorHp}
                onChange={(e) => setField("nomorHp", e.target.value)}
              />
              <select
                required
                className={INPUT_CLS}
                value={form.roleId}
                onChange={(e) => setField("roleId", e.target.value)}
              >
                <option value="">Pilih Role</option>
                {(roles.data ?? []).map((role) => (
                  <option key={role.id} value={role.id}>
                    {displayRoleLabel(role.nama)}
                  </option>
                ))}
              </select>
              <select
                className={INPUT_CLS}
                value={form.unitOrganisasiId}
                onChange={(e) => setField("unitOrganisasiId", e.target.value)}
              >
                <option value="">Pilih Unit Organisasi</option>
                {(units.data ?? []).map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.nama}
                  </option>
                ))}
              </select>
              <input
                className={INPUT_CLS}
                placeholder="ASN ID (opsional)"
                value={form.asnId}
                onChange={(e) => setField("asnId", e.target.value)}
              />
              {modalMode === "create" ? (
                <input
                  required
                  type="password"
                  className={INPUT_CLS}
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                />
              ) : null}
              <label className="flex items-center gap-2 cursor-pointer md:col-span-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setField("isActive", e.target.checked)}
                />
                <span>Aktif</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-5 py-2 rounded-md border border-gray-200 dark:border-[#172036]"
                onClick={() => setModalOpen(false)}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-md bg-primary-500 text-white disabled:opacity-60"
                disabled={actions.create.isPending || actions.update.isPending}
              >
                {actions.create.isPending || actions.update.isPending
                  ? "Menyimpan..."
                  : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* ── New Password Modal ── */}
      {newPassword ? (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1427] rounded-md p-[25px] max-w-[420px] w-full space-y-4">
            <h5>Password Baru</h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sampaikan password ini secara aman kepada pengguna. Password tidak
              akan ditampilkan kembali.
            </p>
            <p className="select-all font-mono text-sm bg-gray-50 dark:bg-[#15203c] p-3 rounded-md break-all">
              {newPassword}
            </p>
            <button
              type="button"
              className="w-full px-5 py-2 bg-primary-500 text-white rounded-md"
              onClick={() => setNewPassword("")}
            >
              Tutup
            </button>
          </div>
        </div>
      ) : null}

      {/* ── Confirm Modal (Reset / Delete) ── */}
      <ConfirmModal
        isOpen={Boolean(pendingConfirm)}
        title={pendingConfirm?.type === "reset" ? "Reset Password" : "Hapus Pengguna"}
        description={
          pendingConfirm?.type === "reset"
            ? `Reset password untuk ${pendingConfirm?.name ?? ""}? Password baru akan dibuat otomatis dan perlu disampaikan secara aman.`
            : `Hapus pengguna ${pendingConfirm?.name ?? "ini"}? Aksi ini tidak dapat dibatalkan.`
        }
        onClose={() => setPendingConfirm(null)}
        onConfirm={confirmAction}
        showTextarea={false}
        confirmLabel={pendingConfirm?.type === "reset" ? "Reset Password" : "Hapus"}
        confirmColor={pendingConfirm?.type === "reset" ? "yellow" : "red"}
        loading={actions.resetPassword.isPending || actions.remove.isPending}
      />
    </div>
  );
}
