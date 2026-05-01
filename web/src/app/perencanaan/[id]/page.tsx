"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import {
  usePerencanaanActions,
  usePerencanaanDetail,
} from "@/hooks/usePerencanaan";
import { useAuthStore } from "@/store/auth.store";

export default function PerencanaanDetailPage() {
  const params = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const query = usePerencanaanDetail(params.id);
  const actions = usePerencanaanActions();
  const item = query.data;
  const canManage =
    user?.roleNama === "Admin_Sistem" || user?.roleNama === "Kabid";
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ tanggalBup: "", tahunBup: "", bupUsia: "", keterangan: "" });

  const openEdit = () => {
    if (!item) return;
    setForm({
      tanggalBup: item.tanggalBup.slice(0, 10),
      tahunBup: String(item.tahunBup),
      bupUsia: String(item.bupUsia),
      keterangan: item.keterangan ?? "",
    });
    setEditOpen(true);
  };

  const submitEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    actions.update.mutate(
      {
        id: params.id,
        body: {
          tanggalBup: form.tanggalBup,
          tahunBup: Number(form.tahunBup),
          bupUsia: Number(form.bupUsia),
          keterangan: form.keterangan || null,
        },
      },
      { onSuccess: () => setEditOpen(false) },
    );
  };

  return (
    <div className="space-y-[25px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-sm text-gray-500 dark:text-gray-400">Perencanaan / Detail</p><h1 className="!mb-0">Detail Perencanaan Pensiun</h1></div>
        <Link href="/perencanaan" className="py-[10px] px-[20px] border border-gray-200 dark:border-[#172036] rounded-md">← Kembali</Link>
      </div>
      {query.isLoading ? <div className="animate-pulse rounded-xl bg-gray-200 dark:bg-[#172036] h-72" /> : query.isError || !item ? <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">Gagal memuat data</div> : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px]">
            <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md"><h5>Info ASN</h5><p className="font-semibold">{item.asn?.nama ?? "-"}</p><p>NIP: {item.asn?.nipBaru ?? "-"}</p><p>Unit: {item.asn?.unitOrganisasiId ?? "-"}</p></div>
            <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md"><h5>Detail</h5><p>Tanggal BUP: {new Date(item.tanggalBup).toLocaleDateString("id-ID")}</p><p>Tahun BUP: {item.tahunBup}</p><p>Usia BUP: {item.bupUsia}</p><p>Keterangan: {item.keterangan ?? "-"}</p><p>Dibuat: {new Date(item.createdAt).toLocaleString("id-ID")}</p><span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${item.sudahDiproses ? "bg-success-100 text-success-700" : "bg-warning-100 text-warning-700"}`}>{item.sudahDiproses ? "Selesai" : "Menunggu"}</span></div>
          </div>
          <div className="flex flex-wrap gap-3">
            {canManage ? <button type="button" className="py-[10px] px-[20px] bg-primary-500 text-white rounded-md" onClick={openEdit}>Edit</button> : null}
            {canManage && !item.sudahDiproses ? <button type="button" className="py-[10px] px-[20px] bg-success-500 text-white rounded-md" onClick={() => actions.tandaiSelesai.mutate(item.id)}>Tandai Selesai</button> : null}
          </div>
        </>
      )}
      {editOpen ? (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form className="bg-white dark:bg-[#0c1427] rounded-md p-[25px] w-full max-w-[520px] space-y-4" onSubmit={submitEdit}><h5>Edit Perencanaan</h5><input type="date" className="h-[45px] rounded-md border px-[14px] w-full bg-white dark:bg-[#0c1427]" value={form.tanggalBup} onChange={(event) => setForm((current) => ({ ...current, tanggalBup: event.target.value }))} /><input type="number" className="h-[45px] rounded-md border px-[14px] w-full bg-white dark:bg-[#0c1427]" value={form.tahunBup} onChange={(event) => setForm((current) => ({ ...current, tahunBup: event.target.value }))} /><input type="number" className="h-[45px] rounded-md border px-[14px] w-full bg-white dark:bg-[#0c1427]" value={form.bupUsia} onChange={(event) => setForm((current) => ({ ...current, bupUsia: event.target.value }))} /><textarea className="min-h-[90px] rounded-md border px-[14px] py-3 w-full bg-white dark:bg-[#0c1427]" value={form.keterangan} onChange={(event) => setForm((current) => ({ ...current, keterangan: event.target.value }))} /><div className="flex justify-end gap-3"><button type="button" className="px-5 py-2 rounded-md border" onClick={() => setEditOpen(false)}>Batal</button><button type="submit" className="px-5 py-2 rounded-md bg-primary-500 text-white">Simpan</button></div></form>
        </div>
      ) : null}
    </div>
  );
}
