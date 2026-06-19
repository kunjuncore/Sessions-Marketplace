"use client";

import Link from "next/link";
import type { Booking } from "@/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface Props {
  booking: Booking;
  onCancel?: (id: string) => void;
  cancelling?: boolean;
}

export default function BookingCard({ booking, onCancel, cancelling }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
          🎓
        </div>
        <div>
          <Link
            href={`/session/${booking.session.id}`}
            className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            {booking.session.title}
          </Link>
          <p className="text-sm text-gray-500">{booking.session.creator.name}</p>
          <p className="mt-1 text-xs text-gray-400">
            {new Date(booking.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge
          label={booking.status}
          variant={booking.status}
        />
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
