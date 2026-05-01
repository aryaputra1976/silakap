import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ApiResponse,
  PaginatedResponse,
  PerencanaanPensiun,
} from "@/types/models";

export const usePerencanaanList = (params: Record<string, unknown> = {}) =>
  useQuery({
    queryKey: ["perencanaan", params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<PerencanaanPensiun>>(
        "/perencanaan",
        { params },
      );
      return data;
    },
  });

export const usePerencanaanDetail = (id: string) =>
  useQuery({
    queryKey: ["perencanaan", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PerencanaanPensiun>>(
        `/perencanaan/${id}`,
      );
      return data.data;
    },
    enabled: Boolean(id),
  });

export const usePerencanaanActions = () => {
  const qc = useQueryClient();
  const invalidate = () =>
    void qc.invalidateQueries({ queryKey: ["perencanaan"] });

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post("/perencanaan", body),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.put(`/perencanaan/${id}`, body),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/perencanaan/${id}`),
    onSuccess: invalidate,
  });
  const tandaiSelesai = useMutation({
    mutationFn: (id: string) => api.post(`/perencanaan/${id}/selesai`),
    onSuccess: invalidate,
  });

  return { create, update, remove, tandaiSelesai };
};
