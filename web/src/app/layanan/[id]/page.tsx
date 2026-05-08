"use client";

import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { useState } from "react";
import ActionButtons from "@/components/silakap/ActionButtons";
import SlaCountdown from "@/components/silakap/SlaCountdown";
import StatusBadge from "@/components/silakap/StatusBadge";
import WorkflowTimeline from "@/components/silakap/WorkflowTimeline";
import {
  downloadDokumenOutput,
  useLayananAction,
  useLayananDetail,
  useUploadDokumen,
} from "@/hooks/useLayanan";
import { displayTahapLabel } from "@/lib/display-labels";
import { useAuthStore } from "@/store/auth.store";
import type { UsulanDetail, UsulanRevisi } from "@/types/models";

type ActionKey =
  | "submit"
  | "terima"
  | "teruskan"
  | "kembalikan"
  | "setujui"
  | "batal"
  | "resubmit";

interface DetailExtras {
  catatanAp?: string | null;
  catatanAm?: string | null;
  catatanAd?: string | null;
  catatanKabid?: string | null;
  catatanKepalaBadan?: string | null;
  revisi?: UsulanRevisi[];
}

const isActionKey = (value: string): value is ActionKey =>
  [
    "submit",
    "terima",
    "teruskan",
    "kembalikan",
    "setujui",
    "batal",
    "resubmit",
  ].includes(value);

const tahapToStatusKey: Record<string, string> = {
  AP: "VerifikasiAP",
  AM: "VerifikasiAM",
  AD: "QualityControl",
  Kabid: "ApprovalKabid",
  KepalaBadan: "ApprovalKepalaBadan",
};

export default function LayananDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const user = useAuthStore((state) => state.user);
  const detailQuery = useLayananDetail(id);
  const actions = useLayananAction(id);
  const uploadDokumen = useUploadDokumen(id);
  const [rowFiles, setRowFiles] = useState<Record<string, File | null>>({});
  const [uploadingRow, setUploadingRow] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [downloadingOutput, setDownloadingOutput] = useState(false);

  const usulan = detailQuery.data as
    | (UsulanDetail & DetailExtras)
    | undefined;
  const actionLoading =
    actions.submit.isPending ||
    actions.terima.isPending ||
    actions.teruskan.isPending ||
    actions.kembalikan.isPending ||
    actions.setujui.isPending ||
    actions.batal.isPending ||
    actions.resubmit.isPending;
  const canUpload =
    user?.roleNama === "Pengelola_OPD" &&
    (usulan?.status === "Draft" || usulan?.status === "Dikembalikan");

  const handleAction = (action: string, body?: Record<string, unknown>) => {
    if (!isActionKey(action)) return;
    actions[action].mutate(body);
  };

  const handleUploadRow = (rowKey: string, namaPersyaratan: string) => {
    const file = rowFiles[rowKey];
    setUploadErrors((prev) => ({ ...prev, [rowKey]: "" }));
    if (!file) {
      setUploadErrors((prev) => ({ ...prev, [rowKey]: "Pilih file terlebih dahulu." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadErrors((prev) => ({ ...prev, [rowKey]: "Ukuran file maksimal 5MB." }));
      return;
    }
    setUploadingRow(rowKey);
    uploadDokumen.mutate(
      { file, jenisDokumen: namaPersyaratan },
      {
        onSuccess: () => setRowFiles((prev) => ({ ...prev, [rowKey]: null })),
        onSettled: () => setUploadingRow(null),
      },
    );
  };

  const handleDownloadOutput = async () => {
    setDownloadingOutput(true);
    try {
      await downloadDokumenOutput(id);
    } finally {
      setDownloadingOutput(false);
    }
  };

  if (detailQuery.isLoading) {
    return (
      <div className="space-y-[25px]">
        <div className="animate-pulse rounded-xl bg-gray-200 dark:bg-[#172036] h-28" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-[25px]">
          <div className="xl:col-span-2 animate-pulse rounded-xl bg-gray-200 dark:bg-[#172036] h-96" />
          <div className="animate-pulse rounded-xl bg-gray-200 dark:bg-[#172036] h-96" />
        </div>
      </div>
    );
  }

  if (detailQuery.isError || !usulan) {
    return (
      <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">
        Gagal memuat data
      </div>
    );
  }

  // helpers
  const initials = usulan.asn.nama
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const STAGES = [
    { key: "Draft", label: "Draft", tahap: null },
    { key: "VerifikasiAP", label: "Verifikasi Analis Pertama", tahap: "AP" },
    { key: "VerifikasiAM", label: "Verifikasi Analis Muda", tahap: "AM" },
    { key: "QualityControl", label: "Quality Control Analis Madya", tahap: "AD" },
    { key: "ApprovalKabid", label: "Persetujuan Kabid", tahap: "Kabid" },
    ...(usulan.jenisLayanan.butuhTteKepalaBadan
      ? [{ key: "ApprovalKepalaBadan", label: "Persetujuan Kepala Badan", tahap: "KepalaBadan" }]
      : []),
  ] as const;

  const STATUS_ORDER = ["Draft", "VerifikasiAP", "VerifikasiAM", "QualityControl", "ApprovalKabid", "ApprovalKepalaBadan", "Selesai"];
  const activeStatusKey = usulan.status === "Selesai"
    ? "Selesai"
    : usulan.tahapSaatIni
      ? tahapToStatusKey[usulan.tahapSaatIni] ?? usulan.status
      : usulan.status === "Diajukan"
        ? "VerifikasiAP"
      : usulan.status;
  const currentIdx = STATUS_ORDER.indexOf(activeStatusKey);

  const wajibCount = usulan.jenisLayanan.persyaratanLayanan.filter((p) => p.isRequired).length;
  const wajibUploaded = usulan.jenisLayanan.persyaratanLayanan.filter(
    (p) => p.isRequired && usulan.dokumen.some((d) => d.jenisDokumen === p.namaPersyaratan),
  ).length;
  const latestReturnNote =
    usulan.revisi?.[0]?.alasanDikembalikan ??
    [...usulan.workflowLog]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .find((log) => log.aksi === "KEMBALIKAN")?.catatan ??
    null;
  const outputDokumen =
    usulan.dokumenOutput?.find((doc) => Boolean(doc.namaFile)) ?? null;

  return (
    <div className="space-y-[25px]">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[25px]">
        <div className="xl:col-span-2 space-y-[25px]">
          {/* ── Informasi Usulan ─────────────────────────── */}
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <div className="flex items-start justify-between gap-3 mb-4">
              <h5 className="!mb-0">Informasi usulan</h5>
              {canUpload && (
                <button type="button" className="inline-flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline">
                  <i className="material-symbols-outlined !text-[16px]">edit</i> Edit
                </button>
              )}
            </div>

            {/* ASN + Jenis Layanan row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-3 rounded-md border border-gray-100 dark:border-[#172036] p-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-black dark:text-white text-sm leading-tight truncate">{usulan.asn.nama}</p>
                  <p className="text-xs text-gray-500 mt-0.5">NIP {usulan.asn.nipBaru}</p>
                  <p className="text-xs text-gray-400">{usulan.unitOrganisasi.nama}</p>
                </div>
              </div>
              <div className="rounded-md border border-gray-100 dark:border-[#172036] p-3">
                <p className="text-xs text-gray-400 mb-1">JENIS LAYANAN</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-semibold">
                    <i className="material-symbols-outlined !text-[12px]">description</i>
                    {usulan.jenisLayanan.nama}
                  </span>
                  {usulan.jenisLayanan.butuhTteKepalaBadan && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-semibold">
                      <i className="material-symbols-outlined !text-[12px]">draw</i>
                      Butuh TTE Kepala Badan
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">Kode: {usulan.jenisLayanan.kode}</p>
              </div>
            </div>

            {/* Meta row */}
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-md bg-gray-50 dark:bg-[#15203c] px-3 py-2">
                <p className="text-xs text-gray-400 mb-0.5">TANGGAL USULAN</p>
                <p className="font-semibold text-black dark:text-white">{dayjs(usulan.tanggalUsulan).format("DD MMM YYYY")}</p>
              </div>
              <div className="rounded-md bg-gray-50 dark:bg-[#15203c] px-3 py-2">
                <p className="text-xs text-gray-400 mb-0.5">DIBUAT OLEH</p>
                <p className="font-semibold text-black dark:text-white truncate">{usulan.diajukanOleh?.namaLengkap ?? "-"}</p>
              </div>
              <div className="rounded-md bg-gray-50 dark:bg-[#15203c] px-3 py-2">
                <p className="text-xs text-gray-400 mb-0.5">NO. USULAN</p>
                <p className="font-semibold text-black dark:text-white text-xs">{usulan.nomorUsulan}</p>
              </div>
            </div>
          </div>

          {usulan.status === "Dikembalikan" ? (
            <div className="rounded-md border border-warning-200 bg-warning-50 px-4 py-3 text-warning-800 dark:border-warning-800/40 dark:bg-warning-900/20 dark:text-warning-200">
              <div className="flex items-start gap-2">
                <i className="material-symbols-outlined !text-[20px] mt-0.5">info</i>
                <div>
                  <p className="font-semibold">
                    Usulan dikembalikan untuk perbaikan. Perbaiki data/dokumen sesuai catatan, upload ulang dokumen yang diminta, lalu klik Kirim Ulang.
                  </p>
                  {latestReturnNote ? (
                    <p className="mt-2 text-sm">
                      Catatan pengembali: {latestReturnNote}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          <ActionButtons
            usulan={usulan}
            userRole={user?.roleNama ?? ""}
            onAction={handleAction}
            loading={actionLoading}
          />

          {usulan.status === "Selesai" ? (
            <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
              {outputDokumen ? (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h5 className="!mb-1">Dokumen Output</h5>
                    <p className="text-gray-500 dark:text-gray-400">
                      {outputDokumen.namaFile}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 py-[10px] px-[16px] bg-primary-500 text-white rounded-md disabled:opacity-70"
                    disabled={downloadingOutput}
                    onClick={() => void handleDownloadOutput()}
                  >
                    <i className="material-symbols-outlined !text-[18px]">download</i>
                    {downloadingOutput ? "Mengunduh..." : "Download Hasil"}
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-md border border-gray-100 bg-gray-50 px-4 py-3 dark:border-[#172036] dark:bg-[#15203c]">
                  <i className="material-symbols-outlined !text-[20px] text-gray-400">folder_off</i>
                  <div>
                    <h5 className="!mb-1">Dokumen Output</h5>
                    <p className="text-gray-500 dark:text-gray-400">
                      Layanan sudah selesai, tetapi dokumen hasil belum tersedia.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {usulan.slaTracker.length ? (
            <SlaCountdown slaTracker={usulan.slaTracker} />
          ) : null}

          <WorkflowTimeline logs={usulan.workflowLog} />

          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <h5 className="!mb-5">Dokumen persyaratan</h5>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Upload dokumen sesuai persyaratan. Jika dikembalikan, unggah ulang dokumen yang diminta.
            </p>
            <div className="space-y-3">
              {usulan.jenisLayanan.persyaratanLayanan.length > 0 ? (
                usulan.jenisLayanan.persyaratanLayanan.map((p) => {
                  const rowKey = String(p.id);
                  const uploaded = usulan.dokumen.find(
                    (d) => d.jenisDokumen === p.namaPersyaratan,
                  );
                  const isUploading = uploadingRow === rowKey;
                  return (
                    <div
                      key={rowKey}
                      className={`rounded-md border px-4 py-3 ${
                        uploaded
                          ? "border-success-200 bg-success-50 dark:border-success-800/40 dark:bg-success-900/10"
                          : "border-gray-200 dark:border-[#172036]"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <i
                          className={`material-symbols-outlined !text-[18px] ${
                            uploaded ? "text-success-500" : "text-gray-400"
                          }`}
                        >
                          {uploaded ? "check_circle" : "radio_button_unchecked"}
                        </i>
                        <span className="font-medium text-sm text-black dark:text-white">
                          {p.namaPersyaratan}
                        </span>
                        {!uploaded && (
                          <span className={`text-xs font-semibold ${p.isRequired ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-gray-500"}`}>
                            {p.isRequired ? "Wajib" : "Opsional"}
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            isUploading
                              ? "bg-warning-100 text-warning-700 dark:bg-warning-900/20 dark:text-warning-300"
                              : uploaded
                                ? "bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-300"
                                : "bg-gray-100 text-gray-600 dark:bg-[#15203c] dark:text-gray-300"
                          }`}
                        >
                          {isUploading ? "Sedang diunggah" : uploaded ? "Terunggah" : "Belum diunggah"}
                        </span>
                        {uploaded && (
                          <a
                            href={uploaded.pathFile}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-auto flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
                          >
                            <i className="material-symbols-outlined !text-[14px]">open_in_new</i>
                            {uploaded.namaFile}
                          </a>
                        )}
                      </div>

                      {canUpload && (
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <input
                            type="file"
                            className="text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#172036] rounded-md px-3 py-1.5 bg-white dark:bg-[#0c1427] w-full sm:w-auto"
                            onChange={(e) =>
                              setRowFiles((prev) => ({
                                ...prev,
                                [rowKey]: e.target.files?.[0] ?? null,
                              }))
                            }
                          />
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary-500 text-white text-sm rounded-md disabled:opacity-60 shrink-0"
                            disabled={isUploading || !rowFiles[rowKey]}
                            onClick={() => handleUploadRow(rowKey, p.namaPersyaratan)}
                          >
                            <i className="material-symbols-outlined !text-[16px]">upload</i>
                            {isUploading ? "Mengunggah..." : uploaded ? "Upload Ulang" : "Upload"}
                          </button>
                          {uploadErrors[rowKey] && (
                            <p className="w-full text-xs text-danger-500 mt-0.5">
                              {uploadErrors[rowKey]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : usulan.dokumen.length ? (
                usulan.dokumen.map((doc) => (
                  <a
                    className="flex items-center justify-between gap-4 rounded-md border border-gray-100 dark:border-[#172036] px-4 py-3 hover:border-primary-500"
                    href={doc.pathFile}
                    key={doc.id}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>
                      <span className="block font-semibold text-black dark:text-white">
                        {doc.namaFile}
                      </span>
                      <span className="text-sm text-gray-500">
                        {doc.jenisDokumen ?? "Dokumen"} • {doc.ukuran ?? "-"}
                      </span>
                    </span>
                    <i className="material-symbols-outlined">open_in_new</i>
                  </a>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Belum ada dokumen.</p>
              )}
            </div>
            {wajibCount > 0 && (
              <p className={`mt-4 text-sm font-medium ${wajibUploaded >= wajibCount ? "text-success-600 dark:text-success-400" : "text-gray-500 dark:text-gray-400"}`}>
                Kelengkapan dokumen: {wajibUploaded}/{wajibCount} wajib
              </p>
            )}
          </div>

        </div>

        {/* ── Sidebar kanan ─────────────────────────────── */}
        <div className="space-y-[25px]">

          {/* Info Cepat */}
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <h5 className="!mb-4">Info cepat</h5>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-500">Status</span>
                <StatusBadge status={usulan.status} />
              </div>
              {usulan.tahapSaatIni && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500">Tahap aktif</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-semibold">
                    {displayTahapLabel(usulan.tahapSaatIni)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-500">No. usulan</span>
                <span className="font-mono text-xs font-semibold text-black dark:text-white">{usulan.nomorUsulan}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-500">Dibuat</span>
                <span className="font-semibold text-black dark:text-white">{dayjs(usulan.createdAt).format("DD MMM YYYY")}</span>
              </div>
            </div>
          </div>

          {/* Alur Persetujuan */}
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <h5 className="!mb-4">Alur persetujuan</h5>
            <div className="relative">
              {STAGES.map((stage, idx) => {
                const stageIdx = STATUS_ORDER.indexOf(stage.key);
                const isDone = currentIdx > stageIdx || usulan.status === "Selesai";
                const isActive = !isDone && currentIdx === stageIdx;
                return (
                  <div key={stage.key} className="flex items-start gap-3 mb-3 last:mb-0">
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`w-3 h-3 rounded-full mt-0.5 ${isDone ? "bg-success-500" : isActive ? "bg-primary-500" : "bg-gray-200 dark:bg-gray-700"}`} />
                      {idx < STAGES.length - 1 && (
                        <div className={`w-0.5 h-5 mt-1 ${isDone ? "bg-success-300 dark:bg-success-700" : "bg-gray-200 dark:bg-gray-700"}`} />
                      )}
                    </div>
                    <div className="flex items-center justify-between w-full gap-2 min-w-0">
                      <span className={`text-sm ${isDone ? "text-gray-700 dark:text-gray-300" : isActive ? "font-semibold text-black dark:text-white" : "text-gray-400 dark:text-gray-600"}`}>
                        {stage.label}
                      </span>
                      {isDone && (
                        <span className="text-xs font-semibold text-success-600 dark:text-success-400 shrink-0">Selesai</span>
                      )}
                      {isActive && (
                        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 shrink-0">Aktif</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Catatan Per Tahap */}
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <h5 className="!mb-2">Catatan per tahap</h5>
            {[
              ["AP", usulan.catatanAp],
              ["AM", usulan.catatanAm],
              ["Kabid", usulan.catatanKabid],
              ["Kepala Badan", usulan.catatanKepalaBadan],
            ].map(([label, note]) => (
              <div className="border-b border-gray-100 dark:border-[#172036] py-2.5 last:border-b-0" key={label}>
                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">{label}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{note || "Belum ada catatan"}</span>
              </div>
            ))}
          </div>

          {/* Riwayat Revisi */}
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <h5 className="!mb-3">Riwayat revisi</h5>
            {usulan.revisi?.length ? (
              <div className="space-y-3">
                {usulan.revisi.map((item) => (
                  <div className="rounded-md bg-gray-50 dark:bg-[#15203c] p-3" key={item.id}>
                    <span className="block text-sm font-semibold text-black dark:text-white">Revisi #{item.nomorRevisi}</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.alasanDikembalikan}</p>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {item.dikembalikanOleh?.namaLengkap ?? "Sistem"} • {dayjs(item.tglDikembalikan).format("DD/MM/YYYY")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <i className="material-symbols-outlined !text-[18px]">history</i>
                Belum ada riwayat revisi
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
