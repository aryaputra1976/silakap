import { redirect } from "next/navigation";

export default function SelesaiPage() {
  redirect("/layanan?status=selesai");
}
