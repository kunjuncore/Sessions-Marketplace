"use client";

import { useSessions } from "@/hooks/useSessions";
import SessionCard from "@/components/sessions/SessionCard";
import SessionFiltersPanel from "@/components/sessions/SessionFilters";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export default function CatalogPage() {
  const { data, loading, error, filters, setFilters } = useSessions({ ordering: "-created_at" });

  return (
    <ErrorBoundary>
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Browse Sessions</h1>
        <p className="mt-1 text-sm text-gray-500">
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
          {loading && <SkeletonGrid count={6} />}

          {error && (
            <EmptyState title="Failed to load sessions" description={error} action={<Button onClick={() => window.location.reload()}>Retry</Button>} />
          )}

          {!loading && !error && data && (
            <>
              {data.results.length === 0 ? (
                <EmptyState
                  title="No sessions match your filters"
                  action={<Button variant="ghost" onClick={() => setFilters({ ordering: "-created_at" })}>Clear filters</Button>}
                />
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
    </ErrorBoundary>
  );
}
