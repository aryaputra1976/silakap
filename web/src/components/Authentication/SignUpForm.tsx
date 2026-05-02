"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { ApiResponse, UnitOrganisasi } from "@/types/models";

type RegisterForm = {
  nip: string;
  email: string;
  nomorHp: string;
  unitOrganisasiId: string;
  password: string;
  confirmPassword: string;
};

const initialForm: RegisterForm = {
  nip: "",
  email: "",
  nomorHp: "",
  unitOrganisasiId: "",
  password: "",
  confirmPassword: "",
};

type AsnLookup = {
  id: string;
  nipBaru: string;
  nama: string;
  email: string | null;
  nomorHp: string | null;
  unitOrganisasiId: string | null;
  unitOrganisasi: { id: string; nama: string } | null;
};

const fieldClass =
  "w-full h-[46px] rounded-full border border-transparent bg-[#edf5fb] pl-12 pr-4 text-[14px] text-[#416783] shadow-[inset_6px_6px_14px_rgba(150,174,196,0.16),inset_-6px_-6px_14px_rgba(255,255,255,0.82)] outline-none transition-all placeholder:text-[#8a9aba] focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100";

const labelClass = "mb-2 block text-[14px] font-medium text-[#416783]";
const helpClass = "mt-2 block text-[12px] leading-relaxed text-[#6b8cad]";

const SignUpForm: React.FC = () => {
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [units, setUnits] = useState<UnitOrganisasi[]>([]);
  const [namaPegawai, setNamaPegawai] = useState("-");
  const [loading, setLoading] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [checkingNip, setCheckingNip] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const unitOptions = useMemo(
    () => units.filter((unit) => unit.level === 2 || unit.level === 3 || unit.isOpd),
    [units],
  );

  const setField = (field: keyof RegisterForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setSuccess("");
  };

  useEffect(() => {
    let active = true;

    const loadUnits = async () => {
      setLoadingUnits(true);
      try {
        const { data } = await api.get<ApiResponse<UnitOrganisasi[]>>("/auth/unit-organisasi");
        if (active) setUnits(data.data);
      } catch {
        if (active) setError("Gagal memuat unit organisasi.");
      } finally {
        if (active) setLoadingUnits(false);
      }
    };

    void loadUnits();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (form.nip.length !== 18) {
      setNamaPegawai("-");
      return;
    }

    let active = true;

    const lookupAsn = async () => {
      setCheckingNip(true);
      try {
        const { data } = await api.get<ApiResponse<AsnLookup>>(`/auth/asn/by-nip/${form.nip}`);
        if (!active) return;

        const asn = data.data;
        setNamaPegawai(asn.nama);
        setForm((current) => ({
          ...current,
          email: current.email || asn.email || "",
          nomorHp: current.nomorHp || asn.nomorHp || "",
          unitOrganisasiId: current.unitOrganisasiId || asn.unitOrganisasiId || "",
        }));
      } catch (err: unknown) {
        if (!active) return;
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setNamaPegawai("-");
        setError(msg ?? "Data ASN tidak ditemukan.");
      } finally {
        if (active) setCheckingNip(false);
      }
    };

    void lookupAsn();

    return () => {
      active = false;
    };
  }, [form.nip]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.nip.trim().length !== 18) {
      setError("NIP harus terdiri dari 18 digit.");
      return;
    }

    if (namaPegawai === "-") {
      setError("NIP harus terhubung dengan data ASN aktif terlebih dahulu.");
      return;
    }

    if (!form.unitOrganisasiId) {
      setError("Unit organisasi wajib dipilih.");
      return;
    }

    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password)) {
      setError("Password minimal 8 karakter serta memiliki huruf kapital dan angka.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post<ApiResponse<unknown>>("/auth/register", form);
      setSuccess(data.message);
      setForm(initialForm);
      setNamaPegawai("-");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Registrasi gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-main-content min-h-screen bg-[#eef7fb] px-4 py-3 text-[#416783]">
      <section className="mx-auto w-full max-w-[1080px] bg-[#eef7fb] px-4 py-4 md:px-6">
        <div className="mb-5 flex flex-col items-start gap-4 md:flex-row md:items-start md:gap-5">
          <div className="flex h-[82px] w-[82px] shrink-0 items-center justify-center rounded-full bg-[#e3edf5] shadow-[9px_9px_18px_rgba(156,178,198,0.18),-9px_-9px_18px_rgba(255,255,255,0.82)] md:ml-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-bkpsdm.svg"
              alt="BKPSDM"
              className="h-[52px] w-[52px] object-contain"
            />
          </div>

          <div className="max-w-[760px]">
            <h1 className="!mb-1 !text-[28px] !font-bold !leading-tight tracking-normal !text-[#14233b] md:!text-[32px]">
              Registrasi SILAKAP
            </h1>
            <p className="mb-1 text-[14px] font-medium text-[#6384a6]">BKPSDM</p>
            <p className="max-w-[760px] text-[13px] leading-6 text-[#6384a6]">
              Buat akun baru untuk mengakses layanan ASN. Jika Anda memiliki NIP aktif,
              masukkan agar akun dapat dikaitkan dengan data pegawai. Pendaftaran ini
              khusus operator perangkat daerah dan akun akan aktif setelah verifikasi admin.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="nip">
              NIP
            </label>
            <div className="relative">
              <i className="ri-id-card-line absolute left-5 top-1/2 -translate-y-1/2 text-[18px] text-[#7d95aa]" />
              <input
                id="nip"
                inputMode="numeric"
                maxLength={18}
                value={form.nip}
                onChange={(event) =>
                  setField("nip", event.target.value.replace(/\D/g, "").slice(0, 18))
                }
                placeholder="NIP aktif"
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="namaPegawai">
              Nama Pegawai
            </label>
            <input
              id="namaPegawai"
              value={checkingNip ? "Memuat data pegawai..." : namaPegawai}
              readOnly
              className={`${fieldClass} pl-5 text-[#416783]`}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="email">
              Email
            </label>
            <div className="relative">
              <i className="ri-user-3-line absolute left-5 top-1/2 -translate-y-1/2 text-[18px] text-[#7d95aa]" />
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
                placeholder="Email pegawai"
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="unitOrganisasiId">
              Unor Pegawai
            </label>
            <div className="relative">
              <i className="ri-bank-card-line absolute left-5 top-1/2 -translate-y-1/2 text-[18px] text-[#7d95aa]" />
              <select
                id="unitOrganisasiId"
                value={form.unitOrganisasiId}
                onChange={(event) => setField("unitOrganisasiId", event.target.value)}
                className={`${fieldClass} appearance-none pr-12 text-[#8a9aba]`}
                disabled={loadingUnits}
              >
                <option value="">
                  {loadingUnits ? "Memuat unit organisasi..." : "Cari unit organisasi level 2 atau 3"}
                </option>
                {unitOptions.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.nama}
                  </option>
                ))}
              </select>
              <i className="ri-arrow-down-s-fill absolute right-5 top-1/2 -translate-y-1/2 text-[18px] text-[#7d95aa]" />
            </div>
            <span className={helpClass}>Cari dan pilih unit organisasi level 2 atau 3.</span>
          </div>

          <div>
            <label className={labelClass} htmlFor="nomorHp">
              No. HP Pegawai
            </label>
            <div className="relative">
              <i className="ri-bank-card-line absolute left-5 top-1/2 -translate-y-1/2 text-[18px] text-[#7d95aa]" />
              <input
                id="nomorHp"
                inputMode="tel"
                value={form.nomorHp}
                onChange={(event) => setField("nomorHp", event.target.value)}
                placeholder="No. HP pegawai"
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="roleDefault">
              Role Default
            </label>
            <input
              id="roleDefault"
              value="OPERATOR"
              readOnly
              className={`${fieldClass} pl-5 font-medium text-[#416783]`}
            />
            <span className={helpClass}>
              Role ini diberikan sebagai default untuk pendaftar dari perangkat daerah.
            </span>
          </div>

          <div>
            <label className={labelClass} htmlFor="password">
              Password
            </label>
            <div className="relative">
              <i className="ri-lock-2-line absolute left-5 top-1/2 -translate-y-1/2 text-[18px] text-[#7d95aa]" />
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(event) => setField("password", event.target.value)}
                placeholder="Password"
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="confirmPassword">
              Konfirmasi Password
            </label>
            <div className="relative">
              <i className="ri-lock-2-line absolute left-5 top-1/2 -translate-y-1/2 text-[18px] text-[#7d95aa]" />
              <input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(event) => setField("confirmPassword", event.target.value)}
                placeholder="Konfirmasi password"
                className={fieldClass}
              />
            </div>
          </div>

          {error ? (
            <div className="md:col-span-2 rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="md:col-span-2 rounded-2xl border border-cyan-100 bg-cyan-50 px-5 py-3 text-sm font-medium text-cyan-700">
              {success}
            </div>
          ) : null}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading || checkingNip}
              className="h-[54px] w-full rounded-full bg-gradient-to-r from-[#5fd0e6] to-[#1aa5c4] text-[15px] font-bold text-white shadow-[0_12px_22px_rgba(31,164,196,0.22)] transition-all hover:brightness-105"
            >
              {loading ? "Mendaftarkan..." : "Daftar"}
            </button>
          </div>
        </form>

        <div className="mt-3 text-center">
          <p className="text-[13px] text-[#6b8cad]">
            Akun baru akan berstatus belum aktif sampai diverifikasi oleh admin BKPSDM.
          </p>
          <Link
            href="/authentication/sign-in"
            className="mt-2 inline-block text-[14px] font-bold text-[#416783] transition-all hover:text-cyan-700"
          >
            Sudah punya akun? Kembali ke login
          </Link>
        </div>
      </section>
    </div>
  );
};

export default SignUpForm;
