"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import ConfirmModal from "@/components/silakap/ConfirmModal";
import UnitOrganisasiTree from "@/components/silakap/UnitOrganisasiTree";
import {
  useConfigSla,
  useConfigSlaActions,
  useRefActions,
  useRefAgama,
  useRefGolonganAdmin,
  useRefJabatan,
  useRefJenisJabatan,
  useRefJenisKelamin,
  useRefJenisLayananAdmin,
  useRefJenisPegawai,
  useRefKedudukanHukum,
  useRefKpkn,
  useRefLokasiKerja,
  useRefPendidikan,
  useRefPendidikanTingkat,
  useRefStatusAsn,
  useRefStatusPerkawinan,
  useRefTemplateDokumen,
  useRefUnitAdmin,
  useRefWilayah,
} from "@/hooks/useAdmin";
import type { UnitOrganisasi } from "@/types/models";

type Tab = "asn" | "jabatan" | "pendidikan" | "wilayah" | "layanan";
type FieldType = "text" | "number" | "checkbox" | "textarea" | "select";

type QueryLike = {
  data?: unknown[];
  isLoading: boolean;
  isError?: boolean;
};

type RefRow = {
  id: string;
  idSiasn?: string | null;
  kode?: string | null;
  nama?: string | null;
  isActive?: boolean | null;
  [key: string]: unknown;
};

type FieldConfig = {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  createOnly?: boolean;
  options?: Array<{ value: string; label: string }>;
};

type ResourceConfig = {
  name: string;
  path: string;
  fields: FieldConfig[];
};

const TABS: Array<{ value: Tab; label: string }> = [
  { value: "asn", label: "Referensi ASN" },
  { value: "jabatan", label: "Jabatan & Golongan" },
  { value: "pendidikan", label: "Pendidikan" },
  { value: "wilayah", label: "Wilayah & Unit" },
  { value: "layanan", label: "Layanan" },
];

const tableClass = "w-full text-sm";
const thClass = "whitespace-nowrap bg-primary-50 px-4 py-3 text-left font-medium dark:bg-[#15203c]";
const tdClass = "border-b border-gray-100 px-4 py-3 align-top dark:border-[#172036]";
const inputClass =
  "h-[42px] w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-0 focus:border-primary-500 dark:border-[#172036] dark:bg-[#0c1427]";
const textAreaClass =
  "min-h-[96px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-0 focus:border-primary-500 dark:border-[#172036] dark:bg-[#0c1427]";

const simpleMasterFields: FieldConfig[] = [
  { name: "idSiasn", label: "ID SIASN" },
  { name: "kode", label: "Kode" },
  { name: "nama", label: "Nama", required: true },
  { name: "isActive", label: "Aktif", type: "checkbox" },
];

const statusBadge = (active?: boolean | null) => (
  <span
    className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${
      active === false
        ? "bg-gray-100 text-gray-600 dark:bg-[#172036] dark:text-gray-300"
        : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
    }`}
  >
    {active === false ? "Nonaktif" : "Aktif"}
  </span>
);

const makeResource = (name: string, path: string, fields = simpleMasterFields): ResourceConfig => ({
  name,
  path,
  fields,
});

export default function AdminReferensiPage() {
  const searchParams = useSearchParams();
  const currentTab = (searchParams.get("tab") as Tab | null) ?? "asn";
  const tab = TABS.some((item) => item.value === currentTab) ? currentTab : "asn";

  const agama = useRefAgama();
  const jenisKelamin = useRefJenisKelamin();
  const statusPerkawinan = useRefStatusPerkawinan();
  const jenisPegawai = useRefJenisPegawai();
  const kedudukanHukum = useRefKedudukanHukum();
  const statusAsn = useRefStatusAsn();
  const golongan = useRefGolonganAdmin();
  const jenisJabatan = useRefJenisJabatan();
  const jabatan = useRefJabatan();
  const pendidikanTingkat = useRefPendidikanTingkat();
  const pendidikan = useRefPendidikan();
  const wilayah = useRefWilayah();
  const kpkn = useRefKpkn();
  const lokasiKerja = useRefLokasiKerja();
  const unit = useRefUnitAdmin();
  const jenisLayanan = useRefJenisLayananAdmin();
  const sla = useConfigSla();
  const templateDokumen = useRefTemplateDokumen();

  const tingkatOptions = useMemo(
    () =>
      ((pendidikanTingkat.data ?? []) as RefRow[]).map((item) => ({
        value: item.id,
        label: item.nama ?? item.id,
      })),
    [pendidikanTingkat.data],
  );
  const jenisLayananOptions = useMemo(
    () =>
      ((jenisLayanan.data ?? []) as unknown as RefRow[]).map((item) => ({
        value: item.id,
        label: `${item.kode ? `${item.kode} - ` : ""}${item.nama ?? item.id}`,
      })),
    [jenisLayanan.data],
  );
  const jenisJabatanOptions = useMemo(
    () =>
      ((jenisJabatan.data ?? []) as unknown as RefRow[]).map((item) => ({
        value: item.id,
        label: `${item.kode ? `${item.kode} - ` : ""}${item.nama ?? item.id}`,
      })),
    [jenisJabatan.data],
  );
  const unitOptions = useMemo(
    () =>
      ((unit.data ?? []) as unknown as RefRow[]).map((item) => ({
        value: item.id,
        label: `${item.idSiasn ? `${item.idSiasn} - ` : ""}${item.nama ?? item.id}`,
      })),
    [unit.data],
  );

  const resources = {
    agama: makeResource("agama", "/referensi/agama"),
    jenisKelamin: makeResource("jenis-kelamin", "/referensi/jenis-kelamin", [
      { name: "kode", label: "Kode", required: true },
      { name: "nama", label: "Nama", required: true },
      { name: "isActive", label: "Aktif", type: "checkbox" },
    ]),
    statusPerkawinan: makeResource("status-perkawinan", "/referensi/status-perkawinan"),
    jenisPegawai: makeResource("jenis-pegawai", "/referensi/jenis-pegawai"),
    kedudukanHukum: makeResource("kedudukan-hukum", "/referensi/kedudukan-hukum"),
    statusAsn: makeResource("status-asn", "/referensi/status-asn", [
      { name: "kode", label: "Kode", required: true },
      { name: "nama", label: "Nama", required: true },
      { name: "isActive", label: "Aktif", type: "checkbox" },
    ]),
    golongan: makeResource("golongan", "/referensi/golongan", [
      { name: "idSiasn", label: "ID SIASN" },
      { name: "kode", label: "Kode", required: true },
      { name: "nama", label: "Nama", required: true },
      { name: "roman", label: "Roman" },
      { name: "tingkat", label: "Tingkat", type: "number" },
      { name: "isActive", label: "Aktif", type: "checkbox" },
    ]),
    jenisJabatan: makeResource("jenis-jabatan", "/referensi/jenis-jabatan", [
      { name: "idSiasn", label: "ID SIASN" },
      { name: "kode", label: "Kode" },
      { name: "nama", label: "Nama", required: true },
      { name: "keterangan", label: "Keterangan", type: "textarea" },
      { name: "isActive", label: "Aktif", type: "checkbox" },
    ]),
    jabatan: makeResource("jabatan", "/referensi/jabatan", [
      { name: "idSiasn", label: "ID SIASN" },
      { name: "kode", label: "Kode" },
      { name: "nama", label: "Nama", required: true },
      { name: "jenisJabatanId", label: "Jenis Jabatan", type: "select", options: jenisJabatanOptions },
      { name: "unitOrganisasiId", label: "Unit Organisasi", type: "select", options: unitOptions },
      { name: "eselonId", label: "Eselon", type: "number" },
      { name: "jenjang", label: "Jenjang" },
      { name: "bup", label: "BUP", type: "number" },
      { name: "isActive", label: "Aktif", type: "checkbox" },
    ]),
    pendidikanTingkat: makeResource("pendidikan-tingkat", "/referensi/pendidikan-tingkat"),
    pendidikan: makeResource("pendidikan", "/referensi/pendidikan", [
      { name: "idSiasn", label: "ID SIASN" },
      { name: "kode", label: "Kode" },
      { name: "nama", label: "Nama", required: true },
      { name: "tingkatId", label: "Tingkat", type: "select", options: tingkatOptions },
      { name: "isActive", label: "Aktif", type: "checkbox" },
    ]),
    wilayah: makeResource("wilayah", "/referensi/wilayah"),
    kpkn: makeResource("kpkn", "/referensi/kpkn"),
    lokasiKerja: makeResource("lokasi-kerja", "/referensi/lokasi-kerja"),
    unit: makeResource("unit", "/referensi/unit-organisasi", [
      { name: "id", label: "ID SIASN", required: true, createOnly: true },
      { name: "kode", label: "Kode" },
      { name: "nama", label: "Nama", required: true },
      { name: "idAtasan", label: "ID Atasan", type: "number" },
      { name: "level", label: "Level", type: "number" },
      { name: "isOpd", label: "OPD", type: "checkbox" },
      { name: "isActive", label: "Aktif", type: "checkbox" },
    ]),
    jenisLayanan: makeResource("jenis-layanan", "/referensi/jenis-layanan", [
      { name: "kode", label: "Kode", required: true },
      { name: "nama", label: "Nama", required: true },
      { name: "deskripsi", label: "Deskripsi", type: "textarea" },
      { name: "butuhTteKepalaBadan", label: "Butuh TTE Kepala Badan", type: "checkbox" },
      { name: "isActive", label: "Aktif", type: "checkbox" },
    ]),
    template: makeResource("template-dokumen", "/referensi/template-dokumen", [
      { name: "jenisLayananId", label: "Jenis Layanan", type: "select", options: jenisLayananOptions },
      { name: "kode", label: "Kode", required: true },
      { name: "nama", label: "Nama", required: true },
      { name: "deskripsi", label: "Deskripsi", type: "textarea" },
      { name: "konten", label: "Konten", type: "textarea", required: true },
      { name: "isActive", label: "Aktif", type: "checkbox" },
    ]),
  };

  return (
    <div className="space-y-[25px]">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="!mb-1">Data Referensi</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Master data ASN, organisasi, dan layanan
          </p>
        </div>
        <Link
          href="/admin/integrasi#import-referensi"
          className="inline-flex h-[40px] items-center gap-2 rounded-md bg-primary-500 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-600"
        >
          <span className="material-symbols-outlined text-[18px]">upload_file</span>
          Import Referensi
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <Link
            key={item.value}
            href={`/admin/referensi?tab=${item.value}`}
            className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
              tab === item.value
                ? "border-primary-500 bg-primary-500 text-white"
                : "border-gray-100 bg-white text-gray-700 hover:bg-gray-50 dark:border-[#172036] dark:bg-[#0c1427] dark:text-gray-300 dark:hover:bg-[#15203c]"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {tab === "asn" ? (
        <ReferenceGrid>
          <MasterTable title="Agama" query={agama} columns={["idSiasn", "kode", "nama", "status"]} resource={resources.agama} />
          <MasterTable title="Jenis Kelamin" query={jenisKelamin} columns={["kode", "nama", "status"]} resource={resources.jenisKelamin} />
          <MasterTable title="Status Perkawinan" query={statusPerkawinan} columns={["idSiasn", "kode", "nama", "status"]} resource={resources.statusPerkawinan} />
          <MasterTable title="Jenis Pegawai" query={jenisPegawai} columns={["idSiasn", "kode", "nama", "status"]} resource={resources.jenisPegawai} />
          <MasterTable title="Kedudukan Hukum" query={kedudukanHukum} columns={["idSiasn", "kode", "nama", "status"]} resource={resources.kedudukanHukum} />
          <MasterTable title="Status ASN" query={statusAsn} columns={["kode", "nama", "status"]} resource={resources.statusAsn} />
        </ReferenceGrid>
      ) : null}

      {tab === "jabatan" ? (
        <ReferenceGrid>
          <MasterTable title="Golongan" query={golongan} columns={["idSiasn", "kode", "nama", "roman", "tingkat", "status"]} resource={resources.golongan} />
          <MasterTable title="Jenis Jabatan" query={jenisJabatan} columns={["idSiasn", "kode", "nama", "keterangan", "status"]} resource={resources.jenisJabatan} />
          <MasterTable title="Jabatan" query={jabatan} columns={["idSiasn", "kode", "nama", "jenisJabatan", "unitOrganisasi", "bup", "status"]} resource={resources.jabatan} pageSize={20} wide />
        </ReferenceGrid>
      ) : null}

      {tab === "pendidikan" ? (
        <ReferenceGrid>
          <MasterTable title="Tingkat Pendidikan" query={pendidikanTingkat} columns={["idSiasn", "kode", "nama", "status"]} resource={resources.pendidikanTingkat} />
          <MasterTable title="Pendidikan" query={pendidikan} columns={["idSiasn", "kode", "nama", "tingkat", "status"]} resource={resources.pendidikan} pageSize={20} wide />
        </ReferenceGrid>
      ) : null}

      {tab === "wilayah" ? (
        <ReferenceGrid>
          <MasterTable title="Wilayah / Tempat Lahir" query={wilayah} columns={["idSiasn", "kode", "nama", "status"]} resource={resources.wilayah} pageSize={20} wide />
          <MasterTable title="KPKN" query={kpkn} columns={["idSiasn", "kode", "nama", "status"]} resource={resources.kpkn} />
          <MasterTable title="Lokasi Kerja" query={lokasiKerja} columns={["idSiasn", "kode", "nama", "status"]} resource={resources.lokasiKerja} />
          <MasterTable title="Unit Organisasi" query={unit} columns={["idSiasn", "kode", "nama", "level", "isOpd", "status"]} resource={resources.unit} pageSize={20} wide />
          <UnitTreePanel query={unit} />
        </ReferenceGrid>
      ) : null}

      {tab === "layanan" ? (
        <ReferenceGrid>
          <MasterTable title="Jenis Layanan" query={jenisLayanan} columns={["kode", "nama", "butuhTteKepalaBadan", "persyaratan", "status"]} resource={resources.jenisLayanan} pageSize={20} wide />
          <SlaTable query={sla} jenisLayananOptions={jenisLayananOptions} />
          <MasterTable title="Template Dokumen" query={templateDokumen} columns={["kode", "nama", "jenisLayanan", "status"]} resource={resources.template} pageSize={20} wide />
        </ReferenceGrid>
      ) : null}
    </div>
  );
}

function ReferenceGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-[25px] xl:grid-cols-2">{children}</div>;
}

function Card({
  title,
  count,
  wide,
  action,
  children,
}: {
  title: string;
  count?: number;
  wide?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={`trezo-card rounded-md bg-white p-[20px] dark:bg-[#0c1427] md:p-[25px] ${wide ? "xl:col-span-2" : ""}`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <h5 className="!mb-0">{title}</h5>
          {typeof count === "number" ? (
            <span className="rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-[#15203c] dark:text-gray-300">
              {count.toLocaleString("id-ID")} data
            </span>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function LoadingBlock() {
  return <div className="h-40 animate-pulse rounded-md bg-gray-100 dark:bg-[#172036]" />;
}

function ErrorBlock() {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
      Data belum bisa dimuat.
    </div>
  );
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-3 flex flex-col gap-2 text-xs text-gray-500 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
      <span>Halaman {page} dari {totalPages}</span>
      <div className="flex gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="rounded border border-gray-200 px-3 py-1 hover:bg-gray-50 disabled:opacity-40 dark:border-[#172036] dark:hover:bg-[#15203c]"
        >
          Prev
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="rounded border border-gray-200 px-3 py-1 hover:bg-gray-50 disabled:opacity-40 dark:border-[#172036] dark:hover:bg-[#15203c]"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function MasterTable({
  title,
  query,
  columns,
  resource,
  pageSize = 10,
  wide,
}: {
  title: string;
  query: QueryLike;
  columns: string[];
  resource?: ResourceConfig;
  pageSize?: number;
  wide?: boolean;
}) {
  const actions = useRefActions();
  const [page, setPage] = useState(1);
  const [editingRow, setEditingRow] = useState<RefRow | null>(null);
  const [deleteRow, setDeleteRow] = useState<RefRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const rows = (query.data ?? []) as RefRow[];
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleRows = rows.slice((safePage - 1) * pageSize, safePage * pageSize);
  const isBusy =
    actions.createMaster.isPending ||
    actions.updateMaster.isPending ||
    actions.removeMaster.isPending;

  const openCreate = () => {
    setErrorMessage("");
    setEditingRow(null);
    setIsModalOpen(true);
  };

  const openEdit = (row: RefRow) => {
    setErrorMessage("");
    setEditingRow(row);
    setIsModalOpen(true);
  };

  const save = async (body: Record<string, unknown>) => {
    if (!resource) return;
    setErrorMessage("");
    try {
      if (editingRow) {
        await actions.updateMaster.mutateAsync({
          name: resource.name,
          path: resource.path,
          id: editingRow.id,
          body,
        });
      } else {
        await actions.createMaster.mutateAsync({
          name: resource.name,
          path: resource.path,
          body,
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const remove = async (row: RefRow) => {
    if (!resource) return;
    setErrorMessage("");
    try {
      await actions.removeMaster.mutateAsync({
        name: resource.name,
        path: resource.path,
        id: row.id,
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  return (
    <>
      <Card
        title={title}
        count={rows.length}
        wide={wide}
        action={
          resource ? (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex h-[36px] items-center gap-1 rounded-md bg-primary-500 px-3 text-sm font-medium text-white hover:bg-primary-600"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tambah
            </button>
          ) : null
        }
      >
        {errorMessage ? (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {errorMessage}
          </div>
        ) : null}
        {query.isLoading ? <LoadingBlock /> : null}
        {query.isError ? <ErrorBlock /> : null}
        {!query.isLoading && !query.isError ? (
          <>
            <div className="overflow-x-auto">
              <table className={tableClass}>
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th className={thClass} key={column}>{columnLabel(column)}</th>
                    ))}
                    {resource ? <th className={`${thClass} text-right`}>Aksi</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.id}>
                      {columns.map((column) => (
                        <td className={tdClass} key={column}>
                          {renderCell(row, column)}
                        </td>
                      ))}
                      {resource ? (
                        <td className={`${tdClass} whitespace-nowrap text-right`}>
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            className="mr-2 rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50 dark:border-[#172036] dark:hover:bg-[#15203c]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => setDeleteRow(row)}
                            className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:hover:bg-red-900/20"
                          >
                            Hapus
                          </button>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                  {visibleRows.length === 0 ? (
                    <tr><td className={tdClass} colSpan={columns.length + (resource ? 1 : 0)}>Belum ada data</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </>
        ) : null}
      </Card>
      {resource ? (
        <ReferenceFormModal
          isOpen={isModalOpen}
          title={`${editingRow ? "Edit" : "Tambah"} ${title}`}
          fields={resource.fields}
          row={editingRow}
          isSubmitting={isBusy}
          onClose={() => setIsModalOpen(false)}
          onSubmit={save}
        />
      ) : null}
      {resource ? (
        <ConfirmModal
          isOpen={Boolean(deleteRow)}
          title={`Nonaktifkan ${title}`}
          description={`Nonaktifkan "${displayValue(deleteRow?.nama)}"? Data tidak akan dihapus permanen, tetapi tidak aktif untuk pilihan baru.`}
          onClose={() => setDeleteRow(null)}
          onConfirm={() => {
            if (!deleteRow) return;
            void remove(deleteRow).then(() => setDeleteRow(null));
          }}
          showTextarea={false}
          confirmLabel="Nonaktifkan"
          confirmColor="red"
          loading={isBusy}
        />
      ) : null}
    </>
  );
}

function UnitTreePanel({ query }: { query: QueryLike }) {
  const units = (query.data ?? []) as UnitOrganisasi[];
  return (
    <Card title="Struktur Unit Organisasi" count={units.length} wide>
      {query.isLoading ? <LoadingBlock /> : null}
      {query.isError ? <ErrorBlock /> : null}
      {!query.isLoading && !query.isError ? (
        <UnitOrganisasiTree units={units} maxHeightClass="max-h-[560px]" />
      ) : null}
    </Card>
  );
}

function SlaTable({
  query,
  jenisLayananOptions,
}: {
  query: QueryLike;
  jenisLayananOptions: Array<{ value: string; label: string }>;
}) {
  const actions = useConfigSlaActions();
  const [page, setPage] = useState(1);
  const [editingRow, setEditingRow] = useState<RefRow | null>(null);
  const [deleteRow, setDeleteRow] = useState<RefRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const rows = (query.data ?? []) as RefRow[];
  const totalPages = Math.max(1, Math.ceil(rows.length / 10));
  const safePage = Math.min(page, totalPages);
  const visibleRows = rows.slice((safePage - 1) * 10, safePage * 10);
  const isBusy = actions.upsert.isPending || actions.remove.isPending;
  const fields: FieldConfig[] = [
    { name: "jenisLayananId", label: "Jenis Layanan", type: "select", options: jenisLayananOptions },
    {
      name: "jabatan",
      label: "Tahap/Jabatan",
      type: "select",
      required: true,
      options: ["AP", "AM", "AD", "Kabid", "KepalaBadan"].map((value) => ({ value, label: value })),
    },
    { name: "slaHari", label: "SLA Hari", type: "number", required: true },
    { name: "slaJam", label: "SLA Jam", type: "number", required: true },
    { name: "eskalasiHari", label: "Eskalasi Hari", type: "number" },
  ];

  const save = async (body: Record<string, unknown>) => {
    setErrorMessage("");
    try {
      await actions.upsert.mutateAsync(body);
      setIsModalOpen(false);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const remove = async (row: RefRow) => {
    setErrorMessage("");
    try {
      await actions.remove.mutateAsync(row.id);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  return (
    <>
      <Card
        title="Konfigurasi SLA"
        count={rows.length}
        action={
          <button
            type="button"
            onClick={() => {
              setEditingRow(null);
              setIsModalOpen(true);
            }}
            className="inline-flex h-[36px] items-center gap-1 rounded-md bg-primary-500 px-3 text-sm font-medium text-white hover:bg-primary-600"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah
          </button>
        }
      >
        {errorMessage ? (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {errorMessage}
          </div>
        ) : null}
        {query.isLoading ? <LoadingBlock /> : null}
        {query.isError ? <ErrorBlock /> : null}
        {!query.isLoading && !query.isError ? (
          <>
            <div className="overflow-x-auto">
              <table className={tableClass}>
                <thead>
                  <tr>
                    {["Layanan", "Tahap/Jabatan", "SLA", "Eskalasi", "Aksi"].map((label) => <th className={`${thClass} ${label === "Aksi" ? "text-right" : ""}`} key={label}>{label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.id}>
                      <td className={tdClass}>{displayValue((row.jenisLayanan as { nama?: string } | undefined)?.nama ?? "-")}</td>
                      <td className={tdClass}>{displayValue(row.jabatan)}</td>
                      <td className={tdClass}>{`${displayValue(row.slaHari)} hari ${displayValue(row.slaJam)} jam`}</td>
                      <td className={tdClass}>{displayValue(row.eskalasiHari)}</td>
                      <td className={`${tdClass} whitespace-nowrap text-right`}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingRow(row);
                            setIsModalOpen(true);
                          }}
                          className="mr-2 rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50 dark:border-[#172036] dark:hover:bg-[#15203c]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => setDeleteRow(row)}
                          className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:hover:bg-red-900/20"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </>
        ) : null}
      </Card>
      <ReferenceFormModal
        isOpen={isModalOpen}
        title={`${editingRow ? "Edit" : "Tambah"} Konfigurasi SLA`}
        fields={fields}
        row={editingRow}
        isSubmitting={isBusy}
        onClose={() => setIsModalOpen(false)}
        onSubmit={save}
      />
      <ConfirmModal
        isOpen={Boolean(deleteRow)}
        title="Hapus Konfigurasi SLA"
        description={`Hapus konfigurasi SLA untuk ${displayValue(deleteRow?.jabatan)}? Pengaturan SLA ini tidak akan dipakai lagi setelah dihapus.`}
        onClose={() => setDeleteRow(null)}
        onConfirm={() => {
          if (!deleteRow) return;
          void remove(deleteRow).then(() => setDeleteRow(null));
        }}
        showTextarea={false}
        confirmLabel="Hapus"
        confirmColor="red"
        loading={isBusy}
      />
    </>
  );
}

function ReferenceFormModal({
  isOpen,
  title,
  fields,
  row,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  title: string;
  fields: FieldConfig[];
  row: RefRow | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (body: Record<string, unknown>) => Promise<void>;
}) {
  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    void onSubmit(buildPayload(formData, fields, Boolean(row)));
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-[620px] rounded-md bg-white p-5 shadow-xl dark:bg-[#0c1427]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h5 className="!mb-0">{title}</h5>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 dark:border-[#172036] dark:hover:bg-[#15203c]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {fields
              .filter((field) => !(row && field.createOnly))
              .map((field) => (
                <FormField field={field} key={field.name} row={row} />
              ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-[38px] rounded-md border border-gray-200 px-4 text-sm hover:bg-gray-50 dark:border-[#172036] dark:hover:bg-[#15203c]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[38px] rounded-md bg-primary-500 px-4 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-60"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ field, row }: { field: FieldConfig; row: RefRow | null }) {
  const value = getNestedValue(row, field.name);
  const inputType = field.type ?? "text";
  const wrapperClass = inputType === "textarea" ? "md:col-span-2" : "";

  if (inputType === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name={field.name}
          defaultChecked={value === undefined ? field.name === "isActive" : Boolean(value)}
          className="h-4 w-4 rounded border-gray-300 text-primary-500"
        />
        {field.label}
      </label>
    );
  }

  return (
    <label className={`block text-sm ${wrapperClass}`}>
      <span className="mb-1 block text-gray-700 dark:text-gray-300">{field.label}</span>
      {inputType === "textarea" ? (
        <textarea
          name={field.name}
          required={field.required}
          defaultValue={valueToInput(value)}
          className={textAreaClass}
        />
      ) : inputType === "select" ? (
        <select
          name={field.name}
          required={field.required}
          defaultValue={valueToInput(value)}
          className={inputClass}
        >
          <option value="">- Pilih -</option>
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={inputType}
          name={field.name}
          required={field.required}
          defaultValue={valueToInput(value)}
          className={inputClass}
        />
      )}
    </label>
  );
}

function buildPayload(formData: FormData, fields: FieldConfig[], isEdit: boolean) {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    if (isEdit && field.createOnly) continue;
    if (field.type === "checkbox") {
      payload[field.name] = formData.get(field.name) === "on";
      continue;
    }
    const raw = String(formData.get(field.name) ?? "").trim();
    if (raw === "") {
      if (field.required) payload[field.name] = "";
      continue;
    }
    payload[field.name] = field.type === "number" ? Number(raw) : raw;
  }
  return payload;
}

function renderCell(row: RefRow, column: string) {
  if (column === "status") return statusBadge(row.isActive);
  if (column === "tingkat") {
    return displayValue((row.tingkat as { nama?: string } | undefined)?.nama ?? row.tingkatId);
  }
  if (column === "jenisLayanan") {
    return displayValue((row.jenisLayanan as { nama?: string } | undefined)?.nama ?? "-");
  }
  if (column === "jenisJabatan") {
    return displayValue((row.jenisJabatan as { nama?: string } | undefined)?.nama ?? "-");
  }
  if (column === "unitOrganisasi") {
    return displayValue((row.unitOrganisasi as { nama?: string } | undefined)?.nama ?? "-");
  }
  if (column === "persyaratan") {
    return Array.isArray(row.persyaratanLayanan) ? row.persyaratanLayanan.length : 0;
  }
  return displayValue(row[column]);
}

function columnLabel(column: string) {
  const labels: Record<string, string> = {
    idSiasn: "ID SIASN",
    kode: "Kode",
    nama: "Nama",
    roman: "Roman",
    tingkat: "Tingkat",
    level: "Level",
    isOpd: "OPD",
    butuhTteKepalaBadan: "TTE KB",
    jenisLayanan: "Layanan",
    jenisJabatan: "Jenis Jabatan",
    unitOrganisasi: "Unit",
    bup: "BUP",
    persyaratan: "Persyaratan",
    keterangan: "Keterangan",
    status: "Status",
  };
  return labels[column] ?? column;
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  if (typeof value === "object") return "-";
  return String(value);
}

function valueToInput(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return "";
  return String(value);
}

function getNestedValue(row: RefRow | null, name: string) {
  if (!row) return undefined;
  return row[name];
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message ?? "Operasi gagal diproses.";
  }
  return "Operasi gagal diproses.";
}
