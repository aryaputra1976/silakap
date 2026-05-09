"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useAsnDetail } from "@/hooks/useAsn";
import { displayRoleLabel } from "@/lib/display-labels";

function Initials({ nama }: { nama: string }) {
  const parts = nama.trim().split(/\s+/);
  const letters =
    parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : nama.slice(0, 2).toUpperCase();
  return (
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center text-2xl font-bold shrink-0 shadow-md shadow-primary-200 dark:shadow-primary-900/30">
      {letters}
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}

function Field({ label, value, mono }: FieldProps) {
  return (
    <div className="py-2.5 border-b border-gray-100 dark:border-[#172036] last:border-b-0">
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
      <p className={`text-sm font-medium text-gray-900 dark:text-white ${mono ? "font-mono" : ""}`}>
        {value || <span className="text-gray-400 dark:text-gray-600 font-normal">—</span>}
      </p>
    </div>
  );
}

type PasswordForm = {
  passwordLama: string;
  passwordBaru: string;
  konfirmasiPassword: string;
};

const emptyForm: PasswordForm = {
  passwordLama: "",
  passwordBaru: "",
  konfirmasiPassword: "",
};

export default function ProfilPage() {
  const user = useAuthStore((s) => s.user);
  const { data: asn } = useAsnDetail(user?.asnId ?? "");

  const [form, setForm] = useState<PasswordForm>(emptyForm);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const changePassword = useMutation({
    mutationFn: (body: PasswordForm) => api.post("/auth/change-password", body),
    onSuccess: () => {
      setSuccess(true);
      setServerError(null);
      setForm(emptyForm);
      setTimeout(() => setSuccess(false), 4000);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Gagal mengganti password";
      setServerError(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (form.passwordBaru !== form.konfirmasiPassword) {
      setServerError("Konfirmasi password tidak cocok");
      return;
    }
    if (form.passwordBaru.length < 8) {
      setServerError("Password baru minimal 8 karakter");
      return;
    }
    changePassword.mutate(form);
  };

  const set = (field: keyof PasswordForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  if (!user) return null;

  const jabatan = (asn as (typeof asn & { jabatan?: { nama: string } }) | undefined)?.jabatan?.nama;

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header card */}
      <div className="bg-white dark:bg-[#0c1427] rounded-xl border border-gray-100 dark:border-[#172036] overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-primary-500 via-primary-400 to-violet-400" />
        <div className="p-5 flex items-center gap-4">
          <Initials nama={user.namaLengkap} />
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white !mb-0.5 truncate">
              {user.namaLengkap}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-xs font-semibold">
                <i className="material-symbols-outlined !text-[11px]">badge</i>
                {displayRoleLabel(user.roleNama)}
              </span>
              {!user.isActive && (
                <span className="px-2.5 py-0.5 rounded-full bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400 text-xs font-semibold">
                  Nonaktif
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Info akun */}
        <div className="bg-white dark:bg-[#0c1427] rounded-xl border border-gray-100 dark:border-[#172036] p-5">
          <h5 className="!mb-3 flex items-center gap-2">
            <i className="material-symbols-outlined !text-[18px] text-gray-400">account_circle</i>
            Info akun
          </h5>
          <Field label="Username" value={user.username} mono />
          <Field label="Email" value={user.email} />
          <Field label="Nomor HP" value={user.nomorHp} />
          <Field label="Login terakhir" value={
            user.lastLogin
              ? new Intl.DateTimeFormat("id-ID", {
                  day: "numeric", month: "long", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                }).format(new Date(user.lastLogin))
              : null
          } />
        </div>

        {/* Info kepegawaian */}
        <div className="bg-white dark:bg-[#0c1427] rounded-xl border border-gray-100 dark:border-[#172036] p-5">
          <h5 className="!mb-3 flex items-center gap-2">
            <i className="material-symbols-outlined !text-[18px] text-gray-400">badge</i>
            Data kepegawaian
          </h5>
          {asn ? (
            <>
              <Field label="NIP" value={asn.nipBaru} mono />
              <Field label="NIP Lama" value={asn.nipLama} mono />
              <Field label="Jabatan" value={jabatan} />
              <Field label="Unit Organisasi" value={asn.unitOrganisasi?.nama} />
              <Field label="Golongan" value={
                (asn as typeof asn & { golongan?: { nama: string } })?.golongan?.nama
              } />
            </>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
              {user.asnId ? "Memuat data ASN..." : "Akun ini tidak terhubung ke data ASN"}
            </p>
          )}
        </div>
      </div>

      {/* Ganti password */}
      <div className="bg-white dark:bg-[#0c1427] rounded-xl border border-gray-100 dark:border-[#172036] p-5">
        <h5 className="!mb-1 flex items-center gap-2">
          <i className="material-symbols-outlined !text-[18px] text-gray-400">lock</i>
          Ganti password
        </h5>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          Password baru minimal 8 karakter, kombinasi huruf dan angka.
        </p>

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800/40 px-4 py-3 text-sm text-success-700 dark:text-success-300">
            <i className="material-symbols-outlined !text-[18px]">check_circle</i>
            Password berhasil diubah
          </div>
        )}
        {serverError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800/40 px-4 py-3 text-sm text-danger-700 dark:text-danger-300">
            <i className="material-symbols-outlined !text-[18px]">error</i>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(
            [
              { key: "passwordLama",        label: "Password saat ini",  type: "password" },
              { key: "passwordBaru",        label: "Password baru",      type: "password" },
              { key: "konfirmasiPassword",  label: "Konfirmasi password",type: "password" },
            ] as const
          ).map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {label}
              </label>
              <input
                required
                type={type}
                className="w-full h-9 rounded-lg border border-gray-200 dark:border-[#172036] bg-gray-50 dark:bg-[#15203c] px-3 text-sm text-black dark:text-white outline-none focus:border-primary-400 transition-colors"
                value={form[key]}
                onChange={set(key)}
                autoComplete={key === "passwordLama" ? "current-password" : "new-password"}
              />
            </div>
          ))}

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={changePassword.isPending}
              className="inline-flex items-center gap-2 px-5 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {changePassword.isPending ? (
                <i className="material-symbols-outlined !text-[16px] animate-spin">refresh</i>
              ) : (
                <i className="material-symbols-outlined !text-[16px]">lock_reset</i>
              )}
              {changePassword.isPending ? "Menyimpan..." : "Simpan password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
