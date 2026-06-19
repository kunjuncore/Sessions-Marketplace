export default function PageLoader() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <svg
        className="h-10 w-10 animate-spin text-blue-600"
        viewBox="0 0 24 24"
        fill="none"
        aria-label="Loading page"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      <p className="text-sm text-gray-400 animate-pulse">Loading…</p>
    </div>
  );
}
