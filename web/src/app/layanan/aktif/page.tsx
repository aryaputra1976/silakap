import { redirect } from "next/navigation";

export default function AktifPage() {
  redirect("/layanan?status=dalamproses");
}
