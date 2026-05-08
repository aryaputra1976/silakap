"use client";

import DashboardAdminPage from "@/app/dashboard/admin/page";
import DashboardAnalisMadyaPage from "@/app/dashboard/analis-madya/page";
import DashboardAnalisMudaPage from "@/app/dashboard/analis-muda/page";
import DashboardAnalisPertamaPage from "@/app/dashboard/analis-pertama/page";
import DashboardKabidPage from "@/app/dashboard/kabid/page";
import DashboardKepalaBadanPage from "@/app/dashboard/kepala-badan/page";
import DashboardOpdPage from "@/app/dashboard/opd/page";
import { normalizeRoleName } from "@/lib/dashboard-redirect";
import { useAuthStore } from "@/store/auth.store";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const role = normalizeRoleName(user?.roleNama);

  if (role === "Admin_Sistem") return <DashboardAdminPage />;
  if (role === "Kabid") return <DashboardKabidPage />;
  if (role === "Kepala_Badan") return <DashboardKepalaBadanPage />;
  if (role === "Analis_Pertama") return <DashboardAnalisPertamaPage />;
  if (role === "Analis_Muda") return <DashboardAnalisMudaPage />;
  if (role === "Analis_Madya") return <DashboardAnalisMadyaPage />;

  return <DashboardOpdPage />;
}
