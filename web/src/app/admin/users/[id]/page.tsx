"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import ConfirmModal from "@/components/silakap/ConfirmModal";
import { useUserActions, useUserDetail } from "@/hooks/useAdmin";
import { displayRoleLabel } from "@/lib/display-labels";

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const query = useUserDetail(params.id);
  const actions = useUserActions();
  const [newPassword, setNewPassword] = useState("");
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
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
    <div className="space-y-[25px]">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-gray-500 dark:text-gray-400">Users / Detail</p><h1 className="!mb-0">Detail Pengguna</h1></div><Link href="/admin/users" className="py-[10px] px-[20px] border border-gray-200 dark:border-[#172036] rounded-md">← Kembali</Link></div>
      {query.isLoading ? <div className="animate-pulse rounded-xl bg-gray-200 dark:bg-[#172036] h-72" /> : query.isError || !user ? <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">Gagal memuat data</div> : (
        <>
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md"><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[20px]"><p><span className="block text-gray-500">Username</span><strong>{user.username}</strong></p><p><span className="block text-gray-500">Nama Lengkap</span><strong>{user.namaLengkap}</strong></p><p><span className="block text-gray-500">Email</span><strong>{user.email ?? "-"}</strong></p><p><span className="block text-gray-500">Nomor HP</span><strong>{user.nomorHp ?? "-"}</strong></p><p><span className="block text-gray-500">Role</span><span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-primary-50 text-primary-700">{displayRoleLabel(user.roleNama)}</span></p><p><span className="block text-gray-500">Unit Organisasi</span><strong>{user.unitOrganisasi?.nama ?? "-"}</strong></p><p><span className="block text-gray-500">ASN ID</span><strong>{user.asnId ?? "-"}</strong></p><p><span className="block text-gray-500">Status</span><span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${user.isActive ? "bg-success-100 text-success-700" : "bg-danger-100 text-danger-700"}`}>{user.isActive ? "Aktif" : "Nonaktif"}</span></p><p><span className="block text-gray-500">Must Change Password</span><strong>{user.mustChangePassword ? "Ya" : "Tidak"}</strong></p><p><span className="block text-gray-500">Last Login</span><strong>{user.lastLogin ? new Date(user.lastLogin).toLocaleString("id-ID") : "-"}</strong></p><p><span className="block text-gray-500">Dibuat Pada</span><strong>{new Date(user.createdAt).toLocaleString("id-ID")}</strong></p></div></div>
          <div className="flex flex-wrap gap-3"><Link href="/admin/users" className="py-[10px] px-[20px] bg-primary-500 text-white rounded-md">Edit</Link><button type="button" className="py-[10px] px-[20px] bg-warning-500 text-black rounded-md" onClick={() => setConfirmResetOpen(true)}>Reset Password</button><button type="button" className="py-[10px] px-[20px] bg-success-500 text-white rounded-md" onClick={() => actions.unlock.mutate(user.id)}>{user.isActive ? "Aktifkan" : "Aktifkan"}</button></div>
        </>
      )}
      {newPassword ? <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"><div className="bg-white dark:bg-[#0c1427] rounded-md p-[25px] max-w-[420px] w-full"><h5>Password Baru</h5><p className="select-all font-mono bg-gray-50 dark:bg-[#15203c] p-3 rounded-md">{newPassword}</p><button type="button" className="mt-4 px-5 py-2 bg-primary-500 text-white rounded-md" onClick={() => setNewPassword("")}>Tutup</button></div></div> : null}
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
    </div>
  );
}
