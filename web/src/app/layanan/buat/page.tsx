"use client";

import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAsnSearch,
  useCreateLayanan,
  useJenisLayanan,
} from "@/hooks/useLayanan";
import { useAuthStore } from "@/store/auth.store";
import type { Asn, RefJenisLayanan } from "@/types/models";

const STEPS = [
  { label: "Jenis layanan", icon: "format_list_bulleted" },
  { label: "Data ASN", icon: "person" },
  { label: "Konfirmasi", icon: "check" },
];

export default function BuatLayananPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const jenisLayananQuery = useJenisLayanan();
  const createLayanan = useCreateLayanan();

  const [step, setStep] = useState(1);
  const [layananSearch, setLayananSearch] = useState("");
  const [selectedJenis, setSelectedJenis] = useState<RefJenisLayanan | null>(null);
  const [asnSearch, setAsnSearch] = useState("");
  const asnQuery = useAsnSearch(asnSearch);
  const [selectedAsn, setSelectedAsn] = useState<Asn | null>(null);
  const [showAsnDropdown, setShowAsnDropdown] = useState(false);
  const [tanggalUsulan, setTanggalUsulan] = useState(dayjs().format("YYYY-MM-DD"));
  const [catatan, setCatatan] = useState("");
  const [submitError, setSubmitError] = useState("");

  const asnInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.roleNama && user.roleNama !== "Pengelola_OPD") {
      router.replace("/layanan");
    }
  }, [router, user]);

  const filteredJenis = useMemo(() => {
    const list = jenisLayananQuery.data ?? [];
    if (!layananSearch.trim()) return list;
    const q = layananSearch.toLowerCase();
    return list.filter(
      (j) =>
        j.nama.toLowerCase().includes(q) ||
        j.kode.toLowerCase().includes(q),
    );
  }, [jenisLayananQuery.data, layananSearch]);

  const initials = (nama: string) =>
    nama
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  const canGoStep2 = !!selectedJenis;
  const canGoStep3 = !!selectedAsn && !!tanggalUsulan;

  const goTo = (target: number) => {
    if (target === 2 && !canGoStep2) return;
    if (target === 3 && !canGoStep3) return;
    setStep(target);
  };

  const handleSubmit = async () => {
    if (!selectedJenis || !selectedAsn || !user?.unitOrganisasiId) return;
    setSubmitError("");
    try {
      const res = await createLayanan.mutateAsync({
        jenisLayananId: selectedJenis.id,
        asnId: selectedAsn.id,
        unitOrganisasiId: selectedAsn.unitOrganisasiId ?? user.unitOrganisasiId,
        tanggalUsulan,
      });
      router.push(`/layanan/${res.data.data.id}`);
    } catch {
      setSubmitError("Gagal membuat draft. Silakan coba lagi.");
    }
  };

  const kelengkapan = [
    { label: "Jenis layanan sudah dipilih", ok: !!selectedJenis },
    { label: "Data ASN ditemukan dan valid", ok: !!selectedAsn },
    { label: "Tanggal usulan sudah diisi", ok: !!tanggalUsulan },
    ...(selectedJenis?.butuhTteKepalaBadan
      ? [{ label: "Layanan ini membutuhkan TTE Kepala Badan — pastikan sudah berkoordinasi sebelumnya", ok: null }]
      : []),
  ];

  return (
    <div className="space-y-[25px]">
      {/* Header */}
      <div>
        <h1 className="!mb-1 text-xl font-bold text-black dark:text-white">Buat usulan</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Lengkapi 3 langkah untuk membuat draft usulan layanan
        </p>
      </div>

      {/* Stepper */}
      <div className="grid grid-cols-3 gap-3">
        {STEPS.map(({ label, icon }, idx) => {
          const num = idx + 1;
          const isDone = step > num;
          const isActive = step === num;
          return (
            <button
              key={label}
              type="button"
              onClick={() => goTo(num)}
              className={`rounded-xl border p-4 text-left transition-all ${
                isDone
                  ? "bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800/40"
                  : isActive
                  ? "bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700"
                  : "bg-white dark:bg-[#0c1427] border-gray-200 dark:border-[#172036]"
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-2 ${
                isDone
                  ? "bg-success-500"
                  : isActive
                  ? "bg-primary-500"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}>
                <i className={`material-symbols-outlined !text-[16px] text-white`}>
                  {isDone ? "check" : icon}
                </i>
              </div>
              <p className={`text-xs font-semibold mb-0.5 ${
                isDone ? "text-success-600 dark:text-success-400"
                : isActive ? "text-primary-600 dark:text-primary-400"
                : "text-gray-400 dark:text-gray-500"
              }`}>
                STEP {num}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-bold ${
                  isDone ? "text-success-700 dark:text-success-300"
                  : isActive ? "text-primary-700 dark:text-primary-300"
                  : "text-gray-500 dark:text-gray-400"
                }`}>
                  {label}
                </span>
                {isDone && (
                  <span className="text-xs text-success-600 dark:text-success-400 font-medium">
                    ✓ Selesai
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div className="space-y-[20px]">
          <div>
            <h5 className="!mb-1 text-base font-bold text-black dark:text-white">Pilih jenis layanan</h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ketuk kartu untuk memilih, lalu lanjut ke step berikutnya.
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <i className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 !text-[20px]">
              search
            </i>
            <input
              type="search"
              className="w-full h-[48px] pl-11 pr-4 rounded-xl border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] text-black dark:text-white text-sm outline-0 focus:border-primary-500"
              placeholder="Cari layanan..."
              value={layananSearch}
              onChange={(e) => setLayananSearch(e.target.value)}
              suppressHydrationWarning
            />
          </div>

          {/* Grid */}
          {jenisLayananQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-36 rounded-2xl bg-gray-100 dark:bg-[#172036] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredJenis.map((item) => {
                const isSelected = selectedJenis?.id === item.id;
                const isTte = item.butuhTteKepalaBadan;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedJenis(item)}
                    className={`text-left rounded-2xl border-2 flex flex-col justify-between min-h-[140px] px-6 py-5 transition-all ${
                      isTte
                        ? isSelected
                          ? "border-orange-500 bg-orange-100 shadow-md"
                          : "border-orange-200 bg-orange-50 hover:border-orange-400 hover:shadow-md"
                        : isSelected
                        ? "border-primary-500 bg-primary-100 shadow-md"
                        : "border-primary-100 bg-primary-50 hover:border-primary-400 hover:shadow-md"
                    }`}
                  >
                    <div>
                      <p className={`text-xs font-bold tracking-widest uppercase mb-3 ${
                        isTte ? "text-orange-500" : "text-primary-500"
                      }`}>
                        {item.kode}
                      </p>
                      <p className="font-bold text-base leading-snug text-gray-800">
                        {item.nama}
                      </p>
                    </div>
                    {isTte && (
                      <span className="mt-4 self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-200 text-orange-700 text-xs font-bold">
                        <i className="material-symbols-outlined !text-[14px]">draw</i>
                        Butuh TTE Kepala Badan
                      </span>
                    )}
                  </button>
                );
              })}
              {filteredJenis.length === 0 && (
                <p className="col-span-3 text-center py-10 text-gray-400">
                  Tidak ada layanan ditemukan
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <div className="space-y-[20px]">
          {/* Cari ASN card */}
          <div className="bg-white dark:bg-[#0c1427] rounded-xl border border-gray-200 dark:border-[#172036] p-[20px]">
            <div className="flex items-center gap-2 mb-4">
              <i className="material-symbols-outlined text-primary-500 !text-[20px]">person_search</i>
              <h5 className="!mb-0 text-sm font-bold text-black dark:text-white">Cari data ASN</h5>
            </div>
            <label className="block text-sm font-medium text-black dark:text-white mb-1.5">
              Cari ASN <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={asnInputRef}
                type="text"
                className="w-full h-[48px] px-4 rounded-xl border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] text-black dark:text-white text-sm outline-0 focus:border-primary-500"
                placeholder="Ketik NIP atau nama ASN..."
                value={asnSearch}
                onChange={(e) => {
                  setAsnSearch(e.target.value);
                  setShowAsnDropdown(true);
                  if (selectedAsn && e.target.value !== selectedAsn.nama) {
                    setSelectedAsn(null);
                  }
                }}
                onFocus={() => setShowAsnDropdown(true)}
                suppressHydrationWarning
              />
              {showAsnDropdown && asnSearch.length >= 3 && (asnQuery.data?.data ?? []).length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white dark:bg-[#0c1427] border border-gray-200 dark:border-[#172036] rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
                  {(asnQuery.data?.data ?? []).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="flex items-center gap-3 w-full px-4 py-3 text-left border-b border-gray-100 dark:border-[#172036] last:border-b-0 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                      onClick={() => {
                        setSelectedAsn(item);
                        setAsnSearch(item.nama);
                        setShowAsnDropdown(false);
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-xs shrink-0">
                        {initials(item.nama)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-black dark:text-white">{item.nama}</p>
                        <p className="text-xs text-gray-500">NIP {item.nipBaru}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showAsnDropdown && asnSearch.length >= 3 && !asnQuery.isLoading && (asnQuery.data?.data ?? []).length === 0 && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white dark:bg-[#0c1427] border border-gray-200 dark:border-[#172036] rounded-xl shadow-lg px-4 py-3 text-sm text-gray-500">
                  ASN tidak ditemukan
                </div>
              )}
            </div>
            <p className="mt-1.5 text-xs text-gray-400 flex items-center gap-1">
              <i className="material-symbols-outlined !text-[14px]">info</i>
              Minimal 3 karakter untuk menampilkan hasil
            </p>

            {selectedAsn && (
              <div className="mt-3 flex items-center gap-3 p-3 rounded-lg bg-success-50 dark:bg-success-900/10 border border-success-200 dark:border-success-800/40">
                <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
                  {initials(selectedAsn.nama)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-black dark:text-white">{selectedAsn.nama}</p>
                  <p className="text-xs text-gray-500">NIP {selectedAsn.nipBaru}</p>
                </div>
                <i className="material-symbols-outlined text-success-500 ml-auto !text-[20px]">check_circle</i>
              </div>
            )}
          </div>

          {/* Tanggal usulan card */}
          <div className="bg-white dark:bg-[#0c1427] rounded-xl border border-gray-200 dark:border-[#172036] p-[20px]">
            <div className="flex items-center gap-2 mb-4">
              <i className="material-symbols-outlined text-primary-500 !text-[20px]">calendar_month</i>
              <h5 className="!mb-0 text-sm font-bold text-black dark:text-white">Tanggal usulan</h5>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-1.5">
                  Tanggal usulan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full h-[48px] px-4 rounded-xl border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] text-black dark:text-white text-sm outline-0 focus:border-primary-500"
                  value={tanggalUsulan}
                  onChange={(e) => setTanggalUsulan(e.target.value)}
                  suppressHydrationWarning
                />
                <p className="mt-1.5 text-xs text-gray-400 flex items-center gap-1">
                  <i className="material-symbols-outlined !text-[14px]">info</i>
                  Format: hari/bulan/tahun
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-1.5">
                  Catatan <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <input
                  type="text"
                  className="w-full h-[48px] px-4 rounded-xl border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] text-black dark:text-white text-sm outline-0 focus:border-primary-500"
                  placeholder="Catatan tambahan untuk usulan ini..."
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  suppressHydrationWarning
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3 ── */}
      {step === 3 && (
        <div className="space-y-[20px]">
          {/* Info banner */}
          <div className="flex items-start gap-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 px-4 py-3">
            <i className="material-symbols-outlined text-blue-500 !text-[20px] shrink-0 mt-0.5">info</i>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Periksa kembali data di bawah sebelum membuat draft. Setelah draft dibuat, Anda masih dapat mengeditnya sebelum diajukan.
            </p>
          </div>

          {/* Ringkasan usulan */}
          <div className="bg-white dark:bg-[#0c1427] rounded-xl border border-gray-200 dark:border-[#172036] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-[#172036]">
              <i className="material-symbols-outlined text-gray-500 !text-[18px]">description</i>
              <h5 className="!mb-0 text-sm font-bold text-black dark:text-white">Ringkasan usulan</h5>
            </div>

            {/* Row: Jenis layanan */}
            <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 dark:border-[#172036]">
              <i className="material-symbols-outlined text-gray-400 !text-[18px] shrink-0">format_list_bulleted</i>
              <span className="text-sm text-gray-500 w-28 shrink-0">Jenis layanan</span>
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-semibold">
                  <i className="material-symbols-outlined !text-[12px]">description</i>
                  {selectedJenis?.nama}
                </span>
                {selectedJenis?.butuhTteKepalaBadan && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-semibold">
                    <i className="material-symbols-outlined !text-[12px]">draw</i>
                    Butuh TTE Kepala Badan
                  </span>
                )}
              </div>
              <button type="button" onClick={() => setStep(1)} className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-[#172036] rounded-lg hover:border-primary-400 text-gray-600 dark:text-gray-400">
                <i className="material-symbols-outlined !text-[14px]">edit</i> Ubah
              </button>
            </div>

            {/* Row: Nama ASN */}
            <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 dark:border-[#172036]">
              <i className="material-symbols-outlined text-gray-400 !text-[18px] shrink-0">person</i>
              <span className="text-sm text-gray-500 w-28 shrink-0">Nama ASN</span>
              <div className="flex items-center gap-2 flex-1">
                <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-xs shrink-0">
                  {selectedAsn ? initials(selectedAsn.nama) : ""}
                </div>
                <span className="font-semibold text-sm text-black dark:text-white">{selectedAsn?.nama}</span>
              </div>
              <button type="button" onClick={() => setStep(2)} className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-[#172036] rounded-lg hover:border-primary-400 text-gray-600 dark:text-gray-400">
                <i className="material-symbols-outlined !text-[14px]">edit</i> Ubah
              </button>
            </div>

            {/* Row: NIP */}
            <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 dark:border-[#172036]">
              <i className="material-symbols-outlined text-gray-400 !text-[18px] shrink-0">badge</i>
              <span className="text-sm text-gray-500 w-28 shrink-0">NIP</span>
              <span className="font-mono text-sm text-black dark:text-white">{selectedAsn?.nipBaru}</span>
            </div>

            {/* Row: Unit kerja */}
            <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 dark:border-[#172036]">
              <i className="material-symbols-outlined text-gray-400 !text-[18px] shrink-0">apartment</i>
              <span className="text-sm text-gray-500 w-28 shrink-0">Unit kerja</span>
              <span className="font-semibold text-sm text-black dark:text-white">
                {(selectedAsn as (Asn & { unitOrganisasi?: { nama: string } }) | null)?.unitOrganisasi?.nama ?? user?.unitOrganisasiId ?? "-"}
              </span>
            </div>

            {/* Row: Tanggal usulan */}
            <div className="flex items-center gap-4 px-5 py-4">
              <i className="material-symbols-outlined text-gray-400 !text-[18px] shrink-0">calendar_month</i>
              <span className="text-sm text-gray-500 w-28 shrink-0">Tanggal usulan</span>
              <span className="font-semibold text-sm text-black dark:text-white flex-1">
                {dayjs(tanggalUsulan).format("DD MMMM YYYY")}
              </span>
              <button type="button" onClick={() => setStep(2)} className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-[#172036] rounded-lg hover:border-primary-400 text-gray-600 dark:text-gray-400">
                <i className="material-symbols-outlined !text-[14px]">edit</i> Ubah
              </button>
            </div>
          </div>

          {/* Kelengkapan data */}
          <div className="bg-white dark:bg-[#0c1427] rounded-xl border border-gray-200 dark:border-[#172036] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-[#172036]">
              <i className="material-symbols-outlined text-success-500 !text-[18px]">checklist</i>
              <h5 className="!mb-0 text-sm font-bold text-black dark:text-white">Kelengkapan data</h5>
            </div>
            <div className="px-5 py-4 space-y-3">
              {kelengkapan.map(({ label, ok }) => (
                <div key={label} className="flex items-start gap-2.5">
                  {ok === null ? (
                    <i className="material-symbols-outlined !text-[18px] text-orange-500 shrink-0 mt-0.5">warning</i>
                  ) : ok ? (
                    <i className="material-symbols-outlined !text-[18px] text-success-500 shrink-0 mt-0.5">check_circle</i>
                  ) : (
                    <i className="material-symbols-outlined !text-[18px] text-gray-300 shrink-0 mt-0.5">radio_button_unchecked</i>
                  )}
                  <span className={`text-sm ${ok === null ? "text-orange-600 dark:text-orange-400" : ok ? "text-gray-700 dark:text-gray-300" : "text-gray-400"}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {submitError && (
            <p className="text-sm text-danger-500 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 rounded-xl px-4 py-3">
              {submitError}
            </p>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-2">
        {step > 1 ? (
          <button
            type="button"
            className="inline-flex items-center gap-2 py-[10px] px-[20px] rounded-xl border border-gray-200 dark:border-[#172036] text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-400"
            onClick={() => setStep((s) => s - 1)}
          >
            <i className="material-symbols-outlined !text-[18px]">arrow_back</i>
            Sebelumnya
          </button>
        ) : (
          <div />
        )}

        {step === 1 && (
          <button
            type="button"
            className="inline-flex items-center gap-2 py-[10px] px-[20px] rounded-xl bg-primary-500 text-white text-sm font-medium disabled:opacity-50"
            disabled={!canGoStep2}
            onClick={() => setStep(2)}
          >
            Lanjut ke Data ASN
            <i className="material-symbols-outlined !text-[18px]">arrow_forward</i>
          </button>
        )}

        {step === 2 && (
          <button
            type="button"
            className="inline-flex items-center gap-2 py-[10px] px-[20px] rounded-xl bg-primary-500 text-white text-sm font-medium disabled:opacity-50"
            disabled={!canGoStep3}
            onClick={() => setStep(3)}
          >
            Lanjut ke konfirmasi
            <i className="material-symbols-outlined !text-[18px]">arrow_forward</i>
          </button>
        )}

        {step === 3 && (
          <button
            type="button"
            className="inline-flex items-center gap-2 py-[10px] px-[24px] rounded-xl bg-primary-500 text-white text-sm font-medium disabled:opacity-60"
            disabled={createLayanan.isPending || !selectedJenis || !selectedAsn}
            onClick={() => void handleSubmit()}
          >
            <i className="material-symbols-outlined !text-[18px]">description</i>
            {createLayanan.isPending ? "Menyimpan..." : "Buat draft usulan"}
          </button>
        )}
      </div>
    </div>
  );
}
