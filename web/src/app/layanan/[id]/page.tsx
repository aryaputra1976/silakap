"use client";

import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { FormEvent, useState } from "react";
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

export default function LayananDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const user = useAuthStore((state) => state.user);
  const detailQuery = useLayananDetail(id);
  const actions = useLayananAction(id);
  const uploadDokumen = useUploadDokumen(id);
  const [file, setFile] = useState<File | null>(null);
  const [jenisDokumen, setJenisDokumen] = useState("");
  const [uploadError, setUploadError] = useState("");
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

  const handleUpload = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadError("");

    if (!file) {
      setUploadError("Pilih file terlebih dahulu.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran file maksimal 5MB.");
      return;
    }

    uploadDokumen.mutate(
      { file, jenisDokumen: jenisDokumen || undefined },
      {
        onSuccess: () => {
          setFile(null);
          setJenisDokumen("");
        },
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

  return (
    <div className="space-y-[25px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="!mb-0">{usulan.nomorUsulan}</h1>
            <StatusBadge status={usulan.status} />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Tanggal usulan{" "}
            {dayjs(usulan.tanggalUsulan).format("DD/MM/YYYY")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[25px]">
        <div className="xl:col-span-2 space-y-[25px]">
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <h5>Informasi Usulan</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
              <div className="rounded-md bg-gray-50 dark:bg-[#15203c] p-4">
                <span className="text-sm text-gray-500">ASN</span>
                <h6 className="!mb-1">{usulan.asn.nama}</h6>
                <p>NIP: {usulan.asn.nipBaru}</p>
                <p>Unit: {usulan.unitOrganisasi.nama}</p>
              </div>
              <div className="rounded-md bg-gray-50 dark:bg-[#15203c] p-4">
                <span className="text-sm text-gray-500">Jenis Layanan</span>
                <h6 className="!mb-1">{usulan.jenisLayanan.nama}</h6>
                <p>Kode: {usulan.jenisLayanan.kode}</p>
                <p>
                  TTE Kepala Badan:{" "}
                  {usulan.jenisLayanan.butuhTteKepalaBadan ? "Ya" : "Tidak"}
                </p>
              </div>
            </div>
          </div>

          {usulan.status === "Selesai" ? (
            <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h5 className="!mb-1">Dokumen Output</h5>
                  <p className="text-gray-500 dark:text-gray-400">
                    {usulan.dokumenOutput?.[0]?.namaFile ?? "Dokumen hasil layanan siap diunduh"}
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
            </div>
          ) : null}

          {usulan.slaTracker.length ? (
            <SlaCountdown slaTracker={usulan.slaTracker} />
          ) : null}

          <WorkflowTimeline logs={usulan.workflowLog} />

          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <div className="trezo-card-header mb-[20px] md:mb-[25px]">
              <h5 className="!mb-0">Dokumen</h5>
            </div>
            <div className="space-y-3">
              {usulan.dokumen.length ? (
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
                <p className="text-gray-500 dark:text-gray-400">
                  Belum ada dokumen.
                </p>
              )}
            </div>

            {canUpload ? (
              <form className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={handleUpload}>
                <input
                  type="file"
                  className="rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] py-[12px] block w-full outline-0"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                />
                <input
                  type="text"
                  className="h-[49px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0"
                  placeholder="Jenis dokumen"
                  value={jenisDokumen}
                  onChange={(event) => setJenisDokumen(event.target.value)}
                />
                <button
                  type="submit"
                  className="h-[49px] bg-primary-500 text-white rounded-md disabled:opacity-70"
                  disabled={uploadDokumen.isPending}
                >
                  {uploadDokumen.isPending ? "Mengunggah..." : "Upload"}
                </button>
                {file ? (
                  <p className="md:col-span-3 text-sm text-gray-500">
                    File dipilih: {file.name}
                  </p>
                ) : null}
                {uploadError ? (
                  <p className="md:col-span-3 text-sm text-danger-500">
                    {uploadError}
                  </p>
                ) : null}
              </form>
            ) : null}
          </div>

          <ActionButtons
            usulan={usulan}
            userRole={user?.roleNama ?? ""}
            onAction={handleAction}
            loading={actionLoading}
          />
        </div>

        <div className="space-y-[25px]">
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <h5>Info Cepat</h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span>Status</span>
                <StatusBadge status={usulan.status} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Tahap</span>
                <span className="font-semibold">{usulan.tahapSaatIni ?? "-"}</span>
              </div>
              {usulan.slaTracker.map((tracker) => (
                <div
                  className="rounded-md bg-gray-50 dark:bg-[#15203c] p-3"
                  key={tracker.id}
                >
                  <span className="block font-semibold">
                    Tahap {tracker.tahapSaat}
                  </span>
                  <span className="text-sm text-gray-500">
                    Masuk {dayjs(tracker.masukTahap).format("DD/MM/YYYY HH:mm")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <h5>Catatan Per Tahap</h5>
            {[
              ["AP", usulan.catatanAp],
              ["AM", usulan.catatanAm],
              ["AD", usulan.catatanAd],
              ["Kabid", usulan.catatanKabid],
              ["Kepala Badan", usulan.catatanKepalaBadan],
            ].map(([label, note]) => (
              <div
                className="border-b border-gray-100 dark:border-[#172036] py-3 last:border-b-0"
                key={label}
              >
                <span className="block font-semibold">{label}</span>
                <span className="text-sm text-gray-500">
                  {note || "Belum ada catatan"}
                </span>
              </div>
            ))}
          </div>

          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <h5>Riwayat Revisi</h5>
            {usulan.revisi?.length ? (
              <div className="space-y-3">
                {usulan.revisi.map((item) => (
                  <div
                    className="rounded-md bg-gray-50 dark:bg-[#15203c] p-3"
                    key={item.id}
                  >
                    <span className="block font-semibold">
                      Revisi #{item.nomorRevisi}
                    </span>
                    <p className="text-sm">{item.alasanDikembalikan}</p>
                    <span className="text-xs text-gray-500">
                      {item.dikembalikanOleh?.namaLengkap ?? "Sistem"} •{" "}
                      {dayjs(item.tglDikembalikan).format("DD/MM/YYYY")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Belum ada revisi.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
