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
  RefJenisJabatan,
  Role,
  RoleWithPermissions,
  SiasnImportLog,
  UnitOrganisasi,
  UserAdmin,
  ValidasiData,
  MaintenanceArchiveResult,
  MaintenanceBackupResult,
  MaintenanceCleanupResult,
  RefJabatan,
  RefMaster,
  RefPendidikan,
  TemplateDokumenRef,
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

export const useRefMasterTable = <T = RefMaster>(name: string, path: string) =>
  useQuery({
    queryKey: ["admin", "ref", name],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<T[]>>(path);
      return data.data;
    },
  });

export const useRefAgama = () => useRefMasterTable("agama", "/referensi/agama");
export const useRefJenisKelamin = () => useRefMasterTable("jenis-kelamin", "/referensi/jenis-kelamin");
export const useRefStatusPerkawinan = () => useRefMasterTable("status-perkawinan", "/referensi/status-perkawinan");
export const useRefJenisPegawai = () => useRefMasterTable("jenis-pegawai", "/referensi/jenis-pegawai");
export const useRefKedudukanHukum = () => useRefMasterTable("kedudukan-hukum", "/referensi/kedudukan-hukum");
export const useRefStatusAsn = () => useRefMasterTable("status-asn", "/referensi/status-asn");
export const useRefJabatan = () => useRefMasterTable<RefJabatan>("jabatan", "/referensi/jabatan");
export const useRefPendidikanTingkat = () => useRefMasterTable("pendidikan-tingkat", "/referensi/pendidikan-tingkat");
export const useRefPendidikan = () => useRefMasterTable<RefPendidikan>("pendidikan", "/referensi/pendidikan");
export const useRefWilayah = () => useRefMasterTable("wilayah", "/referensi/wilayah");
export const useRefKpkn = () => useRefMasterTable("kpkn", "/referensi/kpkn");
export const useRefLokasiKerja = () => useRefMasterTable("lokasi-kerja", "/referensi/lokasi-kerja");
export const useRefTemplateDokumen = () => useRefMasterTable<TemplateDokumenRef>("template-dokumen", "/referensi/template-dokumen");

export const useRefJenisJabatan = () =>
  useQuery({
    queryKey: ["admin", "ref", "jenis-jabatan"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<RefJenisJabatan[]>>("/referensi/jenis-jabatan");
      return data.data;
    },
  });

export const useRefJabatanStruktural = (unitOrganisasiId?: string) =>
  useQuery({
    queryKey: ["admin", "ref", "jabatan", "struktural", unitOrganisasiId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<RefJabatan[]>>("/referensi/jabatan/struktural", {
        params: unitOrganisasiId ? { unitOrganisasiId } : undefined,
      });
      return data.data;
    },
  });

export const useRefJabatanFungsional = () =>
  useQuery({
    queryKey: ["admin", "ref", "jabatan", "fungsional"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<RefJabatan[]>>("/referensi/jabatan/fungsional");
      return data.data;
    },
  });

export const useRefJabatanPelaksana = () =>
  useQuery({
    queryKey: ["admin", "ref", "jabatan", "pelaksana"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<RefJabatan[]>>("/referensi/jabatan/pelaksana");
      return data.data;
    },
  });

export const useRefActions = () => {
  const qc = useQueryClient();
  const invalidateRef = (name: string) =>
    void qc.invalidateQueries({ queryKey: ["admin", "ref", name] });
  return {
    createMaster: useMutation({
      mutationFn: ({
        path,
        body,
      }: {
        name: string;
        path: string;
        body: Record<string, unknown>;
      }) => api.post(path, body),
      onSuccess: (_data, variables) => invalidateRef(variables.name),
    }),
    updateMaster: useMutation({
      mutationFn: ({
        path,
        id,
        body,
      }: {
        name: string;
        path: string;
        id: string;
        body: Record<string, unknown>;
      }) => api.put(`${path}/${id}`, body),
      onSuccess: (_data, variables) => invalidateRef(variables.name),
    }),
    removeMaster: useMutation({
      mutationFn: ({ path, id }: { name: string; path: string; id: string }) =>
        api.delete(`${path}/${id}`),
      onSuccess: (_data, variables) => invalidateRef(variables.name),
    }),
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
        return api.post<ApiResponse<ImportBulkResult>>(
          "/referensi/unit-organisasi/import",
          form,
          { timeout: 120_000 },
        );
      },
      onSuccess: () =>
        void qc.invalidateQueries({ queryKey: ["admin", "ref", "unit"] }),
    }),
    createJenisJabatan: useMutation({
      mutationFn: (body: Record<string, unknown>) => api.post("/referensi/jenis-jabatan", body),
      onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "ref", "jenis-jabatan"] }),
    }),
    updateJenisJabatan: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
        api.put(`/referensi/jenis-jabatan/${id}`, body),
      onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "ref", "jenis-jabatan"] }),
    }),
    createJabatanStruktural: useMutation({
      mutationFn: (body: Record<string, unknown>) => api.post("/referensi/jabatan/struktural", body),
      onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "ref", "jabatan"] }),
    }),
    updateJabatanStruktural: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
        api.put(`/referensi/jabatan/struktural/${id}`, body),
      onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "ref", "jabatan"] }),
    }),
    createJabatanFungsional: useMutation({
      mutationFn: (body: Record<string, unknown>) => api.post("/referensi/jabatan/fungsional", body),
      onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "ref", "jabatan"] }),
    }),
    updateJabatanFungsional: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
        api.put(`/referensi/jabatan/fungsional/${id}`, body),
      onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "ref", "jabatan"] }),
    }),
    createJabatanPelaksana: useMutation({
      mutationFn: (body: Record<string, unknown>) => api.post("/referensi/jabatan/pelaksana", body),
      onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "ref", "jabatan"] }),
    }),
    updateJabatanPelaksana: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
        api.put(`/referensi/jabatan/pelaksana/${id}`, body),
      onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "ref", "jabatan"] }),
    }),
    importJabatanStruktural: useMutation({
      mutationFn: (file: File) => {
        const form = new FormData();
        form.append("file", file);
        return api.post<ApiResponse<ImportBulkResult>>("/referensi/jabatan/struktural/import", form, { timeout: 120_000 });
      },
      onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "ref", "jabatan"] }),
    }),
    importJabatanFungsional: useMutation({
      mutationFn: (file: File) => {
        const form = new FormData();
        form.append("file", file);
        return api.post<ApiResponse<ImportBulkResult>>("/referensi/jabatan/fungsional/import", form, { timeout: 120_000 });
      },
      onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "ref", "jabatan"] }),
    }),
    importJabatanPelaksana: useMutation({
      mutationFn: (file: File) => {
        const form = new FormData();
        form.append("file", file);
        return api.post<ApiResponse<ImportBulkResult>>("/referensi/jabatan/pelaksana/import", form, { timeout: 120_000 });
      },
      onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "ref", "jabatan"] }),
    }),
  };
};

interface ImportBulkResult {
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
        timeout: 600_000,
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "integrasi"] });
    },
  });
};

interface DiagnosaAsnResult {
  totalBaris: number;
  kolom: Array<{ asli: string; normalized: string }>;
  contohParsed: Array<Record<string, string | null>>;
  deteksi: { nip: string; nama: string };
}

export const useDiagnosaAsn = () =>
  useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post<ApiResponse<DiagnosaAsnResult>>("/integrasi/diagnosa/asn", formData, {
        timeout: 60_000,
      });
    },
  });

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
