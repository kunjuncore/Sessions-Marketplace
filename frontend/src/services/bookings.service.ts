import api from "@/lib/axios";
import type { Booking, PaginatedResponse } from "@/types";

export const bookingsService = {
  async book(sessionId: string): Promise<Booking> {
    const { data } = await api.post<Booking>("/bookings/", { session: sessionId });
    return data;
  },

  async myBookings(params: { status?: string; page?: number } = {}): Promise<PaginatedResponse<Booking>> {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) qs.set(k, String(v));
    });
    const { data } = await api.get<PaginatedResponse<Booking>>(`/bookings/my/?${qs.toString()}`);
    return data;
  },

  async cancel(id: string): Promise<Booking> {
    const { data } = await api.patch<Booking>(`/bookings/${id}/cancel/`);
    return data;
  },

  async creatorBookings(params: { status?: string; session?: string; page?: number } = {}): Promise<PaginatedResponse<Booking>> {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) qs.set(k, String(v));
    });
    const { data } = await api.get<PaginatedResponse<Booking>>(`/bookings/creator/?${qs.toString()}`);
    return data;
  },

  async updateStatus(id: string, status: "CONFIRMED" | "CANCELLED"): Promise<Booking> {
    const { data } = await api.patch<Booking>(`/bookings/${id}/status/`, { status });
    return data;
  },
};
