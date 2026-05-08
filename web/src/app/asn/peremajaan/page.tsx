"use client";

import { useMemo, useState } from "react";
import {
  downloadPeremajaanDokumen,
  useApprovePeremajaan,
  useClaimPeremajaan,
  useCreatePeremajaan,
  usePeremajaanList,
  useUploadPeremajaanDokumen,
} from "@/hooks/useAsn";
import { useAsnSearch } from "@/hooks/useLayanan";
import { useAuthStore } from "@/store/auth.store";
import type { Asn, AsnPeremajaan } from "@/types/models";

type PortalTab = "ajukan" | "tiket" | "profil";
type FlowStep = 1 | 2 | 3;
type ServiceCategory = "semua" | "identitas" | "keluarga" | "karier" | "pendidikan";

interface LayananPeremajaan {
  title: string;
  description: string;
  sla: string;
  icon: string;
  category: Exclude<ServiceCategory, "semua">;
  jenisPerubahan: string;
  fieldName: string;
  placeholder: string;
  priority: "Tinggi" | "Normal";
  volumeLabel: string;
  recommended?: boolean;
  isNew?: boolean;
  documents: string[];
}

interface DokumenBuktiMeta {
  namaFile: string;
  fileId: string;
  ukuran: number;
  mimeType?: string;
  uploadedAt?: string;
}

const canApprove = (role?: string) =>
  role === "Analis_Madya" || role === "Kabid" || role === "Admin_Sistem";

const layananPeremajaan: LayananPeremajaan[] = [
  {
    title: "Update ijazah / gelar",
    description: "Penambahan gelar baru berdasarkan ijazah terakhir.",
    sla: "SLA 3 hari",
    icon: "school",
    category: "pendidikan",
    jenisPerubahan: "Pendidikan",
    fieldName: "gelarBelakang",
    placeholder: "Contoh: S.Kom",
    priority: "Tinggi",
    volumeLabel: "Paling sering",
    recommended: true,
    documents: ["Ijazah", "Transkrip", "SK pencantuman gelar bila ada"],
  },
  {
    title: "Data keluarga",
    description: "Tambah/ubah pasangan, anak, atau status keluarga.",
    sla: "SLA 3 hari",
    icon: "family_restroom",
    category: "keluarga",
    jenisPerubahan: "Data Keluarga",
    fieldName: "dataKeluarga",
    placeholder: "Contoh: Anak ke-2 lahir 2026",
    priority: "Normal",
    volumeLabel: "Sering dipakai",
    recommended: true,
    documents: ["Kartu keluarga", "Akta nikah/kelahiran", "Dokumen pendukung"],
  },
  {
    title: "Perubahan nama",
    description: "Perubahan nama sesuai putusan pengadilan atau dokumen sah.",
    sla: "SLA 5 hari",
    icon: "badge",
    category: "identitas",
    jenisPerubahan: "Data Pribadi",
    fieldName: "nama",
    placeholder: "Nama baru sesuai dokumen",
    priority: "Tinggi",
    volumeLabel: "Perlu verifikasi",
    documents: ["Putusan pengadilan", "KTP", "Kartu keluarga"],
  },
  {
    title: "Riwayat jabatan",
    description: "Pemutakhiran jabatan setelah pelantikan atau mutasi.",
    sla: "SLA 5 hari",
    icon: "work_history",
    category: "karier",
    jenisPerubahan: "Jabatan",
    fieldName: "jabatan",
    placeholder: "Nama jabatan baru",
    priority: "Tinggi",
    volumeLabel: "Lintas verifikasi",
    documents: ["SK jabatan", "SPMT", "Berita acara pelantikan"],
  },
  {
    title: "Kontak & alamat",
    description: "Perubahan nomor HP, email, atau alamat domisili.",
    sla: "SLA 2 hari",
    icon: "contact_mail",
    category: "identitas",
    jenisPerubahan: "Data Pribadi",
    fieldName: "kontakAlamat",
    placeholder: "Contoh: emailGov / alamat baru",
    priority: "Normal",
    volumeLabel: "Cepat diproses",
    isNew: true,
    documents: ["KTP", "Bukti alamat bila diperlukan"],
  },
  {
    title: "Golongan / pangkat",
    description: "Pemutakhiran golongan dari SK kenaikan pangkat.",
    sla: "SLA 5 hari",
    icon: "military_tech",
    category: "karier",
    jenisPerubahan: "Golongan",
    fieldName: "golongan",
    placeholder: "Contoh: III/c - Penata",
    priority: "Tinggi",
    volumeLabel: "Rekomendasi BKPSDM",
    documents: ["SK kenaikan pangkat", "Pertek", "Dokumen pendukung"],
  },
];

const categoryOptions: { value: ServiceCategory; label: string; icon: string }[] = [
  { value: "semua", label: "Semua", icon: "grid_view" },
  { value: "identitas", label: "Identitas", icon: "badge" },
  { value: "keluarga", label: "Keluarga", icon: "family_restroom" },
  { value: "karier", label: "Karier", icon: "work" },
  { value: "pendidikan", label: "Pendidikan", icon: "school" },
];

const statusClass: Record<AsnPeremajaan["statusApproval"], string> = {
  Pending: "bg-warning-100 text-warning-700",
  Approved: "bg-success-100 text-success-700",
  Rejected: "bg-danger-100 text-danger-700",
};

const statusLabel: Record<AsnPeremajaan["statusApproval"], string> = {
  Pending: "Menunggu verifikasi",
  Approved: "Disetujui",
  Rejected: "Ditolak",
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (name || "AS").slice(0, 2).toUpperCase();
}

function formatDataBaru(data: Record<string, unknown>) {
  const value = Object.entries(data)
    .map(([key, item]) => `${key}: ${String(item)}`)
    .join(", ");

  return value || "-";
}

function getStepState(step: FlowStep, current: FlowStep) {
  if (step < current) return "done";
  if (step === current) return "active";
  return "idle";
}

function getTicketProgress(status: AsnPeremajaan["statusApproval"]) {
  if (status === "Approved") return 100;
  if (status === "Rejected") return 100;
  return 45;
}

function parseDokumenBukti(value?: string | null): DokumenBuktiMeta | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<DokumenBuktiMeta>;
    if (parsed.namaFile && parsed.fileId && typeof parsed.ukuran === "number") {
      return {
        namaFile: parsed.namaFile,
        fileId: parsed.fileId,
        ukuran: parsed.ukuran,
        mimeType: parsed.mimeType,
        uploadedAt: parsed.uploadedAt,
      };
    }
  } catch {
    return null;
  }
  return null;
}

function formatTanggalWaktu(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Makassar",
  }).format(new Date(value));
}

function DokumenBuktiView({ value }: { value?: string | null }) {
  const meta = parseDokumenBukti(value);

  if (!value) return null;

  if (!meta) {
    return (
      <div className="mt-3 rounded-md bg-primary-50 p-3 text-sm text-primary-700">
        <span className="block font-semibold">Dokumen bukti</span>
        <span>{value}</span>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-md bg-primary-50 p-3 text-sm text-primary-700">
      <span className="block font-semibold">Dokumen bukti</span>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
        <span>
          {meta.namaFile} | {Math.ceil(meta.ukuran / 1024)} KB
        </span>
        <button
          type="button"
          className="inline-flex min-h-[32px] items-center gap-1 rounded-md bg-white px-3 font-semibold text-primary-700"
          onClick={() => void downloadPeremajaanDokumen(meta.fileId, meta.namaFile)}
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Unduh
        </button>
      </div>
    </div>
  );
}

function TicketTimeline({ item }: { item: AsnPeremajaan }) {
  const decisionDone = item.statusApproval !== "Pending";
  const steps = [
    {
      label: "Pengajuan masuk",
      description: item.diajukanOleh?.namaLengkap ?? "Portal ASN / OPD",
      icon: "send",
      at: item.createdAt,
      done: true,
    },
    {
      label: item.ditugaskanKepada ? "Diambil operator" : "Menunggu operator",
      description: item.ditugaskanKepada?.namaLengkap ?? "Belum ada penanggung jawab",
      icon: "assignment_ind",
      at: item.ditugaskanAt,
      done: Boolean(item.ditugaskanKepada),
    },
    {
      label: decisionDone ? statusLabel[item.statusApproval] : "Keputusan akhir",
      description: decisionDone
        ? item.catatan || "Keputusan sudah dicatat"
        : "Menunggu hasil verifikasi",
      icon:
        item.statusApproval === "Rejected"
          ? "cancel"
          : item.statusApproval === "Approved"
            ? "verified"
            : "pending_actions",
      at: decisionDone ? item.updatedAt ?? item.createdAt : null,
      done: decisionDone,
    },
  ];

  return (
    <div className="mt-3 rounded-md border border-gray-200 p-3 dark:border-[#172036]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-black dark:text-white">
          Jejak proses
        </span>
        <span className="text-xs font-medium text-gray-500">WITA</span>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {steps.map((step) => (
          <div
            className={`rounded-md px-3 py-3 text-sm ${
              step.done
                ? "bg-primary-50 text-primary-700"
                : "bg-gray-50 text-gray-500 dark:bg-[#15203c] dark:text-gray-400"
            }`}
            key={step.label}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">{step.icon}</span>
              <span className="font-semibold">{step.label}</span>
            </div>
            <p className="line-clamp-2 text-xs">{step.description}</p>
            <p className="mt-2 text-xs font-semibold">{formatTanggalWaktu(step.at)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PeremajaanAsnPage() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<PortalTab>("ajukan");
  const [flowStep, setFlowStep] = useState<FlowStep>(1);
  const [serviceQuery, setServiceQuery] = useState("");
  const [category, setCategory] = useState<ServiceCategory>("semua");
  const [asnSearch, setAsnSearch] = useState("");
  const [selectedAsn, setSelectedAsn] = useState<Asn | null>(null);
  const [selectedLayanan, setSelectedLayanan] = useState(layananPeremajaan[0]);
  const [fieldValue, setFieldValue] = useState("");
  const [catatan, setCatatan] = useState("");
  const [dokumenBukti, setDokumenBukti] = useState("");
  const [checkedDocuments, setCheckedDocuments] = useState<string[]>([]);
  const [decisionNotes, setDecisionNotes] = useState<Record<string, string>>({});

  const list = usePeremajaanList({ limit: 20 });
  const asn = useAsnSearch(asnSearch);
  const create = useCreatePeremajaan();
  const uploadDokumen = useUploadPeremajaanDokumen();
  const claim = useClaimPeremajaan();
  const approve = useApprovePeremajaan();

  const tickets = useMemo(() => list.data?.data ?? [], [list.data?.data]);
  const namaLengkap = user?.namaLengkap ?? "ASN / Operator OPD";

  const subtitle = useMemo(() => {
    const nip = selectedAsn?.nipBaru ?? user?.asnId ?? "-";
    const unit = selectedAsn?.unitOrganisasiId ?? user?.unitOrganisasiId ?? "-";
    return `NIP ${nip} - ${unit}`;
  }, [selectedAsn, user]);

  const filteredLayanan = useMemo(() => {
    const query = serviceQuery.trim().toLowerCase();
    return layananPeremajaan.filter((item) => {
      const matchesCategory = category === "semua" || item.category === category;
      const matchesQuery =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.jenisPerubahan.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [category, serviceQuery]);

  const ticketSummary = useMemo(
    () => ({
      total: tickets.length,
      pending: tickets.filter((item) => item.statusApproval === "Pending").length,
      approved: tickets.filter((item) => item.statusApproval === "Approved").length,
      rejected: tickets.filter((item) => item.statusApproval === "Rejected").length,
    }),
    [tickets],
  );

  const allDocumentsChecked = selectedLayanan.documents.every((item) =>
    checkedDocuments.includes(item),
  );
  const uploadedDokumenBukti = parseDokumenBukti(dokumenBukti);
  const canSubmit = Boolean(
    selectedAsn && fieldValue.trim() && dokumenBukti.trim() && allDocumentsChecked,
  );

  const selectLayanan = (item: LayananPeremajaan) => {
    setSelectedLayanan(item);
    setFieldValue("");
    setCatatan("");
    setDokumenBukti("");
    setCheckedDocuments([]);
    setFlowStep(2);
  };

  const handleUploadDokumen = (file?: File) => {
    if (!file) return;
    uploadDokumen.mutate(file, {
      onSuccess: (result) => {
        setDokumenBukti(JSON.stringify(result));
      },
    });
  };

  const submit = async () => {
    if (!selectedAsn || !fieldValue.trim()) return;

    await create.mutateAsync({
      asnId: selectedAsn.id,
      jenisPerubahan: selectedLayanan.jenisPerubahan,
      dataBaru: { [selectedLayanan.fieldName]: fieldValue.trim() },
      dokumenBukti: dokumenBukti.trim(),
      catatan,
    });
    setFieldValue("");
    setCatatan("");
    setDokumenBukti("");
    setCheckedDocuments([]);
    setFlowStep(1);
    setActiveTab("tiket");
  };

  return (
    <div className="space-y-[25px]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="mb-2 inline-flex rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
            SILAKAP Peremajaan Terpadu
          </span>
          <h1 className="!mb-1">Portal Peremajaan ASN</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Katalog pengajuan, validasi data, dan tracking tiket dalam satu alur.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex">
          {[
            ["ajukan", "Ajukan", "add_circle"],
            ["tiket", "Tiket", "confirmation_number"],
            ["profil", "Profil", "account_circle"],
          ].map(([value, label, icon]) => (
            <button
              type="button"
              className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border px-4 font-medium transition-all md:px-5 ${
                activeTab === value
                  ? "border-primary-500 bg-primary-500 text-white"
                  : "border-gray-200 bg-white text-black hover:border-primary-500 dark:border-[#172036] dark:bg-[#0c1427] dark:text-white"
              }`}
              key={value}
              onClick={() => setActiveTab(value as PortalTab)}
            >
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="trezo-card rounded-md border border-gray-200 bg-white p-[20px] dark:border-[#172036] dark:bg-[#0c1427] md:p-[25px]">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg font-semibold text-primary-600 dark:bg-[#15203c]">
              {getInitials(namaLengkap)}
            </div>
            <div>
              <h5 className="!mb-1">{namaLengkap}</h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center sm:min-w-[420px]">
            <div className="rounded-md bg-primary-50 px-3 py-3 text-primary-700">
              <span className="block text-xl font-semibold">{ticketSummary.total}</span>
              <span className="text-xs font-medium">Total tiket</span>
            </div>
            <div className="rounded-md bg-warning-50 px-3 py-3 text-warning-700">
              <span className="block text-xl font-semibold">
                {ticketSummary.pending}
              </span>
              <span className="text-xs font-medium">Menunggu</span>
            </div>
            <div className="rounded-md bg-success-50 px-3 py-3 text-success-700">
              <span className="block text-xl font-semibold">
                {ticketSummary.approved}
              </span>
              <span className="text-xs font-medium">Selesai</span>
            </div>
          </div>
        </div>
      </div>

      {activeTab === "ajukan" ? (
        <>
          <div className="grid grid-cols-1 gap-[25px] xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
            <section className="trezo-card rounded-md border border-gray-200 bg-white p-[20px] dark:border-[#172036] dark:bg-[#0c1427] md:p-[25px]">
              <div className="mb-[20px] flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h5 className="!mb-1">Katalog layanan peremajaan</h5>
                  <p className="text-gray-500 dark:text-gray-400">
                    Pilih layanan berdasarkan kebutuhan dan urgensi dokumen.
                  </p>
                </div>
                <div className="relative w-full lg:max-w-[320px]">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-gray-400">
                    search
                  </span>
                  <input
                    suppressHydrationWarning
                    className="h-[44px] w-full rounded-md border border-gray-200 bg-white pl-10 pr-4 outline-0 focus:border-primary-500 dark:border-[#172036] dark:bg-[#0c1427]"
                    placeholder="Cari jenis layanan"
                    value={serviceQuery}
                    onChange={(event) => setServiceQuery(event.target.value)}
                  />
                </div>
              </div>

              <div className="mb-[20px] flex gap-2 overflow-x-auto pb-1">
                {categoryOptions.map((item) => (
                  <button
                    type="button"
                    className={`inline-flex min-h-[38px] shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-all ${
                      category === item.value
                        ? "border-primary-500 bg-primary-500 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-primary-500 dark:border-[#172036] dark:bg-[#0c1427] dark:text-gray-300"
                    }`}
                    key={item.value}
                    onClick={() => setCategory(item.value)}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-[15px] md:grid-cols-2">
                {filteredLayanan.map((item) => {
                  const isSelected = selectedLayanan.title === item.title;
                  return (
                    <button
                      type="button"
                      className={`min-h-[196px] rounded-md border p-[18px] text-left transition-all ${
                        isSelected
                          ? "border-primary-500 bg-primary-50 dark:bg-[#15203c]"
                          : "border-gray-200 bg-white hover:border-primary-400 dark:border-[#172036] dark:bg-[#0c1427]"
                      }`}
                      key={item.title}
                      onClick={() => selectLayanan(item)}
                    >
                      <span className="mb-4 flex items-start justify-between gap-3">
                        <span className="flex h-[46px] w-[46px] items-center justify-center rounded-md bg-primary-100 text-primary-600">
                          <span className="material-symbols-outlined text-[26px]">
                            {item.icon}
                          </span>
                        </span>
                        <span className="flex flex-wrap justify-end gap-2">
                          {item.recommended ? (
                            <span className="rounded-full bg-success-100 px-2.5 py-1 text-xs font-semibold text-success-700">
                              Recommended
                            </span>
                          ) : null}
                          {item.isNew ? (
                            <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">
                              Terbaru
                            </span>
                          ) : null}
                        </span>
                      </span>
                      <span className="block text-lg font-semibold text-black dark:text-white">
                        {item.title}
                      </span>
                      <span className="mt-1 block min-h-[44px] text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </span>
                      <span className="mt-4 flex flex-wrap gap-2">
                        <span className="inline-flex rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
                          {item.sla}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            item.priority === "Tinggi"
                              ? "bg-warning-100 text-warning-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          Prioritas {item.priority}
                        </span>
                        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                          {item.volumeLabel}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {!filteredLayanan.length ? (
                <div className="rounded-md border border-dashed border-gray-200 py-[40px] text-center dark:border-[#172036]">
                  <span className="material-symbols-outlined text-[36px] text-gray-400">
                    search_off
                  </span>
                  <h5 className="!mb-1 mt-2">Layanan tidak ditemukan</h5>
                  <p className="text-gray-500 dark:text-gray-400">
                    Coba kata kunci lain atau ubah filter kategori.
                  </p>
                </div>
              ) : null}
            </section>

            <aside className="trezo-card rounded-md border border-gray-200 bg-white p-[20px] dark:border-[#172036] dark:bg-[#0c1427] md:p-[25px]">
              <div className="mb-5">
                <h5 className="!mb-1">Flow pengajuan</h5>
                <p className="text-gray-500 dark:text-gray-400">
                  Alur dibuat singkat, tapi tetap memberi ruang review sebelum submit.
                </p>
              </div>

              <div className="mb-6 grid grid-cols-3 gap-2">
                {[
                  [1, "Pilih", "category"],
                  [2, "Isi data", "edit_note"],
                  [3, "Review", "task_alt"],
                ].map(([step, label, icon]) => {
                  const state = getStepState(step as FlowStep, flowStep);
                  return (
                    <button
                      type="button"
                      className={`rounded-md border px-2 py-3 text-center text-sm font-medium ${
                        state === "active"
                          ? "border-primary-500 bg-primary-500 text-white"
                          : state === "done"
                            ? "border-success-200 bg-success-50 text-success-700"
                            : "border-gray-200 text-gray-500 dark:border-[#172036]"
                      }`}
                      key={step}
                      onClick={() => setFlowStep(step as FlowStep)}
                    >
                      <span className="material-symbols-outlined mb-1 block text-[22px]">
                        {icon}
                      </span>
                      {label}
                    </button>
                  );
                })}
              </div>

              {flowStep === 1 ? (
                <div className="rounded-md bg-gray-50 p-4 dark:bg-[#15203c]">
                  <span className="mb-3 flex h-[46px] w-[46px] items-center justify-center rounded-md bg-white text-primary-600 dark:bg-[#0c1427]">
                    <span className="material-symbols-outlined text-[26px]">
                      {selectedLayanan.icon}
                    </span>
                  </span>
                  <h5 className="!mb-1">{selectedLayanan.title}</h5>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedLayanan.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
                      {selectedLayanan.sla}
                    </span>
                    <span className="rounded-full bg-warning-100 px-3 py-1 text-xs font-semibold text-warning-700">
                      Prioritas {selectedLayanan.priority}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="mt-5 inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-md bg-primary-500 px-4 font-medium text-white"
                    onClick={() => setFlowStep(2)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      arrow_forward
                    </span>
                    Lanjut isi data
                  </button>
                </div>
              ) : null}

              {flowStep === 2 ? (
                <div className="space-y-4">
                  <div>
                    <label className="mb-[8px] block font-medium">Cari ASN</label>
                    <div className="relative">
                      <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-gray-400">
                        person_search
                      </span>
                      <input
                        suppressHydrationWarning
                        className="h-[45px] w-full rounded-md border border-gray-200 bg-white pl-10 pr-4 outline-0 focus:border-primary-500 dark:border-[#172036] dark:bg-[#0c1427]"
                        placeholder="Nama atau NIP"
                        value={asnSearch}
                        onChange={(event) => setAsnSearch(event.target.value)}
                      />
                    </div>
                    <div className="mt-2 max-h-[190px] overflow-y-auto rounded-md border border-gray-100 dark:border-[#172036]">
                      {(asn.data?.data ?? []).map((item) => (
                        <button
                          type="button"
                          className={`block w-full border-b border-gray-100 px-3 py-2 text-left last:border-b-0 hover:bg-primary-50 dark:border-[#172036] dark:hover:bg-[#15203c] ${
                            selectedAsn?.id === item.id
                              ? "bg-primary-50 dark:bg-[#15203c]"
                              : ""
                          }`}
                          key={item.id}
                          onClick={() => setSelectedAsn(item)}
                        >
                          <span className="block font-semibold text-black dark:text-white">
                            {item.nama}
                          </span>
                          <span className="text-sm text-gray-500">
                            {item.nipBaru}
                          </span>
                        </button>
                      ))}
                      {asnSearch.length >= 2 && !asn.data?.data.length ? (
                        <p className="px-3 py-3 text-gray-500">
                          ASN tidak ditemukan.
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label className="mb-[8px] block font-medium">Data baru</label>
                    <input
                      suppressHydrationWarning
                      className="h-[45px] w-full rounded-md border border-gray-200 bg-white px-[14px] outline-0 focus:border-primary-500 dark:border-[#172036] dark:bg-[#0c1427]"
                      placeholder={selectedLayanan.placeholder}
                      value={fieldValue}
                      onChange={(event) => setFieldValue(event.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-[8px] block font-medium">Catatan</label>
                    <textarea
                      suppressHydrationWarning
                      className="min-h-[92px] w-full rounded-md border border-gray-200 bg-white px-[14px] py-[10px] outline-0 focus:border-primary-500 dark:border-[#172036] dark:bg-[#0c1427]"
                      placeholder="Keterangan pendukung, nomor dokumen, atau konteks perubahan"
                      value={catatan}
                      onChange={(event) => setCatatan(event.target.value)}
                    />
                  </div>

                  <div className="rounded-md bg-primary-50 p-4 text-sm text-primary-700">
                    <span className="mb-2 block font-semibold">
                      Checklist dokumen wajib
                    </span>
                    <div className="space-y-2">
                      {selectedLayanan.documents.map((doc) => (
                        <label
                          className="flex items-center gap-2 rounded-md bg-white px-3 py-2 font-medium"
                          key={doc}
                        >
                          <input
                            suppressHydrationWarning
                            type="checkbox"
                            className="h-4 w-4 rounded border-primary-200"
                            checked={checkedDocuments.includes(doc)}
                            onChange={(event) =>
                              setCheckedDocuments((current) =>
                                event.target.checked
                                  ? [...current, doc]
                                  : current.filter((item) => item !== doc),
                              )
                            }
                          />
                          {doc}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-[8px] block font-medium">
                      Upload dokumen bukti
                    </label>
                    <label className="flex min-h-[96px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-center transition-all hover:border-primary-500 dark:border-[#172036] dark:bg-[#15203c]">
                      <span className="material-symbols-outlined text-[30px] text-primary-500">
                        upload_file
                      </span>
                      <span className="mt-1 font-medium text-black dark:text-white">
                        {uploadDokumen.isPending ? "Mengunggah..." : "Pilih file bukti"}
                      </span>
                      <span className="mt-1 text-xs text-gray-500">
                        PDF, JPG, PNG, DOCX, atau XLSX sesuai whitelist server
                      </span>
                      <input
                        suppressHydrationWarning
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.xls"
                        disabled={uploadDokumen.isPending}
                        onChange={(event) => {
                          handleUploadDokumen(event.target.files?.[0]);
                          event.currentTarget.value = "";
                        }}
                      />
                    </label>
                    {uploadDokumen.isError ? (
                      <p className="mt-2 text-sm text-danger-500">
                        Gagal mengunggah dokumen. Pastikan format dan ukuran file sesuai.
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-[8px] block font-medium">
                      Referensi dokumen bukti
                    </label>
                    <textarea
                      suppressHydrationWarning
                      className="min-h-[82px] w-full rounded-md border border-gray-200 bg-white px-[14px] py-[10px] outline-0 focus:border-primary-500 dark:border-[#172036] dark:bg-[#0c1427]"
                      placeholder="Nomor dokumen, nama file, atau tautan arsip digital"
                      value={
                        uploadedDokumenBukti
                          ? `${uploadedDokumenBukti.namaFile} | ${Math.ceil(uploadedDokumenBukti.ukuran / 1024)} KB`
                          : dokumenBukti
                      }
                      onChange={(event) => setDokumenBukti(event.target.value)}
                    />
                  </div>

                  {!canSubmit ? (
                    <div className="rounded-md border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700">
                      Lengkapi ASN, data baru, seluruh checklist dokumen, dan referensi dokumen sebelum review.
                    </div>
                  ) : null}

                  <button
                    type="button"
                    className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-md bg-primary-500 px-4 font-medium text-white disabled:opacity-70"
                    disabled={!canSubmit}
                    onClick={() => setFlowStep(3)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      rule
                    </span>
                    Review pengajuan
                  </button>
                </div>
              ) : null}

              {flowStep === 3 ? (
                <div className="space-y-4">
                  <div className="rounded-md border border-gray-200 p-4 dark:border-[#172036]">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Layanan
                    </span>
                    <p className="font-semibold text-black dark:text-white">
                      {selectedLayanan.title}
                    </p>
                  </div>
                  <div className="rounded-md border border-gray-200 p-4 dark:border-[#172036]">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ASN
                    </span>
                    <p className="font-semibold text-black dark:text-white">
                      {selectedAsn?.nama ?? "-"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedAsn?.nipBaru ?? "-"}
                    </p>
                  </div>
                  <div className="rounded-md border border-gray-200 p-4 dark:border-[#172036]">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Perubahan
                    </span>
                    <p className="font-semibold text-black dark:text-white">
                      {selectedLayanan.fieldName}: {fieldValue || "-"}
                    </p>
                    <p className="text-sm text-gray-500">{catatan || "Tanpa catatan"}</p>
                  </div>
                  <div className="rounded-md border border-gray-200 p-4 dark:border-[#172036]">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Dokumen bukti
                    </span>
                    <p className="font-semibold text-black dark:text-white">
                      {checkedDocuments.length}/{selectedLayanan.documents.length} checklist
                    </p>
                    {parseDokumenBukti(dokumenBukti) ? (
                      <p className="text-sm text-gray-500">
                        {parseDokumenBukti(dokumenBukti)?.namaFile}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">
                        {dokumenBukti || "-"}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="min-h-[42px] rounded-md border border-gray-200 px-4 font-medium dark:border-[#172036]"
                      onClick={() => setFlowStep(2)}
                    >
                      Ubah data
                    </button>
                    <button
                      type="button"
                      className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-md bg-primary-500 px-4 font-medium text-white disabled:opacity-70"
                      disabled={!canSubmit || create.isPending}
                      onClick={() => void submit()}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        send
                      </span>
                      {create.isPending ? "Mengirim..." : "Submit"}
                    </button>
                  </div>
                </div>
              ) : null}
            </aside>
          </div>
        </>
      ) : null}

      {activeTab === "tiket" ? (
        <section className="trezo-card rounded-md border border-gray-200 bg-white p-[20px] dark:border-[#172036] dark:bg-[#0c1427] md:p-[25px]">
          <div className="mb-[20px] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h5 className="!mb-1">Tracking tiket peremajaan</h5>
              <p className="text-gray-500 dark:text-gray-400">
                Pantau progres, SLA, dan keputusan verifikator.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex min-h-[42px] items-center gap-2 rounded-md border border-gray-200 px-5 font-medium dark:border-[#172036]"
              onClick={() => setActiveTab("ajukan")}
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Ajukan baru
            </button>
          </div>

          <div className="mb-[20px] grid grid-cols-1 gap-[15px] md:grid-cols-3">
            {[
              ["Menunggu verifikasi", ticketSummary.pending, "hourglass_top", "warning"],
              ["Disetujui", ticketSummary.approved, "task_alt", "success"],
              ["Ditolak", ticketSummary.rejected, "cancel", "danger"],
            ].map(([label, value, icon, tone]) => (
              <div
                className="rounded-md border border-gray-200 p-4 dark:border-[#172036]"
                key={label}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {label}
                    </span>
                    <p className="mt-1 text-2xl font-semibold text-black dark:text-white">
                      {value}
                    </p>
                  </div>
                  <span
                    className={`flex h-[46px] w-[46px] items-center justify-center rounded-md ${
                      tone === "success"
                        ? "bg-success-100 text-success-700"
                        : tone === "danger"
                          ? "bg-danger-100 text-danger-700"
                          : "bg-warning-100 text-warning-700"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[26px]">
                      {icon}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {list.isLoading ? (
            <div className="h-48 animate-pulse rounded-md bg-gray-100 dark:bg-[#172036]" />
          ) : tickets.length ? (
            <div className="grid grid-cols-1 gap-[15px] xl:grid-cols-2">
              {tickets.map((item) => {
                const progress = getTicketProgress(item.statusApproval);
                return (
                  <div
                    className="rounded-md border border-gray-200 p-4 dark:border-[#172036]"
                    key={item.id}
                  >
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {item.jenisPerubahan}
                        </span>
                        <h5 className="!mb-1">{item.asn?.nama ?? "-"}</h5>
                        <p className="text-sm text-gray-500">
                          {item.asn?.nipBaru ?? "-"} |{" "}
                          {new Date(item.createdAt).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass[item.statusApproval]}`}
                      >
                        {statusLabel[item.statusApproval]}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Progres tiket
                        </span>
                        <span className="font-semibold text-black dark:text-white">
                          {progress}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 dark:bg-[#172036]">
                        <div
                          className={`h-2 rounded-full ${
                            item.statusApproval === "Rejected"
                              ? "bg-danger-500"
                              : item.statusApproval === "Approved"
                                ? "bg-success-500"
                                : "bg-primary-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                      {[
                        ["Diajukan", "done", true],
                        ["Verifikasi", "manage_search", item.statusApproval !== "Rejected"],
                        [
                          item.statusApproval === "Rejected" ? "Ditolak" : "Selesai",
                          item.statusApproval === "Rejected" ? "cancel" : "verified",
                          item.statusApproval !== "Pending",
                        ],
                      ].map(([label, icon, active]) => (
                        <div
                          className={`rounded-md border px-3 py-3 text-sm ${
                            active
                              ? "border-primary-200 bg-primary-50 text-primary-700"
                              : "border-gray-200 text-gray-500 dark:border-[#172036]"
                          }`}
                          key={String(label)}
                        >
                          <span className="material-symbols-outlined mb-1 block text-[20px]">
                            {icon}
                          </span>
                          <span className="font-medium">{label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-md bg-gray-50 p-3 text-sm dark:bg-[#15203c]">
                      <span className="block text-gray-500 dark:text-gray-400">
                        Data baru
                      </span>
                      <span className="font-medium text-black dark:text-white">
                        {formatDataBaru(item.dataBaru)}
                      </span>
                    </div>

                    <DokumenBuktiView value={item.dokumenBukti} />
                    <TicketTimeline item={item} />

                    {item.statusApproval === "Pending" && canApprove(user?.roleNama) ? (
                      <div className="mt-3 rounded-md border border-gray-200 px-3 py-2 text-sm dark:border-[#172036]">
                        <span className="text-gray-500 dark:text-gray-400">
                          Penanggung jawab:{" "}
                        </span>
                        <span className="font-semibold text-black dark:text-white">
                          {item.ditugaskanKepada?.namaLengkap ?? "Belum diambil"}
                        </span>
                        {item.ditugaskanAt ? (
                          <span className="ml-2 text-xs text-gray-500">
                            {new Date(item.ditugaskanAt).toLocaleString("id-ID")}
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    {item.statusApproval === "Pending" &&
                    canApprove(user?.roleNama) &&
                    item.ditugaskanKepada?.id === user?.id ? (
                      <div className="mt-3">
                        <label
                          className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                          htmlFor={`decision-note-${item.id}`}
                        >
                          Catatan keputusan
                        </label>
                        <textarea
                          suppressHydrationWarning
                          id={`decision-note-${item.id}`}
                          className="min-h-[88px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary-500 dark:border-[#172036] dark:bg-[#0c1427] dark:text-white"
                          placeholder="Ringkasan hasil verifikasi. Wajib diisi bila menolak."
                          value={decisionNotes[item.id] ?? ""}
                          onChange={(event) =>
                            setDecisionNotes((current) => ({
                              ...current,
                              [item.id]: event.target.value,
                            }))
                          }
                        />
                      </div>
                    ) : null}

                    {item.statusApproval === "Pending" && canApprove(user?.roleNama) ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {!item.ditugaskanKepada ? (
                          <button
                            type="button"
                            className="inline-flex min-h-[38px] items-center gap-2 rounded-md bg-primary-500 px-4 font-medium text-white disabled:opacity-70"
                            disabled={claim.isPending}
                            onClick={() => claim.mutate(item.id)}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              assignment_ind
                            </span>
                            Ambil tiket
                          </button>
                        ) : null}
                        {item.ditugaskanKepada?.id === user?.id ? (
                          <>
                            <button
                              type="button"
                              className="inline-flex min-h-[38px] items-center gap-2 rounded-md bg-success-500 px-4 font-medium text-white disabled:opacity-70"
                              disabled={approve.isPending}
                              onClick={() =>
                                approve.mutate({
                                  id: item.id,
                                  body: {
                                    statusApproval: "Approved",
                                    catatan: decisionNotes[item.id]?.trim() || undefined,
                                  },
                                })
                              }
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                check
                              </span>
                              Approve
                            </button>
                            <button
                              type="button"
                              className="inline-flex min-h-[38px] items-center gap-2 rounded-md bg-danger-500 px-4 font-medium text-white disabled:opacity-70"
                              disabled={approve.isPending || !decisionNotes[item.id]?.trim()}
                              onClick={() =>
                                approve.mutate({
                                  id: item.id,
                                  body: {
                                    statusApproval: "Rejected",
                                    catatan: decisionNotes[item.id]?.trim(),
                                  },
                                })
                              }
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                close
                              </span>
                              Tolak
                            </button>
                          </>
                        ) : null}
                        {item.ditugaskanKepada && item.ditugaskanKepada.id !== user?.id ? (
                          <span className="inline-flex min-h-[38px] items-center rounded-md bg-gray-100 px-4 text-sm font-semibold text-gray-600">
                            Sedang ditangani operator lain
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-[45px] text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                <span className="material-symbols-outlined text-[34px]">
                  folder_open
                </span>
              </div>
              <h5 className="!mb-1">Belum ada tiket</h5>
              <p className="text-gray-500 dark:text-gray-400">
                Pengajuan peremajaan akan tampil di sini.
              </p>
            </div>
          )}
        </section>
      ) : null}

      {activeTab === "profil" ? (
        <section className="trezo-card rounded-md border border-gray-200 bg-white p-[20px] dark:border-[#172036] dark:bg-[#0c1427] md:p-[25px]">
          <div className="mb-[20px]">
            <h5 className="!mb-1">Profil akses portal</h5>
            <p className="text-gray-500 dark:text-gray-400">
              Informasi ini dipakai untuk konteks pengajuan dan verifikasi.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-[15px] md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Nama", namaLengkap, "person"],
              ["Role", user?.roleNama ?? "-", "admin_panel_settings"],
              ["Unit organisasi", user?.unitOrganisasiId ?? "-", "account_tree"],
              ["ASN ID", user?.asnId ?? "-", "badge"],
            ].map(([label, value, icon]) => (
              <div
                className="rounded-md border border-gray-200 p-4 dark:border-[#172036]"
                key={label}
              >
                <span className="mb-3 flex h-[40px] w-[40px] items-center justify-center rounded-md bg-primary-50 text-primary-600">
                  <span className="material-symbols-outlined text-[22px]">
                    {icon}
                  </span>
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {label}
                </span>
                <p className="mt-1 font-semibold text-black dark:text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
