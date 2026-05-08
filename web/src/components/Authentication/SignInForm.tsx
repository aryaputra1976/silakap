"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { normalizeRoleName, resolveDashboardPath } from "@/lib/dashboard-redirect";
import { useAuthStore } from "@/store/auth.store";
import type { ApiResponse, User } from "@/types/models";

type LoginUser = User & { role?: { nama?: string | null } | null };

const parseRetrySeconds = (message?: string): number | null => {
  const match = message?.match(/dalam\s+(\d+)\s+detik/i);
  if (!match) return null;

  const seconds = Number(match[1]);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
};

const SignInForm: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retrySeconds, setRetrySeconds] = useState<number | null>(null);

  useEffect(() => {
    if (retrySeconds === null) return undefined;
    if (retrySeconds <= 0) {
      setRetrySeconds(null);
      setError("");
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setRetrySeconds((current) => (current === null ? null : current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [retrySeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (retrySeconds !== null) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post<
        ApiResponse<{ accessToken: string; refreshToken: string; user: LoginUser }>
      >("/auth/login", { username, password });

      const user = {
        ...data.data.user,
        roleNama: normalizeRoleName(data.data.user.roleNama ?? data.data.user.role?.nama),
      };
      useAuthStore.getState().setAuth(user, data.data.accessToken, data.data.refreshToken);
      router.push(resolveDashboardPath(user.roleNama));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setRetrySeconds(parseRetrySeconds(msg));
      setError(msg ?? "Username atau password salah");
    } finally {
      setLoading(false);
    }
  };

  const displayedError =
    retrySeconds !== null
      ? `Terlalu banyak percobaan. Silakan coba lagi dalam ${retrySeconds} detik.`
      : error;

  return (
    <div className="auth-main-content min-h-screen flex overflow-hidden">

      {/* ── Panel Kiri ── */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-center p-[60px] overflow-hidden"
        style={{ background: "linear-gradient(135deg, #e0f5fb 0%, #c2e8f5 50%, #a8d8ea 100%)" }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-[320px] h-[320px] rounded-full bg-cyan-300/20 blur-2xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-sky-400/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-[200px] h-[200px] rounded-full bg-teal-300/10 blur-2xl" />

        <div className="relative z-10 max-w-[500px]">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-5 py-2 mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-sm font-semibold text-cyan-800 tracking-wide">Portal Layanan ASN</span>
          </div>

          {/* Hero image */}
          <div className="rounded-2xl overflow-hidden shadow-xl mb-8 ring-1 ring-white/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing.png"
              alt="SILAKAP Portal"
              className="w-full object-cover"
            />
          </div>

          {/* Headline */}
          <h2 className="text-[26px] md:text-[30px] font-bold leading-snug text-[#0e6a8a] mb-4">
            Sistem Informasi Layanan<br />
            Kepegawaian Terintegrasi<br />
            dan Akuntabel
          </h2>
          <p className="text-[#2a7fa0] text-sm leading-relaxed max-w-[400px]">
            Mendukung proses administrasi ASN yang tertib, cepat, dan profesional
            dalam satu portal layanan digital.
          </p>
        </div>
      </div>

      {/* ── Panel Kanan ── */}
      <div className="flex-1 flex items-center justify-center bg-[#eef7fb] p-6">
        <div className="w-full max-w-[400px]">
          <div className="bg-white rounded-3xl shadow-xl shadow-sky-100/60 p-[40px]">

            {/* Logo & Judul */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-[80px] h-[80px] rounded-2xl bg-white shadow-md shadow-sky-200 flex items-center justify-center mb-5 overflow-hidden border border-sky-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-bkpsdm.svg"
                  alt="BKPSDM"
                  className="w-[60px] h-[60px] object-contain"
                />
              </div>
              <h1 className="text-[22px] font-bold text-gray-800 tracking-tight">Login SILAKAP</h1>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-gray-400 mt-1 uppercase">
                Sistem Layanan ASN
              </p>
            </div>

            {/* Error */}
            {displayedError && (
              <div className="mb-5 py-3 px-4 text-red-600 bg-red-50 border border-red-100 rounded-xl text-sm flex items-start gap-2">
                <i className="ri-error-warning-line mt-0.5 shrink-0" />
                <span>{displayedError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <i className="ri-user-3-line text-[18px]" />
                </span>
                <input
                  type="text"
                  id="username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                  suppressHydrationWarning
                  className="w-full h-[52px] rounded-full bg-[#f4f8fb] border border-transparent pl-11 pr-5 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100 transition-all"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <i className="ri-lock-2-line text-[18px]" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  suppressHydrationWarning
                  className="w-full h-[52px] rounded-full bg-[#f4f8fb] border border-transparent pl-11 pr-12 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors"
                  tabIndex={-1}
                >
                  <i className={`${showPassword ? "ri-eye-line" : "ri-eye-off-line"} text-[18px]`} />
                </button>
              </div>

              {/* Tombol Masuk */}
              <button
                type="submit"
                disabled={loading || retrySeconds !== null}
                className="w-full h-[52px] rounded-full font-semibold text-sm text-white tracking-wide transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-cyan-200/60"
                style={{ background: loading ? "#67c8d8" : "linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)" }}
              >
                {loading ? (
                  <>
                    <i className="material-symbols-outlined text-[18px] animate-spin">progress_activity</i>
                    Memproses...
                  </>
                ) : (
                  "Masuk"
                )}
              </button>

              <Link
                href="/authentication/sign-up"
                className="w-full h-[52px] rounded-full font-semibold text-sm text-cyan-700 tracking-wide border border-cyan-200 bg-white hover:bg-cyan-50 transition-all flex items-center justify-center gap-2"
              >
                <i className="ri-user-add-line text-[18px]" />
                Register
              </Link>
            </form>

            <p className="text-center text-xs text-gray-400 mt-6">
              Lupa password?{" "}
              <span className="text-cyan-600 font-semibold">Hubungi administrator.</span>
            </p>
          </div>

          {/* Footer branding */}
          <p className="text-center text-[11px] text-sky-700/60 mt-6">
            © {new Date().getFullYear()} BKPSDM · SILAKAP v1.0
          </p>
        </div>
      </div>

    </div>
  );
};

export default SignInForm;
