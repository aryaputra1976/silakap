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
  id: "", username: "", namaLengkap: "", email: "",
  nomorHp: "", roleId: "", unitOrganisasiId: "", asnId: "",
  password: "", isActive: true,
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

const INPUT_CLS =
  "h-9 rounded-lg border border-gray-200 dark:border-[#172036] bg-gray-50 dark:bg-[#15203c] px-3 text-sm text-black dark:text-white outline-none focus:border-primary-400 transition-colors w-full";

const initials = (nama: string) =>
  nama.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

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
      limit: 15,
    }),
    [isActive, page, roleId, search],
  );
  const users = useUserList(params);

  const totalPages = users.data?.meta.totalPages ?? 1;
  const total = users.data?.meta.total ?? 0;
  const visiblePages = getVisiblePages(page, totalPages);
  const hasFilter = Boolean(search || roleId || isActive);

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

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

  const resetFilters = () => {
    setSearch(""); setRoleId(""); setIsActive(""); setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="!mb-0.5">Manajemen Pengguna</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {users.isLoading ? "Memuat..." : `${total} pengguna terdaftar`}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <i className="material-symbols-outlined !text-[16px]">person_add</i>
          Tambah User
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-[#0c1427] rounded-xl border border-gray-100 dark:border-[#172036] p-3 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <i className="material-symbols-outlined !text-[16px] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            search
          </i>
          <input
            suppressHydrationWarning
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 dark:border-[#172036] bg-gray-50 dark:bg-[#15203c] text-sm text-black dark:text-white placeholder-gray-400 outline-none focus:border-primary-400"
            placeholder="Cari nama / username..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="h-9 rounded-lg border border-gray-200 dark:border-[#172036] bg-gray-50 dark:bg-[#15203c] text-sm text-black dark:text-white px-3 outline-none focus:border-primary-400 min-w-[140px]"
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
          className="h-9 rounded-lg border border-gray-200 dark:border-[#172036] bg-gray-50 dark:bg-[#15203c] text-sm text-black dark:text-white px-3 outline-none focus:border-primary-400 min-w-[130px]"
          value={isActive}
          onChange={(e) => { setIsActive(e.target.value); setPage(1); }}
        >
          <option value="">Semua Status</option>
          <option value="true">Aktif</option>
          <option value="false">Nonaktif</option>
        </select>
        {hasFilter && (
          <button
            type="button"
            onClick={resetFilters}
            className="h-9 px-3 rounded-lg border border-gray-200 dark:border-[#172036] text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors inline-flex items-center gap-1"
          >
            <i className="material-symbols-outlined !text-[14px]">close</i>
            Reset
          </button>
        )}
      </div>

      {users.isError && (
        <div className="py-3 px-4 text-sm text-danger-600 bg-danger-50 border border-danger-200 rounded-xl">
          Gagal memuat data pengguna
        </div>
      )}

      {/* List */}
      <div className="bg-white dark:bg-[#0c1427] rounded-xl border border-gray-100 dark:border-[#172036] overflow-hidden">
        {users.isLoading ? (
          <div className="divide-y divide-gray-100 dark:divide-[#172036]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#172036] shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-gray-100 dark:bg-[#172036] rounded w-1/3" />
                  <div className="h-3 bg-gray-100 dark:bg-[#172036] rounded w-1/4" />
                </div>
                <div className="h-5 w-16 bg-gray-100 dark:bg-[#172036] rounded-full" />
              </div>
            ))}
          </div>
        ) : users.data?.data.length ? (
          <div className="divide-y divide-gray-100 dark:divide-[#172036]">
            {users.data.data.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors group"
              >
                {/* Avatar */}
                <span className="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {initials(user.namaLengkap)}
                </span>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-semibold text-sm text-black dark:text-white truncate">
                      {user.namaLengkap}
                    </span>
                    <span className="font-mono text-[11px] text-gray-400 dark:text-gray-500 shrink-0">
                      @{user.username}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {displayRoleLabel(user.roleNama)}
                    </span>
                    {user.unitOrganisasi?.nama && (
                      <>
                        <span className="text-gray-300 dark:text-gray-600">·</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                          {user.unitOrganisasi.nama}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status + last login */}
                <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      user.isActive
                        ? "bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400"
                        : "bg-danger-50 text-danger-600 dark:bg-danger-900/20 dark:text-danger-400"
                    }`}
                  >
                    {user.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">
                    {user.lastLogin
                      ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(user.lastLogin))
                      : "—"}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <Link
                    href={`/admin/users/${user.id}`}
                    title="Detail"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  >
                    <i className="material-symbols-outlined !text-[16px]">visibility</i>
                  </Link>
                  <button
                    type="button"
                    title="Edit"
                    onClick={() => openEdit(user)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-warning-600 hover:bg-warning-50 dark:hover:bg-warning-900/20 transition-colors"
                  >
                    <i className="material-symbols-outlined !text-[16px]">edit</i>
                  </button>
                  <button
                    type="button"
                    title="Reset password"
                    onClick={() => setPendingConfirm({ type: "reset", id: user.id, name: user.namaLengkap })}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  >
                    <i className="material-symbols-outlined !text-[16px]">lock_reset</i>
                  </button>
                  {!user.isActive && (
                    <button
                      type="button"
                      title="Aktifkan"
                      onClick={() => actions.unlock.mutate(user.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-success-600 hover:bg-success-50 dark:hover:bg-success-900/20 transition-colors"
                    >
                      <i className="material-symbols-outlined !text-[16px]">person_check</i>
                    </button>
                  )}
                  <button
                    type="button"
                    title="Hapus"
                    onClick={() => setPendingConfirm({ type: "delete", id: user.id, name: user.namaLengkap })}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
                  >
                    <i className="material-symbols-outlined !text-[16px]">delete</i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-14 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-[#172036] flex items-center justify-center mb-3">
              <i className="material-symbols-outlined !text-[24px] text-gray-400">group</i>
            </div>
            <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">
              {hasFilter ? "Tidak ada hasil" : "Belum ada pengguna"}
            </p>
            {hasFilter && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 text-xs text-primary-500 hover:underline"
              >
                Reset filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Hal {page} dari {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#172036] flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors"
            >
              <i className="material-symbols-outlined !text-[16px]">chevron_left</i>
            </button>
            {visiblePages.map((p, i) =>
              p === "ellipsis" ? (
                <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">…</span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-primary-500 text-white"
                      : "border border-gray-200 dark:border-[#172036] hover:bg-gray-50 dark:hover:bg-[#15203c] text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {p}
                </button>
              ),
            )}
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#172036] flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors"
            >
              <i className="material-symbols-outlined !text-[16px]">chevron_right</i>
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            className="bg-white dark:bg-[#0c1427] rounded-xl p-6 w-full max-w-[680px] space-y-4 max-h-[90vh] overflow-y-auto"
            onSubmit={submit}
          >
            <div className="flex items-center justify-between">
              <h5 className="!mb-0">
                {modalMode === "create" ? "Tambah User" : "Edit User"}
              </h5>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-[#172036] transition-colors"
              >
                <i className="material-symbols-outlined !text-[18px]">close</i>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Username</label>
                <input
                  required
                  pattern="[a-z0-9._]+"
                  className={INPUT_CLS}
                  placeholder="contoh: budi.santoso"
                  value={form.username}
                  onChange={(e) => setField("username", e.target.value.toLowerCase())}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Nama Lengkap</label>
                <input
                  required
                  className={INPUT_CLS}
                  placeholder="Nama lengkap"
                  value={form.namaLengkap}
                  onChange={(e) => setField("namaLengkap", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
                <input
                  required
                  type="email"
                  className={INPUT_CLS}
                  placeholder="email@domain.com"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Nomor HP</label>
                <input
                  className={INPUT_CLS}
                  placeholder="08xx-xxxx-xxxx"
                  value={form.nomorHp}
                  onChange={(e) => setField("nomorHp", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Role</label>
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
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Unit Organisasi</label>
                <select
                  className={INPUT_CLS}
                  value={form.unitOrganisasiId}
                  onChange={(e) => setField("unitOrganisasiId", e.target.value)}
                >
                  <option value="">Pilih Unit (opsional)</option>
                  {(units.data ?? []).map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ASN ID</label>
                <input
                  className={INPUT_CLS}
                  placeholder="ID ASN (opsional)"
                  value={form.asnId}
                  onChange={(e) => setField("asnId", e.target.value)}
                />
              </div>
              {modalMode === "create" && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Password</label>
                  <input
                    required
                    type="password"
                    className={INPUT_CLS}
                    placeholder="Min. 8 karakter"
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                  />
                </div>
              )}
              <label className="flex items-center gap-2 cursor-pointer md:col-span-2 py-1">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setField("isActive", e.target.checked)}
                  className="w-4 h-4 accent-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Akun aktif</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-[#172036] text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={actions.create.isPending || actions.update.isPending}
                className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold disabled:opacity-60 transition-colors"
              >
                {actions.create.isPending || actions.update.isPending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Password Modal */}
      {newPassword && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1427] rounded-xl p-6 max-w-[400px] w-full space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-success-50 flex items-center justify-center">
                <i className="material-symbols-outlined !text-[20px] text-success-600">lock_reset</i>
              </span>
              <h5 className="!mb-0">Password Baru</h5>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sampaikan password ini kepada pengguna secara aman. Tidak akan ditampilkan kembali.
            </p>
            <p className="select-all font-mono text-sm bg-gray-50 dark:bg-[#15203c] border border-gray-200 dark:border-[#172036] p-3 rounded-lg break-all text-black dark:text-white">
              {newPassword}
            </p>
            <button
              type="button"
              onClick={() => setNewPassword("")}
              className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(pendingConfirm)}
        title={pendingConfirm?.type === "reset" ? "Reset Password" : "Hapus Pengguna"}
        description={
          pendingConfirm?.type === "reset"
            ? `Reset password untuk ${pendingConfirm?.name ?? ""}? Password baru akan dibuat otomatis.`
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
