"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useAsnList } from "@/hooks/useAsn";
import {
  usePerencanaanActions,
  usePerencanaanList,
} from "@/hooks/usePerencanaan";
import { useAuthStore } from "@/store/auth.store";

interface FormState {
  asnId: string;
  asnSearch: string;
  tanggalBup: string;
  tahunBup: string;
  bupUsia: string;
  keterangan: string;
}

const emptyForm: FormState = {
  asnId: "",
  asnSearch: "",
  tanggalBup: "",
  tahunBup: "",
  bupUsia: "",
  keterangan: "",
};

export default function PerencanaanPage() {
  const user = useAuthStore((state) => state.user);
  const [tahunBup, setTahunBup] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const canManage =
    user?.roleNama === "Admin_Sistem" || user?.roleNama === "Kabid";
  const canDelete = user?.roleNama === "Admin_Sistem";
  const params = useMemo(
    () => ({
      tahunBup: tahunBup || undefined,
      sudahDiproses: status === "" ? undefined : status === "true",
      page,
      limit: 10,
    }),
    [page, status, tahunBup],
  );
  const list = usePerencanaanList(params);
  const actions = usePerencanaanActions();
  const asnList = useAsnList({
    search: form.asnSearch || undefined,
    page: 1,
    limit: 5,
  });

  const submitCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    actions.create.mutate(
      {
        asnId: form.asnId,
        tanggalBup: form.tanggalBup,
        tahunBup: Number(form.tahunBup),
        bupUsia: Number(form.bupUsia),
        keterangan: form.keterangan || null,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setForm(emptyForm);
        },
      },
    );
  };

  return (
    <div className="space-y-[25px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="!mb-1">Perencanaan Pensiun</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Monitoring BUP dan tindak lanjut pensiun
          </p>
        </div>
        {canManage ? (
          <button
            type="button"
            className="py-[10px] px-[20px] bg-primary-500 text-white rounded-md"
            onClick={() => setIsModalOpen(true)}
          >
            + Tambah
          </button>
        ) : null}
      </div>

      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="number"
            placeholder="Filter tahun BUP"
            className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]"
            value={tahunBup}
            onChange={(event) => {
              setTahunBup(event.target.value);
              setPage(1);
            }}
          />
          <select
            className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua</option>
            <option value="false">Belum Diproses</option>
            <option value="true">Sudah Diproses</option>
          </select>
        </div>
      </div>

      {list.isError ? (
        <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">
          Gagal memuat data
        </div>
      ) : null}

      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        {list.isLoading ? (
          <div className="animate-pulse rounded-md bg-gray-200 dark:bg-[#172036] h-48" />
        ) : list.data?.data.length ? (
          <>
            <div className="table-responsive overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {["NIP", "Nama ASN", "Tanggal BUP", "Tahun BUP", "Usia BUP", "Status", "Aksi"].map((heading) => (
                      <th className="font-medium text-left px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c]" key={heading}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.data.data.map((item) => (
                    <tr key={item.id}>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.asn?.nipBaru ?? "-"}</td>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.asn?.nama ?? "-"}</td>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{new Date(item.tanggalBup).toLocaleDateString("id-ID")}</td>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.tahunBup}</td>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.bupUsia}</td>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${item.sudahDiproses ? "bg-success-100 text-success-700" : "bg-warning-100 text-warning-700"}`}>{item.sudahDiproses ? "Selesai" : "Menunggu"}</span></td>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/perencanaan/${item.id}`} className="text-primary-500">Lihat</Link>
                          {canManage && !item.sudahDiproses ? <button type="button" className="text-success-600" onClick={() => actions.tandaiSelesai.mutate(item.id)}>Tandai Selesai</button> : null}
                          {canDelete ? <button type="button" className="text-danger-500" onClick={() => window.confirm("Hapus data ini?") && actions.remove.mutate(item.id)}>Hapus</button> : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2 mt-[20px]">{Array.from({ length: list.data.meta.totalPages }).map((_, index) => <button key={index} type="button" className={`w-9 h-9 rounded-md border ${page === index + 1 ? "bg-primary-500 text-white border-primary-500" : "border-gray-200 dark:border-[#172036]"}`} onClick={() => setPage(index + 1)}>{index + 1}</button>)}</div>
          </>
        ) : (
          <div className="text-center py-[35px]">Belum ada perencanaan pensiun</div>
        )}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form className="bg-white dark:bg-[#0c1427] rounded-md p-[25px] w-full max-w-[680px] space-y-4" onSubmit={submitCreate}>
            <h5>Tambah Perencanaan</h5>
            <input className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px] w-full" placeholder="Cari ASN" value={form.asnSearch} onChange={(event) => setForm((current) => ({ ...current, asnSearch: event.target.value }))} />
            <div className="max-h-[160px] overflow-y-auto border border-gray-100 dark:border-[#172036] rounded-md">
              {(asnList.data?.data ?? []).map((asn) => <button type="button" key={asn.id} className={`block w-full text-left px-4 py-2 ${form.asnId === asn.id ? "bg-primary-50" : ""}`} onClick={() => setForm((current) => ({ ...current, asnId: asn.id, asnSearch: `${asn.nama} - ${asn.nipBaru}` }))}>{asn.nama} - {asn.nipBaru}</button>)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input required type="date" className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={form.tanggalBup} onChange={(event) => setForm((current) => ({ ...current, tanggalBup: event.target.value }))} />
              <input required type="number" placeholder="Tahun BUP" className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={form.tahunBup} onChange={(event) => setForm((current) => ({ ...current, tahunBup: event.target.value }))} />
              <input required type="number" placeholder="Usia BUP" className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={form.bupUsia} onChange={(event) => setForm((current) => ({ ...current, bupUsia: event.target.value }))} />
            </div>
            <textarea className="min-h-[90px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px] py-3 w-full" placeholder="Keterangan" value={form.keterangan} onChange={(event) => setForm((current) => ({ ...current, keterangan: event.target.value }))} />
            <div className="flex justify-end gap-3"><button type="button" className="px-5 py-2 rounded-md border" onClick={() => setIsModalOpen(false)}>Batal</button><button type="submit" className="px-5 py-2 rounded-md bg-primary-500 text-white">Simpan</button></div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
