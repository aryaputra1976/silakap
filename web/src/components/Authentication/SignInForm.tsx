"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  normalizeRoleName,
  resolveDashboardPath,
} from "@/lib/dashboard-redirect";
import { useAuthStore } from "@/store/auth.store";
import type { ApiResponse, User } from "@/types/models";

type LoginUser = User & {
  role?: {
    nama?: string | null;
  } | null;
};

const SignInForm: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post<
        ApiResponse<{
          accessToken: string;
          refreshToken: string;
          user: LoginUser;
        }>
      >("/auth/login", { username, password });

      const user = {
        ...data.data.user,
        roleNama: normalizeRoleName(
          data.data.user.roleNama ?? data.data.user.role?.nama,
        ),
      };

      useAuthStore
        .getState()
        .setAuth(user, data.data.accessToken, data.data.refreshToken);
      router.push(resolveDashboardPath(user.roleNama));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg ?? "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-main-content bg-white dark:bg-[#0a0e19] py-[60px] md:py-[80px] lg:py-[135px]">
        <div className="mx-auto px-[12.5px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1255px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] items-center">
            <div className="xl:ltr:-mr-[25px] xl:rtl:-ml-[25px] 2xl:ltr:-mr-[45px] 2xl:rtl:-ml-[45px] rounded-[25px] order-2 lg:order-1">
              <Image
                src="/images/sign-in.jpg"
                alt="sign-in-image"
                className="rounded-[25px]"
                width={646}
                height={804}
              />
            </div>

            <div className="xl:ltr:pl-[90px] xl:rtl:pr-[90px] 2xl:ltr:pl-[120px] 2xl:rtl:pr-[120px] order-1 lg:order-2">
              <Image
                src="/images/logo-big.svg"
                alt="logo"
                className="inline-block dark:hidden"
                width={142}
                height={38}
              />
              <Image
                src="/images/white-logo-big.svg"
                alt="logo"
                className="hidden dark:inline-block"
                width={142}
                height={38}
              />

              <div className="my-[17px] md:my-[25px]">
                <h1 className="!font-semibold !text-[22px] md:!text-xl lg:!text-2xl !mb-[5px] md:!mb-[7px]">
                  Welcome back to SILAKAP!
                </h1>
                <p className="font-medium lg:text-md text-[#445164] dark:text-gray-400">
                  Masuk dengan username dan password Anda
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {error ? (
                  <div className="mb-[15px] py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">
                    {error}
                  </div>
                ) : null}

                <div className="mb-[15px] relative">
                  <label
                    className="mb-[10px] md:mb-[12px] text-black dark:text-white font-medium block"
                    htmlFor="username"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                    id="username"
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                    suppressHydrationWarning
                  />
                </div>

                <div className="mb-[15px] relative" id="passwordHideShow">
                  <label
                    className="mb-[10px] md:mb-[12px] text-black dark:text-white font-medium block"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                    id="password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    suppressHydrationWarning
                  />
                  <button
                    className="absolute text-lg ltr:right-[20px] rtl:left-[20px] bottom-[12px] transition-all hover:text-primary-500"
                    id="toggleButton"
                    type="button"
                  >
                    <i className="ri-eye-off-line"></i>
                  </button>
                </div>

                <Link
                  href="/authentication/forgot-password"
                  className="inline-block text-primary-500 transition-all font-semibold hover:underline"
                >
                  Forgot Password?
                </Link>

                <button
                  type="submit"
                  disabled={loading}
                  className="md:text-md block w-full text-center transition-all rounded-md font-medium mt-[20px] md:mt-[25px] py-[12px] px-[25px] text-white bg-primary-500 hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="flex items-center justify-center gap-[5px]">
                    {loading ? (
                      <i className="material-symbols-outlined animate-spin">
                        progress_activity
                      </i>
                    ) : (
                      <i className="material-symbols-outlined">login</i>
                    )}
                    {loading ? "Signing In..." : "Sign In"}
                  </span>
                </button>

                <p className="mt-[15px] md:mt-[20px]">
                  Don&apos;t have an account.{" "}
                  <Link
                    href="/authentication/sign-up"
                    className="text-primary-500 transition-all font-semibold hover:underline"
                  >
                    Sign Up
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInForm;
