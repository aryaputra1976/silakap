"use client";

import { useState } from "react";
import {
  useApprovePeremajaan,
  useCreatePeremajaan,
  usePeremajaanList,
} from "@/hooks/useAsn";
import { useAsnSearch } from "@/hooks/useLayanan";
import { useAuthStore } from "@/store/auth.store";
import type { Asn } from "@/types/models";

const canApprove = (role?: string) =>
  role === "Analis_Madya" || role === "Kabid" || role === "Admin_Sistem";

export default function PeremajaanAsnPage() {
  const user = useAuthStore((state) => state.user);
  const [search, setSearch] = useState("");
  const [selectedAsn, setSelectedAsn] = useState<Asn | null>(null);
  const [jenisPerubahan, setJenisPerubahan] = useState("Data Pribadi");
  const [fieldName, setFieldName] = useState("nik");
  const [fieldValue, setFieldValue] = useState("");
  const [catatan, setCatatan] = useState("");
  const list = usePeremajaanList({ limit: 20 });
  const asn = useAsnSearch(search);
  const create = useCreatePeremajaan();
  const approve = useApprovePeremajaan();

  const submit = async () => {
    if (!selectedAsn || !fieldName || !fieldValue) return;
    await create.mutateAsync({
      asnId: selectedAsn.id,
      jenisPerubahan,
      dataBaru: { [fieldName]: fieldValue },
      catatan,
    });
    setFieldValue("");
    setCatatan("");
  };

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">Peremajaan ASN</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Pengajuan pembaruan data ASN dan approval verifikator
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[25px]">
        <div className="xl:col-span-1 trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
          <h5>Form Pengajuan</h5>
          <div className="space-y-4">
            <div>
              <label className="mb-[8px] block font-medium">Cari ASN</label>
              <input
                className="h-[45px] w-full rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px] outline-0"
                placeholder="Nama atau NIP"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <div className="mt-2 max-h-[180px] overflow-y-auto border border-gray-100 dark:border-[#172036] rounded-md">
                {(asn.data?.data ?? []).map((item) => (
                  <button
                    type="button"
                    className={`block w-full text-left px-3 py-2 border-b border-gray-100 dark:border-[#172036] ${selectedAsn?.id === item.id ? "bg-primary-50 dark:bg-[#15203c]" : ""}`}
                    key={item.id}
                    onClick={() => setSelectedAsn(item)}
                  >
                    <span className="block font-semibold">{item.nama}</span>
                    <span className="text-sm text-gray-500">{item.nipBaru}</span>
                  </button>
                ))}
              </div>
            </div>
            <select
              className="h-[45px] w-full rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]"
              value={jenisPerubahan}
              onChange={(event) => setJenisPerubahan(event.target.value)}
            >
              <option>Data Pribadi</option>
              <option>Jabatan</option>
              <option>Golongan</option>
              <option>Pendidikan</option>
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input
                className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]"
                placeholder="Field, contoh nik"
                value={fieldName}
                onChange={(event) => setFieldName(event.target.value)}
              />
              <input
                className="h-[45px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]"
                placeholder="Nilai baru"
                value={fieldValue}
                onChange={(event) => setFieldValue(event.target.value)}
              />
            </div>
            <textarea
              className="min-h-[90px] w-full rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px] py-[10px]"
              placeholder="Catatan"
              value={catatan}
              onChange={(event) => setCatatan(event.target.value)}
            />
            <button
              type="button"
              className="w-full py-[10px] px-[20px] bg-primary-500 text-white rounded-md disabled:opacity-70"
              disabled={!selectedAsn || create.isPending}
              onClick={() => void submit()}
            >
              {create.isPending ? "Mengirim..." : "Ajukan Peremajaan"}
            </button>
          </div>
        </div>

        <div className="xl:col-span-2 trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
          <h5>Daftar Pengajuan</h5>
          <div className="table-responsive overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {["ASN", "Jenis", "Data Baru", "Status", "Aksi"].map((heading) => (
                    <th className="font-medium text-left px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c]" key={heading}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(list.data?.data ?? []).map((item) => (
                  <tr key={item.id}>
                    <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
                      <span className="block font-semibold">{item.asn?.nama ?? "-"}</span>
                      <span className="text-sm text-gray-500">{item.asn?.nipBaru ?? "-"}</span>
                    </td>
                    <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.jenisPerubahan}</td>
                    <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
                      <code>{JSON.stringify(item.dataBaru)}</code>
                    </td>
                    <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.statusApproval}</td>
                    <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
                      {item.statusApproval === "Pending" && canApprove(user?.roleNama) ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="py-[7px] px-[10px] bg-success-500 text-white rounded-md"
                            onClick={() => approve.mutate({ id: item.id, body: { statusApproval: "Approved" } })}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="py-[7px] px-[10px] bg-danger-500 text-white rounded-md"
                            onClick={() => approve.mutate({ id: item.id, body: { statusApproval: "Rejected" } })}
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
