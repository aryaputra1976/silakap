"use client";

import { useRef, useState } from "react";
import { useRefActions } from "@/hooks/useAdmin";

interface ImportBulkResult {
  total: number;
  berhasil: number;
  diperbarui: number;
  errors: Array<{ baris: number; pesan: string }>;
}

function RefImportCard({
  label,
  hint,
  mutateAsync,
  isPending,
}: {
  label: string;
  hint: string;
  mutateAsync: (file: File) => Promise<{ data: { data: ImportBulkResult } }>;
  isPending: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportBulkResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null);
    setResult(null);
    setError(null);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setResult(null);
    setError(null);
    try {
      const res = await mutateAsync(selectedFile);
      setResult(res.data.data);
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string }; status?: number }; code?: string };
      setError(
        apiErr?.response?.data?.message ??
        (apiErr?.response?.status ? `Error ${apiErr.response.status} dari server` :
         apiErr?.code === "ECONNABORTED" ? "Import terlalu lama, cek log untuk hasilnya." :
         "Tidak dapat terhubung ke server")
      );
    }
  };

  return (
    <div className="border border-gray-100 dark:border-[#172036] rounded-md p-4">
      <h6 className="!mb-1 text-[15px]">{label}</h6>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{hint}</p>

      <div className="flex flex-wrap items-center gap-2">
        <input
          suppressHydrationWarning
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          disabled={isPending}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 py-[8px] px-[14px] rounded-md border border-gray-300 dark:border-[#172036] bg-white dark:bg-[#0c1427] hover:bg-gray-50 dark:hover:bg-[#172036] disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-[16px]">upload_file</span>
          Pilih File Excel
        </button>

        {selectedFile && (
          <>
            <span className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-success-500">description</span>
              {selectedFile.name}
              <button type="button" className="ml-0.5 text-gray-400 hover:text-danger-500 transition-colors" onClick={clearFile}>
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </span>
            <button
              type="button"
              disabled={isPending}
              onClick={() => void handleImport()}
              className="inline-flex items-center gap-1.5 py-[8px] px-[14px] rounded-md bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-70 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isPending ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  Mengimpor...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  Mulai Import
                </>
              )}
            </button>
          </>
        )}
      </div>

      {result && (
        <div className="mt-3 p-3 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded text-sm">
          <p className="font-medium text-success-700 dark:text-success-400">
            {result.total} baris: {result.berhasil} ditambahkan · {result.diperbarui} diperbarui
          </p>
          {result.errors.length > 0 && (
            <details className="mt-1">
              <summary className="cursor-pointer text-warning-600 text-xs">{result.errors.length} baris error — klik detail</summary>
              <ul className="mt-1 space-y-0.5 text-xs text-warning-600 list-disc list-inside">
                {result.errors.slice(0, 10).map((e, i) => (
                  <li key={i}>{e.baris > 0 ? `Baris ${e.baris}: ` : ""}{e.pesan}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
      {error && (
        <div className="mt-3 p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded text-sm text-danger-700 dark:text-danger-400">
          {error}
        </div>
      )}
    </div>
  );
}

export default function ImportReferensiPage() {
  const actions = useRefActions();

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">Import Referensi SIASN</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Import data referensi dari hasil export SIASN. Data baru ditambahkan, data yang sudah ada diperbarui (upsert).
        </p>
      </div>

      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <h5>Unit Organisasi & Jabatan</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] mt-4">
          <RefImportCard
            label="Unit Organisasi (UNOR)"
            hint="Kolom: UNOR ID, UNOR NAMA. Opsional: ID ATASAN, LEVEL"
            mutateAsync={actions.importUnitOrganisasi.mutateAsync}
            isPending={actions.importUnitOrganisasi.isPending}
          />
          <RefImportCard
            label="Jabatan Struktural"
            hint="Kolom: JABATAN ID, JABATAN NAMA, UNOR ID. Opsional: ESELON ID, BUP"
            mutateAsync={actions.importJabatanStruktural.mutateAsync}
            isPending={actions.importJabatanStruktural.isPending}
          />
          <RefImportCard
            label="Jabatan Fungsional"
            hint="Kolom: JABATAN ID, JABATAN NAMA. Opsional: KODE JABATAN, JENJANG, BUP"
            mutateAsync={actions.importJabatanFungsional.mutateAsync}
            isPending={actions.importJabatanFungsional.isPending}
          />
          <RefImportCard
            label="Jabatan Pelaksana"
            hint="Kolom: JABATAN ID, JABATAN NAMA. Opsional: KODE JABATAN"
            mutateAsync={actions.importJabatanPelaksana.mutateAsync}
            isPending={actions.importJabatanPelaksana.isPending}
          />
        </div>
      </div>
    </div>
  );
}
