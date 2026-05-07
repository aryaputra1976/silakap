"use client";

import { useState } from "react";
import Link from "next/link";
import { useAntrianDetail } from "@/hooks/useDashboard";
import { useJenisLayanan } from "@/hooks/useLayanan";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { displayStatusLabel } from "@/lib/display-labels";

// ─── Status label & badge ─────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  Diajukan: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  VerifikasiAP: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  VerifikasiAM: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  QualityControl: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  ApprovalKabid: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  ApprovalKepalaBadan: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Selesai: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Dikembalikan: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  Ditolak: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  Diarsipkan: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
};

function AntriannStatusBadge({ status }: { status: string }) {
  const label = displayStatusLabel(status);
  const cls = STATUS_BADGE[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

// ─── Dot indikator SLA ────────────────────────────────────────────────────────

function SlaDot({ statusSla }: { statusSla: "OK" | "Warning" | "Overdue" }) {
  const cls =
    statusSla === "Overdue" ? "bg-red-500" : statusSla === "Warning" ? "bg-orange-400" : "bg-green-500";
  return <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${cls}`} />;
}

// ─── SLA progress cell ────────────────────────────────────────────────────────

function SlaCell({
  sla,
}: {
  sla: { hariKe: number; totalSla: number; statusSla: "OK" | "Warning" | "Overdue" } | null;
}) {
  if (!sla) return <span className="text-gray-400 text-xs">—</span>;

  const pct = Math.min(100, Math.round((sla.hariKe / sla.totalSla) * 100));
  const overdue = sla.hariKe > sla.totalSla;
  const barColor =
    sla.statusSla === "Overdue" ? "bg-red-500" : sla.statusSla === "Warning" ? "bg-orange-400" : "bg-green-500";
  const textColor =
    sla.statusSla === "Overdue" ? "text-red-500" : sla.statusSla === "Warning" ? "text-orange-500" : "text-green-600";

  return (
    <div className="min-w-[110px]">
      <p className={`text-xs font-semibold mb-1 ${textColor}`}>
        Hari ke-{sla.hariKe}/{sla.totalSla}{overdue ? "!" : ""}
      </p>
      <div className="h-1.5 bg-gray-100 dark:bg-[#172036] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Dropdown select ──────────────────────────────────────────────────────────

function FilterSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      className="border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] text-sm rounded-lg px-3 py-2 pr-8 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-300 appearance-none bg-no-repeat"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%239ca3af' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`, backgroundPosition: "right 8px center" }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {children}
    </select>
  );
}

// ─── Hook OPD list ────────────────────────────────────────────────────────────

interface UnitOrg { id: string; nama: string; isOpd: boolean }

function useOpdList() {
  return useQuery({
    queryKey: ["referensi", "unit-organisasi", "opd"],
    queryFn: async () => {
      const { data } = await api.get<{ data: UnitOrg[] }>("/referensi/unit-organisasi");
      const list = Array.isArray(data) ? data : data.data;
      return (list as UnitOrg[]).filter((u) => u.isOpd);
    },
    staleTime: 10 * 60 * 1000,
  });
}

// ─── Main component ───────────────────────────────────────────────────────────

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

type SlaFilter = "semua" | "warning" | "overdue" | "peremajaan";

const SLA_FILTER_OPTS: { value: SlaFilter; label: string; color: string }[] = [
  { value: "semua", label: "Semua", color: "text-gray-600 dark:text-gray-400" },
  { value: "warning", label: "Mendekati SLA", color: "text-warning-600 dark:text-warning-400" },
  { value: "overdue", label: "Overdue", color: "text-danger-600 dark:text-danger-400" },
  { value: "peremajaan", label: "Peremajaan", color: "text-primary-600 dark:text-primary-400" },
];

export default function AntrianTable() {
  const [jenisLayananId, setJenisLayananId] = useState("");
  const [unitOrganisasiId, setUnitOrganisasiId] = useState("");
  const [urutan, setUrutan] = useState("terlama");
  const [slaFilter, setSlaFilter] = useState<SlaFilter>("semua");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAntrianDetail({
    jenisLayananId: jenisLayananId || undefined,
    unitOrganisasiId: unitOrganisasiId || undefined,
    urutan,
    page,
    limit: 20,
  });

  const { data: jenisList } = useJenisLayanan();
  const { data: opdList } = useOpdList();

  const resetPage = () => setPage(1);

  const filteredRows = (data?.data ?? []).filter((item) => {
    if (slaFilter === "semua") return true;
    if (slaFilter === "warning") return item.sla?.statusSla === "Warning";
    if (slaFilter === "overdue") return item.sla?.statusSla === "Overdue";
    if (slaFilter === "peremajaan") return item.source === "peremajaan";
    return true;
  });

  return (
    <div>
      {/* Quick filter chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {SLA_FILTER_OPTS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setSlaFilter(opt.value)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              slaFilter === opt.value
                ? "bg-white dark:bg-[#0c1427] border-gray-300 dark:border-gray-600 shadow-sm " + opt.color
                : "bg-transparent border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-3 mb-5">
        <FilterSelect value={jenisLayananId} onChange={(v) => { setJenisLayananId(v); resetPage(); }}>
          <option value="">Semua jenis</option>
          {jenisList?.map((j) => (
            <option key={j.id} value={j.id}>{j.nama}</option>
          ))}
        </FilterSelect>

        <FilterSelect value={unitOrganisasiId} onChange={(v) => { setUnitOrganisasiId(v); resetPage(); }}>
          <option value="">Semua OPD</option>
          {opdList?.map((u) => (
            <option key={u.id} value={u.id}>{u.nama}</option>
          ))}
        </FilterSelect>

        <FilterSelect value={urutan} onChange={(v) => { setUrutan(v); resetPage(); }}>
          <option value="terlama">Urutkan: terlama</option>
          <option value="terbaru">Urutkan: terbaru</option>
        </FilterSelect>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-50 dark:bg-[#172036] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : !filteredRows.length ? (
        <p className="text-center text-gray-400 py-12 text-sm">
          {slaFilter !== "semua" ? "Tidak ada item yang cocok dengan filter ini" : "Antrian kosong"}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#172036]">
                  <th className="pb-3 pr-4 w-5" />
                  <th className="pb-3 pr-6 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Pengaju / layanan
                  </th>
                  <th className="pb-3 pr-6 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                    OPD
                  </th>
                  <th className="pb-3 pr-6 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Masuk
                  </th>
                  <th className="pb-3 pr-6 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="pb-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                    SLA
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-[#172036]">
                {filteredRows.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-[#172036]/40 transition-colors"
                  >
                    <td className="py-4 pr-4">
                      {item.sla ? (
                        <SlaDot statusSla={item.sla.statusSla} />
                      ) : (
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-200" />
                      )}
                    </td>
                    <td className="py-4 pr-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={item.detailHref ?? `/layanan/${item.id}`}
                          className="font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          {item.asn.nama}
                        </Link>
                        {item.source === "peremajaan" ? (
                          <span className="inline-flex rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700">
                            Portal Peremajaan
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.jenisLayanan.nama}
                      </p>
                    </td>
                    <td className="py-4 pr-6 text-gray-600 dark:text-gray-400 text-sm">
                      {item.unitOrganisasi.singkatan}
                    </td>
                    <td className="py-4 pr-6 text-gray-500 dark:text-gray-400 text-sm">
                      {formatTanggal(item.tanggalUsulan)}
                    </td>
                    <td className="py-4 pr-6">
                      <AntriannStatusBadge status={item.status} />
                    </td>
                    <td className="py-4">
                      <SlaCell sla={item.sla} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(data?.total ?? 0) > (data?.limit ?? 20) && (
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <span>
                {(page - 1) * (data?.limit ?? 20) + 1}–{Math.min(page * (data?.limit ?? 20), data?.total ?? 0)} dari {data?.total ?? 0}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 rounded border border-gray-200 dark:border-[#172036] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#172036]"
                >‹</button>
                <button
                  disabled={page * (data?.limit ?? 20) >= (data?.total ?? 0)}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 rounded border border-gray-200 dark:border-[#172036] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#172036]"
                >›</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
