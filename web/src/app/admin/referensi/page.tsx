"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  useRefActions,
  useRefGolonganAdmin,
  useRefJenisLayananAdmin,
  useRefUnitAdmin,
} from "@/hooks/useAdmin";
import UnitOrganisasiTree from "@/components/silakap/UnitOrganisasiTree";
import type { JenisLayananFull, RefGolonganFull, UnitOrganisasi } from "@/types/models";

type Tab = "golongan" | "unit" | "jenis";
type ModalKind = "golongan" | "unit" | "jenis" | null;
const GOLONGAN_PAGE_SIZE = 10;

interface ImportResult {
  total: number;
  berhasil: number;
  diperbarui: number;
  errors: Array<{ baris: number; pesan: string }>;
}

export default function AdminReferensiPage() {
  const [tab, setTab] = useState<Tab>("golongan");
  const [modalKind, setModalKind] = useState<ModalKind>(null);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [persyaratanId, setPersyaratanId] = useState("");
  const [persyaratan, setPersyaratan] = useState<
    { urutan: number; namaPersyaratan: string; isRequired: boolean }[]
  >([]);
  const [golonganPage, setGolonganPage] = useState(1);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const golongan = useRefGolonganAdmin();
  const unit = useRefUnitAdmin();
  const jenis = useRefJenisLayananAdmin();
  const actions = useRefActions();
  const golonganRows = golongan.data ?? [];
  const golonganTotalPages = Math.max(1, Math.ceil(golonganRows.length / GOLONGAN_PAGE_SIZE));
  const safeGolonganPage = Math.min(golonganPage, golonganTotalPages);
  const golonganStartIndex = (safeGolonganPage - 1) * GOLONGAN_PAGE_SIZE;
  const golonganPageRows = golonganRows.slice(golonganStartIndex, golonganStartIndex + GOLONGAN_PAGE_SIZE);

  useEffect(() => {
    setGolonganPage((page) => Math.min(page, golonganTotalPages));
  }, [golonganTotalPages]);

  const openGolongan = (item?: RefGolonganFull) => {
    setModalKind("golongan");
    setEditingId(item?.id ?? "");
    setForm({ kode: item?.kode ?? "", nama: item?.nama ?? "", roman: item?.roman ?? "", tingkat: item?.tingkat ? String(item.tingkat) : "" });
  };
  const openUnit = (item?: UnitOrganisasi) => {
    setModalKind("unit");
    setEditingId(item?.id ?? "");
    setForm({ id: item?.id ?? "", nama: item?.nama ?? "", idAtasan: item?.idAtasan ?? "", level: item?.level ? String(item.level) : "", isOpd: item?.isOpd ?? false });
  };
  const openJenis = (item?: JenisLayananFull) => {
    setModalKind("jenis");
    setEditingId(item?.id ?? "");
    setForm({ kode: item?.kode ?? "", nama: item?.nama ?? "", deskripsi: item?.deskripsi ?? "", butuhTteKepalaBadan: item?.butuhTteKepalaBadan ?? false, isActive: item?.isActive ?? true });
    setPersyaratanId(item?.id ?? "");
    setPersyaratan(item?.persyaratanLayanan.map((p) => ({ urutan: p.urutan, namaPersyaratan: p.namaPersyaratan, isRequired: p.isRequired })) ?? []);
  };
  const setField = (key: string, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const close = () => { setModalKind(null); setEditingId(""); setForm({}); };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (modalKind === "golongan") {
      const body = { kode: form.kode, nama: form.nama, roman: form.roman || null, tingkat: form.tingkat ? Number(form.tingkat) : null };
      if (editingId) actions.updateGolongan.mutate({ id: editingId, body }, { onSuccess: close }); else actions.createGolongan.mutate(body, { onSuccess: close });
    }
    if (modalKind === "unit") {
      const body = { id: form.id, nama: form.nama, idAtasan: form.idAtasan || null, level: form.level ? Number(form.level) : null, isOpd: Boolean(form.isOpd) };
      if (editingId) actions.updateUnit.mutate({ id: editingId, body }, { onSuccess: close }); else actions.createUnit.mutate(body, { onSuccess: close });
    }
    if (modalKind === "jenis") {
      const body = { kode: form.kode, nama: form.nama, deskripsi: form.deskripsi || null, butuhTteKepalaBadan: Boolean(form.butuhTteKepalaBadan), isActive: Boolean(form.isActive) };
      if (editingId) actions.updateJenisLayanan.mutate({ id: editingId, body }, { onSuccess: close }); else actions.createJenisLayanan.mutate(body, { onSuccess: close });
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportResult(null);
    setImportError(null);
    try {
      const res = await actions.importUnitOrganisasi.mutateAsync(file);
      setImportResult(res.data.data);
    } catch (err: unknown) {
      type ApiErr = { code?: string; message?: string; response?: { data?: { message?: string }; status?: number } };
      const apiErr = err as ApiErr;
      const msg =
        apiErr?.response?.data?.message ??
        (apiErr?.response?.status
          ? `Error ${apiErr.response.status} dari server`
          : apiErr?.code === "ECONNABORTED"
            ? "Import masih diproses terlalu lama. Refresh data referensi untuk memastikan hasilnya."
          : "Tidak dapat terhubung ke server");
      setImportError(msg);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">Data Referensi</h1>
        <p className="text-gray-500 dark:text-gray-400">Kelola data master SILAKAP</p>
      </div>

      {/* Tab selector */}
      <div className="flex flex-wrap gap-2">
        {(["golongan", "unit", "jenis"] as Tab[]).map((value) => (
          <button
            key={value}
            type="button"
            className={`px-4 py-2 rounded-md border ${tab === value ? "bg-primary-500 text-white border-primary-500" : "bg-white dark:bg-[#0c1427] border-gray-100 dark:border-[#172036]"}`}
            onClick={() => { setTab(value); setImportResult(null); setImportError(null); }}
          >
            {value === "golongan" ? "Golongan" : value === "unit" ? "Unit Organisasi" : "Jenis Layanan"}
          </button>
        ))}
      </div>

      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">

        {/* ── TAB: GOLONGAN ── */}
        {tab === "golongan" ? (
          <>
            <button type="button" className="mb-4 py-[10px] px-[20px] bg-primary-500 text-white rounded-md" onClick={() => openGolongan()}>+ Tambah Golongan</button>
            {golongan.isLoading ? <div className="animate-pulse h-48 bg-gray-200 dark:bg-[#172036] rounded-md" /> : (
              <>
                <div className="table-responsive overflow-x-auto">
                  <table className="w-full">
                    <thead><tr>{["Kode", "Nama", "Roman", "Tingkat", "Aksi"].map((h) => <th className="font-medium text-left px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c]" key={h}>{h}</th>)}</tr></thead>
                    <tbody>{golonganPageRows.map((item) => (
                      <tr key={item.id}>
                        <td className="px-[20px] py-[15px] border-b">{item.kode}</td>
                        <td className="px-[20px] py-[15px] border-b">{item.nama}</td>
                        <td className="px-[20px] py-[15px] border-b">{item.roman ?? "-"}</td>
                        <td className="px-[20px] py-[15px] border-b">{item.tingkat ?? "-"}</td>
                        <td className="px-[20px] py-[15px] border-b"><button className="text-primary-500" type="button" onClick={() => openGolongan(item)}>Edit</button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <div className="mt-4 flex flex-col gap-3 text-sm text-gray-500 dark:text-gray-400 md:flex-row md:items-center md:justify-between">
                  <span>
                    Menampilkan {golonganRows.length === 0 ? 0 : golonganStartIndex + 1}-{Math.min(golonganStartIndex + GOLONGAN_PAGE_SIZE, golonganRows.length)} dari {golonganRows.length} golongan
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="h-9 rounded-md border border-gray-200 px-3 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#172036]"
                      disabled={safeGolonganPage <= 1}
                      onClick={() => setGolonganPage((page) => Math.max(1, page - 1))}
                    >
                      Sebelumnya
                    </button>
                    <span className="min-w-[90px] text-center">
                      Halaman {safeGolonganPage} / {golonganTotalPages}
                    </span>
                    <button
                      type="button"
                      className="h-9 rounded-md border border-gray-200 px-3 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#172036]"
                      disabled={safeGolonganPage >= golonganTotalPages}
                      onClick={() => setGolonganPage((page) => Math.min(golonganTotalPages, page + 1))}
                    >
                      Berikutnya
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        ) : null}

        {/* ── TAB: UNIT ORGANISASI ── */}
        {tab === "unit" ? (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <button type="button" className="py-[10px] px-[20px] bg-primary-500 text-white rounded-md" onClick={() => openUnit()}>+ Tambah Unit</button>

              {/* Tombol Import dari SIASN */}
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportFile} />
              <button
                type="button"
                disabled={actions.importUnitOrganisasi.isPending}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 py-[10px] px-[20px] rounded-md border border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                {actions.importUnitOrganisasi.isPending ? "Mengimpor…" : "Import dari SIASN (.xlsx)"}
              </button>
            </div>

            {/* Feedback hasil import */}
            {importResult && (
              <div className="mb-4 rounded-md border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 p-3 text-sm">
                <p className="font-medium text-green-800 dark:text-green-300">
                  Import selesai — {importResult.total} baris diproses
                </p>
                <p className="text-green-700 dark:text-green-400">
                  {importResult.berhasil} ditambahkan · {importResult.diperbarui} diperbarui
                </p>
                {importResult.errors.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-amber-700 dark:text-amber-400">
                      {importResult.errors.length} baris error — klik untuk detail
                    </summary>
                    <ul className="mt-1 space-y-0.5 text-xs text-amber-700 dark:text-amber-400 list-disc list-inside">
                      {importResult.errors.map((e, i) => (
                        <li key={i}>{e.baris > 0 ? `Baris ${e.baris}: ` : ""}{e.pesan}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}
            {importError && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
                {importError}
              </div>
            )}
            {unit.isLoading ? <div className="animate-pulse h-48 bg-gray-200 dark:bg-[#172036] rounded-md" /> : (
              <UnitOrganisasiTree units={unit.data ?? []} onEdit={openUnit} />
            )}
          </>
        ) : null}

        {/* ── TAB: JENIS LAYANAN ── */}
        {tab === "jenis" ? (
          <>
            <button type="button" className="mb-4 py-[10px] px-[20px] bg-primary-500 text-white rounded-md" onClick={() => openJenis()}>+ Tambah Jenis Layanan</button>
            {jenis.isLoading ? <div className="animate-pulse h-48 bg-gray-200 dark:bg-[#172036] rounded-md" /> : (
              <div className="table-responsive overflow-x-auto">
                <table className="w-full">
                  <thead><tr>{["Kode", "Nama", "TTE KB", "Status", "Jumlah Persyaratan", "Aksi"].map((h) => <th className="font-medium text-left px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c]" key={h}>{h}</th>)}</tr></thead>
                  <tbody>{(jenis.data ?? []).map((item) => (
                    <tr key={item.id}>
                      <td className="px-[20px] py-[15px] border-b">{item.kode}</td>
                      <td className="px-[20px] py-[15px] border-b">{item.nama}</td>
                      <td className="px-[20px] py-[15px] border-b">{item.butuhTteKepalaBadan ? "Ya" : "Tidak"}</td>
                      <td className="px-[20px] py-[15px] border-b">{item.isActive ? "Aktif" : "Nonaktif"}</td>
                      <td className="px-[20px] py-[15px] border-b">{item.persyaratanLayanan.length}</td>
                      <td className="px-[20px] py-[15px] border-b"><button className="text-primary-500" type="button" onClick={() => openJenis(item)}>Edit & Persyaratan</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Modal form */}
      {modalKind ? (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form className="bg-white dark:bg-[#0c1427] rounded-md p-[25px] w-full max-w-[720px] space-y-4 max-h-[90vh] overflow-y-auto" onSubmit={submit}>
            <h5>{editingId ? "Edit" : "Tambah"} {modalKind}</h5>

            {modalKind === "golongan" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input required className="h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427]" placeholder="Kode" value={String(form.kode ?? "")} onChange={(e) => setField("kode", e.target.value)} />
                <input required className="h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427]" placeholder="Nama" value={String(form.nama ?? "")} onChange={(e) => setField("nama", e.target.value)} />
                <input className="h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427]" placeholder="Roman" value={String(form.roman ?? "")} onChange={(e) => setField("roman", e.target.value)} />
                <input type="number" className="h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427]" placeholder="Tingkat" value={String(form.tingkat ?? "")} onChange={(e) => setField("tingkat", e.target.value)} />
              </div>
            ) : null}

            {modalKind === "unit" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input required readOnly={Boolean(editingId)} className="h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427] disabled:opacity-60" placeholder="ID (UUID atau hex SIASN)" value={String(form.id ?? "")} onChange={(e) => setField("id", e.target.value)} />
                <input required className="h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427]" placeholder="Nama Unit Organisasi" value={String(form.nama ?? "")} onChange={(e) => setField("nama", e.target.value)} />
                <select className="h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427]" value={String(form.idAtasan ?? "")} onChange={(e) => setField("idAtasan", e.target.value)}>
                  <option value="">Tanpa Atasan (Root)</option>
                  {(unit.data ?? []).filter(u => u.id !== editingId).map((u) => <option key={u.id} value={u.id}>{u.nama}</option>)}
                </select>
                <input type="number" className="h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427]" placeholder="Level (1 = root, 2 = OPD, dst)" value={String(form.level ?? "")} onChange={(e) => setField("level", e.target.value)} />
                <label className="flex items-center gap-2 col-span-2">
                  <input type="checkbox" checked={Boolean(form.isOpd)} onChange={(e) => setField("isOpd", e.target.checked)} />
                  <span>Tandai sebagai OPD</span>
                </label>
              </div>
            ) : null}

            {modalKind === "jenis" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input required className="h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427]" placeholder="Kode" value={String(form.kode ?? "")} onChange={(e) => setField("kode", e.target.value)} />
                  <input required className="h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427]" placeholder="Nama Jenis Layanan" value={String(form.nama ?? "")} onChange={(e) => setField("nama", e.target.value)} />
                  <textarea className="md:col-span-2 min-h-[80px] rounded-md border px-[14px] py-3 bg-white dark:bg-[#0c1427]" placeholder="Deskripsi" value={String(form.deskripsi ?? "")} onChange={(e) => setField("deskripsi", e.target.value)} />
                  <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(form.butuhTteKepalaBadan)} onChange={(e) => setField("butuhTteKepalaBadan", e.target.checked)} /> Butuh TTE Kepala Badan</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(form.isActive)} onChange={(e) => setField("isActive", e.target.checked)} /> Aktif</label>
                </div>
                {editingId ? (
                  <div className="border-t pt-4">
                    <h6>Persyaratan Dokumen</h6>
                    {persyaratan.map((row, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                        <input type="number" className="col-span-2 h-[40px] rounded-md border px-2 bg-white dark:bg-[#0c1427]" placeholder="No" value={row.urutan} onChange={(e) => setPersyaratan((cur) => cur.map((r, i) => i === index ? { ...r, urutan: Number(e.target.value) } : r))} />
                        <input className="col-span-6 h-[40px] rounded-md border px-2 bg-white dark:bg-[#0c1427]" placeholder="Nama persyaratan" value={row.namaPersyaratan} onChange={(e) => setPersyaratan((cur) => cur.map((r, i) => i === index ? { ...r, namaPersyaratan: e.target.value } : r))} />
                        <label className="col-span-2 flex items-center gap-1 text-sm"><input type="checkbox" checked={row.isRequired} onChange={(e) => setPersyaratan((cur) => cur.map((r, i) => i === index ? { ...r, isRequired: e.target.checked } : r))} /> Wajib</label>
                        <button type="button" className="col-span-2 text-danger-500 text-sm" onClick={() => setPersyaratan((cur) => cur.filter((_, i) => i !== index))}>Hapus</button>
                      </div>
                    ))}
                    <div className="flex gap-3 mt-2">
                      <button type="button" className="text-primary-500 text-sm" onClick={() => setPersyaratan((cur) => [...cur, { urutan: cur.length + 1, namaPersyaratan: "", isRequired: true }])}>+ Tambah Baris</button>
                      <button type="button" className="text-success-600 text-sm" onClick={() => actions.replacePersyaratan.mutate({ id: persyaratanId, persyaratan })}>Simpan Persyaratan</button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="flex justify-end gap-3">
              <button type="button" className="px-5 py-2 rounded-md border" onClick={close}>Batal</button>
              <button type="submit" className="px-5 py-2 rounded-md bg-primary-500 text-white">Simpan</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
