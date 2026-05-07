interface Item {
  nama: string;
  total: number;
}

interface Props {
  items: Item[];
}

const DANGER_KEYWORDS = ["nama", "rekening", "perkawinan"];

function isDanger(nama: string) {
  return DANGER_KEYWORDS.some((k) => nama.toLowerCase().includes(k));
}

export default function VolumePerLayananChart({ items }: Props) {
  const max = Math.max(...items.map((i) => i.total), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const pct = Math.round((item.total / max) * 100);
        const danger = isDanger(item.nama);
        return (
          <div key={item.nama} className="flex items-center gap-3">
            <span className="w-40 shrink-0 text-sm text-gray-700 dark:text-gray-300 truncate">
              {item.nama}
            </span>
            <div className="flex-1 h-2.5 bg-gray-100 dark:bg-[#172036] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  danger ? "bg-red-400" : "bg-blue-500"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-sm font-semibold text-gray-800 dark:text-gray-200">
              {item.total}
            </span>
          </div>
        );
      })}
    </div>
  );
}
