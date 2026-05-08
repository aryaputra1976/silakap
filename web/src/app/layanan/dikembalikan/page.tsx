import { redirect } from "next/navigation";

export default function DikembalikanPage() {
  redirect("/layanan?status=dikembalikan");
}
