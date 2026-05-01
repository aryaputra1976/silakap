"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Toast from "@/components/silakap/Toast";
import { useToast } from "@/hooks/useToast";
import type { ApiResponse } from "@/types/models";

interface ChangePasswordPayload {
  passwordLama: string;
  passwordBaru: string;
  konfirmasiPassword: string;
}

const getErrorMessage = (error: unknown) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? "Gagal mengubah password";

export default function ChangePasswordPage() {
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [formError, setFormError] = useState("");
  const { toast, showToast, hideToast } = useToast();

  const mutation = useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      api.post<ApiResponse<null>>("/auth/change-password", payload),
    onSuccess: () => {
      setPasswordLama("");
      setPasswordBaru("");
      setKonfirmasiPassword("");
      showToast("Password berhasil diubah", "success");
    },
    onError: (error) => {
      showToast(getErrorMessage(error), "error");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (passwordBaru.length < 8) {
      setFormError("Password baru minimal 8 karakter.");
      return;
    }

    if (!/^(?=.*[A-Z])(?=.*[0-9])/.test(passwordBaru)) {
      setFormError("Password baru harus mengandung huruf kapital dan angka.");
      return;
    }

    if (passwordBaru !== konfirmasiPassword) {
      setFormError("Konfirmasi password tidak cocok.");
      return;
    }

    mutation.mutate({ passwordLama, passwordBaru, konfirmasiPassword });
  };

  return (
    <div className="space-y-[25px]">
      <div className="mb-[25px] md:flex items-center justify-between">
        <div>
          <h5 className="!mb-1">Ganti Password</h5>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Perbarui password akun SILAKAP Anda secara berkala.
          </p>
        </div>

        <ol className="breadcrumb mt-[12px] md:mt-0">
          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            <Link
              href="/"
              className="inline-block relative ltr:pl-[22px] rtl:pr-[22px] transition-all hover:text-primary-500"
            >
              <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 !text-lg -mt-px text-primary-500 top-1/2 -translate-y-1/2">
                home
              </i>
              Dashboard
            </Link>
          </li>
          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            Pengaturan
          </li>
          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            Ganti Password
          </li>
        </ol>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[25px]">
        <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md lg:col-span-2">
          <div className="trezo-card-header mb-[20px] md:mb-[25px]">
            <h5 className="!mb-0">Form Ganti Password</h5>
          </div>

          {formError ? (
            <div className="mb-[20px] py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">
              {formError}
            </div>
          ) : null}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
              <PasswordField
                id="passwordLama"
                label="Password Lama"
                value={passwordLama}
                onChange={setPasswordLama}
                autoComplete="current-password"
              />
              <PasswordField
                id="passwordBaru"
                label="Password Baru"
                value={passwordBaru}
                onChange={setPasswordBaru}
                autoComplete="new-password"
              />
              <div className="md:col-span-2">
                <PasswordField
                  id="konfirmasiPassword"
                  label="Konfirmasi Password Baru"
                  value={konfirmasiPassword}
                  onChange={setKonfirmasiPassword}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="mt-[20px] md:mt-[25px] flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="font-medium inline-flex items-center gap-2 transition-all rounded-md md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <i className="material-symbols-outlined">
                  {mutation.isPending ? "progress_activity" : "check"}
                </i>
                {mutation.isPending ? "Menyimpan..." : "Simpan Password"}
              </button>

              <Link
                href="/my-profile"
                className="font-medium inline-flex items-center gap-2 rounded-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] border border-gray-200 dark:border-[#172036] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors"
              >
                Batal
              </Link>
            </div>
          </form>
        </div>

        <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
          <h5 className="!mb-4">Ketentuan Password</h5>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex gap-2">
              <i className="material-symbols-outlined !text-[18px] text-primary-500">
                check_circle
              </i>
              Minimal 8 karakter.
            </li>
            <li className="flex gap-2">
              <i className="material-symbols-outlined !text-[18px] text-primary-500">
                check_circle
              </i>
              Mengandung huruf kapital dan angka.
            </li>
            <li className="flex gap-2">
              <i className="material-symbols-outlined !text-[18px] text-primary-500">
                check_circle
              </i>
              Tidak boleh sama dengan password sebelumnya.
            </li>
          </ul>
        </div>
      </div>

      {toast.visible ? (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      ) : null}
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  return (
    <div>
      <label
        className="mb-[10px] text-black dark:text-white font-medium block"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        type="password"
        className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
        id={id}
        placeholder="Masukkan password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required
      />
    </div>
  );
}
