import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, AuditLog, PaginatedResponse } from "@/types/models";

export const useAuditList = (params: Record<string, unknown> = {}) =>
  useQuery({
    queryKey: ["audit", params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<AuditLog>>("/audit", {
        params,
      });
      return data;
    },
  });

export const useAuditDetail = (id: string) =>
  useQuery({
    queryKey: ["audit", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AuditLog>>(`/audit/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });

export const downloadAuditExport = async (
  params: Record<string, unknown> = {},
) => {
  const response = await api.get("/audit/export", {
    params,
    responseType: "blob",
  });
  const url = URL.createObjectURL(response.data as Blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};
