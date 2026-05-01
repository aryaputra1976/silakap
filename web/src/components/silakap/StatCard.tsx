import Link from "next/link";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  color: "blue" | "green" | "yellow" | "red" | "purple" | "gray" | "orange";
  description?: string;
  href?: string;
  trend?: { value: number; label: string };
  highlight?: boolean;
}

const iconColorClasses: Record<StatCardProps["color"], string> = {
  blue: "bg-primary-50 text-primary-500 dark:bg-[#ffffff14]",
  green: "bg-success-100 text-success-600 dark:bg-[#ffffff14]",
  yellow: "bg-warning-100 text-warning-600 dark:bg-[#ffffff14]",
  red: "bg-danger-50 text-danger-500 dark:bg-[#ffffff14]",
  purple: "bg-purple-100 text-purple-500 dark:bg-[#ffffff14]",
  gray: "bg-gray-100 text-gray-600 dark:bg-[#ffffff14] dark:text-gray-300",
  orange: "bg-orange-100 text-orange-600 dark:bg-[#ffffff14]",
};

const borderColorClasses: Record<StatCardProps["color"], string> = {
  blue: "border-l-blue-500",
  green: "border-l-green-500",
  yellow: "border-l-amber-400",
  red: "border-l-red-500",
  purple: "border-l-purple-500",
  gray: "border-l-gray-300",
  orange: "border-l-orange-500",
};

const highlightClasses: Record<StatCardProps["color"], string> = {
  blue: "bg-blue-50",
  green: "bg-green-50",
  yellow: "bg-amber-50",
  red: "bg-red-50",
  purple: "bg-purple-50",
  gray: "bg-white",
  orange: "bg-orange-50",
};

const getTrendClass = (value: number) => {
  if (value > 0) {
    return "text-green-600";
  }

  if (value < 0) {
    return "text-red-500";
  }

  return "text-gray-400";
};

const getTrendText = (trend: { value: number; label: string }) => {
  if (trend.value > 0) {
    return `▲ +${trend.value} ${trend.label}`;
  }

  if (trend.value < 0) {
    return `▼ ${trend.value} ${trend.label}`;
  }

  return `→ ${trend.label}`;
};

export default function StatCard({
  label,
  value,
  icon,
  color,
  description,
  href,
  trend,
  highlight = false,
}: StatCardProps) {
  const cardClassName = `${
    highlight ? highlightClasses[color] : "bg-white"
  } dark:bg-[#0c1427] shadow-sm rounded-xl p-6 border border-l-4 border-gray-100 dark:border-[#172036] ${
    borderColorClasses[color]
  } ${href ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`;

  const content = (
    <div className={cardClassName}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <h3 className="!mb-0 mt-2 !text-3xl !font-bold text-black dark:text-white">
            {value}
          </h3>
          {trend ? (
            <p className={`mt-2 text-xs font-medium ${getTrendClass(trend.value)}`}>
              {getTrendText(trend)}
            </p>
          ) : null}
        </div>
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconColorClasses[color]}`}
        >
          <i className="material-symbols-outlined !text-[28px]">{icon}</i>
        </div>
      </div>
      {description ? (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
