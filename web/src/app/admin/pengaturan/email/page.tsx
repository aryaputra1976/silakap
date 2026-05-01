"use client";

import { useState } from "react";
import Toast from "@/components/silakap/Toast";
import { useEmailStatus, useTestEmail } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/useToast";

export default function PengaturanEmailPage() {
  const status = useEmailStatus();
  const testEmail = useTestEmail();
  const { toast, showToast, hideToast } = useToast();
  const [to, setTo] = useState("");

  const sendTest = () => {
    testEmail.mutate(to, {
      onSuccess: () => showToast("Email test berhasil dikirim", "success"),
      onError: () => showToast("Email test gagal. Cek konfigurasi SMTP.", "error"),
    });
  };

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">Pengaturan Email</h1>
        <p className="text-gray-500 dark:text-gray-400">Status SMTP dan pengujian pengiriman email</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[25px]">
        <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
          <h5>Status SMTP</h5>
          <span className={`inline-flex rounded-full px-3 py-1 text-sm ${status.data?.configured ? "bg-success-100 text-success-700" : "bg-warning-100 text-warning-700"}`}>
            {status.data?.configured ? "Terkonfigurasi" : "Belum lengkap"}
          </span>
          <div className="mt-5 space-y-3 text-sm">
            <Info label="Host" value={status.data?.smtpHost || "-"} />
            <Info label="Port" value={String(status.data?.smtpPort ?? "-")} />
            <Info label="From" value={status.data?.smtpFrom || "-"} />
          </div>
        </div>

        <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md lg:col-span-2">
          <h5>Test Kirim Email</h5>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="email"
              className="h-[45px] flex-1 rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]"
              placeholder="email@domain.go.id"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
            <button
              type="button"
              className="py-[10px] px-[20px] bg-primary-500 text-white rounded-md disabled:opacity-70"
              disabled={!to || testEmail.isPending}
              onClick={sendTest}
            >
              {testEmail.isPending ? "Mengirim..." : "Kirim Test"}
            </button>
          </div>
        </div>
      </div>

      {toast.visible ? <Toast message={toast.message} type={toast.type} onClose={hideToast} /> : null}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 dark:border-[#172036] pb-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-black dark:text-white truncate">{value}</span>
    </div>
  );
}
