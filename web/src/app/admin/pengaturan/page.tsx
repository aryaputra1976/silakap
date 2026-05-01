"use client";

import { FormEvent, useState } from "react";
import Toast from "@/components/silakap/Toast";
import {
  useConfigSla,
  useConfigSlaActions,
  useRefJenisLayananAdmin,
} from "@/hooks/useAdmin";
import { useToast } from "@/hooks/useToast";
import type { ConfigSla } from "@/types/models";

const jabatanLabels: Record<string, string> = {
  AP: "Analis Pertama",
  AM: "Analis Muda",
  AD: "Analis Madya",
  Kabid: "Kepala Bidang",
  KepalaBadan: "Kepala Badan",
};

const empty = { id: "", jabatan: "AP", jenisLayananId: "", slaHari: "0", slaJam: "0", eskalasiHari: "" };

export default function AdminPengaturanPage() {
  const query = useConfigSla();
  const jenis = useRefJenisLayananAdmin();
  const actions = useConfigSlaActions();
  const { toast, showToast, hideToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const open = (item?: ConfigSla) => {
    setForm(item ? { id: item.id, jabatan: item.jabatan, jenisLayananId: item.jenisLayananId ?? "", slaHari: String(item.slaHari), slaJam: String(item.slaJam), eskalasiHari: item.eskalasiHari ? String(item.eskalasiHari) : "" } : empty);
    setModalOpen(true);
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    actions.upsert.mutate({ jenisLayananId: form.jenisLayananId || null, jabatan: form.jabatan, slaHari: Number(form.slaHari), slaJam: Number(form.slaJam), eskalasiHari: form.eskalasiHari ? Number(form.eskalasiHari) : null }, { onSuccess: () => { setModalOpen(false); showToast("Config SLA berhasil disimpan", "success"); } });
  };
  return (
    <div className="space-y-[25px]">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="!mb-1">Pengaturan SLA</h1><p className="text-gray-500 dark:text-gray-400">Konfigurasi batas waktu (SLA) per tahap dan jenis layanan</p></div><button type="button" className="py-[10px] px-[20px] bg-primary-500 text-white rounded-md" onClick={() => open()}>+ Tambah Config SLA</button></div>
      {query.isError ? <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">Gagal memuat data</div> : null}
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">{query.isLoading ? <div className="animate-pulse h-48 bg-gray-200 dark:bg-[#172036] rounded-md" /> : <div className="table-responsive overflow-x-auto"><table className="w-full"><thead><tr>{["Jabatan", "Jenis Layanan", "SLA Hari", "SLA Jam", "Eskalasi Hari", "Aksi"].map((h) => <th className="font-medium text-left px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c]" key={h}>{h}</th>)}</tr></thead><tbody>{(query.data ?? []).map((item) => <tr key={item.id}><td className="px-[20px] py-[15px] border-b">{jabatanLabels[item.jabatan] ?? item.jabatan}</td><td className="px-[20px] py-[15px] border-b">{item.jenisLayanan?.nama ?? "Semua Jenis"}</td><td className="px-[20px] py-[15px] border-b">{item.slaHari}</td><td className="px-[20px] py-[15px] border-b">{item.slaJam}</td><td className="px-[20px] py-[15px] border-b">{item.eskalasiHari ?? "-"}</td><td className="px-[20px] py-[15px] border-b"><button className="text-primary-500 mr-3" type="button" onClick={() => open(item)}>Edit</button><button className="text-danger-500" type="button" onClick={() => window.confirm("Hapus config SLA?") && actions.remove.mutate(item.id)}>Hapus</button></td></tr>)}</tbody></table></div>}</div>
      {modalOpen ? <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"><form className="bg-white dark:bg-[#0c1427] rounded-md p-[25px] w-full max-w-[560px] space-y-4" onSubmit={submit}><h5>Config SLA</h5><select required className="h-[45px] rounded-md border px-[14px] w-full bg-white dark:bg-[#0c1427]" value={form.jabatan} onChange={(e) => setForm((c) => ({ ...c, jabatan: e.target.value }))}>{Object.entries(jabatanLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select className="h-[45px] rounded-md border px-[14px] w-full bg-white dark:bg-[#0c1427]" value={form.jenisLayananId} onChange={(e) => setForm((c) => ({ ...c, jenisLayananId: e.target.value }))}><option value="">Semua Jenis</option>{(jenis.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}</select><div className="grid grid-cols-3 gap-3"><input required min={0} type="number" className="h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427]" value={form.slaHari} onChange={(e) => setForm((c) => ({ ...c, slaHari: e.target.value }))} /><input required min={0} max={23} type="number" className="h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427]" value={form.slaJam} onChange={(e) => setForm((c) => ({ ...c, slaJam: e.target.value }))} /><input min={0} type="number" className="h-[45px] rounded-md border px-[14px] bg-white dark:bg-[#0c1427]" placeholder="Eskalasi" value={form.eskalasiHari} onChange={(e) => setForm((c) => ({ ...c, eskalasiHari: e.target.value }))} /></div><div className="flex justify-end gap-3"><button type="button" className="px-5 py-2 rounded-md border" onClick={() => setModalOpen(false)}>Batal</button><button type="submit" className="px-5 py-2 rounded-md bg-primary-500 text-white">Simpan</button></div></form></div> : null}
      {toast.visible ? <Toast message={toast.message} type={toast.type} onClose={hideToast} /> : null}
    </div>
  );
}
