"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  useRefActions,
  useRefGolonganAdmin,
  useRefJabatanFungsional,
  useRefJabatanPelaksana,
  useRefJabatanStruktural,
  useRefJenisJabatan,
  useRefJenisLayananAdmin,
  useRefUnitAdmin,
} from "@/hooks/useAdmin";
import UnitOrganisasiTree from "@/components/silakap/UnitOrganisasiTree";
import type {
  JenisLayananFull,
  RefGolonganFull,
  RefJabatanFungsional,
  RefJabatanPelaksana,
  RefJabatanStruktural,
  RefJenisJabatan,
  UnitOrganisasi,
} from "@/types/models";

type Tab = "golongan" | "unit" | "jenis" | "jenis-jabatan" | "jabatan-struktural" | "jabatan-fungsional" | "jabatan-pelaksana";
type ModalKind = Tab | null;
const GOLONGAN_PAGE_SIZE = 10;

const TAB_LABELS: Record<Tab, string> = {
  golongan: "Golongan",
  unit: "Unit Organisasi",
  jenis: "Jenis Layanan",
  "jenis-jabatan": "Jenis Jabatan",
  "jabatan-struktural": "Jabatan Struktural",
  "jabatan-fungsional": "Jabatan Fungsional",
  "jabatan-pelaksana": "Jabatan Pelaksana",
};

export default function AdminReferensiPage() {
  const [tab, setTab] = useState<Tab>("golongan");
  const [modalKind, setModalKind] = useState<ModalKind>(null);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState<Record<string, string | boolean | number>>({});
  const [persyaratanId, setPersyaratanId] = useState("");
  const [persyaratan, setPersyaratan] = useState<
    { urutan: number; namaPersyaratan: string; isRequired: boolean }[]
  >([]);
  const [golonganPage, setGolonganPage] = useState(1);

  const golongan = useRefGolonganAdmin();
  const unit = useRefUnitAdmin();
  const jenis = useRefJenisLayananAdmin();
  const jenisJabatan = useRefJenisJabatan();
  const jabatanStruktural = useRefJabatanStruktural();
  const jabatanFungsional = useRefJabatanFungsional();
  const jabatanPelaksana = useRefJabatanPelaksana();
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
  const openJenisJabatan = (item?: RefJenisJabatan) => {
    setModalKind("jenis-jabatan");
    setEditingId(item?.id ?? "");
    setForm({ nama: item?.nama ?? "", keterangan: item?.keterangan ?? "" });
  };
  const openJabatanStruktural = (item?: RefJabatanStruktural) => {
    setModalKind("jabatan-struktural");
    setEditingId(item?.id ?? "");
    setForm({
      id: item?.id ?? "",
      nama: item?.nama ?? "",
      unitOrganisasiId: item?.unitOrganisasiId ?? "",
      eselonId: item?.eselonId != null ? String(item.eselonId) : "",
      bup: item?.bup != null ? String(item.bup) : "58",
      kode: item?.kode ?? "",
      idSiasn: item?.idSiasn ?? "",
      isActive: item?.isActive ?? true,
    });
  };
  const openJabatanFungsional = (item?: RefJabatanFungsional) => {
    setModalKind("jabatan-fungsional");
    setEditingId(item?.id ?? "");
    setForm({
      id: item?.id ?? "",
      kode: item?.kode ?? "",
      nama: item?.nama ?? "",
      jenjang: item?.jenjang ?? "",
      bup: item?.bup != null ? String(item.bup) : "58",
      idSiasn: item?.idSiasn ?? "",
      isActive: item?.isActive ?? true,
    });
  };
  const openJabatanPelaksana = (item?: RefJabatanPelaksana) => {
    setModalKind("jabatan-pelaksana");
    setEditingId(item?.id ?? "");
    setForm({
      id: item?.id ?? "",
      kode: item?.kode ?? "",
      nama: item?.nama ?? "",
      idSiasn: item?.idSiasn ?? "",
      isActive: item?.isActive ?? true,
    });
  };

  const setField = (key: string, value: string | boolean | number) => setForm((current) => ({ ...current, [key]: value }));
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
    if (modalKind === "jenis-jabatan") {
      const body = { nama: form.nama, keterangan: form.keterangan || null };
      if (editingId) actions.updateJenisJabatan.mutate({ id: editingId, body }, { onSuccess: close }); else actions.createJenisJabatan.mutate(body, { onSuccess: close });
    }
    if (modalKind === "jabatan-struktural") {
      const body = {
        id: form.id, nama: form.nama, unitOrganisasiId: form.unitOrganisasiId,
        eselonId: form.eselonId ? Number(form.eselonId) : null,
        bup: form.bup ? Number(form.bup) : 58,
        kode: form.kode || null, idSiasn: form.idSiasn || null, isActive: Boolean(form.isActive),
      };
      if (editingId) actions.updateJabatanStruktural.mutate({ id: editingId, body }, { onSuccess: close }); else actions.createJabatanStruktural.mutate(body, { onSuccess: close });
    }
    if (modalKind === "jabatan-fungsional") {
      const body = {
        id: form.id, kode: form.kode || null, nama: form.nama,
        jenjang: form.jenjang || null,
        bup: form.bup ? Number(form.bup) : 58,
        idSiasn: form.idSiasn || null, isActive: Boolean(form.isActive),
      };
      if (editingId) actions.updateJabatanFungsional.mutate({ id: editingId, body }, { onSuccess: close }); else actions.createJabatanFungsional.mutate(body, { onSuccess: close });
    }
    if (modalKind === "jabatan-pelaksana") {
      const body = {
        id: form.id, kode: form.kode || null, nama: form.nama,
        idSiasn: form.idSiasn || null, isActive: Boolean(form.isActive),
      };
      if (editingId) actions.updateJabatanPelaksana.mutate({ id: editingId, body }, { onSuccess: close }); else actions.createJabatanPelaksana.mutate(body, { onSuccess: close });
    }
  };

  const thClass = "font-medium text-left px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c]";
  const tdClass = "px-[20px] py-[15px] border-b";
  const inputClass = "h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427]";

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">Data Referensi</h1>
        <p className="text-gray-500 dark:text-gray-400">Kelola data master SILAKAP</p>
      </div>

      {/* Tab selector */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(TAB_LABELS) as Tab[]).map((value) => (
          <button
            key={value}
            type="button"
            className={`px-4 py-2 rounded-md border ${tab === value ? "bg-primary-500 text-white border-primary-500" : "bg-white dark:bg-[#0c1427] border-gray-100 dark:border-[#172036]"}`}
            onClick={() => setTab(value)}
          >
            {TAB_LABELS[value]}
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
                    <thead><tr>{["Kode", "Nama", "Roman", "Tingkat", "Aksi"].map((h) => <th className={thClass} key={h}>{h}</th>)}</tr></thead>
                    <tbody>{golonganPageRows.map((item) => (
                      <tr key={item.id}>
                        <td className={tdClass}>{item.kode}</td>
                        <td className={tdClass}>{item.nama}</td>
                        <td className={tdClass}>{item.roman ?? "-"}</td>
                        <td className={tdClass}>{item.tingkat ?? "-"}</td>
                        <td className={tdClass}><button className="text-primary-500" type="button" onClick={() => openGolongan(item)}>Edit</button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <div className="mt-4 flex flex-col gap-3 text-sm text-gray-500 dark:text-gray-400 md:flex-row md:items-center md:justify-between">
                  <span>Menampilkan {golonganRows.length === 0 ? 0 : golonganStartIndex + 1}-{Math.min(golonganStartIndex + GOLONGAN_PAGE_SIZE, golonganRows.length)} dari {golonganRows.length} golongan</span>
                  <div className="flex items-center gap-2">
                    <button type="button" className="h-9 rounded-md border border-gray-200 px-3 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#172036]" disabled={safeGolonganPage <= 1} onClick={() => setGolonganPage((page) => Math.max(1, page - 1))}>Sebelumnya</button>
                    <span className="min-w-[90px] text-center">Halaman {safeGolonganPage} / {golonganTotalPages}</span>
                    <button type="button" className="h-9 rounded-md border border-gray-200 px-3 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#172036]" disabled={safeGolonganPage >= golonganTotalPages} onClick={() => setGolonganPage((page) => Math.min(golonganTotalPages, page + 1))}>Berikutnya</button>
                  </div>
                </div>
              </>
            )}
          </>
        ) : null}

        {/* ── TAB: UNIT ORGANISASI ── */}
        {tab === "unit" ? (
          <>
            <button type="button" className="mb-4 py-[10px] px-[20px] bg-primary-500 text-white rounded-md" onClick={() => openUnit()}>+ Tambah Unit</button>
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
                  <thead><tr>{["Kode", "Nama", "TTE KB", "Status", "Jumlah Persyaratan", "Aksi"].map((h) => <th className={thClass} key={h}>{h}</th>)}</tr></thead>
                  <tbody>{(jenis.data ?? []).map((item) => (
                    <tr key={item.id}>
                      <td className={tdClass}>{item.kode}</td>
                      <td className={tdClass}>{item.nama}</td>
                      <td className={tdClass}>{item.butuhTteKepalaBadan ? "Ya" : "Tidak"}</td>
                      <td className={tdClass}>{item.isActive ? "Aktif" : "Nonaktif"}</td>
                      <td className={tdClass}>{item.persyaratanLayanan.length}</td>
                      <td className={tdClass}><button className="text-primary-500" type="button" onClick={() => openJenis(item)}>Edit & Persyaratan</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </>
        ) : null}

        {/* ── TAB: JENIS JABATAN ── */}
        {tab === "jenis-jabatan" ? (
          <>
            <button type="button" className="mb-4 py-[10px] px-[20px] bg-primary-500 text-white rounded-md" onClick={() => openJenisJabatan()}>+ Tambah Jenis Jabatan</button>
            {jenisJabatan.isLoading ? <div className="animate-pulse h-48 bg-gray-200 dark:bg-[#172036] rounded-md" /> : (
              <div className="table-responsive overflow-x-auto">
                <table className="w-full">
                  <thead><tr>{["Nama", "Keterangan", "Aksi"].map((h) => <th className={thClass} key={h}>{h}</th>)}</tr></thead>
                  <tbody>{(jenisJabatan.data ?? []).map((item) => (
                    <tr key={item.id}>
                      <td className={tdClass}>{item.nama}</td>
                      <td className={tdClass}>{item.keterangan ?? "-"}</td>
                      <td className={tdClass}><button className="text-primary-500" type="button" onClick={() => openJenisJabatan(item)}>Edit</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </>
        ) : null}

        {/* ── TAB: JABATAN STRUKTURAL ── */}
        {tab === "jabatan-struktural" ? (
          <>
            <button type="button" className="mb-4 py-[10px] px-[20px] bg-primary-500 text-white rounded-md" onClick={() => openJabatanStruktural()}>+ Tambah Jabatan Struktural</button>
            {jabatanStruktural.isLoading ? <div className="animate-pulse h-48 bg-gray-200 dark:bg-[#172036] rounded-md" /> : (
              <div className="table-responsive overflow-x-auto">
                <table className="w-full">
                  <thead><tr>{["Nama", "Unit Organisasi", "Eselon", "BUP", "Status", "Aksi"].map((h) => <th className={thClass} key={h}>{h}</th>)}</tr></thead>
                  <tbody>{(jabatanStruktural.data ?? []).map((item) => (
                    <tr key={item.id}>
                      <td className={tdClass}>{item.nama}</td>
                      <td className={tdClass}>{item.unitOrganisasi?.nama ?? item.unitOrganisasiId}</td>
                      <td className={tdClass}>{item.eselonId ?? "-"}</td>
                      <td className={tdClass}>{item.bup}</td>
                      <td className={tdClass}>{item.isActive ? "Aktif" : "Nonaktif"}</td>
                      <td className={tdClass}><button className="text-primary-500" type="button" onClick={() => openJabatanStruktural(item)}>Edit</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </>
        ) : null}

        {/* ── TAB: JABATAN FUNGSIONAL ── */}
        {tab === "jabatan-fungsional" ? (
          <>
            <button type="button" className="mb-4 py-[10px] px-[20px] bg-primary-500 text-white rounded-md" onClick={() => openJabatanFungsional()}>+ Tambah Jabatan Fungsional</button>
            {jabatanFungsional.isLoading ? <div className="animate-pulse h-48 bg-gray-200 dark:bg-[#172036] rounded-md" /> : (
              <div className="table-responsive overflow-x-auto">
                <table className="w-full">
                  <thead><tr>{["Kode", "Nama", "Jenjang", "BUP", "Status", "Aksi"].map((h) => <th className={thClass} key={h}>{h}</th>)}</tr></thead>
                  <tbody>{(jabatanFungsional.data ?? []).map((item) => (
                    <tr key={item.id}>
                      <td className={tdClass}>{item.kode ?? "-"}</td>
                      <td className={tdClass}>{item.nama}</td>
                      <td className={tdClass}>{item.jenjang ?? "-"}</td>
                      <td className={tdClass}>{item.bup}</td>
                      <td className={tdClass}>{item.isActive ? "Aktif" : "Nonaktif"}</td>
                      <td className={tdClass}><button className="text-primary-500" type="button" onClick={() => openJabatanFungsional(item)}>Edit</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </>
        ) : null}

        {/* ── TAB: JABATAN PELAKSANA ── */}
        {tab === "jabatan-pelaksana" ? (
          <>
            <button type="button" className="mb-4 py-[10px] px-[20px] bg-primary-500 text-white rounded-md" onClick={() => openJabatanPelaksana()}>+ Tambah Jabatan Pelaksana</button>
            {jabatanPelaksana.isLoading ? <div className="animate-pulse h-48 bg-gray-200 dark:bg-[#172036] rounded-md" /> : (
              <div className="table-responsive overflow-x-auto">
                <table className="w-full">
                  <thead><tr>{["Kode", "Nama", "ID SIASN", "Status", "Aksi"].map((h) => <th className={thClass} key={h}>{h}</th>)}</tr></thead>
                  <tbody>{(jabatanPelaksana.data ?? []).map((item) => (
                    <tr key={item.id}>
                      <td className={tdClass}>{item.kode ?? "-"}</td>
                      <td className={tdClass}>{item.nama}</td>
                      <td className={tdClass}>{item.idSiasn ?? "-"}</td>
                      <td className={tdClass}>{item.isActive ? "Aktif" : "Nonaktif"}</td>
                      <td className={tdClass}><button className="text-primary-500" type="button" onClick={() => openJabatanPelaksana(item)}>Edit</button></td>
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
            <h5>{editingId ? "Edit" : "Tambah"} {TAB_LABELS[modalKind]}</h5>

            {modalKind === "golongan" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input required className={inputClass} placeholder="Kode" value={String(form.kode ?? "")} onChange={(e) => setField("kode", e.target.value)} />
                <input required className={inputClass} placeholder="Nama" value={String(form.nama ?? "")} onChange={(e) => setField("nama", e.target.value)} />
                <input className={inputClass} placeholder="Roman" value={String(form.roman ?? "")} onChange={(e) => setField("roman", e.target.value)} />
                <input type="number" className={inputClass} placeholder="Tingkat" value={String(form.tingkat ?? "")} onChange={(e) => setField("tingkat", e.target.value)} />
              </div>
            ) : null}

            {modalKind === "unit" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input required readOnly={Boolean(editingId)} className={inputClass} placeholder="ID (UUID atau hex SIASN)" value={String(form.id ?? "")} onChange={(e) => setField("id", e.target.value)} />
                <input required className={inputClass} placeholder="Nama Unit Organisasi" value={String(form.nama ?? "")} onChange={(e) => setField("nama", e.target.value)} />
                <select className={inputClass} value={String(form.idAtasan ?? "")} onChange={(e) => setField("idAtasan", e.target.value)}>
                  <option value="">Tanpa Atasan (Root)</option>
                  {(unit.data ?? []).filter(u => u.id !== editingId).map((u) => <option key={u.id} value={u.id}>{u.nama}</option>)}
                </select>
                <input type="number" className={inputClass} placeholder="Level (1 = root, 2 = OPD, dst)" value={String(form.level ?? "")} onChange={(e) => setField("level", e.target.value)} />
                <label className="flex items-center gap-2 col-span-2">
                  <input type="checkbox" checked={Boolean(form.isOpd)} onChange={(e) => setField("isOpd", e.target.checked)} />
                  <span>Tandai sebagai OPD</span>
                </label>
              </div>
            ) : null}

            {modalKind === "jenis" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input required className={inputClass} placeholder="Kode" value={String(form.kode ?? "")} onChange={(e) => setField("kode", e.target.value)} />
                  <input required className={inputClass} placeholder="Nama Jenis Layanan" value={String(form.nama ?? "")} onChange={(e) => setField("nama", e.target.value)} />
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

            {modalKind === "jenis-jabatan" ? (
              <div className="grid grid-cols-1 gap-3">
                <input required className={inputClass} placeholder="Nama Jenis Jabatan" value={String(form.nama ?? "")} onChange={(e) => setField("nama", e.target.value)} />
                <textarea className="min-h-[80px] rounded-md border px-[14px] py-3 bg-white dark:bg-[#0c1427]" placeholder="Keterangan (opsional)" value={String(form.keterangan ?? "")} onChange={(e) => setField("keterangan", e.target.value)} />
              </div>
            ) : null}

            {modalKind === "jabatan-struktural" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input required readOnly={Boolean(editingId)} className={inputClass} placeholder="ID Jabatan (UUID)" value={String(form.id ?? "")} onChange={(e) => setField("id", e.target.value)} />
                <input required className={inputClass} placeholder="Nama Jabatan" value={String(form.nama ?? "")} onChange={(e) => setField("nama", e.target.value)} />
                <select required className={inputClass} value={String(form.unitOrganisasiId ?? "")} onChange={(e) => setField("unitOrganisasiId", e.target.value)}>
                  <option value="">-- Pilih Unit Organisasi --</option>
                  {(unit.data ?? []).map((u) => <option key={u.id} value={u.id}>{u.nama}</option>)}
                </select>
                <input type="number" className={inputClass} placeholder="Eselon (1-5)" value={String(form.eselonId ?? "")} onChange={(e) => setField("eselonId", e.target.value)} />
                <input required type="number" className={inputClass} placeholder="BUP (tahun, mis: 58)" value={String(form.bup ?? "58")} onChange={(e) => setField("bup", e.target.value)} />
                <input className={inputClass} placeholder="Kode (opsional)" value={String(form.kode ?? "")} onChange={(e) => setField("kode", e.target.value)} />
                <input className="md:col-span-2 h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427]" placeholder="ID SIASN (opsional)" value={String(form.idSiasn ?? "")} onChange={(e) => setField("idSiasn", e.target.value)} />
                <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(form.isActive)} onChange={(e) => setField("isActive", e.target.checked)} /> Aktif</label>
              </div>
            ) : null}

            {modalKind === "jabatan-fungsional" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input required readOnly={Boolean(editingId)} className={inputClass} placeholder="ID Jabatan (UUID)" value={String(form.id ?? "")} onChange={(e) => setField("id", e.target.value)} />
                <input className={inputClass} placeholder="Kode (opsional)" value={String(form.kode ?? "")} onChange={(e) => setField("kode", e.target.value)} />
                <input required className={inputClass} placeholder="Nama Jabatan" value={String(form.nama ?? "")} onChange={(e) => setField("nama", e.target.value)} />
                <input className={inputClass} placeholder="Jenjang (mis: Pertama, Muda, Madya, Utama)" value={String(form.jenjang ?? "")} onChange={(e) => setField("jenjang", e.target.value)} />
                <input required type="number" className={inputClass} placeholder="BUP (tahun, mis: 60)" value={String(form.bup ?? "58")} onChange={(e) => setField("bup", e.target.value)} />
                <input className={inputClass} placeholder="ID SIASN (opsional)" value={String(form.idSiasn ?? "")} onChange={(e) => setField("idSiasn", e.target.value)} />
                <label className="flex items-center gap-2 col-span-2"><input type="checkbox" checked={Boolean(form.isActive)} onChange={(e) => setField("isActive", e.target.checked)} /> Aktif</label>
              </div>
            ) : null}

            {modalKind === "jabatan-pelaksana" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input required readOnly={Boolean(editingId)} className={inputClass} placeholder="ID Jabatan (UUID)" value={String(form.id ?? "")} onChange={(e) => setField("id", e.target.value)} />
                <input className={inputClass} placeholder="Kode (opsional)" value={String(form.kode ?? "")} onChange={(e) => setField("kode", e.target.value)} />
                <input required className="md:col-span-2 h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427]" placeholder="Nama Jabatan" value={String(form.nama ?? "")} onChange={(e) => setField("nama", e.target.value)} />
                <input className="md:col-span-2 h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427]" placeholder="ID SIASN (opsional)" value={String(form.idSiasn ?? "")} onChange={(e) => setField("idSiasn", e.target.value)} />
                <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(form.isActive)} onChange={(e) => setField("isActive", e.target.checked)} /> Aktif</label>
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
