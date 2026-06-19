"use client";

import { useSessions } from "@/hooks/useSessions";
import SessionCard from "@/components/sessions/SessionCard";
import SessionFiltersPanel from "@/components/sessions/SessionFilters";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

export default function CatalogPage() {
  const { data, loading, error, filters, setFilters } = useSessions({ ordering: "-created_at" });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Sessions</h1>
        <p className="mt-1 text-gray-500">
          {data ? `${data.count} session${data.count !== 1 ? "s" : ""} available` : ""}
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar filters */}
        <div className="w-full lg:w-72 lg:shrink-0">
          <SessionFiltersPanel filters={filters} onChange={setFilters} />
        </div>

        {/* Results */}
        <div className="flex-1">
          {loading && (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 p-6 text-center text-red-600">{error}</div>
          )}

          {!loading && !error && data && (
            <>
              {data.results.length === 0 ? (
                <div className="rounded-xl bg-gray-50 py-20 text-center">
                  <div className="mb-3 text-5xl">🔍</div>
                  <p className="text-gray-500">No sessions match your filters.</p>
                  <Button
                    variant="ghost"
                    className="mt-4"
                    onClick={() => setFilters({ ordering: "-created_at" })}
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {data.results.map((s) => (
                    <SessionCard key={s.id} session={s} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {data.total_pages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!data.previous}
                    onClick={() => setFilters((f: typeof filters) => ({ ...f, page: (f.page || 1) - 1 }))}
                  >
                    ← Previous
                  </Button>
                  <span className="text-sm text-gray-500">
                    Page {data.current_page} of {data.total_pages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!data.next}
                    onClick={() => setFilters((f: typeof filters) => ({ ...f, page: (f.page || 1) + 1 }))}
                  >
                    Next →
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
