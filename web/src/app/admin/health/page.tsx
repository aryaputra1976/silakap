"use client";

import Toast from "@/components/silakap/Toast";
import { useAdminHealth, useMaintenanceActions } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/useToast";

const formatBytes = (value = 0) => {
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const formatUptime = (seconds = 0) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}h ${hours}j ${minutes}m`;
};

export default function AdminHealthPage() {
  const health = useAdminHealth();
  const actions = useMaintenanceActions();
  const { toast, showToast, hideToast } = useToast();
  const data = health.data;

  const runArchive = () => {
    actions.arsipOlderThanOneYear.mutate(undefined, {
      onSuccess: (result) => showToast(`${result.archived} usulan lama diarsipkan`, "success"),
      onError: () => showToast("Arsip usulan lama gagal diproses", "error"),
    });
  };

  const runBackup = () => {
    actions.backupDatabase.mutate(undefined, {
      onSuccess: (result) => showToast(`Backup dibuat: ${result.filename}`, "success"),
      onError: () => showToast("Backup manual gagal dibuat", "error"),
    });
  };

  const runCleanup = (dryRun: boolean) => {
    actions.cleanupOrphanFiles.mutate(dryRun, {
      onSuccess: (result) =>
        showToast(
          dryRun
            ? `Scan menemukan ${result.orphanCount} orphan file`
            : `${result.orphanCount} orphan file dibersihkan`,
          "success",
        ),
      onError: () => showToast("Cleanup orphan file gagal diproses", "error"),
    });
  };

  return (
    <div className="space-y-[25px]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="!mb-1">Health Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Monitoring runtime, storage, ENV, backup, dan maintenance sistem</p>
        </div>
        <button
          type="button"
          className="h-[40px] rounded-md bg-primary-500 px-[18px] text-white disabled:opacity-70"
          onClick={() => health.refetch()}
          disabled={health.isFetching}
        >
          {health.isFetching ? "Memuat..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[20px]">
        <Metric label="Status" value={data?.status ?? "-"} tone={data?.status === "ok" ? "success" : "warning"} />
        <Metric label="DB Latency" value={`${data?.db.latencyMs ?? 0} ms`} tone={(data?.db.latencyMs ?? 0) < 1000 ? "success" : "warning"} />
        <Metric label="Uptime" value={formatUptime(data?.uptimeSeconds)} />
        <Metric label="Heap Used" value={formatBytes(data?.memory.heapUsed)} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[25px]">
        <section className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036] xl:col-span-2">
          <h5 className="!mb-4">System Checks</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Info label="Node" value={data?.node ?? "-"} />
            <Info label="Platform" value={data?.platform ?? "-"} />
            <Info label="Users" value={String(data?.counts.users ?? 0)} />
            <Info label="Layanan" value={String(data?.counts.layanan ?? 0)} />
            <Info label="Upload Dir" value={data?.storage.uploadDir ?? "-"} status={data?.storage.uploadDirReady} />
            <Info label="Backup Dir" value={data?.storage.backupDir ?? "-"} status={data?.storage.backupDirReady} />
            <Info label="Backup Count" value={String(data?.storage.backupCount ?? 0)} />
            <Info label="Latest Backup" value={String(data?.storage.latestBackup?.filename ?? "-")} />
          </div>
        </section>

        <section className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036]">
          <h5 className="!mb-4">Audit ENV</h5>
          <span className={`inline-flex rounded-full px-3 py-1 text-sm ${data?.envAudit.ok ? "bg-success-100 text-success-700" : "bg-danger-100 text-danger-700"}`}>
            {data?.envAudit.ok ? "Lulus audit" : "Perlu tindakan"}
          </span>
          <div className="mt-4 space-y-3 text-sm">
            {(data?.envAudit.errors ?? []).map((item) => (
              <p key={item} className="rounded-md bg-danger-50 p-3 text-danger-700">{item}</p>
            ))}
            {(data?.envAudit.warnings ?? []).map((item) => (
              <p key={item} className="rounded-md bg-warning-50 p-3 text-warning-700">{item}</p>
            ))}
            {!data?.envAudit.errors.length && !data?.envAudit.warnings.length ? (
              <p className="text-gray-500">Tidak ada catatan audit ENV.</p>
            ) : null}
          </div>
        </section>
      </div>

      <section className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036]">
        <div className="mb-5">
          <h5 className="!mb-1">Maintenance Tools</h5>
          <p className="text-sm text-gray-500 dark:text-gray-400">Aksi operasional terbatas untuk Admin Sistem</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <ActionButton label="Arsip >1 Tahun" loading={actions.arsipOlderThanOneYear.isPending} onClick={runArchive} />
          <ActionButton label="Backup Manual" loading={actions.backupDatabase.isPending} onClick={runBackup} />
          <ActionButton label="Scan Orphan File" loading={actions.cleanupOrphanFiles.isPending} onClick={() => runCleanup(true)} />
          <ActionButton label="Cleanup Orphan File" loading={actions.cleanupOrphanFiles.isPending} danger onClick={() => runCleanup(false)} />
        </div>
        {actions.cleanupOrphanFiles.data ? (
          <div className="mt-5 rounded-md border border-gray-100 dark:border-[#172036] p-4 text-sm">
            <strong>{actions.cleanupOrphanFiles.data.orphanCount} orphan file</strong>
            <span className="text-gray-500"> dari {actions.cleanupOrphanFiles.data.scanned} file dipindai.</span>
          </div>
        ) : null}
      </section>

      {toast.visible ? <Toast message={toast.message} type={toast.type} onClose={hideToast} /> : null}
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" }) {
  const color = tone === "success" ? "text-success-600" : tone === "warning" ? "text-warning-600" : "text-black dark:text-white";
  return (
    <div className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036]">
      <span className="block text-sm text-gray-500">{label}</span>
      <strong className={`mt-2 block text-2xl capitalize ${color}`}>{value}</strong>
    </div>
  );
}

function Info({ label, value, status }: { label: string; value: string; status?: boolean }) {
  return (
    <div className="rounded-md border border-gray-100 dark:border-[#172036] p-3">
      <span className="block text-gray-500">{label}</span>
      <span className="mt-1 block break-words font-medium text-black dark:text-white">{value}</span>
      {typeof status === "boolean" ? (
        <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs ${status ? "bg-success-100 text-success-700" : "bg-danger-100 text-danger-700"}`}>
          {status ? "Ready" : "Not ready"}
        </span>
      ) : null}
    </div>
  );
}

function ActionButton({ label, loading, danger, onClick }: { label: string; loading: boolean; danger?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`h-[44px] rounded-md px-[16px] text-white disabled:opacity-70 ${danger ? "bg-danger-500" : "bg-primary-500"}`}
      disabled={loading}
      onClick={onClick}
    >
      {loading ? "Memproses..." : label}
    </button>
  );
}
