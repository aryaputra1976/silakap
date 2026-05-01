import LayananFilteredList from "@/components/silakap/LayananFilteredList";

export default function DraftPage() {
  return (
    <LayananFilteredList
      title="Draft Saya"
      description="Draft usulan yang belum diajukan ke workflow"
      status="Draft"
      emptyText="Belum ada draft usulan."
    />
  );
}
