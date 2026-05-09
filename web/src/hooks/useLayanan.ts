import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ApiResponse,
  Asn,
  PaginatedResponse,
  RefJenisLayanan,
  UsulanDetail,
  UsulanLayanan,
} from "@/types/models";

export interface CreateLayananPayload {
  jenisLayananId: string;
  asnId: string;
  tanggalUsulan: string;
}

export const useLayananList = (params: Record<string, unknown> = {}) =>
  useQuery({
    queryKey: ["layanan", params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<UsulanLayanan>>(
        "/layanan",
        { params },
      );
      return data;
    },
  });

export const useLayananDetail = (id: string) =>
  useQuery({
    queryKey: ["layanan", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<UsulanDetail>>(
        `/layanan/${id}`,
      );
      return data.data;
    },
    enabled: Boolean(id),
  });

export const useLayananAction = (id: string) => {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["layanan"] });
  };
  const submit = useMutation({
    mutationFn: (body?: Record<string, unknown>) =>
      api.post(`/layanan/${id}/submit`, body),
    onSuccess: invalidate,
  });
  const terima = useMutation({
    mutationFn: (body?: Record<string, unknown>) =>
      api.post(`/layanan/${id}/terima`, body),
    onSuccess: invalidate,
  });
  const teruskan = useMutation({
    mutationFn: (body?: Record<string, unknown>) =>
      api.post(`/layanan/${id}/teruskan`, body),
    onSuccess: invalidate,
  });
  const kembalikan = useMutation({
    mutationFn: (body?: Record<string, unknown>) =>
      api.post(`/layanan/${id}/kembalikan`, body),
    onSuccess: invalidate,
  });
  const setujui = useMutation({
    mutationFn: (body?: Record<string, unknown>) =>
      api.post(`/layanan/${id}/setujui`, body),
    onSuccess: invalidate,
  });
  const batal = useMutation({
    mutationFn: (body?: Record<string, unknown>) =>
      api.post(`/layanan/${id}/batal`, body),
    onSuccess: invalidate,
  });
  const resubmit = useMutation({
    mutationFn: (body?: Record<string, unknown>) =>
      api.post(`/layanan/${id}/resubmit`, body),
    onSuccess: invalidate,
  });

  return {
    submit,
    terima,
    teruskan,
    kembalikan,
    setujui,
    batal,
    resubmit,
  };
};

export const useCreateLayanan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateLayananPayload) =>
      api.post<ApiResponse<UsulanLayanan>>("/layanan", body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["layanan"] }),
  });
};

export const useJenisLayanan = () =>
  useQuery({
    queryKey: ["referensi", "jenis-layanan"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<RefJenisLayanan[]> | RefJenisLayanan[]>(
        "/referensi/jenis-layanan",
      );
      return Array.isArray(data) ? data : data.data;
    },
  });

export const useAsnSearch = (search: string) =>
  useQuery({
    queryKey: ["asn", search],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Asn>>("/asn", {
        params: { search },
      });
      return data;
    },
    enabled: search.trim().length >= 2,
  });

export const useUploadDokumen = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { file: File; jenisDokumen?: string }) => {
      const formData = new FormData();
      formData.append("file", body.file);
      if (body.jenisDokumen) {
        formData.append("jenisDokumen", body.jenisDokumen);
      }
      return api.post(`/layanan/${id}/dokumen`, formData);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["layanan", id] }),
  });
};

export const downloadDokumenOutput = async (id: string) => {
  const response = await api.get(`/layanan/${id}/dokumen-output`, {
    responseType: "blob",
  });
  const disposition = response.headers["content-disposition"] as string | undefined;
  const match = disposition?.match(/filename="?([^"]+)"?/i);
  const filename = match?.[1] ?? `dokumen-output-${id}.txt`;
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
