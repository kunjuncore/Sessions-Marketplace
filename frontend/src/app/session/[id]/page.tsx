"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useSession } from "@/hooks/useSessions";
import { useAuth } from "@/context/AuthContext";
import { bookingsService } from "@/services/bookings.service";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session, loading, error } = useSession(id);
  const { user } = useAuth();
  const router = useRouter();
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  const handleBook = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setBooking(true);
    try {
      await bookingsService.book(id);
      setBooked(true);
      toast.success("Session booked successfully!");
    } catch (e: any) {
      const msg = e?.response?.data?.session?.[0] || e?.response?.data?.detail || "Booking failed.";
      toast.error(msg);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="mx-auto max-w-2xl py-24 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-900">Session not found</h2>
        <Link href="/catalog" className="mt-4 inline-block text-blue-600 hover:underline">
          Back to catalog
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === session.creator.id;
  const alreadyBooked = booked || session.is_booked;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/catalog" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
        ← Back to catalog
      </Link>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Cover */}
        <div className="relative h-64 w-full bg-gradient-to-br from-blue-50 to-indigo-100 sm:h-80">
          {session.image_url ? (
            <Image src={session.image_url} alt={session.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-7xl">🎓</div>
          )}
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{session.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">🕐 {session.duration} min</span>
                <span className="flex items-center gap-1">👥 {session.booking_count} booked</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold text-blue-600">
                ${parseFloat(session.price).toFixed(2)}
              </p>
            </div>
          </div>

          <p className="mt-6 leading-relaxed text-gray-600">{session.description}</p>

          {/* Creator card */}
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-gray-50 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
              {session.creator.name[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{session.creator.name}</p>
              <Badge label="Creator" variant="CREATOR" />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8">
            {isOwner ? (
              <div className="rounded-xl bg-blue-50 p-4 text-center text-sm text-blue-700">
                This is your session.{" "}
                <Link href="/creator" className="font-semibold underline">
                  Manage it in your dashboard →
                </Link>
              </div>
            ) : alreadyBooked ? (
              <div className="rounded-xl bg-green-50 p-4 text-center text-sm text-green-700 font-medium">
                ✅ You&apos;ve booked this session.{" "}
                <Link href="/dashboard" className="underline">View in dashboard →</Link>
              </div>
            ) : !user ? (
              <div className="text-center">
                <p className="mb-3 text-sm text-gray-500">Sign in to book this session</p>
                <Link href="/login">
                  <Button size="lg">Sign In to Book</Button>
                </Link>
              </div>
            ) : (
              <Button size="lg" className="w-full" loading={booking} onClick={handleBook}>
                Book This Session — ${parseFloat(session.price).toFixed(2)}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
