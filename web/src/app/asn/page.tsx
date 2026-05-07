"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAsnList,
  useAsnStats,
  useRefGolongan,
  useRefUnitOrganisasi,
} from "@/hooks/useAsn";
import type { AsnDetail, UnitOrganisasi } from "@/types/models";

type UnitTreeNode = UnitOrganisasi & {
  children: UnitTreeNode[];
  depth: number;
};

const fullName = (asn: AsnDetail) =>
  [asn.gelarDepan, asn.nama, asn.gelarBelakang].filter(Boolean).join(" ");

const mainPosition = (asn: AsnDetail) =>
  asn.jabatan?.nama ??
  asn.jenisJabatan?.nama ??
  "-";

const getVisiblePages = (currentPage: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const maxButtons = 5;
  let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let end = start + maxButtons - 1;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxButtons + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

const normalizeText = (value: string) => value.toLowerCase().trim();

const buildUnitTree = (units: UnitOrganisasi[]) => {
  const nodes = new Map<string, UnitTreeNode>();
  const roots: UnitTreeNode[] = [];

  units.forEach((unit) => {
    nodes.set(unit.id, { ...unit, children: [], depth: 1 });
  });

  units.forEach((unit) => {
    const node = nodes.get(unit.id);
    if (!node) return;
    const parent = unit.idAtasan ? nodes.get(unit.idAtasan) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const assignDepth = (items: UnitTreeNode[], depth = 1) => {
    items.forEach((item) => {
      item.depth = depth;
      assignDepth(item.children, depth + 1);
    });
  };

  assignDepth(roots);
  return roots;
};

const flattenUnitTree = (nodes: UnitTreeNode[]): UnitTreeNode[] =>
  nodes.flatMap((node) => [node, ...flattenUnitTree(node.children)]);

export default function AsnPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [unitOrganisasiId, setUnitOrganisasiId] = useState("");
  const [statusPegawai, setStatusPegawai] = useState("");
  const [golonganId, setGolonganId] = useState("");
  const [page, setPage] = useState(1);

  const refUnit = useRefUnitOrganisasi();
  const refGolongan = useRefGolongan();

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
  const asnStats = useAsnStats();
  const statCards = [
    {
      label: "Keseluruhan",
      value: asnStats.data?.total,
      className: "border-primary-100 bg-primary-50 text-primary-700 dark:border-primary-900/50 dark:bg-primary-900/20 dark:text-primary-200",
      iconClass: "bg-primary-500 text-white",
      icon: "groups",
    },
    {
      label: "PNS",
      value: asnStats.data?.pns,
      className: "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-200",
      iconClass: "bg-emerald-500 text-white",
      icon: "badge",
    },
    {
      label: "PPPK",
      value: asnStats.data?.pppk,
      className: "border-sky-100 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-900/20 dark:text-sky-200",
      iconClass: "bg-sky-500 text-white",
      icon: "assignment_ind",
    },
    {
      label: "PPPK Paruh Waktu",
      value: asnStats.data?.pppkParuhWaktu,
      className: "border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200",
      iconClass: "bg-amber-500 text-white",
      icon: "schedule",
    },
  ];

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
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            isLoading={asnStats.isLoading}
            className={item.className}
            iconClass={item.iconClass}
            icon={item.icon}
          />
        ))}
      </div>

      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <div className="flex flex-col xl:flex-row gap-3">
          <input
            suppressHydrationWarning
            className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] outline-0 grow"
            placeholder="Cari nama / NIP..."
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <UnitTreeSelect
            units={refUnit.data ?? []}
            value={unitOrganisasiId}
            onChange={(value) => resetPage(setUnitOrganisasiId, value)}
          />
          <select
            suppressHydrationWarning
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
            suppressHydrationWarning
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

      {asnList.isError ? (
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
            <div className="overflow-hidden">
              <table className="w-full table-fixed text-sm">
                <colgroup>
                  <col className="w-[34%]" />
                  <col className="w-[28%]" />
                  <col className="w-[33%]" />
                  <col className="w-[5%]" />
                </colgroup>
                <thead className="text-black dark:text-white">
                  <tr>
                    {[
                      "Nama / NIP",
                      "Golongan / Jabatan",
                      "Unit",
                      "Aksi",
                    ].map((heading) => (
                      <th
                        className="bg-primary-50 px-2.5 py-2 text-left text-xs font-medium dark:bg-[#15203c] md:px-3"
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
                      <td className="break-words border-b border-gray-100 px-2.5 py-3 dark:border-[#172036] md:px-3">
                        <span className="block font-semibold text-black dark:text-white">
                          {fullName(asn)}
                        </span>
                        <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                          {asn.nipBaru}
                        </span>
                      </td>
                      <td className="break-words border-b border-gray-100 px-2.5 py-3 dark:border-[#172036] md:px-3">
                        <span className="block font-semibold text-black dark:text-white">
                          {asn.golongan?.nama ?? "-"}
                        </span>
                        <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                          {mainPosition(asn)}
                        </span>
                      </td>
                      <td className="break-words border-b border-gray-100 px-2.5 py-3 dark:border-[#172036] md:px-3">
                        {asn.unitOrganisasi?.nama ?? "-"}
                      </td>
                      <td className="border-b border-gray-100 px-2 py-3 dark:border-[#172036]">
                        <Link
                          href={`/asn/${asn.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-500"
                          title="Lihat"
                        >
                          <i className="material-symbols-outlined !text-[18px]">
                            visibility
                          </i>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AsnPagination
              page={page}
              totalPages={asnList.data.meta.totalPages}
              onPageChange={setPage}
            />
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

function AsnPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(page, totalPages);
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;
  const buttonClass =
    "h-9 min-w-9 rounded-md border px-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";
  const inactiveClass =
    "border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-[#172036] dark:text-gray-300 dark:hover:bg-[#15203c]";

  return (
    <div className="mt-[20px] flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Halaman {page.toLocaleString("id-ID")} dari {totalPages.toLocaleString("id-ID")}
      </p>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          disabled={isFirstPage}
          onClick={() => onPageChange(1)}
          className={`${buttonClass} ${inactiveClass}`}
          aria-label="Halaman pertama"
          title="Halaman pertama"
        >
          &lt;&lt;
        </button>
        <button
          type="button"
          disabled={isFirstPage}
          onClick={() => onPageChange(page - 1)}
          className={`${buttonClass} ${inactiveClass}`}
          aria-label="Halaman sebelumnya"
          title="Halaman sebelumnya"
        >
          &lt;
        </button>
        {visiblePages.map((pageNumber) => (
          <button
            className={`${buttonClass} ${
              pageNumber === page
                ? "border-primary-500 bg-primary-500 text-white"
                : inactiveClass
            }`}
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          disabled={isLastPage}
          onClick={() => onPageChange(page + 1)}
          className={`${buttonClass} ${inactiveClass}`}
          aria-label="Halaman berikutnya"
          title="Halaman berikutnya"
        >
          &gt;
        </button>
        <button
          type="button"
          disabled={isLastPage}
          onClick={() => onPageChange(totalPages)}
          className={`${buttonClass} ${inactiveClass}`}
          aria-label="Halaman terakhir"
          title="Halaman terakhir"
        >
          &gt;&gt;
        </button>
      </div>
    </div>
  );
}

function UnitTreeSelect({
  units,
  value,
  onChange,
}: {
  units: UnitOrganisasi[];
  value: string;
  onChange: (value: string) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const roots = useMemo(() => buildUnitTree(units), [units]);
  const flatUnits = useMemo(() => flattenUnitTree(roots), [roots]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const selected = flatUnits.find((unit) => unit.id === value);
  const parentById = useMemo(
    () => new Map(flatUnits.map((unit) => [unit.id, unit.idAtasan])),
    [flatUnits],
  );
  const visibleUnits = useMemo(() => {
    const keyword = normalizeText(search);
    if (!keyword) {
      return flatUnits.filter((unit) => {
        let parentId = unit.idAtasan;
        while (parentId) {
          if (!expanded.has(parentId)) return false;
          parentId = parentById.get(parentId) ?? null;
        }
        return true;
      });
    }

    const matched = new Set<string>();
    const ancestors = new Set<string>();
    const descendants = new Set<string>();
    const collectDescendants = (unit: UnitTreeNode) => {
      unit.children.forEach((child) => {
        descendants.add(child.id);
        collectDescendants(child);
      });
    };

    flatUnits.forEach((unit) => {
      const haystack = normalizeText(`${unit.nama} ${unit.idSiasn ?? ""} ${unit.kode ?? ""}`);
      if (!haystack.includes(keyword)) return;
      matched.add(unit.id);
      collectDescendants(unit);
      let parentId = unit.idAtasan;
      while (parentId) {
        ancestors.add(parentId);
        parentId = parentById.get(parentId) ?? null;
      }
    });

    return flatUnits.filter((unit) => matched.has(unit.id) || ancestors.has(unit.id) || descendants.has(unit.id));
  }, [expanded, flatUnits, parentById, search]);

  useEffect(() => {
    setExpanded(new Set(roots.map((unit) => unit.id)));
  }, [roots]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectUnit = (unitId: string) => {
    onChange(unitId);
    setOpen(false);
    setSearch("");
  };

  const toggle = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="relative w-full xl:w-[420px]" ref={wrapperRef}>
      <button
        type="button"
        className="flex h-[45px] w-full items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-[14px] text-left text-black outline-0 dark:border-[#172036] dark:bg-[#0c1427] dark:text-white"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="min-w-0 truncate">{selected?.nama ?? "Semua Unit"}</span>
        <span className="material-symbols-outlined shrink-0 text-[20px] text-gray-500">
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 rounded-md border border-gray-200 bg-white shadow-lg dark:border-[#172036] dark:bg-[#0c1427]">
          <div className="border-b border-gray-100 p-3 dark:border-[#172036]">
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
                search
              </span>
              <input
                suppressHydrationWarning
                type="search"
                className="h-10 w-full rounded-md border border-gray-200 bg-white pl-10 pr-3 text-sm outline-0 focus:border-primary-500 dark:border-[#172036] dark:bg-[#0c1427]"
                placeholder="Cari unit..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-[360px] overflow-y-auto p-2">
            <button
              type="button"
              className={`mb-1 flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-primary-50 dark:hover:bg-[#15203c] ${
                value === "" ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-300" : ""
              }`}
              onClick={() => selectUnit("")}
            >
              Semua Unit
              {value === "" ? <span className="material-symbols-outlined text-[18px]">check</span> : null}
            </button>

            {visibleUnits.map((unit) => {
              const canExpand = unit.children.length > 0;
              const isExpanded = expanded.has(unit.id) || Boolean(search);
              return (
                <div
                  className={`flex items-start rounded-md text-sm hover:bg-primary-50 dark:hover:bg-[#15203c] ${
                    value === unit.id ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-300" : ""
                  }`}
                  key={unit.id}
                  style={{ paddingLeft: `${8 + Math.max(0, unit.depth - 1) * 18}px` }}
                >
                  <button
                    type="button"
                    className={`mt-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded text-gray-500 hover:bg-white dark:hover:bg-[#0c1427] ${
                      canExpand ? "" : "invisible"
                    }`}
                    onClick={() => toggle(unit.id)}
                    aria-label={isExpanded ? "Tutup subunit" : "Buka subunit"}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isExpanded ? "expand_more" : "chevron_right"}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-start justify-between gap-2 py-2 pr-3 text-left"
                    onClick={() => selectUnit(unit.id)}
                  >
                    <span className="min-w-0">
                      <span className="block break-words font-medium">{unit.nama}</span>
                      <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                        Level {unit.level ?? unit.depth}
                        {unit.children.length ? ` · ${unit.children.length} subunit` : ""}
                      </span>
                    </span>
                    {value === unit.id ? (
                      <span className="material-symbols-outlined shrink-0 text-[18px]">check</span>
                    ) : null}
                  </button>
                </div>
              );
            })}

            {visibleUnits.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-gray-500">
                Unit tidak ditemukan.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  isLoading,
  className,
  iconClass,
  icon,
}: {
  label: string;
  value?: number;
  isLoading: boolean;
  className: string;
  iconClass: string;
  icon: string;
}) {
  return (
    <div className={`rounded-md border p-4 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium opacity-80">{label}</p>
          <strong className="mt-1 block text-2xl font-semibold leading-tight">
            {isLoading ? "-" : (value ?? 0).toLocaleString("id-ID")}
          </strong>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${iconClass}`}>
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </span>
      </div>
    </div>
  );
}
