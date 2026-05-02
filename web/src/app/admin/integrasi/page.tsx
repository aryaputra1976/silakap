"use client";

import { useRef, useState } from "react";
import {
  downloadImportErrors,
  useDiagnosaAsn,
  useImportAsn,
  useIntegrasiLog,
  useIntegrasiStatus,
  useRefActions,
  useRunValidasi,
  useValidasiData,
} from "@/hooks/useAdmin";

const statusClass = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized.includes("sukses") || normalized.includes("success")) return "bg-success-100 text-success-700";
  if (normalized.includes("gagal") || normalized.includes("fail")) return "bg-danger-100 text-danger-700";
  if (normalized.includes("proses") || normalized.includes("processing")) return "bg-warning-100 text-warning-700";
  return "bg-gray-100 text-gray-700";
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));

const importErrorMessage = (error: unknown) => {
  const err = error as {
    code?: string;
    message?: string;
    response?: { data?: { message?: string } };
  };

  if (err.code === "ECONNABORTED" || err.message?.toLowerCase().includes("timeout")) {
    return "Import masih diproses di server tetapi browser kehabisan waktu menunggu. Cek Log Import di bawah untuk hasil akhirnya.";
  }

  return err.response?.data?.message ?? "Import gagal. Cek format file dan pastikan kolom NIP & Nama tersedia.";
};

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
        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
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
          <p className="font-medium text-success-700 dark:text-success-400">{result.total} baris: {result.berhasil} ditambahkan · {result.diperbarui} diperbarui</p>
          {result.errors.length > 0 && (
            <details className="mt-1">
              <summary className="cursor-pointer text-warning-600 text-xs">{result.errors.length} baris error — klik detail</summary>
              <ul className="mt-1 space-y-0.5 text-xs text-warning-600 list-disc list-inside">
                {result.errors.slice(0, 10).map((e, i) => <li key={i}>{e.baris > 0 ? `Baris ${e.baris}: ` : ""}{e.pesan}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}
      {error && (
        <div className="mt-3 p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded text-sm text-danger-700 dark:text-danger-400">{error}</div>
      )}
    </div>
  );
}

export default function AdminIntegrasiPage() {
  const [page, setPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const status = useIntegrasiStatus();
  const validasi = useValidasiData();
  const runValidasi = useRunValidasi();
  const importAsn = useImportAsn();
  const diagnosa = useDiagnosaAsn();
  const actions = useRefActions();
  const log = useIntegrasiLog({ page, limit: 10 });

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
        <h1 className="!mb-1">Integrasi & Validasi Data</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Monitoring import SIASN dan kualitas data ASN
        </p>
      </div>

      <div id="import-asn" className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <h5>Import ASN dari Excel</h5>
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
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${d.deteksi.nip.startsWith('OK') ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'}`}>
                  <span className="material-symbols-outlined text-[14px]">{d.deteksi.nip.startsWith('OK') ? 'check_circle' : 'error'}</span>
                  NIP: {d.deteksi.nip}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${d.deteksi.nama.startsWith('OK') ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'}`}>
                  <span className="material-symbols-outlined text-[14px]">{d.deteksi.nama.startsWith('OK') ? 'check_circle' : 'error'}</span>
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
              {!d.deteksi.nip.startsWith('OK') || !d.deteksi.nama.startsWith('OK') ? (
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
              {hasFailedRows ? " Unduh Excel error di Log Import untuk detail." : " Lihat log di bawah untuk detail hasilnya."}
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

      <div id="import-referensi" className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <h5>Import Referensi SIASN</h5>
        <p className="text-gray-500 dark:text-gray-400 mb-5">
          Import data referensi dari hasil export SIASN. Data baru ditambahkan, data yang sudah ada diperbarui (upsert).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
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

      <div>
        <h5>Status Import</h5>
        {status.isLoading ? (
          <div className="animate-pulse h-32 bg-gray-200 dark:bg-[#172036] rounded-md" />
        ) : status.isError ? (
          <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">
            Gagal memuat status import
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
            {(status.data ?? []).map((item) => (
              <div
                className="bg-white dark:bg-[#0c1427] rounded-md p-[20px] border border-gray-100 dark:border-[#172036]"
                key={item.id}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h6 className="!mb-0">{item.jenisData}</h6>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${statusClass(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <p>Sukses: {item.successBaris}</p>
                <p>Gagal: {item.failedBaris}</p>
                <p className="text-sm text-gray-500">
                  {formatDateTime(item.createdAt)}
                </p>
              </div>
            ))}
            {!status.data?.length ? (
              <div className="bg-white dark:bg-[#0c1427] rounded-md p-[20px]">
                Belum ada status import.
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-[20px]">
          <h5 className="!mb-0">Validasi Data</h5>
          <button
            type="button"
            className="py-[10px] px-[20px] bg-primary-500 text-white rounded-md disabled:opacity-70"
            disabled={runValidasi.isPending}
            onClick={() => runValidasi.mutate()}
          >
            Jalankan Validasi Ulang
          </button>
        </div>
        {validasi.isLoading ? (
          <div className="animate-pulse h-24 bg-gray-200 dark:bg-[#172036] rounded-md" />
        ) : validasi.isError ? (
          <div className="text-danger-500">Gagal memuat validasi</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-[20px]">
            <div className={validasi.data?.asnTanpaUnit ? "text-danger-500" : ""}>
              <span className="block text-sm text-gray-500">ASN tanpa Unit</span>
              <strong className="text-2xl">{validasi.data?.asnTanpaUnit ?? 0}</strong>
            </div>
            <div className={validasi.data?.duplikatNik ? "text-danger-500" : ""}>
              <span className="block text-sm text-gray-500">Duplikat NIK</span>
              <strong className="text-2xl">{validasi.data?.duplikatNik ?? 0}</strong>
            </div>
            <div className={validasi.data?.duplikatNip ? "text-danger-500" : ""}>
              <span className="block text-sm text-gray-500">Duplikat NIP</span>
              <strong className="text-2xl">{validasi.data?.duplikatNip ?? 0}</strong>
            </div>
            <div>
              <span className="block text-sm text-gray-500">Dicek pada</span>
              <strong>
                {validasi.data?.checkedAt
                  ? formatDateTime(validasi.data.checkedAt)
                  : "-"}
              </strong>
            </div>
          </div>
        )}
      </div>

      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <h5>Log Import</h5>
        {log.isLoading ? (
          <div className="animate-pulse h-48 bg-gray-200 dark:bg-[#172036] rounded-md" />
        ) : log.isError ? (
          <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">
            Gagal memuat log import
          </div>
        ) : (
          <>
            <div className="table-responsive overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {["Jenis Data", "Status", "Sukses", "Gagal", "Waktu", "Error"].map((heading) => (
                      <th
                        className="font-medium text-left px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c]"
                        key={heading}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(log.data?.data ?? []).map((item) => (
                    <tr key={item.id}>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.jenisData}</td>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${statusClass(item.status)}`}>{item.status}</span></td>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.successBaris}</td>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.failedBaris}</td>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{formatDateTime(item.createdAt)}</td>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
                        {item.failedBaris > 0 ? (
                          <button
                            type="button"
                            className="text-primary-500 font-medium"
                            onClick={() => void downloadImportErrors(item.id)}
                          >
                            Excel error
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {log.data?.meta.totalPages ? (
              <div className="flex justify-end gap-2 mt-[20px]">
                {Array.from({ length: log.data.meta.totalPages }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`w-9 h-9 rounded-md border ${page === index + 1 ? "bg-primary-500 text-white border-primary-500" : "border-gray-200 dark:border-[#172036]"}`}
                    onClick={() => setPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
