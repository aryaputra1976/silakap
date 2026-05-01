"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAsnDetail, useAsnRiwayat, useDeleteAsn } from "@/hooks/useAsn";
import { useAuthStore } from "@/store/auth.store";
import type { AsnDetail } from "@/types/models";

const statusClasses: Record<AsnDetail["statusPegawai"], string> = {
  Aktif: "bg-success-100 text-success-700",
  Pensiun: "bg-primary-50 text-primary-700",
  Meninggal: "bg-gray-100 text-gray-700",
  Keluar: "bg-danger-100 text-danger-700",
};

const fullName = (asn: AsnDetail) =>
  [asn.gelarDepan, asn.nama, asn.gelarBelakang].filter(Boolean).join(" ");

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("id-ID") : "-";

const mainPosition = (asn: AsnDetail) =>
  asn.jabatanStruktural?.nama ??
  asn.jabatanFungsional?.nama ??
  asn.jabatanPelaksana?.nama ??
  "-";

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <span className="block text-xs text-gray-500 dark:text-gray-400">
      {label}
    </span>
    <span className="block font-medium text-black dark:text-white">
      {value || "-"}
    </span>
  </div>
);

export default function AsnDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const asnQuery = useAsnDetail(params.id);
  const riwayatQuery = useAsnRiwayat(params.id);
  const deleteAsn = useDeleteAsn();
  const asn = asnQuery.data;
  const canEdit =
    user?.roleNama === "Admin_Sistem" || user?.roleNama === "Kabid";
  const canDelete = user?.roleNama === "Admin_Sistem";

  const handleDelete = () => {
    if (!asn) return;

    if (window.confirm("Hapus data ASN ini?")) {
      deleteAsn.mutate(asn.id, {
        onSuccess: () => router.push("/asn"),
      });
    }
  };

  if (asnQuery.isLoading) {
    return (
      <div className="space-y-[25px]">
        <div className="animate-pulse rounded-xl bg-gray-200 dark:bg-[#172036] h-24" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[25px]">
          <div className="lg:col-span-2 animate-pulse rounded-xl bg-gray-200 dark:bg-[#172036] h-96" />
          <div className="animate-pulse rounded-xl bg-gray-200 dark:bg-[#172036] h-96" />
        </div>
      </div>
    );
  }

  if (asnQuery.isError || !asn) {
    return (
      <div className="space-y-[20px]">
        <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">
          Gagal memuat data
        </div>
        <Link href="/asn" className="text-primary-500 font-medium">
          Kembali
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-[25px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ASN / {asn.nama}
          </p>
          <h1 className="!mb-0">{fullName(asn)}</h1>
        </div>
        <Link
          href="/asn"
          className="inline-flex items-center gap-2 py-[10px] px-[20px] border border-gray-200 dark:border-[#172036] rounded-md"
        >
          <i className="material-symbols-outlined !text-[18px]">
            arrow_back
          </i>
          Kembali
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[25px]">
        <div className="lg:col-span-2 space-y-[25px]">
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <h5>Data Pribadi</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Nama Lengkap" value={fullName(asn)} />
              <Field label="NIP Baru / Lama" value={`${asn.nipBaru} / ${asn.nipLama ?? "-"}`} />
              <Field
                label="Tempat/Tanggal Lahir"
                value={`${asn.tempatLahir ?? "-"} / ${formatDate(asn.tanggalLahir)}`}
              />
              <Field
                label="Jenis Kelamin"
                value={asn.jenisKelamin?.nama ?? "-"}
              />
              <Field label="Agama" value={asn.agama?.nama ?? "-"} />
              <Field
                label="Status Kawin"
                value={asn.statusKawin?.nama ?? "-"}
              />
              <Field label="NIK" value={asn.nik} />
              <Field label="NPWP" value={asn.npwp} />
              <Field label="BPJS" value={asn.bpjs} />
              <Field label="Nomor HP" value={asn.nomorHp} />
              <Field label="Email" value={asn.email} />
              <Field label="Email Gov" value={asn.emailGov} />
              <div className="md:col-span-2">
                <Field label="Alamat" value={asn.alamat} />
              </div>
            </div>
          </div>

          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <h5>Data Kepegawaian</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field
                label="Status Pegawai"
                value={
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs ${statusClasses[asn.statusPegawai]}`}
                  >
                    {asn.statusPegawai}
                  </span>
                }
              />
              <Field label="Jenis Pegawai" value={asn.jenisPegawai} />
              <Field label="Kedudukan Hukum" value={asn.kedudukanHukum} />
              <Field label="No SK CPNS" value={asn.nomorSkCpns} />
              <Field label="Tanggal SK CPNS" value={formatDate(asn.tanggalSkCpns)} />
              <Field label="TMT CPNS" value={formatDate(asn.tmtCpns)} />
              <Field label="No SK PNS" value={asn.nomorSkPns} />
              <Field label="Tanggal SK PNS" value={formatDate(asn.tanggalSkPns)} />
              <Field label="TMT PNS" value={formatDate(asn.tmtPns)} />
              <Field
                label="Golongan"
                value={`${asn.golongan?.nama ?? "-"} / ${formatDate(asn.tmtGolongan)}`}
              />
              <Field
                label="Masa Kerja"
                value={`${asn.mkTahun ?? 0} tahun ${asn.mkBulan ?? 0} bulan`}
              />
              <Field
                label="Jenis Jabatan"
                value={asn.jenisJabatan?.nama ?? "-"}
              />
              <Field label="Jabatan" value={mainPosition(asn)} />
              <Field label="TMT Jabatan" value={formatDate(asn.tmtJabatan)} />
              <Field
                label="Tingkat Pendidikan"
                value={asn.tingkatPendidikan?.nama ?? "-"}
              />
              <Field
                label="Bidang Pendidikan"
                value={asn.bidangPendidikan?.nama ?? "-"}
              />
              <Field
                label="Unit Organisasi"
                value={asn.unitOrganisasi?.nama ?? "-"}
              />
              <Field label="Lokasi Kerja" value={asn.lokasiKerja} />
              <Field label="NIK Valid" value={asn.nikValid ? "Ya" : "Tidak"} />
              <Field label="IKD" value={asn.flagIkd ? "Ya" : "Tidak"} />
            </div>
          </div>

          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <h5>Riwayat</h5>
            {riwayatQuery.isLoading ? (
              <div className="animate-pulse rounded-md bg-gray-200 dark:bg-[#172036] h-24" />
            ) : riwayatQuery.data?.length ? (
              <div className="table-responsive overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      {["Jenis", "Keterangan", "Tanggal"].map((heading) => (
                        <th
                          className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c]"
                          key={heading}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {riwayatQuery.data.map((item) => (
                      <tr key={item.id}>
                        <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
                          {item.jenis}
                        </td>
                        <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
                          {item.keterangan ?? "-"}
                        </td>
                        <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
                          {formatDate(item.tanggal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Belum ada riwayat
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md sticky top-[110px]">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-primary-600 text-white flex items-center justify-center text-3xl font-bold mb-4">
                {asn.nama.slice(0, 2).toUpperCase()}
              </div>
              <h5>{fullName(asn)}</h5>
              <p className="text-gray-500">{asn.nipBaru}</p>
              <span
                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusClasses[asn.statusPegawai]}`}
              >
                {asn.statusPegawai}
              </span>
            </div>
            <div className="mt-6 space-y-4">
              <Field label="Unit Organisasi" value={asn.unitOrganisasi?.nama ?? "-"} />
              <Field label="Golongan" value={asn.golongan?.nama ?? "-"} />
              <Field label="Jabatan Utama" value={mainPosition(asn)} />
            </div>
            <div className="mt-6 space-y-3">
              {canEdit ? (
                <Link
                  href={`/asn/${asn.id}/edit`}
                  className="block text-center py-[10px] px-[20px] bg-primary-500 text-white rounded-md hover:bg-primary-400"
                >
                  Edit Data
                </Link>
              ) : null}
              {canDelete ? (
                <button
                  type="button"
                  className="block w-full py-[10px] px-[20px] bg-danger-500 text-white rounded-md hover:bg-danger-400"
                  onClick={handleDelete}
                  disabled={deleteAsn.isPending}
                >
                  Hapus
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
