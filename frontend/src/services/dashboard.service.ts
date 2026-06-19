import api from "@/lib/axios";
import type { UserDashboard, CreatorDashboard } from "@/types";

export const dashboardService = {
  async getUserDashboard(): Promise<UserDashboard> {
    const { data } = await api.get<UserDashboard>("/dashboard/user/");
    return data;
  },

  async getCreatorDashboard(): Promise<CreatorDashboard> {
    const { data } = await api.get<CreatorDashboard>("/dashboard/creator/");
    return data;
  },
};
