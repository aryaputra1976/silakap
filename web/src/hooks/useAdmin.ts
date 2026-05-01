import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ApiResponse,
  AdminHealthDashboard,
  ConfigSla,
  ConfigLaporanOtomatis,
  ConfigNotifikasi,
  EmailStatus,
  JenisLayananFull,
  PaginatedResponse,
  RefGolonganFull,
  Role,
  RoleWithPermissions,
  SiasnImportLog,
  UnitOrganisasi,
  UserAdmin,
  ValidasiData,
  MaintenanceArchiveResult,
  MaintenanceBackupResult,
  MaintenanceCleanupResult,
} from "@/types/models";

export const useUserList = (params: Record<string, unknown> = {}) =>
  useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<UserAdmin>>("/users", {
        params,
      });
      return data;
    },
  });

export const useUserDetail = (id: string) =>
  useQuery({
    queryKey: ["admin", "users", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<UserAdmin>>(`/users/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });

export const useUserActions = () => {
  const qc = useQueryClient();
  const invalidate = () =>
    void qc.invalidateQueries({ queryKey: ["admin", "users"] });
  return {
    create: useMutation({
      mutationFn: (body: Record<string, unknown>) => api.post("/users", body),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
        api.put(`/users/${id}`, body),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => api.delete(`/users/${id}`),
      onSuccess: invalidate,
    }),
    resetPassword: useMutation({
      mutationFn: (id: string) =>
        api.post<ApiResponse<{ newPassword: string }>>(
          `/users/${id}/reset-password`,
        ),
    }),
    unlock: useMutation({
      mutationFn: (id: string) => api.post(`/users/${id}/unlock`),
      onSuccess: invalidate,
    }),
  };
};

export const useRoleList = () =>
  useQuery({
    queryKey: ["admin", "roles"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Role[]>>("/roles");
      return data.data;
    },
  });

export const useRolePermissions = (id: string) =>
  useQuery({
    queryKey: ["admin", "roles", id, "permissions"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<RoleWithPermissions>>(
        `/roles/${id}/permissions`,
      );
      return data.data;
    },
    enabled: Boolean(id),
  });

export const useRoleActions = () => {
  const qc = useQueryClient();
  const invalidate = () =>
    void qc.invalidateQueries({ queryKey: ["admin", "roles"] });
  return {
    create: useMutation({
      mutationFn: (body: { nama: string; deskripsi?: string }) =>
        api.post("/roles", body),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
        api.put(`/roles/${id}`, body),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => api.delete(`/roles/${id}`),
      onSuccess: invalidate,
    }),
    setPermissions: useMutation({
      mutationFn: ({
        id,
        permissionIds,
      }: {
        id: string;
        permissionIds: number[];
      }) => api.put(`/roles/${id}/permissions`, { permissionIds }),
      onSuccess: invalidate,
    }),
  };
};

export const useRefGolonganAdmin = () =>
  useQuery({
    queryKey: ["admin", "ref", "golongan"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<RefGolonganFull[]>>(
        "/referensi/golongan",
      );
      return data.data;
    },
  });

export const useRefUnitAdmin = () =>
  useQuery({
    queryKey: ["admin", "ref", "unit"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<UnitOrganisasi[]>>(
        "/referensi/unit-organisasi",
      );
      return data.data;
    },
  });

export const useRefJenisLayananAdmin = () =>
  useQuery({
    queryKey: ["admin", "ref", "jenis-layanan"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<JenisLayananFull[]>>(
        "/referensi/jenis-layanan",
      );
      return data.data;
    },
  });

export const useRefActions = () => {
  const qc = useQueryClient();
  return {
    createGolongan: useMutation({
      mutationFn: (body: Record<string, unknown>) =>
        api.post("/referensi/golongan", body),
      onSuccess: () =>
        void qc.invalidateQueries({ queryKey: ["admin", "ref", "golongan"] }),
    }),
    updateGolongan: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
        api.put(`/referensi/golongan/${id}`, body),
      onSuccess: () =>
        void qc.invalidateQueries({ queryKey: ["admin", "ref", "golongan"] }),
    }),
    createUnit: useMutation({
      mutationFn: (body: Record<string, unknown>) =>
        api.post("/referensi/unit-organisasi", body),
      onSuccess: () =>
        void qc.invalidateQueries({ queryKey: ["admin", "ref", "unit"] }),
    }),
    updateUnit: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
        api.put(`/referensi/unit-organisasi/${id}`, body),
      onSuccess: () =>
        void qc.invalidateQueries({ queryKey: ["admin", "ref", "unit"] }),
    }),
    createJenisLayanan: useMutation({
      mutationFn: (body: Record<string, unknown>) =>
        api.post("/referensi/jenis-layanan", body),
      onSuccess: () =>
        void qc.invalidateQueries({
          queryKey: ["admin", "ref", "jenis-layanan"],
        }),
    }),
    updateJenisLayanan: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
        api.put(`/referensi/jenis-layanan/${id}`, body),
      onSuccess: () =>
        void qc.invalidateQueries({
          queryKey: ["admin", "ref", "jenis-layanan"],
        }),
    }),
    replacePersyaratan: useMutation({
      mutationFn: ({
        id,
        persyaratan,
      }: {
        id: string;
        persyaratan: {
          namaPersyaratan: string;
          isRequired?: boolean;
          urutan?: number;
        }[];
      }) =>
        api.put(`/referensi/jenis-layanan/${id}/persyaratan`, { persyaratan }),
      onSuccess: () =>
        void qc.invalidateQueries({
          queryKey: ["admin", "ref", "jenis-layanan"],
        }),
    }),
    importUnitOrganisasi: useMutation({
      mutationFn: (file: File) => {
        const form = new FormData();
        form.append("file", file);
        return api.post<ApiResponse<ImportUnitResult>>(
          "/referensi/unit-organisasi/import",
          form,
          { timeout: 120_000 },
        );
      },
      onSuccess: () =>
        void qc.invalidateQueries({ queryKey: ["admin", "ref", "unit"] }),
    }),
  };
};

interface ImportUnitResult {
  total: number;
  berhasil: number;
  diperbarui: number;
  errors: Array<{ baris: number; pesan: string }>;
}

export const useConfigSla = () =>
  useQuery({
    queryKey: ["admin", "config-sla"],
    queryFn: async () => {
      const { data } =
        await api.get<ApiResponse<ConfigSla[]>>("/pengaturan/sla");
      return data.data;
    },
  });

export const useConfigSlaActions = () => {
  const qc = useQueryClient();
  const invalidate = () =>
    void qc.invalidateQueries({ queryKey: ["admin", "config-sla"] });
  return {
    upsert: useMutation({
      mutationFn: (body: Record<string, unknown>) =>
        api.put("/pengaturan/sla", body),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => api.delete(`/pengaturan/sla/${id}`),
      onSuccess: invalidate,
    }),
  };
};

export const useEmailStatus = () =>
  useQuery({
    queryKey: ["admin", "email", "status"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<EmailStatus>>(
        "/pengaturan/email/status",
      );
      return data.data;
    },
  });

export const useTestEmail = () =>
  useMutation({
    mutationFn: (to: string) =>
      api.post<ApiResponse<{ to: string; sentAt: string }>>(
        "/pengaturan/email/test",
        { to },
      ),
  });

export const useAdminHealth = () =>
  useQuery({
    queryKey: ["admin", "health"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AdminHealthDashboard>>(
        "/pengaturan/health",
      );
      return data.data;
    },
    refetchInterval: 60_000,
  });

export const useMaintenanceActions = () => {
  const qc = useQueryClient();
  const invalidateHealth = () =>
    void qc.invalidateQueries({ queryKey: ["admin", "health"] });
  return {
    arsipOlderThanOneYear: useMutation({
      mutationFn: async () => {
        const { data } = await api.post<ApiResponse<MaintenanceArchiveResult>>(
          "/pengaturan/maintenance/arsip-older-than-1y",
        );
        return data.data;
      },
      onSuccess: invalidateHealth,
    }),
    backupDatabase: useMutation({
      mutationFn: async () => {
        const { data } = await api.post<ApiResponse<MaintenanceBackupResult>>(
          "/pengaturan/maintenance/db-backup",
        );
        return data.data;
      },
      onSuccess: invalidateHealth,
    }),
    cleanupOrphanFiles: useMutation<MaintenanceCleanupResult, Error, boolean | undefined>({
      mutationFn: async (dryRun = true) => {
        const { data } = await api.post<ApiResponse<MaintenanceCleanupResult>>(
          "/pengaturan/maintenance/cleanup-orphan-files",
          { dryRun },
        );
        return data.data;
      },
      onSuccess: invalidateHealth,
    }),
  };
};

export const useConfigNotifikasi = () =>
  useQuery({
    queryKey: ["admin", "config-notifikasi"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ConfigNotifikasi[]>>(
        "/pengaturan/notifikasi",
      );
      return data.data;
    },
  });

export const useConfigNotifikasiActions = () => {
  const qc = useQueryClient();
  const invalidate = () =>
    void qc.invalidateQueries({ queryKey: ["admin", "config-notifikasi"] });
  return {
    create: useMutation({
      mutationFn: (body: Record<string, unknown>) =>
        api.post("/pengaturan/notifikasi", body),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
        api.put(`/pengaturan/notifikasi/${id}`, body),
      onSuccess: invalidate,
    }),
  };
};

export const useConfigLaporanOtomatis = () =>
  useQuery({
    queryKey: ["admin", "laporan-otomatis"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ConfigLaporanOtomatis[]>>(
        "/pengaturan/laporan-otomatis",
      );
      return data.data;
    },
  });

export const useConfigLaporanOtomatisActions = () => {
  const qc = useQueryClient();
  return {
    upsert: useMutation({
      mutationFn: (body: Record<string, unknown>) =>
        api.put("/pengaturan/laporan-otomatis", body),
      onSuccess: () =>
        void qc.invalidateQueries({ queryKey: ["admin", "laporan-otomatis"] }),
    }),
  };
};

export const useIntegrasiStatus = () =>
  useQuery({
    queryKey: ["admin", "integrasi", "status"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<SiasnImportLog[]>>(
        "/integrasi/status",
      );
      return data.data;
    },
  });

export const useIntegrasiLog = (params: Record<string, unknown> = {}) =>
  useQuery({
    queryKey: ["admin", "integrasi", "log", params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<SiasnImportLog>>(
        "/integrasi/log",
        { params },
      );
      return data;
    },
  });

export const useValidasiData = () =>
  useQuery({
    queryKey: ["admin", "integrasi", "validasi"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ValidasiData>>(
        "/integrasi/validasi",
      );
      return data.data;
    },
  });

export const useRunValidasi = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<ApiResponse<ValidasiData>>("/integrasi/validasi/run"),
    onSuccess: () =>
      void qc.invalidateQueries({
        queryKey: ["admin", "integrasi", "validasi"],
      }),
  });
};

export const useImportAsn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post<ApiResponse<SiasnImportLog>>("/integrasi/import/asn", formData, {
        timeout: 120_000,
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "integrasi"] });
    },
  });
};

export const downloadImportErrors = async (id: string) => {
  const response = await api.get(`/integrasi/log/${id}/errors`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = `import-errors-${id}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
