"use client";

import { redirect } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();

  if (user && user.roleNama !== "Admin_Sistem") {
    redirect("/");
  }

  return <>{children}</>;
}
