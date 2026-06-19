import { useState, useEffect, useCallback } from "react";
import { sessionsService } from "@/services/sessions.service";
import type { Session, PaginatedResponse, SessionFilters } from "@/types";

export function useSessions(initialFilters: SessionFilters = {}) {
  const [data, setData] = useState<PaginatedResponse<Session> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SessionFilters>(initialFilters);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await sessionsService.list(filters);
      setData(result);
    } catch {
      setError("Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, filters, setFilters, refetch: fetch };
}

export function useSession(id: string) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    sessionsService
      .get(id)
      .then(setSession)
      .catch(() => setError("Session not found."))
      .finally(() => setLoading(false));
  }, [id]);

  return { session, loading, error };
}
