"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useCreatorDashboard } from "@/hooks/useDashboard";
import { sessionsService } from "@/services/sessions.service";
import { bookingsService } from "@/services/bookings.service";
import { getApiError } from "@/lib/errors";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Sidebar from "@/components/layout/Sidebar";
import StatCard from "@/components/ui/StatCard";
import SessionCard from "@/components/sessions/SessionCard";
import SessionForm from "@/components/sessions/SessionForm";
import BookingCard from "@/components/bookings/BookingCard";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import type { Session } from "@/types";

const sidebarItems = [
  { href: "/creator", label: "Overview", icon: "🏠" },
  { href: "/catalog", label: "Browse", icon: "🔍" },
];

type Tab = "overview" | "sessions" | "bookings";

function CreatorDashboardContent() {
  const { data, loading, error } = useCreatorDashboard();
  const [tab, setTab] = useState<Tab>("overview");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editSession, setEditSession] = useState<Session | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [updatingBooking, setUpdatingBooking] = useState<string | null>(null);

  const buildFormData = (formData: any): FormData => {
    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("description", formData.description);
    fd.append("price", formData.price);
    fd.append("duration", formData.duration);
    if (formData.image?.[0]) fd.append("image", formData.image[0]);
    return fd;
  };

  const handleCreate = async (formData: any) => {
    setSubmitting(true);
    try {
      await sessionsService.create(buildFormData(formData));
      toast.success("Session created!");
      setShowCreateModal(false);
      window.location.reload();
    } catch (e) {
      toast.error(getApiError(e, "Failed to create session."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (formData: any) => {
    if (!editSession) return;
    setSubmitting(true);
    try {
      await sessionsService.update(editSession.id, buildFormData(formData));
      toast.success("Session updated!");
      setEditSession(null);
      window.location.reload();
    } catch (e) {
      toast.error(getApiError(e, "Failed to update session."));
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
    } catch (e) {
      toast.error(getApiError(e, "Failed to delete session."));
    } finally {
      setDeleting(null);
    }
  };

  const handleStatusUpdate = async (bookingId: string, status: "CONFIRMED" | "CANCELLED") => {
    setUpdatingBooking(bookingId);
    try {
      await bookingsService.updateStatus(bookingId, status);
      toast.success(`Booking ${status.toLowerCase()}.`);
      window.location.reload();
    } catch (e) {
      toast.error(getApiError(e, "Failed to update booking."));
    } finally {
      setUpdatingBooking(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        icon="⚠️"
        title="Failed to load dashboard"
        description={error ?? "Please try again."}
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  return (
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
          <Button onClick={() => setShowCreateModal(true)}>+ New Session</Button>
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

        {/* ── Overview ── */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Total Sessions" value={data.stats.total_sessions} />
              <StatCard label="Total Bookings" value={data.stats.total_bookings} />
              <StatCard label="Revenue" value={`$${parseFloat(data.stats.total_revenue).toFixed(2)}`} color="text-green-600" />
              <StatCard label="Pending" value={data.stats.pending_bookings} color="text-yellow-500" />
              <StatCard label="Confirmed" value={data.stats.confirmed_bookings} color="text-green-600" />
              <StatCard label="Cancelled" value={data.stats.cancelled_bookings} color="text-red-500" />
            </div>

            <div>
              <h2 className="mb-4 text-lg font-semibold">Top Sessions by Bookings</h2>
              {data.top_sessions.length === 0 ? (
                <EmptyState icon="📋" title="No sessions yet" description="Create your first session to get started." />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {data.top_sessions.map((s) => <SessionCard key={s.id} session={s} />)}
                </div>
              )}
            </div>

            <div>
              <h2 className="mb-4 text-lg font-semibold">Recent Bookings</h2>
              {data.recent_bookings.length === 0 ? (
                <EmptyState icon="📭" title="No bookings yet" />
              ) : (
                <div className="flex flex-col gap-3">
                  {data.recent_bookings.map((b) => <BookingCard key={b.id} booking={b} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Sessions tab ── */}
        {tab === "sessions" && (
          <div className="space-y-3">
            {data.recent_sessions.length === 0 ? (
              <EmptyState
                icon="📋"
                title="No sessions yet"
                action={<Button onClick={() => setShowCreateModal(true)}>Create Session</Button>}
              />
            ) : (
              data.recent_sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{s.title}</p>
                    <p className="text-sm text-gray-500">
                      ${parseFloat(s.price).toFixed(2)} · {s.duration} min · {s.booking_count} booked
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setEditSession(s)}>Edit</Button>
                    <Button variant="danger" size="sm" loading={deleting === s.id} onClick={() => handleDelete(s.id)}>Delete</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Bookings tab ── */}
        {tab === "bookings" && (
          <div className="flex flex-col gap-3">
            {data.recent_bookings.length === 0 ? (
              <EmptyState icon="📭" title="No bookings for your sessions yet" />
            ) : (
              data.recent_bookings.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{b.session.title}</p>
                    <p className="text-sm text-gray-500">Booked by {b.user.name} · {new Date(b.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge label={b.status} variant={b.status} />
                    {b.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          loading={updatingBooking === b.id}
                          onClick={() => handleStatusUpdate(b.id, "CONFIRMED")}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          loading={updatingBooking === b.id}
                          onClick={() => handleStatusUpdate(b.id, "CANCELLED")}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create session modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Session">
        <SessionForm onSubmit={handleCreate} loading={submitting} />
      </Modal>

      {/* Edit session modal */}
      <Modal open={!!editSession} onClose={() => setEditSession(null)} title="Edit Session">
        {editSession && (
          <SessionForm session={editSession} onSubmit={handleUpdate} loading={submitting} />
        )}
      </Modal>
    </div>
  );
}

export default function CreatorDashboardPage() {
  return (
    <ProtectedRoute role="CREATOR">
      <ErrorBoundary>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <CreatorDashboardContent />
        </div>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}
