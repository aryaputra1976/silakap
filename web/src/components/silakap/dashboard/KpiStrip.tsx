interface KpiItem {
  label: string;
  value: string | number;
  color?: "default" | "blue" | "green" | "orange" | "red";
}

interface Props {
  items: KpiItem[];
}

const valueColors: Record<NonNullable<KpiItem["color"]>, string> = {
  default: "text-gray-900 dark:text-white",
  blue: "text-blue-600 dark:text-blue-400",
  green: "text-green-600 dark:text-green-400",
  orange: "text-orange-600 dark:text-orange-400",
  red: "text-red-500 dark:text-red-400",
};

export default function KpiStrip({ items }: Props) {
  return (
    <div className="bg-white dark:bg-[#0c1427] border border-gray-100 dark:border-[#172036] rounded-xl overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100 dark:divide-[#172036]">
        {items.map((item, i) => (
          <div key={i} className="px-6 py-5">
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-tight">{item.label}</p>
            <p
              className={`mt-2 text-3xl font-bold leading-none ${valueColors[item.color ?? "default"]}`}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
