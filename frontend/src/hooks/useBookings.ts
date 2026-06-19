import { useState, useEffect, useCallback } from "react";
import { bookingsService } from "@/services/bookings.service";
import type { Booking, PaginatedResponse } from "@/types";

interface BookingFilters {
  status?: string;
  page?: number;
  page_size?: number;
}

export function useMyBookings(initialFilters: BookingFilters = {}) {
  const [data, setData] = useState<PaginatedResponse<Booking> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BookingFilters>(initialFilters);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await bookingsService.myBookings(filters);
      setData(result);
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, filters, setFilters, refetch: fetch };
}

export function useCreatorBookings(initialFilters: BookingFilters & { session?: string } = {}) {
  const [data, setData] = useState<PaginatedResponse<Booking> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await bookingsService.creatorBookings(filters);
      setData(result);
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, filters, setFilters, refetch: fetch };
}
