"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useSession } from "@/hooks/useSessions";
import { useAuth } from "@/context/AuthContext";
import { bookingsService } from "@/services/bookings.service";
import { getApiError } from "@/lib/errors";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import PageLoader from "@/components/ui/PageLoader";

const GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-rose-600",
];

function hashGradient(id: string) {
  const code = id.charCodeAt(0) + id.charCodeAt(id.length - 1);
  return GRADIENTS[code % GRADIENTS.length];
}

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session, loading, error } = useSession(id);
  const { user } = useAuth();
  const router = useRouter();
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  const handleBook = async () => {
    if (!user) { router.push("/login"); return; }
    setBooking(true);
    try {
      await bookingsService.book(id);
      setBooked(true);
      toast.success("Session booked! Check your dashboard.");
    } catch (e) {
      toast.error(getApiError(e, "Booking failed."));
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <PageLoader />;

  if (error || !session) {
    return (
      <div className="mx-auto max-w-2xl py-24 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-900">Session not found</h2>
        <p className="mt-2 text-gray-500">It may have been removed by the creator.</p>
        <Link href="/catalog" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700">
          ← Back to catalog
        </Link>
      </div>
    );
  }

  const gradient = hashGradient(session.id);
  const isOwner = user?.id === session.creator.id;
  const alreadyBooked = booked || session.is_booked;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <Link href="/catalog" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to catalog
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover */}
          <div className={`relative h-64 w-full overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} sm:h-80`}>
            {session.image_url ? (
              <Image src={session.image_url} alt={session.title} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-7xl drop-shadow">🎓</div>
            )}
          </div>

          {/* Title & meta */}
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">{session.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                </svg>
                {session.duration} min
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                </svg>
                {session.booking_count} booked
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-3 font-semibold text-gray-800">About this session</h2>
            <p className="leading-relaxed text-gray-600">{session.description}</p>
          </div>

          {/* Creator */}
          <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-xl font-bold text-white shadow-sm`}>
              {session.creator.name[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{session.creator.name}</p>
              <p className="text-sm text-gray-500">{session.creator.email}</p>
              <div className="mt-1"><Badge label="Creator" variant="CREATOR" /></div>
            </div>
          </div>
        </div>

        {/* Sticky booking panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
            <div className="mb-1 text-sm text-gray-500">Price</div>
            <div className="text-4xl font-extrabold text-gray-900">
              ${parseFloat(session.price).toFixed(2)}
            </div>

            <div className="my-5 space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600">🕐</span>
                {session.duration} minutes
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600">👤</span>
                {session.creator.name}
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600">👥</span>
                {session.booking_count} people booked
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              {isOwner ? (
                <div className="rounded-xl bg-blue-50 p-4 text-center text-sm text-blue-700">
                  This is your session.{" "}
                  <Link href="/creator" className="font-semibold underline">Manage it →</Link>
                </div>
              ) : alreadyBooked ? (
                <div className="rounded-xl bg-green-50 p-4 text-center">
                  <p className="text-sm font-semibold text-green-700">✅ You&apos;ve booked this session</p>
                  <Link href="/dashboard" className="mt-2 block text-xs text-green-600 underline">View in dashboard →</Link>
                </div>
              ) : !user ? (
                <div className="text-center">
                  <p className="mb-4 text-sm text-gray-500">Sign in to book this session</p>
                  <Link href="/login" className="block w-full rounded-xl bg-blue-600 py-3 text-center text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors">
                    Sign In to Book
                  </Link>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full"
                  loading={booking}
                  onClick={handleBook}
                >
                  Book Now — ${parseFloat(session.price).toFixed(2)}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
