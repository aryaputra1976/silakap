"use client";

import { useRef, useState, type ReactNode } from "react";
import UnitOrganisasiTree from "@/components/silakap/UnitOrganisasiTree";
import {
  useRefActions,
  useRefGolonganAdmin,
  useRefJenisLayananAdmin,
  useRefUnitAdmin,
} from "@/hooks/useAdmin";

interface ImportResult {
  total: number;
  berhasil: number;
  diperbarui: number;
  errors: Array<{ baris: number; pesan: string }>;
}

export default function ReferensiPage() {
  const golongan = useRefGolonganAdmin();
  const unit = useRefUnitAdmin();
  const jenis = useRefJenisLayananAdmin();
  const { importUnitOrganisasi } = useRefActions();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportResult(null);
    setImportError(null);
    try {
      const response = await importUnitOrganisasi.mutateAsync(file);
      setImportResult(response.data.data);
    } catch (error: unknown) {
      const apiError = error as { code?: string; response?: { data?: { message?: string } } };
      const message =
        apiError.response?.data?.message ??
        (apiError.code === "ECONNABORTED"
          ? "Import masih diproses terlalu lama. Refresh data referensi untuk memastikan hasilnya."
          : "Gagal mengimpor file");
      setImportError(message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">Referensi</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Data master untuk membantu verifikasi layanan
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[25px]">
        <ReferencePanel title="Golongan" loading={golongan.isLoading}>
          {(golongan.data ?? []).map((item) => (
            <div
              className="flex items-center justify-between border-b border-gray-100 py-2 dark:border-[#172036]"
              key={item.id}
            >
              <span>{item.nama}</span>
              <span className="font-semibold">{item.kode}</span>
            </div>
          ))}
        </ReferencePanel>

        <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md xl:col-span-2">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h5 className="!mb-0">Unit Organisasi</h5>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                disabled={importUnitOrganisasi.isPending}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-[40px] items-center gap-2 rounded-md bg-primary-500 px-4 text-sm text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                {importUnitOrganisasi.isPending ? "Mengimpor..." : "Import SIASN"}
              </button>
            </div>
          </div>

          {importResult ? (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm dark:border-green-800 dark:bg-green-900/20">
              <p className="font-medium text-green-800 dark:text-green-300">
                Import selesai - {importResult.total} baris diproses
              </p>
              <p className="text-green-700 dark:text-green-400">
                {importResult.berhasil} ditambahkan, {importResult.diperbarui} diperbarui
              </p>
              {importResult.errors.length > 0 ? (
                <details className="mt-2">
                  <summary className="cursor-pointer text-amber-700 dark:text-amber-400">
                    {importResult.errors.length} error
                  </summary>
                  <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-amber-700 dark:text-amber-400">
                    {importResult.errors.map((item, index) => (
                      <li key={index}>{item.baris > 0 ? `Baris ${item.baris}: ` : ""}{item.pesan}</li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </div>
          ) : null}

          {importError ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {importError}
            </div>
          ) : null}

          <UnitOrganisasiTree units={unit.data ?? []} loading={unit.isLoading} maxHeightClass="max-h-[560px]" />
        </div>

        <ReferencePanel title="Jenis Layanan" loading={jenis.isLoading}>
          {(jenis.data ?? []).map((item) => (
            <div className="border-b border-gray-100 py-2 dark:border-[#172036]" key={item.id}>
              <span className="block font-medium">{item.nama}</span>
              <span className="text-sm text-gray-500">
                {item.kode} - {item.butuhTteKepalaBadan ? "TTE KB" : "Tanpa TTE KB"}
              </span>
            </div>
          ))}
        </ReferencePanel>
      </div>
    </div>
  );
}

function ReferencePanel({
  title,
  loading,
  children,
}: {
  title: string;
  loading: boolean;
  children: ReactNode;
}) {
  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
      <h5>{title}</h5>
      {loading ? (
        <div className="animate-pulse h-40 bg-gray-200 dark:bg-[#172036] rounded-md" />
      ) : (
        <div className="max-h-[520px] overflow-y-auto">{children}</div>
      )}
    </div>
  );
}
