"use client";

import React from "react";
import Link from "next/link";
import { useNotifikasiCount } from "@/hooks/useNotifikasi";
import { useAuthStore } from "@/store/auth.store";

const Notifications: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const count = useNotifikasiCount(isAuthenticated);
  const unread = count.data?.belumDibaca ?? 0;

  return (
    <div className="relative notifications-menu mx-[8px] md:mx-[10px] lg:mx-[12px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0">
      <Link
        href="/notifikasi"
        className="leading-none inline-block transition-all relative top-[2px] hover:text-primary-500"
        aria-label="Notifikasi"
      >
        <i className="material-symbols-outlined !text-[22px] md:!text-[24px]">
          notifications
        </i>
        {unread > 0 ? (
          <span className="absolute -top-[8px] -right-[10px] min-w-[18px] h-[18px] rounded-full bg-danger-500 text-white text-[10px] leading-[18px] text-center font-semibold px-[4px]">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </Link>
    </div>
  );
};

export default Notifications;
