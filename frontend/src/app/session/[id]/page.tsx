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
        <div className="mb-4 text-4xl">&hellip;</div>
        <h2 className="text-xl font-bold text-gray-900">Session not found</h2>
        <p className="mt-2 text-gray-500">It may have been removed by the creator.</p>
        <Link href="/catalog" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800">
          &larr; Back to catalog
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === session.creator.id;
  const alreadyBooked = booked || session.is_booked;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/catalog" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to catalog
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative h-64 w-full overflow-hidden rounded-xl bg-gray-100 sm:h-80">
            {session.image_url ? (
              <Image src={session.image_url} alt={session.title} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{session.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 text-gray-600">
                {session.duration} min
              </span>
              <span className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 text-gray-600">
                {session.booking_count} booked
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">About this session</h2>
            <p className="leading-relaxed text-gray-600">{session.description}</p>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-sm font-bold text-gray-600">
              {session.creator.name[0].toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{session.creator.name}</p>
              <p className="text-sm text-gray-500">{session.creator.email}</p>
              <div className="mt-1"><Badge label="Creator" variant="CREATOR" /></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-gray-100 bg-white p-6">
            <div className="mb-1 text-sm text-gray-500">Price</div>
            <div className="text-3xl font-bold text-gray-900">
              ${parseFloat(session.price).toFixed(2)}
            </div>

            <div className="my-6 space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-gray-600 text-xs">{session.duration}m</span>
                Duration
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-gray-600 text-xs font-medium">{session.creator.name[0]}</span>
                {session.creator.name}
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-gray-600 text-xs font-medium">{session.booking_count}</span>
                people booked
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              {isOwner ? (
                <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-600">
                  This is your session.{" "}
                  <Link href="/creator" className="font-semibold underline">Manage it &rarr;</Link>
                </div>
              ) : alreadyBooked ? (
                <div className="rounded-lg bg-gray-50 p-4 text-center">
                  <p className="text-sm font-medium text-gray-900">You&apos;ve booked this session</p>
                  <Link href="/dashboard" className="mt-2 block text-xs text-gray-500 underline">View in dashboard &rarr;</Link>
                </div>
              ) : !user ? (
                <div className="text-center">
                  <p className="mb-4 text-sm text-gray-500">Sign in to book this session</p>
                  <Link href="/login" className="block w-full rounded-lg bg-gray-900 py-3 text-center text-sm font-semibold text-white hover:bg-gray-800 transition-colors">
                    Sign In to Book
                  </Link>
                </div>
              ) : (
                <Button size="lg" className="w-full" loading={booking} onClick={handleBook}>
                  Book Now &mdash; ${parseFloat(session.price).toFixed(2)}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
