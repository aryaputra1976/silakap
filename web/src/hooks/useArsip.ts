import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, ArsipUsulan, PaginatedResponse } from "@/types/models";

export const useArsipList = (params: Record<string, unknown> = {}) =>
  useQuery({
    queryKey: ["arsip", params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<ArsipUsulan>>("/arsip", {
        params,
      });
      return data;
    },
  });

export const useArsipDetail = (id: string) =>
  useQuery({
    queryKey: ["arsip", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ArsipUsulan>>(`/arsip/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });

export const useArsipkan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { usulanLayananId: string; alasanArsip?: string }) =>
      api.post("/arsip", body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["arsip"] }),
  });
};
