"use client";

import { useRouter } from "next/navigation";
import LayananCardGrid from "@/components/silakap/LayananCardGrid";
import { useJenisLayanan } from "@/hooks/useLayanan";
import { useAsnDetail } from "@/hooks/useAsn";
import { useAuthStore } from "@/store/auth.store";

function Initials({ nama }: { nama: string }) {
  const parts = nama.trim().split(/\s+/);
  const letters = parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : nama.slice(0, 2).toUpperCase();
  return (
    <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center text-lg font-bold shrink-0">
      {letters}
    </div>
  );
}

export default function DashboardOpdPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: jenisLayananList, isLoading } = useJenisLayanan();
  const { data: asn } = useAsnDetail(user?.asnId ?? "");

  const namaLengkap = user?.namaLengkap ?? "—";
  const nip = asn?.nipBaru ?? "—";
  const unitNama = asn?.unitOrganisasi?.nama ?? user?.unitOrganisasiId ?? "—";

  return (
    <div className="space-y-6">
      {/* Profile header card */}
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* User info */}
          <div className="flex items-center gap-4">
            <Initials nama={namaLengkap} />
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white !mb-0">
                {namaLengkap}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                NIP {nip} — {unitNama}
              </p>
            </div>
          </div>

          {/* Nav buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push("/layanan/buat")}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] text-gray-700 dark:text-gray-300 hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Ajukan layanan
            </button>
            <button
              onClick={() => router.push("/layanan")}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] text-gray-700 dark:text-gray-300 hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Tiket saya
            </button>
            <button
              onClick={() => router.push("/profil")}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] text-gray-700 dark:text-gray-300 hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Profil
            </button>
          </div>
        </div>
      </div>

      {/* Service cards */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
          Pilih jenis layanan yang ingin diajukan
        </h3>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-[#172036] animate-pulse" />
            ))}
          </div>
        ) : (
          <LayananCardGrid items={jenisLayananList ?? []} />
        )}
      </div>
    </div>
  );
}
