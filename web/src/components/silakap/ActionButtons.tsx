"use client";

import { useState } from "react";
import ConfirmModal from "./ConfirmModal";
import type { UsulanDetail } from "@/types/models";

interface ActionButtonsProps {
  usulan: UsulanDetail;
  userRole: string;
  onAction: (action: string, body?: Record<string, unknown>) => void;
  loading?: boolean;
}

type ModalAction = "teruskan" | "kembalikan" | "setujui" | "batal" | null;

const analystRoleMatchesTahap = (role: string, tahap: string | null) =>
  (tahap === "AP" && role === "Analis_Pertama") ||
  (tahap === "AM" && role === "Analis_Muda") ||
  (tahap === "AD" && role === "Analis_Madya");

const roleMatchesActiveTahap = (role: string, tahap: string | null) =>
  analystRoleMatchesTahap(role, tahap) ||
  (tahap === "Kabid" && role === "Kabid") ||
  (tahap === "KepalaBadan" && role === "Kepala_Badan");

const modalConfig: Record<
  Exclude<ModalAction, null>,
  {
    title: string;
    label: string;
    placeholder: string;
    requireText: boolean;
    color: "green" | "yellow" | "red";
  }
> = {
  teruskan: {
    title: "Teruskan Usulan",
    label: "Teruskan",
    placeholder: "Catatan opsional",
    requireText: false,
    color: "green",
  },
  kembalikan: {
    title: "Kembalikan Usulan",
    label: "Kembalikan",
    placeholder: "Tuliskan alasan pengembalian",
    requireText: true,
    color: "yellow",
  },
  setujui: {
    title: "Setujui Usulan",
    label: "Setujui",
    placeholder: "Catatan opsional",
    requireText: false,
    color: "green",
  },
  batal: {
    title: "Batalkan Usulan",
    label: "Batalkan",
    placeholder: "Tuliskan alasan pembatalan",
    requireText: true,
    color: "red",
  },
};

export default function ActionButtons({
  usulan,
  userRole,
  onAction,
  loading = false,
}: ActionButtonsProps) {
  const [modalAction, setModalAction] = useState<ModalAction>(null);

  const showSubmit = usulan.status === "Draft" && userRole === "Pengelola_OPD";
  const showTerima =
    usulan.status === "Diajukan" && userRole === "Analis_Pertama";
  const showTeruskan = analystRoleMatchesTahap(userRole, usulan.tahapSaatIni);
  const showKembalikan = roleMatchesActiveTahap(userRole, usulan.tahapSaatIni);
  const showSetujui =
    (usulan.tahapSaatIni === "Kabid" && userRole === "Kabid") ||
    (usulan.tahapSaatIni === "KepalaBadan" && userRole === "Kepala_Badan");
  const showBatal =
    (usulan.status === "Draft" && userRole === "Pengelola_OPD") ||
    userRole === "Admin_Sistem";
  const showResubmit =
    usulan.status === "Dikembalikan" && userRole === "Pengelola_OPD";

  const config = modalAction ? modalConfig[modalAction] : null;

  const handleModalConfirm = (value: string) => {
    if (!modalAction) return;

    if (modalAction === "kembalikan" || modalAction === "batal") {
      onAction(modalAction, { alasan: value });
    } else {
      onAction(modalAction, value ? { catatan: value } : undefined);
    }

    setModalAction(null);
  };

  const contextMsg: string | null = (() => {
    if (showSubmit) return "Pastikan semua dokumen wajib sudah diunggah sebelum submit.";
    if (showTerima) return "Terdapat usulan baru yang menunggu konfirmasi Anda.";
    if (showResubmit) return "Perbaikan selesai? Klik Kirim Ulang untuk meneruskan ke Analis.";
    if (showSetujui) return "Tinjau usulan, lalu berikan persetujuan atau kembalikan untuk perbaikan.";
    if (showTeruskan) return "Periksa kelengkapan dokumen, lalu teruskan ke tahap berikutnya atau kembalikan.";
    return null;
  })();

  const hasAnyAction = showSubmit || showTerima || showTeruskan || showSetujui || showKembalikan || showBatal || showResubmit;

  return (
    <div className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036]">
      <div className="mb-4">
        <h5 className="!mb-0">Aksi tersedia</h5>
        {contextMsg && hasAnyAction && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{contextMsg}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {showSubmit ? (
          <button
            type="button"
            className="inline-flex items-center gap-2 py-[10px] px-[20px] bg-primary-500 text-white transition-all hover:bg-primary-400 rounded-md"
            onClick={() => onAction("submit")}
            disabled={loading}
          >
            <i className="material-symbols-outlined !text-[18px]">upload</i>
            Submit
          </button>
        ) : null}
        {showTerima ? (
          <button
            type="button"
            className="inline-flex items-center gap-2 py-[10px] px-[20px] bg-primary-500 text-white transition-all hover:bg-primary-400 rounded-md"
            onClick={() => onAction("terima")}
            disabled={loading}
          >
            <i className="material-symbols-outlined !text-[18px]">check</i>
            Terima
          </button>
        ) : null}
        {showTeruskan ? (
          <button
            type="button"
            className="inline-flex items-center gap-2 py-[10px] px-[20px] bg-success-500 text-white transition-all hover:bg-success-400 rounded-md"
            onClick={() => setModalAction("teruskan")}
            disabled={loading}
          >
            <i className="material-symbols-outlined !text-[18px]">
              arrow_right_alt
            </i>
            Teruskan
          </button>
        ) : null}
        {showSetujui ? (
          <button
            type="button"
            className="inline-flex items-center gap-2 py-[10px] px-[20px] bg-success-500 text-white transition-all hover:bg-success-400 rounded-md"
            onClick={() => setModalAction("setujui")}
            disabled={loading}
          >
            <i className="material-symbols-outlined !text-[18px]">verified</i>
            Setujui
          </button>
        ) : null}
        {showKembalikan ? (
          <button
            type="button"
            className="inline-flex items-center gap-2 py-[10px] px-[20px] bg-warning-500 text-black transition-all hover:bg-warning-400 rounded-md"
            onClick={() => setModalAction("kembalikan")}
            disabled={loading}
          >
            <i className="material-symbols-outlined !text-[18px]">
              keyboard_return
            </i>
            Kembalikan
          </button>
        ) : null}
        {showBatal ? (
          <button
            type="button"
            className="inline-flex items-center gap-2 py-[10px] px-[20px] bg-danger-500 text-white transition-all hover:bg-danger-400 rounded-md"
            onClick={() => setModalAction("batal")}
            disabled={loading}
          >
            <i className="material-symbols-outlined !text-[18px]">cancel</i>
            Batal
          </button>
        ) : null}
        {showResubmit ? (
          <button
            type="button"
            className="inline-flex items-center gap-2 py-[10px] px-[20px] bg-primary-500 text-white transition-all hover:bg-primary-400 rounded-md"
            onClick={() => onAction("resubmit")}
            disabled={loading}
          >
            <i className="material-symbols-outlined !text-[18px]">refresh</i>
            Kirim Ulang
          </button>
        ) : null}
        {!showSubmit &&
        !showTerima &&
        !showTeruskan &&
        !showSetujui &&
        !showKembalikan &&
        !showBatal &&
        !showResubmit ? (
          <p className="text-gray-500 dark:text-gray-400">
            Tidak ada aksi yang tersedia.
          </p>
        ) : null}
      </div>

      {config ? (
        <ConfirmModal
          isOpen={Boolean(modalAction)}
          title={config.title}
          onClose={() => setModalAction(null)}
          onConfirm={handleModalConfirm}
          requireText={config.requireText}
          placeholder={config.placeholder}
          confirmLabel={config.label}
          confirmColor={config.color}
          loading={loading}
        />
      ) : null}
    </div>
  );
}
