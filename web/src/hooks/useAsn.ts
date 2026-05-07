import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ApiResponse,
  AsnDetail,
  AsnPeremajaan,
  AsnRiwayat,
  AsnStats,
  PaginatedResponse,
  RefGolongan,
  RefSimple,
  UnitOrganisasi,
} from "@/types/models";

const unwrapRef = <T>(payload: ApiResponse<T[]> | T[]) =>
  Array.isArray(payload) ? payload : payload.data;

export const useAsnList = (params: Record<string, unknown> = {}) =>
  useQuery({
    queryKey: ["asn", params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<AsnDetail>>("/asn", {
        params,
      });
      return data;
    },
  });

export const useAsnStats = () =>
  useQuery({
    queryKey: ["asn", "stats"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AsnStats>>("/asn/stats");
      return data.data;
    },
  });

export const useAsnDetail = (id: string) =>
  useQuery({
    queryKey: ["asn", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AsnDetail>>(`/asn/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });

export const useAsnRiwayat = (id: string) =>
  useQuery({
    queryKey: ["asn", id, "riwayat"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AsnRiwayat[]>>(
        `/asn/${id}/riwayat`,
      );
      return data.data;
    },
    enabled: Boolean(id),
  });

export const useCreateAsn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.post<ApiResponse<AsnDetail>>("/asn", body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["asn"] }),
  });
};

export const useUpdateAsn = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.put<ApiResponse<AsnDetail>>(`/asn/${id}`, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["asn"] }),
  });
};

export const useDeleteAsn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/asn/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["asn"] }),
  });
};

export const usePeremajaanList = (params: Record<string, unknown> = {}) =>
  useQuery({
    queryKey: ["asn", "peremajaan", params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<AsnPeremajaan>>(
        "/asn/peremajaan",
        { params },
      );
      return data;
    },
  });

export const useCreatePeremajaan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.post<ApiResponse<AsnPeremajaan>>("/asn/peremajaan", body),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: ["asn", "peremajaan"] }),
  });
};

export const useUploadPeremajaanDokumen = () =>
  useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post<
        ApiResponse<{
          namaFile: string;
          fileId: string;
          ukuran: number;
          mimeType: string;
          uploadedAt: string;
        }>
      >("/asn/peremajaan/dokumen", formData);
      return data.data;
    },
  });

export const downloadPeremajaanDokumen = async (fileId: string, filename: string) => {
  const response = await api.get(`/asn/peremajaan/dokumen/${encodeURIComponent(fileId)}`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const useApprovePeremajaan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { statusApproval: "Approved" | "Rejected"; catatan?: string };
    }) => api.put<ApiResponse<AsnPeremajaan>>(`/asn/peremajaan/${id}/approve`, body),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: ["asn", "peremajaan"] }),
  });
};

export const useClaimPeremajaan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<ApiResponse<AsnPeremajaan>>(`/asn/peremajaan/${id}/claim`),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: ["asn", "peremajaan"] }),
  });
};

export const useRefGolongan = () =>
  useQuery({
    queryKey: ["ref", "golongan"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<RefGolongan[]> | RefGolongan[]>(
        "/referensi/golongan",
      );
      return unwrapRef(data);
    },
    staleTime: 5 * 60 * 1000,
  });

export const useRefUnitOrganisasi = () =>
  useQuery({
    queryKey: ["ref", "unit-organisasi"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<UnitOrganisasi[]> | UnitOrganisasi[]>(
        "/referensi/unit-organisasi",
      );
      return unwrapRef(data);
    },
    staleTime: 5 * 60 * 1000,
  });

export const useRefJenisJabatan = () =>
  useQuery({
    queryKey: ["ref", "jenis-jabatan"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<RefSimple[]> | RefSimple[]>(
        "/referensi/jenis-jabatan",
      );
      return unwrapRef(data);
    },
    staleTime: 5 * 60 * 1000,
  });

export const useRefTingkatPendidikan = () =>
  useQuery({
    queryKey: ["ref", "tingkat-pendidikan"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<RefSimple[]> | RefSimple[]>(
        "/referensi/tingkat-pendidikan",
      );
      return unwrapRef(data);
    },
    staleTime: 5 * 60 * 1000,
  });
