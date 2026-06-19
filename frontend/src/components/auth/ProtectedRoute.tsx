"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PageLoader from "@/components/ui/PageLoader";

interface Props {
  children: ReactNode;
  /** If provided, user must have this role */
  role?: "USER" | "CREATOR";
  /** Where to redirect unauthenticated users (default: /login) */
  redirectTo?: string;
}

export default function ProtectedRoute({ children, role, redirectTo = "/login" }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(redirectTo);
      return;
    }

    if (role && user.role !== role) {
      // Wrong role — send to the correct dashboard
      router.replace(user.role === "CREATOR" ? "/creator" : "/dashboard");
    }
  }, [loading, user, role, redirectTo, router]);

  if (loading) return <PageLoader />;
  if (!user) return null;
  if (role && user.role !== role) return null;

  return <>{children}</>;
}
