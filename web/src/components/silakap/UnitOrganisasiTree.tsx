"use client";

import { useEffect, useMemo, useState } from "react";
import type { UnitOrganisasi } from "@/types/models";

type UnitTreeNode = UnitOrganisasi & {
  children: UnitTreeNode[];
  depth: number;
  parentName: string | null;
};

interface UnitOrganisasiTreeProps {
  units: UnitOrganisasi[];
  loading?: boolean;
  onEdit?: (unit: UnitOrganisasi) => void;
  maxHeightClass?: string;
}

const normalize = (value: string) => value.toLowerCase().trim();

const buildTree = (units: UnitOrganisasi[]): UnitTreeNode[] => {
  const byId = new Map<string, UnitTreeNode>();
  const roots: UnitTreeNode[] = [];

  units.forEach((unit) => {
    byId.set(unit.id, { ...unit, children: [], depth: 1, parentName: null });
  });

  units.forEach((unit) => {
    const node = byId.get(unit.id);
    if (!node) return;
    const parent = unit.idAtasan ? byId.get(unit.idAtasan) : undefined;
    if (parent) {
      node.depth = parent.depth + 1;
      node.parentName = parent.nama;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

const flattenTree = (nodes: UnitTreeNode[]): UnitTreeNode[] =>
  nodes.flatMap((node) => [node, ...flattenTree(node.children)]);

export default function UnitOrganisasiTree({
  units,
  loading,
  onEdit,
  maxHeightClass = "max-h-[680px]",
}: UnitOrganisasiTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState("");

  const roots = useMemo(() => buildTree(units), [units]);
  const flat = useMemo(() => flattenTree(roots), [roots]);
  const childrenCount = useMemo(
    () => new Map(flat.map((unit) => [unit.id, unit.children.length])),
    [flat],
  );

  useEffect(() => {
    const defaultExpanded = new Set<string>();
    flat.forEach((unit) => {
      if (unit.children.length > 0 && unit.depth <= 2) {
        defaultExpanded.add(unit.id);
      }
    });
    setExpanded(defaultExpanded);
  }, [flat]);

  const visibleRows = useMemo(() => {
    const search = normalize(query);
    if (!search) {
      return flat.filter((unit) => {
        let parentId = unit.idAtasan;
        while (parentId) {
          if (!expanded.has(parentId)) return false;
          parentId = flat.find((candidate) => candidate.id === parentId)?.idAtasan ?? null;
        }
        return true;
      });
    }

    const matched = new Set<string>();
    const ancestors = new Set<string>();
    flat.forEach((unit) => {
      const haystack = normalize(`${unit.nama} ${unit.id} ${unit.parentName ?? ""}`);
      if (!haystack.includes(search)) return;
      matched.add(unit.id);
      let parentId = unit.idAtasan;
      while (parentId) {
        ancestors.add(parentId);
        parentId = flat.find((candidate) => candidate.id === parentId)?.idAtasan ?? null;
      }
    });

    return flat.filter((unit) => matched.has(unit.id) || ancestors.has(unit.id));
  }, [expanded, flat, query]);

  const toggle = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpanded(new Set(flat.filter((unit) => unit.children.length > 0).map((unit) => unit.id)));
  const collapseAll = () => setExpanded(new Set(roots.map((unit) => unit.id)));

  const copyId = async (id: string) => {
    await navigator.clipboard?.writeText(id);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(""), 1200);
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-gray-200 dark:bg-[#172036] rounded-md" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-[420px]">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-gray-400">
            search
          </span>
          <input
            type="search"
            className="h-[44px] w-full rounded-md border border-gray-200 bg-white pl-10 pr-3 dark:border-[#172036] dark:bg-[#0c1427]"
            placeholder="Cari nama unit, ID, atau atasan"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="h-[40px] rounded-md border border-gray-200 px-4 text-sm dark:border-[#172036]" onClick={expandAll}>
            Buka Semua
          </button>
          <button type="button" className="h-[40px] rounded-md border border-gray-200 px-4 text-sm dark:border-[#172036]" onClick={collapseAll}>
            Ringkas
          </button>
        </div>
      </div>

      <div className={`overflow-auto rounded-md border border-gray-100 dark:border-[#172036] ${maxHeightClass}`}>
        <table className="w-full min-w-[920px]">
          <thead className="sticky top-0 z-10">
            <tr>
              {["Struktur Unit", "Level", "Status", "Subunit", "Aksi"].map((heading) => (
                <th className="bg-primary-50 px-[20px] py-[12px] text-left font-medium dark:bg-[#15203c]" key={heading}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((unit) => {
              const count = childrenCount.get(unit.id) ?? 0;
              const canExpand = count > 0;
              const isExpanded = expanded.has(unit.id) || Boolean(query);
              return (
                <tr className="border-b border-gray-100 last:border-b-0 dark:border-[#172036]" key={unit.id}>
                  <td className="px-[20px] py-[14px]">
                    <div className="flex items-start gap-2" style={{ paddingLeft: `${Math.max(0, unit.depth - 1) * 22}px` }}>
                      <button
                        type="button"
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-gray-200 text-gray-500 dark:border-[#172036] ${canExpand ? "" : "invisible"}`}
                        onClick={() => toggle(unit.id)}
                        aria-label={isExpanded ? "Tutup subunit" : "Buka subunit"}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isExpanded ? "expand_more" : "chevron_right"}
                        </span>
                      </button>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-black dark:text-white">{unit.nama}</span>
                          {unit.children.length === 0 ? <Badge tone="gray">Unit terkecil</Badge> : null}
                          {unit.isOpd ? <Badge tone="green">OPD</Badge> : null}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span className="font-mono">{unit.id}</span>
                          {unit.parentName ? <span>Atasan: {unit.parentName}</span> : null}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-[20px] py-[14px]">{unit.level ?? unit.depth}</td>
                  <td className="px-[20px] py-[14px]">{unit.isOpd ? <Badge tone="green">OPD</Badge> : <Badge tone="gray">Internal</Badge>}</td>
                  <td className="px-[20px] py-[14px]">{count}</td>
                  <td className="px-[20px] py-[14px]">
                    <div className="flex flex-wrap items-center gap-2">
                      {onEdit ? (
                        <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-md text-primary-500 hover:bg-primary-50" onClick={() => onEdit(unit)} title="Edit unit">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                      ) : null}
                      <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-50 dark:hover:bg-[#172036]" onClick={() => void copyId(unit.id)} title="Salin ID SIASN">
                        <span className="material-symbols-outlined text-[20px]">{copiedId === unit.id ? "done" : "content_copy"}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visibleRows.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">Tidak ada unit yang cocok.</div>
        ) : null}
      </div>
    </div>
  );
}

function Badge({ children, tone }: { children: string; tone: "green" | "gray" }) {
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-xs ${tone === "green" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-gray-100 text-gray-600 dark:bg-[#172036] dark:text-gray-300"}`}>
      {children}
    </span>
  );
}
