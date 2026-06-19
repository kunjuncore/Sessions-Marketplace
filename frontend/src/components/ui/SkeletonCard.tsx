export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm animate-pulse">
      <div className="h-44 w-full bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded bg-gray-100" />
        <div className="h-3 w-full rounded bg-gray-100" />
        <div className="h-3 w-2/3 rounded bg-gray-100" />
        <div className="mt-4 flex justify-between">
          <div className="h-3 w-16 rounded bg-gray-100" />
          <div className="h-5 w-16 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
