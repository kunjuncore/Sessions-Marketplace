import api from "@/lib/axios";
import Cookies from "js-cookie";
import type { AuthTokens, User } from "@/types";

export const authService = {
  async googleLogin(token: string): Promise<AuthTokens> {
    const { data } = await api.post<AuthTokens>("/auth/google/", { token });
    Cookies.set("access_token", data.access, { expires: 1 / 24 });
    Cookies.set("refresh_token", data.refresh, { expires: 7 });
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<User>("/auth/me/");
    return data;
  },

  async updateMe(payload: Partial<Pick<User, "name" | "avatar">>): Promise<User> {
    const { data } = await api.patch<User>("/auth/me/", payload);
    return data;
  },

  async upgradeToCreator(): Promise<AuthTokens> {
    const { data } = await api.patch<AuthTokens>("/auth/role/", { role: "CREATOR" });
    Cookies.set("access_token", data.access, { expires: 1 / 24 });
    Cookies.set("refresh_token", data.refresh, { expires: 7 });
    return data;
  },

  async logout(): Promise<void> {
    const refresh = Cookies.get("refresh_token");
    if (refresh) {
      try {
        await api.post("/auth/logout/", { refresh });
      } catch {
        // silently fail — tokens are cleared regardless
      }
    }
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
  },
};
