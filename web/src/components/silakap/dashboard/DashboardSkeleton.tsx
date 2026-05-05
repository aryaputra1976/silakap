function SkeletonBox({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-xl bg-gray-200 dark:bg-[#172036] animate-pulse ${className ?? ""}`}
    />
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="space-y-[25px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[25px]">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBox key={i} className="h-28" />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[25px]">
        <SkeletonBox className="xl:col-span-2 h-80" />
        <SkeletonBox className="h-80" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-[25px]">
        <SkeletonBox className="h-72" />
        <SkeletonBox className="h-72" />
      </div>

      <SkeletonBox className="h-64" />

      <SkeletonBox className="h-80" />
    </div>
  );
}
