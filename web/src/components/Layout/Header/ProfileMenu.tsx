"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { displayRoleLabel } from "@/lib/display-labels";
import { useAuthStore } from "@/store/auth.store";

const ProfileMenu: React.FC = () => {
  const [active, setActive] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const initials = (user?.namaLengkap ?? "U")
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const roleLabel = displayRoleLabel(user?.roleNama);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    router.prefetch("/my-profile");
    router.prefetch("/settings/change-password");
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push("/authentication/sign-in");
  };

  return (
    <div
      className="relative profile-menu mx-[8px] md:mx-[10px] lg:mx-[12px]"
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() => setActive((value) => !value)}
        className={`flex items-center gap-2 relative ltr:pr-[14px] rtl:pl-[14px] text-black dark:text-white ${active ? "active" : ""}`}
      >
        <span className="w-[36px] h-[36px] md:w-[42px] md:h-[42px] rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold text-sm shrink-0">
          {initials}
        </span>
        <span className="hidden lg:block font-semibold text-sm max-w-[120px] truncate">
          {user?.namaLengkap ?? "User"}
        </span>
        <i className="ri-arrow-down-s-line text-[15px] absolute ltr:-right-[3px] rtl:-left-[3px] top-1/2 -translate-y-1/2 mt-px" />
      </button>

      {active ? (
        <div className="profile-menu-dropdown bg-white dark:bg-[#0c1427] shadow-3xl dark:shadow-none py-[16px] absolute mt-[13px] w-[220px] z-[10] top-full ltr:right-0 rtl:left-0 rounded-md border border-gray-100 dark:border-[#172036]">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-[#172036] pb-[12px] mx-[16px] mb-[8px]">
            <span className="w-[38px] h-[38px] rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold text-sm shrink-0">
              {initials}
            </span>
            <div className="overflow-hidden">
              <span className="block text-black dark:text-white font-medium text-sm truncate">
                {user?.namaLengkap ?? "User"}
              </span>
              <span className="block text-xs text-gray-500 truncate">
                {roleLabel}
              </span>
            </div>
          </div>

          <ul>
            <li>
              <Link
                href="/my-profile"
                onClick={() => setActive(false)}
                onMouseEnter={() => router.prefetch("/my-profile")}
                className="flex items-center gap-3 py-[8px] px-[16px] text-sm text-black dark:text-white hover:text-primary-500 hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors"
              >
                <i className="material-symbols-outlined !text-[20px]">
                  account_circle
                </i>
                Profil Saya
              </Link>
            </li>
            <li>
              <Link
                href="/settings/change-password"
                onClick={() => setActive(false)}
                onMouseEnter={() => router.prefetch("/settings/change-password")}
                className="flex items-center gap-3 py-[8px] px-[16px] text-sm text-black dark:text-white hover:text-primary-500 hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors"
              >
                <i className="material-symbols-outlined !text-[20px]">
                  lock_reset
                </i>
                Ganti Password
              </Link>
            </li>
          </ul>

          <div className="border-t border-gray-100 dark:border-[#172036] mx-[16px] my-[8px]" />

          <ul>
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 py-[8px] px-[16px] text-sm text-danger-500 hover:bg-danger-50 dark:hover:bg-[#15203c] transition-colors"
              >
                <i className="material-symbols-outlined !text-[20px]">
                  logout
                </i>
                Keluar
              </button>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default ProfileMenu;
