import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ApiResponse,
  Notifikasi,
  NotifikasiCount,
  PaginatedResponse,
} from "@/types/models";

const NOTIF_KEY = ["notifikasi"] as const;
const COUNT_KEY = [...NOTIF_KEY, "count"] as const;

const isListQuery = (queryKey: readonly unknown[]) =>
  queryKey[0] === "notifikasi" && queryKey[1] !== "count";

export const useNotifikasiList = (
  params: Record<string, unknown> = {},
  enabled = true,
) =>
  useQuery({
    queryKey: [...NOTIF_KEY, params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Notifikasi>>(
        "/notifikasi",
        { params },
      );
      return data;
    },
    refetchInterval: 30_000,
    retry: false,
    enabled,
  });

export const useNotifikasiCount = (enabled = true) =>
  useQuery({
    queryKey: COUNT_KEY,
    queryFn: async () => {
      const { data } =
        await api.get<ApiResponse<NotifikasiCount>>("/notifikasi/count");
      return data.data;
    },
    refetchInterval: 30_000,
    retry: false,
    enabled,
  });

export const useReadNotifikasi = () => {
  const qc = useQueryClient();

  const invalidate = () => void qc.invalidateQueries({ queryKey: NOTIF_KEY });

  const snapshot = () => ({
    lists: qc.getQueriesData<PaginatedResponse<Notifikasi>>({
      queryKey: NOTIF_KEY,
      predicate: (q) => isListQuery(q.queryKey),
    }),
    count: qc.getQueryData<NotifikasiCount>(COUNT_KEY),
  });

  const restore = (ctx: ReturnType<typeof snapshot>) => {
    for (const [key, data] of ctx.lists) qc.setQueryData(key, data);
    qc.setQueryData(COUNT_KEY, ctx.count);
  };

  const readOne = useMutation({
    mutationFn: (id: string) => api.put(`/notifikasi/${id}/read`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: NOTIF_KEY });
      const ctx = snapshot();

      let wasUnread = false;
      for (const [, data] of ctx.lists) {
        const found = data?.data.find((n) => n.id === id);
        if (found && !found.isRead) { wasUnread = true; break; }
      }

      qc.setQueriesData<PaginatedResponse<Notifikasi>>(
        { queryKey: NOTIF_KEY, predicate: (q) => isListQuery(q.queryKey) },
        (old) => old && {
          ...old,
          data: old.data.map((n) =>
            n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n,
          ),
        },
      );

      if (ctx.count && wasUnread) {
        qc.setQueryData<NotifikasiCount>(COUNT_KEY, {
          ...ctx.count,
          belumDibaca: Math.max(0, ctx.count.belumDibaca - 1),
        });
      }

      return ctx;
    },
    onError: (_e, _id, ctx) => ctx && restore(ctx),
    onSettled: invalidate,
  });

  const readAll = useMutation({
    mutationFn: () => api.put("/notifikasi/read-all"),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: NOTIF_KEY });
      const ctx = snapshot();

      qc.setQueriesData<PaginatedResponse<Notifikasi>>(
        { queryKey: NOTIF_KEY, predicate: (q) => isListQuery(q.queryKey) },
        (old) => old && {
          ...old,
          data: old.data.map((n) => ({
            ...n,
            isRead: true,
            readAt: new Date().toISOString(),
          })),
        },
      );

      if (ctx.count) {
        qc.setQueryData<NotifikasiCount>(COUNT_KEY, {
          ...ctx.count,
          belumDibaca: 0,
        });
      }

      return ctx;
    },
    onError: (_e, _v, ctx) => ctx && restore(ctx),
    onSettled: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/notifikasi/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: NOTIF_KEY });
      const ctx = snapshot();

      let wasUnread = false;
      for (const [, data] of ctx.lists) {
        const found = data?.data.find((n) => n.id === id);
        if (found && !found.isRead) { wasUnread = true; break; }
      }

      qc.setQueriesData<PaginatedResponse<Notifikasi>>(
        { queryKey: NOTIF_KEY, predicate: (q) => isListQuery(q.queryKey) },
        (old) => old && {
          ...old,
          data: old.data.filter((n) => n.id !== id),
          meta: { ...old.meta, total: Math.max(0, old.meta.total - 1) },
        },
      );

      if (ctx.count) {
        qc.setQueryData<NotifikasiCount>(COUNT_KEY, {
          total: Math.max(0, ctx.count.total - 1),
          belumDibaca: wasUnread
            ? Math.max(0, ctx.count.belumDibaca - 1)
            : ctx.count.belumDibaca,
        });
      }

      return ctx;
    },
    onError: (_e, _id, ctx) => ctx && restore(ctx),
    onSettled: invalidate,
  });

  return { readOne, readAll, remove };
};
