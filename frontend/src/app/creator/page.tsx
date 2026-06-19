"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useCreatorDashboard } from "@/hooks/useDashboard";
import { sessionsService } from "@/services/sessions.service";
import { bookingsService } from "@/services/bookings.service";
import Sidebar from "@/components/layout/Sidebar";
import StatCard from "@/components/ui/StatCard";
import SessionCard from "@/components/sessions/SessionCard";
import SessionForm from "@/components/sessions/SessionForm";
import BookingCard from "@/components/bookings/BookingCard";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import type { Session } from "@/types";

const sidebarItems = [
  { href: "/creator", label: "Overview", icon: "🏠" },
  { href: "/catalog", label: "Browse", icon: "🔍" },
];

type Tab = "overview" | "sessions" | "bookings";

export default function CreatorDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { data, loading, error } = useCreatorDashboard();
  const [tab, setTab] = useState<Tab>("overview");
  const [showForm, setShowForm] = useState(false);
  const [editSession, setEditSession] = useState<Session | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
    if (!authLoading && user && user.role !== "CREATOR") router.replace("/dashboard");
  }, [authLoading, user, router]);

  const handleCreate = async (formData: any) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("description", formData.description);
      fd.append("price", formData.price);
      fd.append("duration", formData.duration);
      if (formData.image?.[0]) fd.append("image", formData.image[0]);
      await sessionsService.create(fd);
      toast.success("Session created!");
      setShowForm(false);
      window.location.reload();
    } catch {
      toast.error("Failed to create session.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (formData: any) => {
    if (!editSession) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("description", formData.description);
      fd.append("price", formData.price);
      fd.append("duration", formData.duration);
      if (formData.image?.[0]) fd.append("image", formData.image[0]);
      await sessionsService.update(editSession.id, fd);
      toast.success("Session updated!");
      setEditSession(null);
      window.location.reload();
    } catch {
      toast.error("Failed to update session.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this session? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await sessionsService.delete(id);
      toast.success("Session deleted.");
      window.location.reload();
    } catch {
      toast.error("Failed to delete session.");
    } finally {
      setDeleting(null);
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
    return <div className="py-24 text-center text-red-500">{error || "Failed to load."}</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex gap-8">
        <Sidebar items={sidebarItems} title="Creator" />

        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Creator Dashboard</h1>
              <div className="mt-1 flex items-center gap-2">
                <Badge label="CREATOR" variant="CREATOR" />
                <span className="text-sm text-gray-500">{data.profile.email}</span>
              </div>
            </div>
            <Button onClick={() => { setShowForm(true); setEditSession(null); }}>
              + New Session
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
            {(["overview", "sessions", "bookings"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-colors
                  ${tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Session form modal */}
          {(showForm || editSession) && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {editSession ? "Edit Session" : "New Session"}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditSession(null); }}>
                  ✕
                </Button>
              </div>
              <SessionForm
                session={editSession || undefined}
                onSubmit={editSession ? handleUpdate : handleCreate}
                loading={submitting}
              />
            </div>
          )}

          {/* Overview tab */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard label="Total Sessions" value={data.stats.total_sessions} />
                <StatCard label="Total Bookings" value={data.stats.total_bookings} />
                <StatCard
                  label="Revenue"
                  value={`$${parseFloat(data.stats.total_revenue).toFixed(2)}`}
                  color="text-green-600"
                />
                <StatCard label="Pending" value={data.stats.pending_bookings} color="text-yellow-500" />
                <StatCard label="Confirmed" value={data.stats.confirmed_bookings} color="text-green-600" />
                <StatCard label="Cancelled" value={data.stats.cancelled_bookings} color="text-red-500" />
              </div>

              <div>
                <h2 className="mb-4 text-lg font-semibold">Top Sessions</h2>
                {data.top_sessions.length === 0 ? (
                  <div className="rounded-xl bg-gray-50 py-10 text-center text-sm text-gray-400">
                    No sessions yet. Create your first one!
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {data.top_sessions.map((s) => (
                      <SessionCard key={s.id} session={s} />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="mb-4 text-lg font-semibold">Recent Bookings</h2>
                {data.recent_bookings.length === 0 ? (
                  <div className="rounded-xl bg-gray-50 py-10 text-center text-sm text-gray-400">
                    No bookings yet.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {data.recent_bookings.map((b) => (
                      <BookingCard key={b.id} booking={b} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sessions tab */}
          {tab === "sessions" && (
            <div className="space-y-4">
              {data.recent_sessions.length === 0 ? (
                <div className="rounded-xl bg-gray-50 py-10 text-center text-sm text-gray-400">
                  No sessions yet.
                </div>
              ) : (
                data.recent_sessions.map((s) => (
                  <div key={s.id} className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{s.title}</p>
                      <p className="text-sm text-gray-500">
                        ${parseFloat(s.price).toFixed(2)} · {s.duration} min · {s.booking_count} booked
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setEditSession(s)}>
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={deleting === s.id}
                        onClick={() => handleDelete(s.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Bookings tab */}
          {tab === "bookings" && (
            <div className="flex flex-col gap-3">
              {data.recent_bookings.length === 0 ? (
                <div className="rounded-xl bg-gray-50 py-10 text-center text-sm text-gray-400">
                  No bookings for your sessions yet.
                </div>
              ) : (
                data.recent_bookings.map((b) => (
                  <div key={b.id} className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{b.session.title}</p>
                      <p className="text-sm text-gray-500">Booked by {b.user.name}</p>
                    </div>
                    <Badge label={b.status} variant={b.status} />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
