"use client";

import { useState } from "react";
import KpiStrip from "@/components/silakap/dashboard/KpiStrip";
import AntrianTable from "@/components/silakap/dashboard/AntrianTable";
import {
  downloadPeremajaanDokumen,
  useApprovePeremajaan,
  useClaimPeremajaan,
  usePeremajaanList,
} from "@/hooks/useAsn";
import { useDashboardOperatorKpi } from "@/hooks/useDashboard";
import { useAuthStore } from "@/store/auth.store";
import type { AsnPeremajaan } from "@/types/models";

const TABS = ["Antrian", "Verifikasi aktif"] as const;
type Tab = (typeof TABS)[number];

const TAHAP = "AD";

function formatHariIni() {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function LoadingSkeleton() {
  return (
    <div className="h-24 rounded-xl bg-gray-100 dark:bg-[#172036] animate-pulse" />
  );
}

function formatDataBaru(data: Record<string, unknown>) {
  return (
    Object.entries(data)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(", ") || "-"
  );
}

interface DokumenBuktiMeta {
  namaFile: string;
  fileId: string;
  ukuran: number;
}

function parseDokumenBukti(value?: string | null): DokumenBuktiMeta | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as {
      namaFile?: string;
      fileId?: string;
      ukuran?: number;
    };
    if (parsed.namaFile && parsed.fileId && typeof parsed.ukuran === "number") {
      return {
        namaFile: parsed.namaFile,
        fileId: parsed.fileId,
        ukuran: parsed.ukuran,
      };
    }
  } catch {
    return null;
  }
  return null;
}

function formatTanggalWaktu(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Makassar",
  }).format(new Date(value));
}

function DokumenBuktiView({ value }: { value?: string | null }) {
  const meta = parseDokumenBukti(value);
  if (!value) return null;

  if (!meta) {
    return (
      <div className="mt-3 rounded-md bg-primary-50 p-3 text-sm text-primary-700">
        <span className="block font-semibold">Dokumen bukti</span>
        <span>{value}</span>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-md bg-primary-50 p-3 text-sm text-primary-700">
      <span className="block font-semibold">Dokumen bukti</span>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
        <span>
          {meta.namaFile} | {Math.ceil(meta.ukuran / 1024)} KB
        </span>
        <button
          type="button"
          className="inline-flex min-h-[32px] items-center gap-1 rounded-md bg-white px-3 font-semibold text-primary-700"
          onClick={() => void downloadPeremajaanDokumen(meta.fileId, meta.namaFile)}
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Unduh
        </button>
      </div>
    </div>
  );
}

function TicketTimeline({ item }: { item: AsnPeremajaan }) {
  const decisionDone = item.statusApproval !== "Pending";
  const steps = [
    {
      label: "Masuk",
      description: item.diajukanOleh?.namaLengkap ?? "Portal ASN / OPD",
      icon: "send",
      at: item.createdAt,
      done: true,
    },
    {
      label: item.ditugaskanKepada ? "Diambil" : "Belum diambil",
      description: item.ditugaskanKepada?.namaLengkap ?? "Menunggu operator",
      icon: "assignment_ind",
      at: item.ditugaskanAt,
      done: Boolean(item.ditugaskanKepada),
    },
    {
      label:
        item.statusApproval === "Approved"
          ? "Disetujui"
          : item.statusApproval === "Rejected"
            ? "Ditolak"
            : "Keputusan",
      description: decisionDone ? item.catatan || "Keputusan sudah dicatat" : "Belum diputuskan",
      icon:
        item.statusApproval === "Rejected"
          ? "cancel"
          : item.statusApproval === "Approved"
            ? "verified"
            : "pending_actions",
      at: decisionDone ? item.updatedAt ?? item.createdAt : null,
      done: decisionDone,
    },
  ];

  return (
    <div className="mt-3 rounded-md border border-gray-200 p-3 dark:border-[#172036]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-black dark:text-white">
          Jejak proses
        </span>
        <span className="text-xs font-medium text-gray-500">WITA</span>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        {steps.map((step) => (
          <div
            className={`rounded-md px-3 py-3 text-sm ${
              step.done
                ? "bg-primary-50 text-primary-700"
                : "bg-gray-50 text-gray-500 dark:bg-[#15203c] dark:text-gray-400"
            }`}
            key={step.label}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">{step.icon}</span>
              <span className="font-semibold">{step.label}</span>
            </div>
            <p className="text-xs">{step.description}</p>
            <p className="mt-2 text-xs font-semibold">{formatTanggalWaktu(step.at)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardAnalisMadyaPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Antrian");
  const [decisionNotes, setDecisionNotes] = useState<Record<string, string>>({});
  const user = useAuthStore((s) => s.user);
  const { data: kpi, isLoading, isError } = useDashboardOperatorKpi(TAHAP);
  const peremajaan = usePeremajaanList({ status: "Pending", limit: 10 });
  const approvePeremajaan = useApprovePeremajaan();
  const claimPeremajaan = useClaimPeremajaan();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="!mb-1 text-xl font-bold text-gray-900 dark:text-white">
            Dashboard verifikasi - BKD
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Operator:{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {user?.namaLengkap ?? "-"}
            </span>{" "}
            | {formatHariIni()}
          </p>
          <p className="mt-1 text-xs font-medium text-primary-600 dark:text-primary-400">
            Antrian memuat usulan layanan dan pengajuan peremajaan dari portal ASN.
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-gray-200 bg-white text-gray-900 shadow-sm dark:border-[#172036] dark:bg-[#0c1427] dark:text-white"
                  : "border-transparent bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {isError ? (
        <div className="rounded-md border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-500">
          Gagal memuat data dashboard
        </div>
      ) : null}

      {activeTab === "Antrian" ? (
        <>
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <KpiStrip
              items={[
                {
                  label: "Menunggu verifikasi",
                  value: kpi?.menungguVerifikasi ?? 0,
                  color: "blue",
                },
                {
                  label: "Sedang diproses",
                  value: kpi?.sedangDiproses ?? 0,
                  color: "orange",
                },
                {
                  label: "Mendekati SLA",
                  value: kpi?.mendekatiSla ?? 0,
                  color: "red",
                },
                {
                  label: "Selesai hari ini",
                  value: kpi?.selesaiHariIni ?? 0,
                  color: "green",
                },
              ]}
            />
          )}
          <div className="trezo-card rounded-xl bg-white p-6 dark:bg-[#0c1427]">
            <AntrianTable />
          </div>
        </>
      ) : null}

      {activeTab === "Verifikasi aktif" ? (
        <div className="trezo-card rounded-xl bg-white p-6 dark:bg-[#0c1427]">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h5 className="!mb-1">Verifikasi peremajaan aktif</h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pengajuan dari portal ASN yang menunggu keputusan operator.
              </p>
            </div>
            <span className="inline-flex rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-700">
              {peremajaan.data?.meta.total ?? 0} pending
            </span>
          </div>

          {peremajaan.isLoading ? (
            <div className="h-40 animate-pulse rounded-md bg-gray-100 dark:bg-[#172036]" />
          ) : peremajaan.data?.data.length ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {peremajaan.data.data.map((item) => (
                <div
                  className="rounded-md border border-gray-200 p-4 dark:border-[#172036]"
                  key={item.id}
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {item.jenisPerubahan}
                      </span>
                      <h5 className="!mb-1">{item.asn?.nama ?? "-"}</h5>
                      <p className="text-sm text-gray-500">
                        {item.asn?.nipBaru ?? "-"} |{" "}
                        {new Date(item.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <span className="rounded-full bg-warning-100 px-3 py-1 text-xs font-semibold text-warning-700">
                      Menunggu
                    </span>
                  </div>

                  <div className="mb-3 rounded-md border border-gray-200 px-3 py-2 text-sm dark:border-[#172036]">
                    <span className="text-gray-500 dark:text-gray-400">
                      Penanggung jawab:{" "}
                    </span>
                    <span className="font-semibold text-black dark:text-white">
                      {item.ditugaskanKepada?.namaLengkap ?? "Belum diambil"}
                    </span>
                    {item.ditugaskanAt ? (
                      <span className="ml-2 text-xs text-gray-500">
                        {new Date(item.ditugaskanAt).toLocaleString("id-ID")}
                      </span>
                    ) : null}
                  </div>

                  <div className="rounded-md bg-gray-50 p-3 text-sm dark:bg-[#15203c]">
                    <span className="block text-gray-500 dark:text-gray-400">
                      Perubahan
                    </span>
                    <span className="font-medium text-black dark:text-white">
                      {formatDataBaru(item.dataBaru)}
                    </span>
                  </div>

                  <DokumenBuktiView value={item.dokumenBukti} />
                  <TicketTimeline item={item} />

                  {item.ditugaskanKepada?.id === user?.id ? (
                    <div className="mt-4">
                      <label
                        className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                        htmlFor={`decision-note-${item.id}`}
                      >
                        Catatan keputusan
                      </label>
                      <textarea
                        suppressHydrationWarning
                        id={`decision-note-${item.id}`}
                        className="min-h-[88px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary-500 dark:border-[#172036] dark:bg-[#0c1427] dark:text-white"
                        placeholder="Ringkasan hasil verifikasi. Wajib diisi bila menolak."
                        value={decisionNotes[item.id] ?? ""}
                        onChange={(event) =>
                          setDecisionNotes((current) => ({
                            ...current,
                            [item.id]: event.target.value,
                          }))
                        }
                      />
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {!item.ditugaskanKepada ? (
                      <button
                        type="button"
                        className="inline-flex min-h-[38px] items-center gap-2 rounded-md bg-primary-500 px-4 font-medium text-white disabled:opacity-70"
                        disabled={claimPeremajaan.isPending}
                        onClick={() => claimPeremajaan.mutate(item.id)}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          assignment_ind
                        </span>
                        Ambil tiket
                      </button>
                    ) : null}
                    {item.ditugaskanKepada?.id === user?.id ? (
                      <>
                        <button
                          type="button"
                          className="inline-flex min-h-[38px] items-center gap-2 rounded-md bg-success-500 px-4 font-medium text-white disabled:opacity-70"
                          disabled={approvePeremajaan.isPending}
                          onClick={() =>
                            approvePeremajaan.mutate({
                              id: item.id,
                              body: {
                                statusApproval: "Approved",
                                catatan: decisionNotes[item.id]?.trim() || undefined,
                              },
                            })
                          }
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            check
                          </span>
                          Approve
                        </button>
                        <button
                          type="button"
                          className="inline-flex min-h-[38px] items-center gap-2 rounded-md bg-danger-500 px-4 font-medium text-white disabled:opacity-70"
                          disabled={
                            approvePeremajaan.isPending || !decisionNotes[item.id]?.trim()
                          }
                          onClick={() =>
                            approvePeremajaan.mutate({
                              id: item.id,
                              body: {
                                statusApproval: "Rejected",
                                catatan: decisionNotes[item.id]?.trim(),
                              },
                            })
                          }
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            close
                          </span>
                          Tolak
                        </button>
                      </>
                    ) : null}
                    {item.ditugaskanKepada && item.ditugaskanKepada.id !== user?.id ? (
                      <span className="inline-flex min-h-[38px] items-center rounded-md bg-gray-100 px-4 text-sm font-semibold text-gray-600">
                        Sedang ditangani operator lain
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-14 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">
                fact_check
              </span>
              <p className="mt-3 text-gray-400 dark:text-gray-500">
                Tidak ada verifikasi peremajaan aktif.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
