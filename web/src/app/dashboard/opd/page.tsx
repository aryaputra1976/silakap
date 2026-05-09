"use client";

import { useRouter } from "next/navigation";
import LayananCardGrid from "@/components/silakap/LayananCardGrid";
import { useJenisLayanan, useLayananList } from "@/hooks/useLayanan";
import { useAsnDetail } from "@/hooks/useAsn";
import { useAuthStore } from "@/store/auth.store";

function Initials({ nama }: { nama: string }) {
  const parts = nama.trim().split(/\s+/);
  const letters = parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : nama.slice(0, 2).toUpperCase();
  return (
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-md shadow-primary-200 dark:shadow-primary-900/30">
      {letters}
    </div>
  );
}

export default function DashboardOpdPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: jenisLayananList, isLoading } = useJenisLayanan();
  const { data: asn } = useAsnDetail(user?.asnId ?? "");
  const { data: tiketData } = useLayananList({ limit: 1 });

  const namaLengkap = user?.namaLengkap ?? "—";
  const nip = asn?.nipBaru ?? null;
  const unitNama = asn?.unitOrganisasi?.nama ?? null;
  const jabatan = (asn as (typeof asn & { jabatan?: { nama: string } }) | undefined)?.jabatan?.nama ?? null;
  const totalTiket = tiketData?.meta?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Profile header card */}
      <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-gray-100 dark:border-[#172036] overflow-hidden shadow-sm">
        {/* Colored top accent strip */}
        <div className="h-1.5 bg-gradient-to-r from-primary-500 via-primary-400 to-violet-400" />

        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
            {/* User info */}
            <div className="flex items-center gap-4">
              <Initials nama={namaLengkap} />
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white !mb-0.5">
                  {namaLengkap}
                </h2>
                {nip ? (
                  <p className="text-xs font-mono text-gray-500 dark:text-gray-400 !mb-0.5">
                    NIP {nip}
                  </p>
                ) : null}
                {jabatan && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 !mb-0.5">{jabatan}</p>
                )}
                {unitNama && (
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-xs font-medium">
                    <i className="material-symbols-outlined !text-[11px]">apartment</i>
                    {unitNama}
                  </span>
                )}
              </div>
            </div>

            {/* Nav buttons */}
            <div className="flex flex-wrap gap-2 sm:shrink-0">
              <button
                onClick={() => router.push("/layanan/buat")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary-500 hover:bg-primary-600 text-white transition-colors shadow-sm shadow-primary-200 dark:shadow-primary-900/20"
              >
                <i className="material-symbols-outlined !text-[16px]">add_circle</i>
                Ajukan layanan
              </button>
              <button
                onClick={() => router.push("/layanan")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] text-gray-700 dark:text-gray-300 hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <i className="material-symbols-outlined !text-[16px]">receipt_long</i>
                Tiket saya
                {totalTiket > 0 && (
                  <span className="ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold flex items-center justify-center">
                    {totalTiket > 99 ? "99+" : totalTiket}
                  </span>
                )}
              </button>
              <button
                onClick={() => router.push("/profil")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] text-gray-700 dark:text-gray-300 hover:border-gray-400 transition-colors"
              >
                <i className="material-symbols-outlined !text-[16px]">manage_accounts</i>
                Profil
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Service cards */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <i className="material-symbols-outlined !text-[16px] text-gray-400">grid_view</i>
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 !mb-0">
              Pilih jenis layanan — klik kartu untuk mengajukan permohonan
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-gray-100 dark:bg-[#172036] animate-pulse" />
            ))}
          </div>
        ) : (
          <LayananCardGrid items={jenisLayananList ?? []} />
        )}
      </div>
    </div>
  );
}
