import LayananFilteredList from "@/components/silakap/LayananFilteredList";

export default function SelesaiPage() {
  return (
    <LayananFilteredList
      title="Download Hasil"
      description="Dokumen output layanan yang sudah selesai dan siap diunduh OPD"
      status="Selesai"
      emptyText="Belum ada dokumen hasil yang siap diunduh."
      showDownload
    />
  );
}
