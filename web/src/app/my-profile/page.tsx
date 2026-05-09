"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { normalizeRoleName } from "@/lib/dashboard-redirect";
import { displayRoleLabel } from "@/lib/display-labels";
import { useAuthStore } from "@/store/auth.store";
import type { ApiResponse } from "@/types/models";

interface AuthProfile {
  id: string;
  username: string;
  namaLengkap: string;
  email: string | null;
  role: { id: string; nama: string } | null;
  unitOrganisasiId?: string | null;
  mustChangePassword: boolean;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

export default function MyProfilePage() {
  const storedUser = useAuthStore((state) => state.user);
  const profile = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AuthProfile>>("/auth/me");
      return data.data;
    },
  });

  const roleName =
    profile.data?.role?.nama ?? storedUser?.roleNama ?? "Pengelola_OPD";
  const normalizedRole = normalizeRoleName(roleName);
  const roleLabel = displayRoleLabel(normalizedRole);
  const displayName =
    profile.data?.namaLengkap ?? storedUser?.namaLengkap ?? "User";
  const email = profile.data?.email ?? storedUser?.email ?? "-";
  const username = profile.data?.username ?? storedUser?.username ?? "-";
  const unitOrganisasiId =
    profile.data?.unitOrganisasiId ?? storedUser?.unitOrganisasiId ?? "-";
  const mustChangePassword =
    profile.data?.mustChangePassword ?? storedUser?.mustChangePassword ?? false;

  return (
    <div className="space-y-[25px]">
      <div className="mb-[25px] md:flex items-center justify-between">
        <div>
          <h5 className="!mb-1">Profil Saya</h5>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Informasi akun pengguna SILAKAP yang sedang aktif.
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
            Profil Saya
          </li>
        </ol>
      </div>

      {profile.isError ? (
        <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">
          Gagal memuat profil. Data sesi lokal tetap ditampilkan.
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[25px]">
        <div className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036] lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <span className="w-[96px] h-[96px] rounded-full bg-primary-500 text-white flex items-center justify-center text-3xl font-semibold mb-4">
              {getInitials(displayName)}
            </span>
            <h4 className="!mb-1">{displayName}</h4>
            <span className="inline-flex rounded-full bg-primary-50 text-primary-700 px-3 py-1 text-xs font-medium">
              {roleLabel}
            </span>
          </div>

          <div className="mt-[25px] space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 dark:border-[#172036] pb-3">
              <span className="text-gray-500">Username</span>
              <span className="font-medium text-black dark:text-white">
                {username}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 dark:border-[#172036] pb-3">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-black dark:text-white truncate">
                {email}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500">Status Password</span>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                  mustChangePassword
                    ? "bg-warning-100 text-warning-700"
                    : "bg-success-100 text-success-700"
                }`}
              >
                {mustChangePassword ? "Perlu diganti" : "Aktif"}
              </span>
            </div>
            <Link
              href="/settings/change-password"
              className="flex items-center gap-3 rounded-md border border-gray-100 p-3 text-left transition-colors hover:border-primary-500 hover:bg-primary-50 dark:border-[#172036] dark:hover:bg-[#15203c]"
            >
              <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-600 dark:bg-[#15203c]">
                <i className="material-symbols-outlined !text-[22px]">lock_reset</i>
              </span>
              <span>
                <span className="block font-semibold text-black dark:text-white">
                  Ganti Password
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  Perbarui password akun secara aman.
                </span>
              </span>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036] lg:col-span-2">
          <div className="mb-4">
            <h5 className="!mb-0">Detail Akun</h5>
          </div>

          {profile.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  className="h-12 rounded-md bg-gray-100 dark:bg-[#172036] animate-pulse"
                  key={index}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
              <InfoItem label="Nama Lengkap" value={displayName} />
              <InfoItem label="Username" value={username} />
              <InfoItem label="Email" value={email} />
              <InfoItem label="Role" value={roleLabel} />
              <InfoItem label="ID Role" value={profile.data?.role?.id ?? "-"} />
              <InfoItem label="ID Unit Organisasi" value={unitOrganisasiId} />
              <InfoItem label="ID User" value={profile.data?.id ?? storedUser?.id ?? "-"} />
              <InfoItem
                label="Wajib Ganti Password"
                value={mustChangePassword ? "Ya" : "Tidak"}
              />
            </div>
          )}

          <div className="mt-[25px] flex flex-wrap gap-3">
            <Link
              href="/settings/change-password"
              className="inline-flex items-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-white font-medium hover:bg-primary-400 transition-colors"
            >
              <i className="material-symbols-outlined !text-[20px]">
                lock_reset
              </i>
              Ganti Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-gray-100 dark:border-[#172036] p-4">
      <span className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </span>
      <span className="block font-medium text-black dark:text-white break-words">
        {value}
      </span>
    </div>
  );
}
