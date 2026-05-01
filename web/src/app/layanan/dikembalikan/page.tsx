import LayananFilteredList from "@/components/silakap/LayananFilteredList";

export default function DikembalikanPage() {
  return (
    <LayananFilteredList
      title="Usulan Dikembalikan"
      description="Usulan yang perlu diperbaiki dan diajukan ulang"
      status="Dikembalikan"
      emptyText="Tidak ada usulan yang sedang dikembalikan."
    />
  );
}
