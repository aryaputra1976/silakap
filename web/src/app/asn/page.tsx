"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  useAsnList,
  useDeleteAsn,
  useRefGolongan,
  useRefUnitOrganisasi,
} from "@/hooks/useAsn";
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

const mainPosition = (asn: AsnDetail) =>
  asn.jabatanStruktural?.nama ??
  asn.jabatanFungsional?.nama ??
  asn.jabatanPelaksana?.nama ??
  asn.jenisJabatan?.nama ??
  "-";

export default function AsnPage() {
  const user = useAuthStore((state) => state.user);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [unitOrganisasiId, setUnitOrganisasiId] = useState("");
  const [statusPegawai, setStatusPegawai] = useState("");
  const [golonganId, setGolonganId] = useState("");
  const [page, setPage] = useState(1);

  const refUnit = useRefUnitOrganisasi();
  const refGolongan = useRefGolongan();
  const deleteAsn = useDeleteAsn();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      unitOrganisasiId: unitOrganisasiId || undefined,
      golonganId: golonganId || undefined,
      statusPegawai: statusPegawai || undefined,
      page,
      limit: 10,
    }),
    [golonganId, page, search, statusPegawai, unitOrganisasiId],
  );
  const asnList = useAsnList(queryParams);

  const canCreate = user?.roleNama === "Admin_Sistem";
  const canEdit =
    user?.roleNama === "Admin_Sistem" || user?.roleNama === "Kabid";
  const canDelete = user?.roleNama === "Admin_Sistem";

  const handleDelete = (id: string) => {
    if (window.confirm("Hapus data ASN ini?")) {
      deleteAsn.mutate(id);
    }
  };

  const resetPage = (callback: (value: string) => void, value: string) => {
    callback(value);
    setPage(1);
  };

  return (
    <div className="space-y-[25px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="!mb-1">Data ASN</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Data pegawai ASN dan informasi kepegawaian
          </p>
        </div>
        {canCreate ? (
          <Link
            href="/asn/buat"
            className="inline-flex items-center gap-2 py-[10px] px-[20px] bg-primary-500 text-white transition-all hover:bg-primary-400 rounded-md"
          >
            <i className="material-symbols-outlined !text-[20px]">add</i>
            Tambah ASN
          </Link>
        ) : null}
      </div>

      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <div className="flex flex-col xl:flex-row gap-3">
          <input
            className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] outline-0 grow"
            placeholder="Cari nama / NIP..."
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <select
            className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px] outline-0"
            value={unitOrganisasiId}
            onChange={(event) =>
              resetPage(setUnitOrganisasiId, event.target.value)
            }
          >
            <option value="">Semua Unit</option>
            {(refUnit.data ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama}
              </option>
            ))}
          </select>
          <select
            className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px] outline-0"
            value={statusPegawai}
            onChange={(event) => resetPage(setStatusPegawai, event.target.value)}
          >
            <option value="">Semua Status</option>
            {["Aktif", "Pensiun", "Meninggal", "Keluar"].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px] outline-0"
            value={golonganId}
            onChange={(event) => resetPage(setGolonganId, event.target.value)}
          >
            <option value="">Semua Golongan</option>
            {(refGolongan.data ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.kode} - {item.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {asnList.isError || deleteAsn.isError ? (
        <div className="py-[1rem] px-[1rem] text-danger-500 bg-danger-50 border border-danger-200 rounded-md">
          Gagal memuat data
        </div>
      ) : null}

      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        {asnList.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                className="animate-pulse rounded-md bg-gray-200 dark:bg-[#172036] h-12"
                key={index}
              />
            ))}
          </div>
        ) : asnList.data?.data.length ? (
          <>
            <div className="table-responsive overflow-x-auto">
              <table className="w-full">
                <thead className="text-black dark:text-white">
                  <tr>
                    {[
                      "NIP Baru",
                      "Nama",
                      "Golongan",
                      "Jabatan",
                      "Unit",
                      "Status",
                      "Aksi",
                    ].map((heading) => (
                      <th
                        className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c] whitespace-nowrap"
                        key={heading}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {asnList.data.data.map((asn) => (
                    <tr key={asn.id}>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] font-medium whitespace-nowrap">
                        {asn.nipBaru}
                      </td>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
                        {fullName(asn)}
                      </td>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] whitespace-nowrap">
                        {asn.golongan?.nama ?? "-"}
                      </td>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
                        {mainPosition(asn)}
                      </td>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
                        {asn.unitOrganisasi?.nama ?? "-"}
                      </td>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClasses[asn.statusPegawai]}`}
                        >
                          {asn.statusPegawai}
                        </span>
                      </td>
                      <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/asn/${asn.id}`}
                            className="w-8 h-8 rounded-md bg-primary-50 text-primary-500 flex items-center justify-center"
                            title="Lihat"
                          >
                            <i className="material-symbols-outlined !text-[18px]">
                              visibility
                            </i>
                          </Link>
                          {canEdit ? (
                            <Link
                              href={`/asn/${asn.id}/edit`}
                              className="w-8 h-8 rounded-md bg-warning-100 text-warning-700 flex items-center justify-center"
                              title="Edit"
                            >
                              <i className="material-symbols-outlined !text-[18px]">
                                edit
                              </i>
                            </Link>
                          ) : null}
                          {canDelete ? (
                            <button
                              type="button"
                              className="w-8 h-8 rounded-md bg-danger-50 text-danger-500 flex items-center justify-center"
                              title="Hapus"
                              onClick={() => handleDelete(asn.id)}
                              disabled={deleteAsn.isPending}
                            >
                              <i className="material-symbols-outlined !text-[18px]">
                                delete
                              </i>
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-end gap-2 mt-[20px]">
              {Array.from({ length: asnList.data.meta.totalPages }).map(
                (_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      className={`w-9 h-9 rounded-md border ${
                        pageNumber === page
                          ? "bg-primary-500 text-white border-primary-500"
                          : "border-gray-200 dark:border-[#172036]"
                      }`}
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                },
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-[45px]">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary-50 text-primary-500 flex items-center justify-center mb-4">
              <i className="material-symbols-outlined !text-[34px]">people</i>
            </div>
            <h5 className="!mb-1">Tidak ada data ASN</h5>
          </div>
        )}
      </div>
    </div>
  );
}
