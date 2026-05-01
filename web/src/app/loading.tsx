export default function Loading() {
  return (
    <div className="space-y-[25px]">
      <div className="h-8 w-64 rounded-md bg-gray-200 dark:bg-[#172036] animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[25px]">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            className="h-28 rounded-xl bg-gray-200 dark:bg-[#172036] animate-pulse"
            key={index}
          />
        ))}
      </div>
      <div className="h-[320px] rounded-md bg-gray-200 dark:bg-[#172036] animate-pulse" />
    </div>
  );
}
