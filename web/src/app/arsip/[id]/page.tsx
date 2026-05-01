"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useArsipDetail } from "@/hooks/useArsip";

const textValue = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value) : "-";

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md bg-gray-50 dark:bg-[#15203c] p-4">
    <span className="block text-sm text-gray-500">{label}</span>
    <span className="font-semibold text-black dark:text-white">{value}</span>
  </div>
);

export default function ArsipDetailPage() {
  const params = useParams<{ id: string }>();
  const query = useArsipDetail(params.id);
  const item = query.data;

  return (
    <div className="space-y-[25px]">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-gray-500 dark:text-gray-400">Arsip / Detail</p><h1 className="!mb-0">Detail Arsip</h1></div><Link href="/arsip" className="py-[10px] px-[20px] border border-gray-200 dark:border-[#172036] rounded-md">← Kembali</Link></div>
      {query.isLoading ? <div className="animate-pulse rounded-xl bg-gray-200 dark:bg-[#172036] h-72" /> : query.isError || !item ? <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">Gagal memuat data</div> : (
        <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
          <h5>Informasi Arsip</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[20px]">
            <Field label="Nomor Usulan" value={textValue(item.dataSnapshot.nomorUsulan)} />
            <Field label="Status" value={textValue(item.dataSnapshot.status)} />
            <Field label="Nama ASN" value={`${textValue(item.dataSnapshot.asnNama)} / ${textValue(item.dataSnapshot.asnNip)}`} />
            <Field label="Jenis Layanan" value={textValue(item.dataSnapshot.jenisLayanan)} />
            <Field label="Tanggal Usulan" value={textValue(item.dataSnapshot.tanggalUsulan)} />
            <Field label="Tanggal Selesai" value={textValue(item.dataSnapshot.tglSelesai)} />
            <Field label="Alasan Arsip" value={item.alasanArsip ?? "-"} />
            <Field label="Diarsipkan Oleh" value={item.diarsipkanOleh?.namaLengkap ?? "-"} />
            <Field label="Tanggal Diarsipkan" value={new Date(item.createdAt).toLocaleString("id-ID")} />
          </div>
          {item.usulanLayananId ? <Link href={`/layanan/${item.usulanLayananId}`} className="inline-block mt-[25px] py-[10px] px-[20px] bg-primary-500 text-white rounded-md">Lihat Usulan Asli</Link> : null}
        </div>
      )}
    </div>
  );
}
