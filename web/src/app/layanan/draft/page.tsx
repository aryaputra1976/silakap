import { redirect } from "next/navigation";

export default function DraftPage() {
  redirect("/layanan?status=draft");
}
