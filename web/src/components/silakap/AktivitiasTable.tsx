export interface AktivitasItem {
  id: string;
  aksi: string;
  catatan: string | null;
  createdAt: string;
  usulanLayanan: { nomorUsulan: string } | null;
  dilakukanOleh: { namaLengkap: string } | null;
}

interface AktivitasTableProps {
  data: AktivitasItem[];
  limit?: number;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const formatRelativeTime = (dateValue: string) => {
  const diffMs = Date.now() - new Date(dateValue).getTime();
  const diffMinutes = Math.max(Math.floor(diffMs / 60000), 0);

  if (diffMinutes < 1) return "Baru saja";
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} hari lalu`;
};

export function AktivitasTable({ data, limit = 10 }: AktivitasTableProps) {
  const rows = data.slice(0, limit);

  return (
    <div className="bg-white dark:bg-[#0c1427] p-5 rounded-xl border border-gray-100 dark:border-[#172036]">
      <div className="mb-4 flex items-center justify-between">
          <h5 className="!mb-0">Aktivitas Terkini</h5>
      </div>
      <div>
        <div className="table-responsive overflow-x-auto">
          <table className="w-full">
            <thead className="text-black dark:text-white">
              <tr>
                <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c] whitespace-nowrap first:ltr:rounded-tl-md first:rtl:rounded-tr-md">
                  Pelaku
                </th>
                <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">
                  Aksi
                </th>
                <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c] whitespace-nowrap">
                  Usulan
                </th>
                <th className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] bg-primary-50 dark:bg-[#15203c] whitespace-nowrap last:ltr:rounded-tr-md last:rtl:rounded-tl-md">
                  Waktu
                </th>
              </tr>
            </thead>
            <tbody className="text-black dark:text-white">
              {rows.length > 0 ? (
                rows.map((item) => {
                  const actor = item.dilakukanOleh?.namaLengkap ?? "Sistem";

                  return (
                    <tr key={item.id}>
                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center font-semibold">
                            {getInitials(actor) || "S"}
                          </div>
                          <span className="font-medium">{actor}</span>
                        </div>
                      </td>
                      <td className="ltr:text-left rtl:text-right px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036]">
                        <span className="font-medium">{item.aksi}</span>
                        {item.catatan ? (
                          <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {item.catatan}
                          </span>
                        ) : null}
                      </td>
                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] text-gray-500 dark:text-gray-400">
                        {item.usulanLayanan?.nomorUsulan ?? "-"}
                      </td>
                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(item.createdAt)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    className="text-center px-[20px] py-[30px] text-gray-500 dark:text-gray-400"
                    colSpan={4}
                  >
                    Belum ada aktivitas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
