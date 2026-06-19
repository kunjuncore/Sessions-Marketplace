"use client";

import Link from "next/link";
import type { Booking, BookingStatus } from "@/types";
import Button from "@/components/ui/Button";

interface Props {
  booking: Booking;
  onCancel?: (id: string) => void;
  cancelling?: boolean;
}

const statusConfig: Record<BookingStatus, { dot: string; label: string; text: string }> = {
  PENDING: { dot: "bg-yellow-400", label: "Pending", text: "text-yellow-700" },
  CONFIRMED: { dot: "bg-green-500", label: "Confirmed", text: "text-green-700" },
  CANCELLED: { dot: "bg-red-400", label: "Cancelled", text: "text-red-600" },
};

export default function BookingCard({ booking, onCancel, cancelling }: Props) {
  const cfg = statusConfig[booking.status];

  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl shadow-sm">
          🎓
        </div>

        {/* Info */}
        <div className="min-w-0">
          <Link
            href={`/session/${booking.session.id}`}
            className="block truncate font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            {booking.session.title}
          </Link>
          <p className="mt-0.5 text-sm text-gray-500">{booking.session.creator.name}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <span>
              ${parseFloat(booking.session.price).toFixed(2)}
            </span>
            <span>·</span>
            <span>{booking.session.duration} min</span>
            <span>·</span>
            <span>{new Date(booking.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
        </div>
      </div>

      {/* Status + action */}
      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cfg.text} bg-opacity-10`}
          style={{ backgroundColor: `color-mix(in srgb, currentColor 10%, transparent)` }}>
          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
        {booking.status === "PENDING" && onCancel && (
          <Button
            variant="danger"
            size="sm"
            loading={cancelling}
            onClick={() => onCancel(booking.id)}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
