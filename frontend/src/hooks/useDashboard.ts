import { useState, useEffect } from "react";
import { dashboardService } from "@/services/dashboard.service";
import type { UserDashboard, CreatorDashboard } from "@/types";

export function useUserDashboard() {
  const [data, setData] = useState<UserDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardService
      .getUserDashboard()
      .then(setData)
      .catch(() => setError("Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useCreatorDashboard() {
  const [data, setData] = useState<CreatorDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardService
      .getCreatorDashboard()
      .then(setData)
      .catch(() => setError("Failed to load creator dashboard."))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
