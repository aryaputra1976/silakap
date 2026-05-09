"use client";

import { FormEvent, useState } from "react";
import { useConfigNotifikasi, useConfigNotifikasiActions } from "@/hooks/useAdmin";
import { displayRoleLabel } from "@/lib/display-labels";

const roles = ["Pengelola_OPD", "Analis_Pertama", "Analis_Muda", "Analis_Madya", "Kabid", "Kepala_Badan", "Admin_Sistem"];
const channels = ["InApp", "Email", "WhatsApp", "SMS"];

export default function PengaturanNotifikasiPage() {
  const config = useConfigNotifikasi();
  const actions = useConfigNotifikasiActions();
  const [form, setForm] = useState({ eventType: "workflow", channel: "InApp", penerimaRole: "Analis_Pertama", templateMessage: "", isActive: true });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    actions.create.mutate(form, { onSuccess: () => setForm((current) => ({ ...current, templateMessage: "" })) });
  };

  return (
    <div className="space-y-[25px]">
      <div>
        <h1 className="!mb-1">Pengaturan Notifikasi</h1>
        <p className="text-gray-500 dark:text-gray-400">Atur event, channel, penerima, dan template notifikasi</p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[25px]">
        <form className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036] space-y-3" onSubmit={submit}>
          <h5>Tambah Config</h5>
          <input className="h-[45px] w-full rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={form.eventType} onChange={(event) => setForm((current) => ({ ...current, eventType: event.target.value }))} />
          <select className="h-[45px] w-full rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={form.channel} onChange={(event) => setForm((current) => ({ ...current, channel: event.target.value }))}>
            {channels.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className="h-[45px] w-full rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px]" value={form.penerimaRole} onChange={(event) => setForm((current) => ({ ...current, penerimaRole: event.target.value }))}>
            {roles.map((item) => <option key={item} value={item}>{displayRoleLabel(item)}</option>)}
          </select>
          <textarea className="min-h-[100px] w-full rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[14px] py-[10px]" placeholder="Template pesan" value={form.templateMessage} onChange={(event) => setForm((current) => ({ ...current, templateMessage: event.target.value }))} />
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} /> Aktif</label>
          <button type="submit" className="w-full py-[10px] px-[20px] bg-primary-500 text-white rounded-md">Simpan</button>
        </form>
        <div className="xl:col-span-2 bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036]">
          <h5>Daftar Config</h5>
          <div className="table-responsive overflow-x-auto">
            <table className="w-full">
              <thead><tr>{["Event", "Channel", "Role", "Status", "Aksi"].map((heading) => <th className="font-medium text-left px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c]" key={heading}>{heading}</th>)}</tr></thead>
              <tbody>
                {(config.data ?? []).map((item) => (
                  <tr key={item.id}>
                    <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.eventType ?? "-"}</td>
                    <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.channel ?? "-"}</td>
                    <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{displayRoleLabel(item.penerimaRole)}</td>
                    <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">{item.isActive ? "Aktif" : "Nonaktif"}</td>
                    <td className="px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
                      <button type="button" className="text-primary-500" onClick={() => actions.update.mutate({ id: item.id, body: { isActive: !item.isActive } })}>
                        {item.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
