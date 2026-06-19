import { useState, useEffect, useCallback } from "react";
import { sessionsService } from "@/services/sessions.service";
import type { Session, PaginatedResponse, SessionFilters } from "@/types";

export function useCreatorSessions(initialFilters: SessionFilters = {}) {
  const [data, setData] = useState<PaginatedResponse<Session> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SessionFilters>(initialFilters);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await sessionsService.getMySessions(filters);
      setData(result);
    } catch {
      setError("Failed to load your sessions.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, filters, setFilters, refetch: fetch };
}
