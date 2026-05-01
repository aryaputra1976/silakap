import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ApiResponse,
  LaporanBulanan,
  LaporanHarian,
  PaginatedResponse,
} from "@/types/models";

export const useLaporanHarianList = (params: Record<string, unknown> = {}) =>
  useQuery({
    queryKey: ["laporan", "harian", params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<LaporanHarian>>(
        "/laporan/harian",
        { params },
      );
      return data;
    },
  });

export const useLaporanHarianDetail = (id: string) =>
  useQuery({
    queryKey: ["laporan", "harian", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<LaporanHarian>>(
        `/laporan/harian/${id}`,
      );
      return data.data;
    },
    enabled: Boolean(id),
  });

export const useLaporanBulananList = (params: Record<string, unknown> = {}) =>
  useQuery({
    queryKey: ["laporan", "bulanan", params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<LaporanBulanan>>(
        "/laporan/bulanan",
        { params },
      );
      return data;
    },
  });

export const useLaporanBulananDetail = (id: string) =>
  useQuery({
    queryKey: ["laporan", "bulanan", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<LaporanBulanan>>(
        `/laporan/bulanan/${id}`,
      );
      return data.data;
    },
    enabled: Boolean(id),
  });

export const useGenerateLaporan = () => {
  const qc = useQueryClient();
  const invalidate = () => void qc.invalidateQueries({ queryKey: ["laporan"] });

  const generateHarian = useMutation({
    mutationFn: () => api.post("/laporan/harian/generate"),
    onSuccess: invalidate,
  });
  const generateBulanan = useMutation({
    mutationFn: () => api.post("/laporan/bulanan/generate"),
    onSuccess: invalidate,
  });

  return { generateHarian, generateBulanan };
};
