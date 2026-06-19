import api from "@/lib/axios";
import type { Session, PaginatedResponse, SessionFilters } from "@/types";

export const sessionsService = {
  async list(filters: SessionFilters = {}): Promise<PaginatedResponse<Session>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== "") params.set(k, String(v));
    });
    const { data } = await api.get<PaginatedResponse<Session>>(
      `/sessions/?${params.toString()}`
    );
    return data;
  },

  async get(id: string): Promise<Session> {
    const { data } = await api.get<Session>(`/sessions/${id}/`);
    return data;
  },

  async create(payload: FormData): Promise<Session> {
    const { data } = await api.post<Session>("/sessions/", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async update(id: string, payload: FormData | Partial<Session>): Promise<Session> {
    const isFormData = payload instanceof FormData;
    const { data } = await api.patch<Session>(`/sessions/${id}/`, payload, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/sessions/${id}/`);
  },

  async getMySessions(filters: SessionFilters = {}): Promise<PaginatedResponse<Session>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== "") params.set(k, String(v));
    });
    const { data } = await api.get<PaginatedResponse<Session>>(
      `/sessions/my/?${params.toString()}`
    );
    return data;
  },

  async getStats() {
    const { data } = await api.get("/sessions/stats/");
    return data;
  },
};
