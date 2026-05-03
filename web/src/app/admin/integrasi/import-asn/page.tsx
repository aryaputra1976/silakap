"use client";

import { useRef, useState } from "react";
import { useDiagnosaAsn, useImportAsn } from "@/hooks/useAdmin";

const importErrorMessage = (error: unknown) => {
  const err = error as {
    code?: string;
    message?: string;
    response?: { data?: { message?: string } };
  };
  if (err.code === "ECONNABORTED" || err.message?.toLowerCase().includes("timeout")) {
    return "Import masih diproses di server tetapi browser kehabisan waktu menunggu. Cek Log Import untuk hasil akhirnya.";
  }
  return err.response?.data?.message ?? "Import gagal. Cek format file dan pastikan kolom NIP & Nama tersedia.";
};

export default function ImportAsnPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importAsn = useImportAsn();
  const diagnosa = useDiagnosaAsn();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null);
    importAsn.reset();
    diagnosa.reset();
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    importAsn.reset();
    diagnosa.reset();
  };

  const handleImport = () => {
    if (!selectedFile) return;
    importAsn.mutate(selectedFile, { onSuccess: clearFile });
  };

  const handleDiagnosa = () => {
    if (!selectedFile) return;
    diagnosa.mutate(selectedFile);
  };

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">Import ASN dari Excel</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Upload file Excel hasil export SIASN. Kolom minimal: NIP, Nama.
        </p>
      </div>

      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <h5>Upload File</h5>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Kolom minimal: NIP, Nama. Opsional: NIK, Email, Nomor HP, Unit Organisasi ID.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            suppressHydrationWarning
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 py-[10px] px-[20px] rounded-md border border-gray-300 dark:border-[#172036] bg-white dark:bg-[#0c1427] hover:bg-gray-50 dark:hover:bg-[#172036] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            Pilih File Excel
          </button>

          {selectedFile && (
            <>
              <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-success-500">description</span>
                {selectedFile.name}
                <button
                  type="button"
                  className="ml-1 text-gray-400 hover:text-danger-500 transition-colors"
                  onClick={clearFile}
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </span>

              <button
                type="button"
                onClick={handleDiagnosa}
                disabled={diagnosa.isPending || importAsn.isPending}
                className="inline-flex items-center gap-2 py-[10px] px-[20px] rounded-md border border-gray-300 dark:border-[#172036] bg-white dark:bg-[#0c1427] hover:bg-gray-50 dark:hover:bg-[#172036] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {diagnosa.isPending ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Mendiagnosa...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">search</span>
                    Diagnosa Kolom
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleImport}
                disabled={importAsn.isPending || diagnosa.isPending}
                className="inline-flex items-center gap-2 py-[10px] px-[20px] rounded-md bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {importAsn.isPending ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Mengimpor...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                    Mulai Import
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {diagnosa.isSuccess && diagnosa.data && (() => {
          const d = diagnosa.data.data.data;
          return (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-[#172036] rounded-md text-sm space-y-3">
              <p className="font-medium">Hasil Diagnosa — {d.totalBaris} baris terdeteksi</p>
              <div className="flex flex-wrap gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${d.deteksi.nip.startsWith("OK") ? "bg-success-100 text-success-700" : "bg-danger-100 text-danger-700"}`}>
                  <span className="material-symbols-outlined text-[14px]">{d.deteksi.nip.startsWith("OK") ? "check_circle" : "error"}</span>
                  NIP: {d.deteksi.nip}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${d.deteksi.nama.startsWith("OK") ? "bg-success-100 text-success-700" : "bg-danger-100 text-danger-700"}`}>
                  <span className="material-symbols-outlined text-[14px]">{d.deteksi.nama.startsWith("OK") ? "check_circle" : "error"}</span>
                  Nama: {d.deteksi.nama}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Kolom yang terdeteksi di Excel:</p>
                <div className="flex flex-wrap gap-1.5">
                  {d.kolom.map((k) => (
                    <code key={k.asli} className="px-2 py-0.5 bg-white dark:bg-[#0c1427] border border-gray-200 dark:border-[#253350] rounded text-xs">{k.asli}</code>
                  ))}
                </div>
              </div>
              {!d.deteksi.nip.startsWith("OK") || !d.deteksi.nama.startsWith("OK") ? (
                <p className="text-xs text-warning-600">Ganti nama kolom di Excel agar sesuai, lalu pilih ulang file dan import.</p>
              ) : (
                <p className="text-xs text-success-600">Kolom terdeteksi dengan benar. Silakan klik Mulai Import.</p>
              )}
            </div>
          );
        })()}

        {importAsn.isSuccess && (() => {
          const result = importAsn.data.data.data;
          const hasFailedRows = result.failedBaris > 0;
          return (
            <p className={`mt-3 text-sm flex items-center gap-1.5 ${hasFailedRows ? "text-warning-600" : "text-success-600"}`}>
              <span className="material-symbols-outlined text-[16px]">
                {hasFailedRows ? "warning" : "check_circle"}
              </span>
              Import selesai: {result.successBaris} sukses, {result.failedBaris} gagal.
              {hasFailedRows ? " Unduh Excel error di Log Import untuk detail." : " Lihat log untuk detail hasilnya."}
            </p>
          );
        })()}

        {importAsn.isError && (
          <p className="mt-3 text-sm text-danger-500 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {importErrorMessage(importAsn.error)}
          </p>
        )}
      </div>
    </div>
  );
}
