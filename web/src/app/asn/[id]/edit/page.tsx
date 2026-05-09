"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Toast from "@/components/silakap/Toast";
import {
  useAsnDetail,
  useRefGolongan,
  useRefJenisJabatan,
  useRefTingkatPendidikan,
  useRefUnitOrganisasi,
  useUpdateAsn,
} from "@/hooks/useAsn";
import { useToast } from "@/hooks/useToast";
import { useAuthStore } from "@/store/auth.store";

const tabs = [
  "Data Pribadi",
  "Data Kepegawaian",
  "Jabatan & Golongan",
  "Pendidikan & Unit",
] as const;

const statusOptions = ["Aktif", "Pensiun", "Meninggal", "Keluar"] as const;
const jenisKelaminOptions = ["Laki-laki", "Perempuan"];
const agamaOptions = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"];
const statusKawinOptions = ["Belum Kawin", "Kawin", "Cerai Hidup", "Cerai Mati"];

const asnSchema = z.object({
  nipBaru: z.string().min(1, "NIP Baru wajib diisi").max(20),
  nipLama: z.string().optional(),
  nama: z.string().min(1, "Nama wajib diisi"),
  gelarDepan: z.string().optional(),
  gelarBelakang: z.string().optional(),
  tempatLahir: z.string().optional(),
  tanggalLahir: z.string().optional(),
  jenisKelaminId: z.string().optional(),
  agamaId: z.string().optional(),
  statusKawinId: z.string().optional(),
  nik: z.string().optional(),
  npwp: z.string().optional(),
  bpjs: z.string().optional(),
  nomorHp: z.string().optional(),
  email: z.string().email("Email tidak valid").or(z.literal("")).optional(),
  emailGov: z.string().email("Email gov tidak valid").or(z.literal("")).optional(),
  alamat: z.string().optional(),
  jenisPegawai: z.string().optional(),
  statusPegawai: z.enum(statusOptions),
  kedudukanHukum: z.string().optional(),
  nomorSkCpns: z.string().optional(),
  tanggalSkCpns: z.string().optional(),
  tmtCpns: z.string().optional(),
  nomorSkPns: z.string().optional(),
  tanggalSkPns: z.string().optional(),
  tmtPns: z.string().optional(),
  golonganId: z.string().optional(),
  tmtGolongan: z.string().optional(),
  mkTahun: z.number().min(0).optional(),
  mkBulan: z.number().min(0).max(11).optional(),
  jenisJabatanId: z.string().optional(),
  tmtJabatan: z.string().optional(),
  tingkatPendidikanId: z.string().optional(),
  namaSekolah: z.string().optional(),
  tahunLulus: z.string().optional(),
  unitOrganisasiId: z.string().optional(),
  lokasiKerja: z.string().optional(),
  nikValid: z.boolean(),
  flagIkd: z.boolean(),
});

type AsnFormValues = z.infer<typeof asnSchema>;

const emptyToNull = (value: unknown) => (value === "" ? null : value);

const toPayload = (values: AsnFormValues): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, emptyToNull(value)]),
  );

const inputClass =
  "h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500";

export default function EditAsnPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { toast, showToast, hideToast } = useToast();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>(tabs[0]);
  const asnQuery = useAsnDetail(params.id);
  const updateAsn = useUpdateAsn(params.id);
  const refGolongan = useRefGolongan();
  const refUnit = useRefUnitOrganisasi();
  const refJenisJabatan = useRefJenisJabatan();
  const refTingkatPendidikan = useRefTingkatPendidikan();

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<AsnFormValues>({
    resolver: zodResolver(asnSchema),
    defaultValues: {
      nipBaru: "",
      nama: "",
      statusPegawai: "Aktif",
      nikValid: false,
      flagIkd: false,
    },
  });

  useEffect(() => {
    if (
      user?.roleNama &&
      user.roleNama !== "Admin_Sistem" &&
      user.roleNama !== "Kabid"
    ) {
      router.replace("/asn");
    }
  }, [router, user]);

  useEffect(() => {
    const asn = asnQuery.data;
    if (!asn) return;

    reset({
      nipBaru: asn.nipBaru,
      nipLama: asn.nipLama ?? "",
      nama: asn.nama,
      gelarDepan: asn.gelarDepan ?? "",
      gelarBelakang: asn.gelarBelakang ?? "",
      tempatLahir: asn.tempatLahir ?? "",
      tanggalLahir: asn.tanggalLahir?.slice(0, 10) ?? "",
      jenisKelaminId: asn.jenisKelamin?.id ?? "",
      agamaId: asn.agama?.id ?? "",
      statusKawinId: asn.statusKawin?.id ?? "",
      nik: asn.nik ?? "",
      npwp: asn.npwp ?? "",
      bpjs: asn.bpjs ?? "",
      nomorHp: asn.nomorHp ?? "",
      email: asn.email ?? "",
      emailGov: asn.emailGov ?? "",
      alamat: asn.alamat ?? "",
      jenisPegawai: asn.jenisPegawai ?? "",
      statusPegawai: asn.statusPegawai,
      kedudukanHukum: asn.kedudukanHukum ?? "",
      nomorSkCpns: asn.nomorSkCpns ?? "",
      tanggalSkCpns: asn.tanggalSkCpns?.slice(0, 10) ?? "",
      tmtCpns: asn.tmtCpns?.slice(0, 10) ?? "",
      nomorSkPns: asn.nomorSkPns ?? "",
      tanggalSkPns: asn.tanggalSkPns?.slice(0, 10) ?? "",
      tmtPns: asn.tmtPns?.slice(0, 10) ?? "",
      golonganId: asn.golongan?.id ?? asn.golonganId ?? "",
      tmtGolongan: asn.tmtGolongan?.slice(0, 10) ?? "",
      mkTahun: asn.mkTahun ?? 0,
      mkBulan: asn.mkBulan ?? 0,
      jenisJabatanId: asn.jenisJabatan?.id ?? "",
      tmtJabatan: asn.tmtJabatan?.slice(0, 10) ?? "",
      tingkatPendidikanId: asn.tingkatPendidikan?.id ?? "",
      namaSekolah: "",
      tahunLulus: "",
      unitOrganisasiId: asn.unitOrganisasi?.id ?? asn.unitOrganisasiId ?? "",
      lokasiKerja: asn.lokasiKerja ?? "",
      nikValid: asn.nikValid,
      flagIkd: asn.flagIkd,
    });
  }, [asnQuery.data, reset]);

  const onSubmit = (values: AsnFormValues) => {
    updateAsn.mutate(toPayload(values), {
      onSuccess: () => {
        showToast("Data berhasil diperbarui", "success");
        window.setTimeout(() => router.push(`/asn/${params.id}`), 700);
      },
      onError: () => showToast("Gagal memperbarui data", "error"),
    });
  };

  if (asnQuery.isLoading) {
    return (
      <div className="animate-pulse rounded-xl bg-gray-200 dark:bg-[#172036] h-96" />
    );
  }

  return (
    <div className="space-y-[25px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ASN / Edit Data
          </p>
          <h1 className="!mb-0">Edit Data ASN</h1>
        </div>
        <Link
          href={`/asn/${params.id}`}
          className="py-[10px] px-[20px] border border-gray-200 dark:border-[#172036] rounded-md"
        >
          Batal
        </Link>
      </div>

      {asnQuery.isError ? (
        <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">
          Gagal memuat data
        </div>
      ) : null}

      <form
        className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036]"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-wrap gap-2 mb-[25px]">
          {tabs.map((tab) => (
            <button
              type="button"
              className={`px-4 py-2 rounded-md border ${
                activeTab === tab
                  ? "bg-primary-500 text-white border-primary-500"
                  : "border-gray-200 dark:border-[#172036]"
              }`}
              key={tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Data Pribadi" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
            <label>
              NIP Baru
              <input className={inputClass} {...register("nipBaru")} />
              {errors.nipBaru ? <span className="text-danger-500 text-sm">{errors.nipBaru.message}</span> : null}
            </label>
            <label>NIP Lama<input className={inputClass} {...register("nipLama")} /></label>
            <label>Nama<input className={inputClass} {...register("nama")} /></label>
            <label>Gelar Depan<input className={inputClass} {...register("gelarDepan")} /></label>
            <label>Gelar Belakang<input className={inputClass} {...register("gelarBelakang")} /></label>
            <label>Tempat Lahir<input className={inputClass} {...register("tempatLahir")} /></label>
            <label>Tanggal Lahir<input type="date" className={inputClass} {...register("tanggalLahir")} /></label>
            <label>Jenis Kelamin<select className={inputClass} {...register("jenisKelaminId")}><option value="">Pilih</option>{jenisKelaminOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label>Agama<select className={inputClass} {...register("agamaId")}><option value="">Pilih</option>{agamaOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label>Status Kawin<select className={inputClass} {...register("statusKawinId")}><option value="">Pilih</option>{statusKawinOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label>NIK<input className={inputClass} {...register("nik")} /></label>
            <label>NPWP<input className={inputClass} {...register("npwp")} /></label>
            <label>BPJS<input className={inputClass} {...register("bpjs")} /></label>
            <label>Nomor HP<input className={inputClass} {...register("nomorHp")} /></label>
            <label>Email<input className={inputClass} {...register("email")} /></label>
            <label>Email Gov<input className={inputClass} {...register("emailGov")} /></label>
            <label className="md:col-span-2">Alamat<textarea className={`${inputClass} min-h-[110px] py-[12px]`} {...register("alamat")} /></label>
          </div>
        ) : null}

        {activeTab === "Data Kepegawaian" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
            <label>Jenis Pegawai<input className={inputClass} {...register("jenisPegawai")} /></label>
            <label>Status Pegawai<select className={inputClass} {...register("statusPegawai")}>{statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label>Kedudukan Hukum<input className={inputClass} {...register("kedudukanHukum")} /></label>
            <label>No SK CPNS<input className={inputClass} {...register("nomorSkCpns")} /></label>
            <label>Tgl SK CPNS<input type="date" className={inputClass} {...register("tanggalSkCpns")} /></label>
            <label>TMT CPNS<input type="date" className={inputClass} {...register("tmtCpns")} /></label>
            <label>No SK PNS<input className={inputClass} {...register("nomorSkPns")} /></label>
            <label>Tgl SK PNS<input type="date" className={inputClass} {...register("tanggalSkPns")} /></label>
            <label>TMT PNS<input type="date" className={inputClass} {...register("tmtPns")} /></label>
          </div>
        ) : null}

        {activeTab === "Jabatan & Golongan" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
            <label>Golongan<select className={inputClass} {...register("golonganId")}><option value="">Pilih</option>{(refGolongan.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.kode} - {item.nama}</option>)}</select></label>
            <label>TMT Golongan<input type="date" className={inputClass} {...register("tmtGolongan")} /></label>
            <label>Masa Kerja Tahun<input type="number" className={inputClass} {...register("mkTahun", { valueAsNumber: true })} /></label>
            <label>Masa Kerja Bulan<input type="number" className={inputClass} {...register("mkBulan", { valueAsNumber: true })} /></label>
            <label>Jenis Jabatan<select className={inputClass} {...register("jenisJabatanId")}><option value="">Pilih</option>{(refJenisJabatan.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}</select></label>
            <label>TMT Jabatan<input type="date" className={inputClass} {...register("tmtJabatan")} /></label>
          </div>
        ) : null}

        {activeTab === "Pendidikan & Unit" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
            <label>Tingkat Pendidikan<select className={inputClass} {...register("tingkatPendidikanId")}><option value="">Pilih</option>{(refTingkatPendidikan.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}</select></label>
            <label>Nama Sekolah<input className={inputClass} {...register("namaSekolah")} /></label>
            <label>Tahun Lulus<input className={inputClass} {...register("tahunLulus")} /></label>
            <label>Unit Organisasi<select className={inputClass} {...register("unitOrganisasiId")}><option value="">Pilih</option>{(refUnit.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}</select></label>
            <label>Lokasi Kerja<input className={inputClass} {...register("lokasiKerja")} /></label>
            <label className="flex items-center gap-3"><input type="checkbox" {...register("nikValid")} /> NikValid</label>
            <label className="flex items-center gap-3"><input type="checkbox" {...register("flagIkd")} /> Flag IKD</label>
          </div>
        ) : null}

        <div className="mt-[25px] flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="py-[10px] px-[20px] bg-primary-500 text-white rounded-md disabled:opacity-70"
            disabled={updateAsn.isPending}
          >
            {updateAsn.isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          <Link href={`/asn/${params.id}`} className="py-[10px] px-[20px] rounded-md border border-gray-200 dark:border-[#172036]">
            Batal
          </Link>
        </div>
      </form>

      {toast.visible ? (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      ) : null}
    </div>
  );
}
