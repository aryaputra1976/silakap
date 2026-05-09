"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import ConfirmModal from "@/components/silakap/ConfirmModal";
import { useUserActions, useUserDetail } from "@/hooks/useAdmin";
import { displayRoleLabel } from "@/lib/display-labels";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-2.5 border-b border-gray-100 dark:border-[#172036] last:border-b-0">
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
      <div className="text-sm font-medium text-gray-900 dark:text-white">
        {value ?? <span className="text-gray-400 dark:text-gray-600 font-normal">—</span>}
      </div>
    </div>
  );
}

const initials = (nama: string) =>
  nama.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const query = useUserDetail(params.id);
  const actions = useUserActions();
  const [newPassword, setNewPassword] = useState("");
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState(false);
  const user = query.data;

  const resetPassword = () => {
    actions.resetPassword.mutate(params.id, {
      onSuccess: (response) => {
        setNewPassword(response.data.data.newPassword);
        setConfirmResetOpen(false);
      },
    });
  };

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
            Admin / Users / Detail
          </p>
          <h1 className="!mb-0">Detail Pengguna</h1>
        </div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-[#172036] text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors"
        >
          <i className="material-symbols-outlined !text-[16px]">arrow_back</i>
          Kembali
        </Link>
      </div>

      {query.isLoading && (
        <div className="animate-pulse rounded-xl bg-gray-100 dark:bg-[#172036] h-64" />
      )}

      {(query.isError || (!query.isLoading && !user)) && (
        <div className="py-3 px-4 text-sm text-danger-600 bg-danger-50 border border-danger-200 rounded-xl">
          Gagal memuat data pengguna
        </div>
      )}

      {user && (
        <>
          {/* Profile card */}
          <div className="bg-white dark:bg-[#0c1427] rounded-xl border border-gray-100 dark:border-[#172036] overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-primary-500 via-primary-400 to-violet-400" />
            <div className="p-5 flex items-center gap-4">
              <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-md shadow-primary-200 dark:shadow-primary-900/30">
                {initials(user.namaLengkap)}
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white !mb-0.5 truncate">
                  {user.namaLengkap}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-xs font-semibold">
                    <i className="material-symbols-outlined !text-[11px]">badge</i>
                    {displayRoleLabel(user.roleNama)}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      user.isActive
                        ? "bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400"
                        : "bg-danger-50 text-danger-600 dark:bg-danger-900/20 dark:text-danger-400"
                    }`}
                  >
                    {user.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                  {user.mustChangePassword && (
                    <span className="px-2.5 py-0.5 rounded-full bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400 text-xs font-semibold">
                      Wajib ganti password
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Info akun */}
            <div className="bg-white dark:bg-[#0c1427] rounded-xl border border-gray-100 dark:border-[#172036] p-5">
              <h5 className="!mb-3 flex items-center gap-2">
                <i className="material-symbols-outlined !text-[18px] text-gray-400">account_circle</i>
                Info akun
              </h5>
              <Field label="Username" value={<span className="font-mono">{user.username}</span>} />
              <Field label="Email" value={user.email} />
              <Field label="Nomor HP" value={user.nomorHp} />
              <Field
                label="Login terakhir"
                value={
                  user.lastLogin
                    ? new Intl.DateTimeFormat("id-ID", {
                        day: "numeric", month: "long", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      }).format(new Date(user.lastLogin))
                    : null
                }
              />
              <Field
                label="Dibuat pada"
                value={new Intl.DateTimeFormat("id-ID", {
                  day: "numeric", month: "long", year: "numeric",
                }).format(new Date(user.createdAt))}
              />
            </div>

            {/* Info organisasi */}
            <div className="bg-white dark:bg-[#0c1427] rounded-xl border border-gray-100 dark:border-[#172036] p-5">
              <h5 className="!mb-3 flex items-center gap-2">
                <i className="material-symbols-outlined !text-[18px] text-gray-400">corporate_fare</i>
                Info organisasi
              </h5>
              <Field label="Unit Organisasi" value={user.unitOrganisasi?.nama} />
              <Field label="ASN ID" value={user.asnId ? <span className="font-mono text-xs">{user.asnId}</span> : null} />
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-[#0c1427] rounded-xl border border-gray-100 dark:border-[#172036] p-5">
            <h5 className="!mb-4 flex items-center gap-2">
              <i className="material-symbols-outlined !text-[18px] text-gray-400">manage_accounts</i>
              Aksi
            </h5>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-medium transition-colors"
              >
                <i className="material-symbols-outlined !text-[16px]">lock_reset</i>
                Reset Password
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeactivateOpen(true)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  user.isActive
                    ? "bg-danger-50 hover:bg-danger-100 dark:bg-danger-900/20 dark:hover:bg-danger-900/30 text-danger-700 dark:text-danger-400"
                    : "bg-success-50 hover:bg-success-100 dark:bg-success-900/20 dark:hover:bg-success-900/30 text-success-700 dark:text-success-400"
                }`}
              >
                <i className="material-symbols-outlined !text-[16px]">
                  {user.isActive ? "person_off" : "person_check"}
                </i>
                {user.isActive ? "Nonaktifkan" : "Aktifkan"}
              </button>
            </div>
          </div>
        </>
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

      {/* Confirm Reset */}
      <ConfirmModal
        isOpen={confirmResetOpen}
        title="Reset Password"
        description={`Reset password untuk ${user?.namaLengkap ?? "pengguna ini"}? Password baru akan dibuat otomatis dan perlu disampaikan secara aman.`}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={resetPassword}
        showTextarea={false}
        confirmLabel="Reset Password"
        confirmColor="yellow"
        loading={actions.resetPassword.isPending}
      />

      {/* Confirm Activate/Deactivate */}
      <ConfirmModal
        isOpen={confirmDeactivateOpen}
        title={user?.isActive ? "Nonaktifkan Pengguna" : "Aktifkan Pengguna"}
        description={
          user?.isActive
            ? `Nonaktifkan akun ${user?.namaLengkap ?? "ini"}? User tidak bisa login sampai diaktifkan kembali.`
            : `Aktifkan kembali akun ${user?.namaLengkap ?? "ini"}?`
        }
        onClose={() => setConfirmDeactivateOpen(false)}
        onConfirm={() => {
          if (user) {
            actions.unlock.mutate(user.id, { onSuccess: () => setConfirmDeactivateOpen(false) });
          }
        }}
        showTextarea={false}
        confirmLabel={user?.isActive ? "Nonaktifkan" : "Aktifkan"}
        confirmColor={user?.isActive ? "red" : "green"}
        loading={actions.unlock.isPending}
      />
    </div>
  );
}
