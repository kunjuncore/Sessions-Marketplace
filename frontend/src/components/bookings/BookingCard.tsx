"use client";

import Link from "next/link";
import type { Booking, BookingStatus } from "@/types";
import Button from "@/components/ui/Button";

interface Props {
  booking: Booking;
  onCancel?: (id: string) => void;
  cancelling?: boolean;
}

const statusConfig: Record<BookingStatus, { dot: string; label: string }> = {
  PENDING: { dot: "bg-yellow-400", label: "Pending" },
  CONFIRMED: { dot: "bg-green-500", label: "Confirmed" },
  CANCELLED: { dot: "bg-red-400", label: "Cancelled" },
};

export default function BookingCard({ booking, onCancel, cancelling }: Props) {
  const cfg = statusConfig[booking.status];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>

        <div className="min-w-0">
          <Link
            href={`/session/${booking.session.id}`}
            className="block truncate font-medium text-gray-900 hover:text-gray-600 transition-colors"
          >
            {booking.session.title}
          </Link>
          <p className="mt-0.5 text-sm text-gray-500">{booking.session.creator.name}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-400">
            <span>${parseFloat(booking.session.price).toFixed(2)}</span>
            <span>&middot;</span>
            <span>{booking.session.duration} min</span>
            <span>&middot;</span>
            <span>{new Date(booking.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
        {booking.status === "PENDING" && onCancel && (
          <Button variant="danger" size="sm" loading={cancelling} onClick={() => onCancel(booking.id)}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
