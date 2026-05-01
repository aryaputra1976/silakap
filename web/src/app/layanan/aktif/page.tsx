import LayananFilteredList from "@/components/silakap/LayananFilteredList";

export default function AktifPage() {
  return (
    <LayananFilteredList
      title="Pengajuan Aktif"
      description="Usulan yang sedang berjalan di workflow verifikasi dan approval"
      status="DalamProses"
      emptyText="Belum ada pengajuan aktif."
    />
  );
}
