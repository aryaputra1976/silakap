"use client";

import dayjs from "dayjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  useAsnSearch,
  useCreateLayanan,
  useJenisLayanan,
} from "@/hooks/useLayanan";
import { useAuthStore } from "@/store/auth.store";
import type { Asn, RefJenisLayanan } from "@/types/models";

const formSchema = z.object({
  jenisLayananId: z.string().min(1, "Pilih jenis layanan"),
  asnId: z.string().min(1, "Pilih ASN"),
  unitOrganisasiId: z.string().min(1, "Unit organisasi tidak tersedia"),
  tanggalUsulan: z.string().min(1, "Tanggal usulan wajib diisi"),
});

type FormValues = z.infer<typeof formSchema>;

const steps = ["Jenis Layanan", "Data ASN", "Konfirmasi"];

export default function BuatLayananPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const jenisLayanan = useJenisLayanan();
  const createLayanan = useCreateLayanan();
  const [step, setStep] = useState(1);
  const [asnSearch, setAsnSearch] = useState("");
  const asnQuery = useAsnSearch(asnSearch);
  const [selectedJenis, setSelectedJenis] = useState<RefJenisLayanan | null>(
    null,
  );
  const [selectedAsn, setSelectedAsn] = useState<Asn | null>(null);
  const [checkedRequirements, setCheckedRequirements] = useState<string[]>([]);

  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jenisLayananId: "",
      asnId: "",
      unitOrganisasiId: user?.unitOrganisasiId ?? "",
      tanggalUsulan: dayjs().format("YYYY-MM-DD"),
    },
  });

  useEffect(() => {
    if (user?.roleNama && user.roleNama !== "Pengelola_OPD") {
      router.replace("/layanan");
    }
    if (user?.unitOrganisasiId) {
      setValue("unitOrganisasiId", user.unitOrganisasiId);
    }
  }, [router, setValue, user]);

  const requiredItems = useMemo(
    () =>
      selectedJenis?.persyaratanLayanan
        ?.filter((item) => item.isRequired)
        .map((item) => item.id) ?? [],
    [selectedJenis],
  );
  const allRequiredChecked = requiredItems.every((id) =>
    checkedRequirements.includes(id),
  );

  const selectJenis = (item: RefJenisLayanan) => {
    setSelectedJenis(item);
    setCheckedRequirements([]);
    setValue("jenisLayananId", item.id, { shouldValidate: true });
  };

  const selectAsn = (item: Asn) => {
    setSelectedAsn(item);
    setValue("asnId", item.id, { shouldValidate: true });
  };

  const onSubmit = async (values: FormValues) => {
    if (!allRequiredChecked) {
      return;
    }

    const response = await createLayanan.mutateAsync(values);
    router.push(`/layanan/${response.data.data.id}`);
  };

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">Buat Usulan</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Lengkapi 3 langkah untuk membuat draft usulan layanan
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          return (
            <button
              type="button"
              className={`rounded-md px-4 py-3 text-left border ${
                step === stepNumber
                  ? "bg-primary-500 border-primary-500 text-white"
                  : "bg-white dark:bg-[#0c1427] border-gray-100 dark:border-[#172036]"
              }`}
              key={label}
              onClick={() => setStep(stepNumber)}
            >
              <span className="block text-xs opacity-80">Step {stepNumber}</span>
              <span className="font-semibold">{label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-[25px]">
        <input type="hidden" {...register("jenisLayananId")} />
        <input type="hidden" {...register("asnId")} />
        <input type="hidden" {...register("unitOrganisasiId")} />

        {step === 1 ? (
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <h5>Pilih Jenis Layanan</h5>
            {jenisLayanan.isLoading ? (
              <div className="animate-pulse rounded-xl bg-gray-200 dark:bg-[#172036] h-32" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[15px]">
                {(jenisLayanan.data ?? []).map((item) => (
                  <button
                    type="button"
                    className={`text-left rounded-md border p-4 transition-all ${
                      selectedJenis?.id === item.id
                        ? "border-primary-500 bg-primary-50 dark:bg-[#15203c]"
                        : "border-gray-100 dark:border-[#172036] hover:border-primary-500"
                    }`}
                    key={item.id}
                    onClick={() => selectJenis(item)}
                  >
                    <span className="text-xs text-gray-500">{item.kode}</span>
                    <span className="block font-semibold text-black dark:text-white">
                      {item.nama}
                    </span>
                    {item.butuhTteKepalaBadan ? (
                      <span className="inline-block mt-3 text-xs px-2 py-1 rounded-full bg-warning-100 text-warning-700">
                        Butuh TTE Kepala Badan
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
            {errors.jenisLayananId ? (
              <p className="mt-3 text-danger-500 text-sm">
                {errors.jenisLayananId.message}
              </p>
            ) : null}
            {selectedJenis?.persyaratanLayanan?.length ? (
              <div className="mt-5 rounded-md bg-gray-50 dark:bg-[#15203c] p-4">
                <h6>Persyaratan</h6>
                <ul className="space-y-2">
                  {selectedJenis.persyaratanLayanan
                    .slice()
                    .sort((a, b) => a.urutan - b.urutan)
                    .map((item) => (
                      <li className="flex items-center gap-2" key={item.id}>
                        <i className="material-symbols-outlined !text-[18px] text-primary-500">
                          check_circle
                        </i>
                        <span>{item.namaPersyaratan}</span>
                        {item.isRequired ? (
                          <span className="text-danger-500 text-xs">Wajib</span>
                        ) : null}
                      </li>
                    ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <h5>Data ASN</h5>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px]">
              <div>
                <label className="mb-[10px] text-black dark:text-white font-medium block">
                  Cari ASN
                </label>
                <input
                  type="search"
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 focus:border-primary-500"
                  placeholder="Cari NIP atau nama"
                  value={asnSearch}
                  onChange={(event) => setAsnSearch(event.target.value)}
                />
                <div className="mt-3 max-h-[260px] overflow-y-auto border border-gray-100 dark:border-[#172036] rounded-md">
                  {(asnQuery.data?.data ?? []).map((item) => (
                    <button
                      type="button"
                      className={`block w-full text-left px-4 py-3 border-b border-gray-100 dark:border-[#172036] last:border-b-0 hover:bg-primary-50 dark:hover:bg-[#15203c] ${
                        selectedAsn?.id === item.id ? "bg-primary-50" : ""
                      }`}
                      key={item.id}
                      onClick={() => selectAsn(item)}
                    >
                      <span className="block font-semibold text-black dark:text-white">
                        {item.nama}
                      </span>
                      <span className="text-sm text-gray-500">{item.nipBaru}</span>
                    </button>
                  ))}
                  {asnSearch.length >= 2 && !asnQuery.data?.data.length ? (
                    <p className="px-4 py-3 text-gray-500">
                      ASN tidak ditemukan.
                    </p>
                  ) : null}
                </div>
                {errors.asnId ? (
                  <p className="mt-3 text-danger-500 text-sm">
                    {errors.asnId.message}
                  </p>
                ) : null}
              </div>
              <div>
                <label className="mb-[10px] text-black dark:text-white font-medium block">
                  Tanggal Usulan
                </label>
                <input
                  type="date"
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 focus:border-primary-500"
                  {...register("tanggalUsulan")}
                />
                {selectedAsn ? (
                  <div className="mt-5 rounded-md bg-gray-50 dark:bg-[#15203c] p-4">
                    <h6>{selectedAsn.nama}</h6>
                    <p>NIP: {selectedAsn.nipBaru}</p>
                    <p>Golongan: {selectedAsn.golonganId ?? "Belum tersedia"}</p>
                    <p>Jabatan: Belum tersedia</p>
                    <p>Unit: {selectedAsn.unitOrganisasiId ?? "Belum tersedia"}</p>
                  </div>
                ) : null}
                {errors.tanggalUsulan ? (
                  <p className="mt-3 text-danger-500 text-sm">
                    {errors.tanggalUsulan.message}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <h5>Konfirmasi & Submit</h5>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-[20px]">
              <div className="rounded-md bg-gray-50 dark:bg-[#15203c] p-4">
                <span className="text-sm text-gray-500">Jenis Layanan</span>
                <p className="font-semibold">{selectedJenis?.nama ?? "-"}</p>
              </div>
              <div className="rounded-md bg-gray-50 dark:bg-[#15203c] p-4">
                <span className="text-sm text-gray-500">ASN</span>
                <p className="font-semibold">{selectedAsn?.nama ?? "-"}</p>
              </div>
              <div className="rounded-md bg-gray-50 dark:bg-[#15203c] p-4">
                <span className="text-sm text-gray-500">Tanggal</span>
                <p className="font-semibold">{watch("tanggalUsulan")}</p>
              </div>
            </div>
            {selectedJenis?.persyaratanLayanan?.length ? (
              <div className="mt-5 space-y-3">
                {selectedJenis.persyaratanLayanan.map((item) => (
                  <label className="flex items-center gap-3" key={item.id}>
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={checkedRequirements.includes(item.id)}
                      onChange={(event) =>
                        setCheckedRequirements((current) =>
                          event.target.checked
                            ? [...current, item.id]
                            : current.filter((id) => id !== item.id),
                        )
                      }
                    />
                    <span>
                      {item.namaPersyaratan}
                      {item.isRequired ? " (wajib)" : ""}
                    </span>
                  </label>
                ))}
                {!allRequiredChecked ? (
                  <p className="text-sm text-danger-500">
                    Centang seluruh persyaratan wajib sebelum membuat draft.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <button
            type="button"
            className="py-[10px] px-[20px] rounded-md border border-gray-200 dark:border-[#172036]"
            onClick={() => setStep((current) => Math.max(current - 1, 1))}
          >
            Sebelumnya
          </button>
          {step < 3 ? (
            <button
              type="button"
              className="py-[10px] px-[20px] bg-primary-500 text-white rounded-md"
              onClick={() => setStep((current) => Math.min(current + 1, 3))}
            >
              Lanjut
            </button>
          ) : (
            <button
              type="submit"
              className="py-[10px] px-[20px] bg-primary-500 text-white rounded-md disabled:opacity-70"
              disabled={createLayanan.isPending || !allRequiredChecked}
            >
              {createLayanan.isPending ? "Menyimpan..." : "Buat Draft"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
