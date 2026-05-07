interface Item {
  nama: string;
  persen: number;
}

interface Props {
  items: Item[];
}

function barColor(persen: number) {
  if (persen >= 85) return "bg-green-500";
  if (persen >= 70) return "bg-yellow-400";
  return "bg-red-400";
}

function textColor(persen: number) {
  if (persen >= 85) return "text-green-600";
  if (persen >= 70) return "text-yellow-600";
  return "text-red-500";
}

export default function KepatuhanOperatorList({ items }: Props) {
  if (!items.length) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
        Belum ada data operator
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.nama}>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[60%]">
              {item.nama}
            </span>
            <span className={`text-sm font-semibold ${textColor(item.persen)}`}>
              {item.persen}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-[#172036] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${barColor(item.persen)}`}
              style={{ width: `${item.persen}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
