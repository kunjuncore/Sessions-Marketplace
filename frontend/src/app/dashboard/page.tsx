"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useUserDashboard } from "@/hooks/useDashboard";
import { authService } from "@/services/auth.service";
import { bookingsService } from "@/services/bookings.service";
import Sidebar from "@/components/layout/Sidebar";
import StatCard from "@/components/ui/StatCard";
import BookingCard from "@/components/bookings/BookingCard";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";

const sidebarItems = [
  { href: "/dashboard", label: "Overview", icon: "🏠" },
  { href: "/catalog", label: "Browse Sessions", icon: "🔍" },
];

export default function DashboardPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const { data, loading, error } = useUserDashboard();
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const handleCancel = async (id: string) => {
    setCancelling(id);
    try {
      await bookingsService.cancel(id);
      toast.success("Booking cancelled.");
      window.location.reload();
    } catch {
      toast.error("Failed to cancel booking.");
    } finally {
      setCancelling(null);
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      await authService.upgradeToCreator();
      await refreshUser();
      toast.success("You are now a Creator!");
      router.push("/creator");
    } catch {
      toast.error("Upgrade failed.");
    } finally {
      setUpgrading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-24 text-center text-red-500">{error || "Failed to load dashboard."}</div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex gap-8">
        <Sidebar items={sidebarItems} title="Dashboard" />

        <div className="flex-1 space-y-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Hello, {data.profile.name} 👋
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <Badge label={data.profile.role} variant={data.profile.role} />
                <span className="text-sm text-gray-500">{data.profile.email}</span>
              </div>
            </div>
            <Button variant="secondary" size="sm" loading={upgrading} onClick={handleUpgrade}>
              Become a Creator
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Bookings" value={data.stats.total} color="text-blue-600" />
            <StatCard label="Pending" value={data.stats.pending} color="text-yellow-500" />
            <StatCard label="Confirmed" value={data.stats.confirmed} color="text-green-600" />
            <StatCard label="Cancelled" value={data.stats.cancelled} color="text-red-500" />
          </div>

          {/* Upcoming sessions */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Upcoming Sessions</h2>
            {data.upcoming_bookings.length === 0 ? (
              <div className="rounded-xl bg-gray-50 py-10 text-center text-sm text-gray-400">
                No confirmed bookings yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {data.upcoming_bookings.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            )}
          </section>

          {/* Recent bookings */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Recent Bookings</h2>
            {data.recent_bookings.length === 0 ? (
              <div className="rounded-xl bg-gray-50 py-10 text-center text-sm text-gray-400">
                No bookings yet. <a href="/catalog" className="text-blue-600 hover:underline">Browse sessions →</a>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {data.recent_bookings.map((b) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    onCancel={handleCancel}
                    cancelling={cancelling === b.id}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
