"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useAsnList } from "@/hooks/useAsn";
import { usePerencanaanActions, usePerencanaanList } from "@/hooks/usePerencanaan";
import { getVisiblePages } from "@/lib/pagination";
import { useAuthStore } from "@/store/auth.store";
import type { JenisPensiun, StatusPensiun } from "@/types/models";

const JENIS_OPTIONS: { value: JenisPensiun | ""; label: string; tag: string; color: string }[] = [
  { value: "", label: "Semua", tag: "", color: "" },
  { value: "BUP", label: "BUP", tag: "Batas Usia Pensiun", color: "bg-primary-100 text-primary-700" },
  { value: "APS", label: "APS", tag: "Atas Permintaan Sendiri", color: "bg-purple-100 text-purple-700" },
  { value: "JandaDuda", label: "Janda/Duda", tag: "Ahli Waris", color: "bg-orange-100 text-orange-700" },
  { value: "Uzur", label: "Uzur", tag: "Tidak Cakap Jasmani/Rohani", color: "bg-warning-100 text-warning-700" },
  { value: "Dini", label: "Dini", tag: "Perampingan Organisasi", color: "bg-gray-100 text-gray-700" },
];

const STATUS_OPTIONS: { value: StatusPensiun | ""; label: string }[] = [
  { value: "", label: "Semua Status" },
  { value: "Terdeteksi", label: "Terdeteksi Sistem" },
  { value: "DraftBerkas", label: "Draft Berkas" },
  { value: "ValidasiSyarat", label: "Validasi Syarat (APS)" },
  { value: "PersetujuanPejabat", label: "Persetujuan Sekda" },
  { value: "VerifikasiBKPSDM", label: "Verifikasi BKPSDM" },
  { value: "InputSIASN", label: "Input SIASN" },
  { value: "CetakDokumen", label: "Cetak DPCP" },
  { value: "DikirimKanreg", label: "Dikirim ke Kanreg" },
  { value: "SKTerbit", label: "SK Terbit" },
  { value: "Ditolak", label: "Ditolak" },
  { value: "Dibatalkan", label: "Dibatalkan" },
];

const STATUS_COLOR: Record<StatusPensiun, string> = {
  Terdeteksi:         "bg-blue-100 text-blue-700",
  DraftBerkas:        "bg-gray-100 text-gray-700",
  ValidasiSyarat:     "bg-purple-100 text-purple-700",
  PersetujuanPejabat: "bg-warning-100 text-warning-700",
  VerifikasiBKPSDM:   "bg-primary-100 text-primary-700",
  InputSIASN:         "bg-cyan-100 text-cyan-700",
  CetakDokumen:       "bg-indigo-100 text-indigo-700",
  DikirimKanreg:      "bg-orange-100 text-orange-700",
  SKTerbit:           "bg-success-100 text-success-700",
  Ditolak:            "bg-danger-100 text-danger-700",
  Dibatalkan:         "bg-gray-100 text-gray-500",
};

interface FormState {
  asnId: string;
  asnSearch: string;
  jenisPensiun: JenisPensiun;
  tanggalBup: string;
  tahunBup: string;
  bupUsia: string;
  isDarurat: boolean;
  subJenisUzur: string;
  keterangan: string;
}

const emptyForm: FormState = {
  asnId: "", asnSearch: "", jenisPensiun: "BUP",
  tanggalBup: "", tahunBup: "", bupUsia: "58",
  isDarurat: false, subJenisUzur: "", keterangan: "",
};

const INPUT = "h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px] w-full outline-0";
const TD = "px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]";

export default function PerencanaanPage() {
  const user = useAuthStore((state) => state.user);
  const canManage = user?.roleNama === "Admin_Sistem" || user?.roleNama === "Kabid";

  const [jenisPensiun, setJenisPensiun] = useState<JenisPensiun | "">("");
  const [statusPensiun, setStatusPensiun] = useState<StatusPensiun | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const params = useMemo(() => ({
    jenisPensiun: jenisPensiun || undefined,
    statusPensiun: statusPensiun || undefined,
    search: search.trim() || undefined,
    page, limit: 10,
  }), [jenisPensiun, statusPensiun, search, page]);

  const list = usePerencanaanList(params);
  const actions = usePerencanaanActions();
  const asnList = useAsnList({ search: form.asnSearch || undefined, page: 1, limit: 5 });

  const totalPages = list.data?.meta.totalPages ?? 1;
  const visiblePages = getVisiblePages(page, totalPages);

  const submitCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.asnId) return;
    actions.create.mutate(
      {
        asnId: form.asnId,
        jenisPensiun: form.jenisPensiun,
        tanggalBup: form.tanggalBup,
        tahunBup: Number(form.tahunBup),
        bupUsia: Number(form.bupUsia),
        isDarurat: form.jenisPensiun === "JandaDuda" ? true : form.isDarurat,
        subJenisUzur: form.subJenisUzur || undefined,
        keterangan: form.keterangan || undefined,
      },
      { onSuccess: () => { setIsModalOpen(false); setForm(emptyForm); } },
    );
  };

  const selectedJenis = JENIS_OPTIONS.find((o) => o.value === jenisPensiun);

  return (
    <div className="space-y-[25px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="!mb-1">Perencanaan Pensiun</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Monitoring BUP dan pengelolaan 5 jenis pensiun — Perka BKN No. 3/2020
          </p>
        </div>
        {canManage ? (
          <button
            type="button"
            className="inline-flex items-center gap-2 py-[10px] px-[20px] bg-primary-500 text-white rounded-md hover:bg-primary-400 transition-all"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="material-symbols-outlined !text-[20px]">add</i>
            Tambah
          </button>
        ) : null}
      </div>

      {/* Filter chips per jenis pensiun */}
      <div className="flex flex-wrap gap-2">
        {JENIS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
              jenisPensiun === opt.value
                ? "border-primary-500 bg-primary-500 text-white"
                : "border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] hover:border-primary-500"
            }`}
            onClick={() => { setJenisPensiun(opt.value as JenisPensiun | ""); setPage(1); }}
          >
            {opt.value ? <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${opt.color}`}>{opt.value}</span> : null}
            {opt.value ? opt.tag : "Semua Jenis"}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px] outline-0"
            value={statusPensiun}
            onChange={(e) => { setStatusPensiun(e.target.value as StatusPensiun | ""); setPage(1); }}
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input
            className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px] outline-0 md:col-span-2"
            placeholder="Cari nama atau NIP ASN"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {selectedJenis?.value ? (
        <div className={`px-4 py-3 rounded-md border text-sm font-medium ${selectedJenis.color} border-current/20`}>
          <strong>{selectedJenis.label}</strong> — {selectedJenis.tag}
          {selectedJenis.value === "BUP" ? " · Sistem scan otomatis H-15 bulan sebelum TMT. SLA kritis: berkas ke Kanreg BKN paling lambat H-2 bulan." : null}
          {selectedJenis.value === "APS" ? " · Validasi otomatis: usia ≥ 50 tahun + masa kerja ≥ 20 tahun sebelum diteruskan ke Sekda." : null}
          {selectedJenis.value === "JandaDuda" ? " · 🚨 Alur darurat — proses harus dimulai dalam 3 hari kerja setelah laporan masuk. Tidak ada syarat usia/masa kerja minimum." : null}
          {selectedJenis.value === "Uzur" ? " · Dua sub-jenis: Karena Dinas (keudzuran jabatan) & Bukan Karena Dinas (masa kerja ≥ 4 tahun). Surat TPK adalah syarat mutlak." : null}
          {selectedJenis.value === "Dini" ? " · Akibat kebijakan perampingan organisasi. Perlu SK/kebijakan pemerintah sebagai dasar hukum." : null}
        </div>
      ) : null}

      {list.isError ? (
        <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">
          Gagal memuat data
        </div>
      ) : null}

      <div className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036]">
        {list.isLoading ? (
          <div className="animate-pulse rounded-md bg-gray-200 dark:bg-[#172036] h-48" />
        ) : list.data?.data.length ? (
          <>
            <div className="table-responsive overflow-x-auto">
              <table className="w-full">
                <thead className="text-black dark:text-white">
                  <tr>
                    {["NIP / Nama ASN", "Unit", "Jenis", "TMT Pensiun", "Status", "Aksi"].map((h) => (
                      <th key={h} className="font-medium text-left px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.data.data.map((item) => {
                    const jenis = JENIS_OPTIONS.find((o) => o.value === item.jenisPensiun);
                    return (
                      <tr key={item.id} className={item.isDarurat ? "bg-danger-50/40 dark:bg-danger-900/10" : ""}>
                        <td className={TD}>
                          <div className="flex items-center gap-2">
                            {item.isDarurat ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-danger-500 text-white shrink-0" title="DARURAT">
                                <i className="material-symbols-outlined !text-[14px]">priority_high</i>
                              </span>
                            ) : null}
                            <div>
                              <span className="block font-medium">{item.asn?.nama ?? "-"}</span>
                              <span className="text-sm text-gray-500">{item.asn?.nipBaru ?? "-"}</span>
                            </div>
                          </div>
                        </td>
                        <td className={TD}>
                          <span className="text-sm">{item.asn?.unitOrganisasi?.nama ?? "-"}</span>
                        </td>
                        <td className={TD}>
                          {jenis?.value ? (
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${jenis.color}`}>
                              {jenis.value}
                            </span>
                          ) : "-"}
                        </td>
                        <td className={`${TD} whitespace-nowrap`}>
                          {new Date(item.tanggalBup).toLocaleDateString("id-ID")}
                          <span className="block text-xs text-gray-500">Usia {item.bupUsia} th</span>
                        </td>
                        <td className={TD}>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[item.statusPensiun]}`}>
                            {STATUS_OPTIONS.find((o) => o.value === item.statusPensiun)?.label ?? item.statusPensiun}
                          </span>
                          {item.autoDetected ? (
                            <span className="block text-xs text-gray-400 mt-0.5">Auto-detect</span>
                          ) : null}
                        </td>
                        <td className={TD}>
                          <Link href={`/perencanaan/${item.id}`} className="text-primary-500 font-medium hover:underline whitespace-nowrap">
                            Lihat detail
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 ? (
              <div className="flex flex-wrap items-center justify-end gap-2 mt-[20px]">
                {visiblePages.map((p, idx) =>
                  p === "ellipsis" ? (
                    <span key={`e-${idx}`} className="inline-flex h-9 min-w-9 items-center justify-center px-2 text-gray-400">...</span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      className={`w-9 h-9 rounded-md border ${p === page ? "bg-primary-500 text-white border-primary-500" : "border-gray-200 dark:border-[#172036]"}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>
            ) : null}
          </>
        ) : (
          <div className="text-center py-[45px]">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary-50 text-primary-500 flex items-center justify-center mb-4">
              <i className="material-symbols-outlined !text-[34px]">event_available</i>
            </div>
            <h5 className="!mb-1">Belum ada data perencanaan pensiun</h5>
            <p className="text-gray-500 dark:text-gray-400">
              Data BUP akan muncul otomatis saat sistem mendeteksi ASN yang mendekati masa pensiun.
            </p>
          </div>
        )}
      </div>

      {/* Modal Tambah */}
      {isModalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            className="bg-white dark:bg-[#0c1427] rounded-md p-[25px] w-full max-w-[680px] space-y-4 max-h-[90vh] overflow-y-auto"
            onSubmit={submitCreate}
          >
            <h5>Tambah Perencanaan Pensiun</h5>

            <div>
              <label className="block mb-2 font-medium">Jenis Pensiun</label>
              <div className="grid grid-cols-3 gap-2">
                {(["BUP", "APS", "JandaDuda", "Uzur", "Dini"] as JenisPensiun[]).map((j) => {
                  const opt = JENIS_OPTIONS.find((o) => o.value === j)!;
                  return (
                    <button
                      key={j}
                      type="button"
                      className={`px-3 py-2 rounded-md border text-sm font-medium text-left transition-all ${
                        form.jenisPensiun === j
                          ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-[#15203c]"
                          : "border-gray-200 dark:border-[#172036]"
                      }`}
                      onClick={() => setField("jenisPensiun", j)}
                    >
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-semibold ${opt.color} block mb-1`}>{j}</span>
                      <span className="text-xs text-gray-500">{opt.tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {form.jenisPensiun === "JandaDuda" ? (
              <div className="rounded-md border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
                🚨 Alur darurat — proses harus dimulai dalam 3 hari kerja. Tidak ada syarat usia/masa kerja minimum.
              </div>
            ) : null}

            {form.jenisPensiun === "Uzur" ? (
              <div>
                <label className="block mb-2 font-medium">Sub-jenis Uzur <span className="text-danger-500">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {(["KarenaDinas", "BukanKarenaDinas"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`px-3 py-2 rounded-md border text-sm text-left transition-all ${
                        form.subJenisUzur === s
                          ? "border-primary-500 bg-primary-50 dark:bg-[#15203c]"
                          : "border-gray-200 dark:border-[#172036]"
                      }`}
                      onClick={() => setField("subJenisUzur", s)}
                    >
                      <span className="font-medium">{s === "KarenaDinas" ? "Karena Dinas" : "Bukan Karena Dinas"}</span>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        {s === "KarenaDinas" ? "Keudzuran jabatan / akibat tugas" : "Masa kerja ≥ 4 tahun wajib"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <label className="block mb-2 font-medium">Cari ASN <span className="text-danger-500">*</span></label>
              <input
                className={INPUT}
                placeholder="Cari nama atau NIP ASN"
                value={form.asnSearch}
                onChange={(e) => setField("asnSearch", e.target.value)}
              />
              <div className="mt-1 max-h-[140px] overflow-y-auto border border-gray-100 dark:border-[#172036] rounded-md">
                {(asnList.data?.data ?? []).map((asn) => (
                  <button
                    key={asn.id}
                    type="button"
                    className={`block w-full text-left px-3 py-2 border-b border-gray-100 dark:border-[#172036] last:border-b-0 hover:bg-primary-50 dark:hover:bg-[#15203c] ${
                      form.asnId === asn.id ? "bg-primary-50 dark:bg-[#15203c]" : ""
                    }`}
                    onClick={() => setForm((p) => ({ ...p, asnId: asn.id, asnSearch: `${asn.nama} — ${asn.nipBaru}` }))}
                  >
                    <span className="block font-medium">{asn.nama}</span>
                    <span className="text-sm text-gray-500">{asn.nipBaru}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block mb-2 font-medium">Tanggal BUP <span className="text-danger-500">*</span></label>
                <input required type="date" className={INPUT} value={form.tanggalBup} onChange={(e) => setField("tanggalBup", e.target.value)} />
              </div>
              <div>
                <label className="block mb-2 font-medium">Tahun BUP</label>
                <input required type="number" className={INPUT} placeholder="2026" value={form.tahunBup} onChange={(e) => setField("tahunBup", e.target.value)} />
              </div>
              <div>
                <label className="block mb-2 font-medium">Usia BUP</label>
                <input required type="number" className={INPUT} placeholder="58" value={form.bupUsia} onChange={(e) => setField("bupUsia", e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium">Keterangan</label>
              <textarea
                className="min-h-[80px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px] py-[10px] w-full outline-0"
                placeholder="Catatan tambahan..."
                value={form.keterangan}
                onChange={(e) => setField("keterangan", e.target.value)}
              />
            </div>

            {form.jenisPensiun === "APS" ? (
              <div className="rounded-md border border-warning-200 bg-warning-50 px-3 py-2 text-sm text-warning-700">
                ⚠ Sistem akan memvalidasi otomatis: usia ≥ 50 tahun DAN masa kerja ≥ 20 tahun. Pengajuan akan ditolak jika syarat tidak terpenuhi.
              </div>
            ) : null}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" className="px-5 py-2 rounded-md border border-gray-200 dark:border-[#172036]" onClick={() => { setIsModalOpen(false); setForm(emptyForm); }}>
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-md bg-primary-500 text-white disabled:opacity-70"
                disabled={!form.asnId || !form.tanggalBup || actions.create.isPending}
              >
                {actions.create.isPending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
