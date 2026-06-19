import Link from "next/link";
import Image from "next/image";
import type { Session } from "@/types";

interface SessionCardProps {
  session: Session;
}

export default function SessionCard({ session }: SessionCardProps) {
  return (
    <Link href={`/session/${session.id}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-all hover:border-gray-200 hover:shadow-sm">
        <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
          {session.image_url ? (
            <Image
              src={session.image_url}
              alt={session.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
          )}

          <div className="absolute bottom-3 right-3">
            <span className="rounded-md bg-white/90 px-2.5 py-1 text-sm font-semibold text-gray-900 shadow-sm">
              ${parseFloat(session.price).toFixed(2)}
            </span>
          </div>

          {session.is_booked && (
            <div className="absolute left-3 top-3">
              <span className="rounded-md bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                Booked
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-1 font-semibold text-gray-900 group-hover:text-gray-600">
            {session.title}
          </h3>
          <p className="mt-1 line-clamp-2 flex-1 text-sm leading-relaxed text-gray-500">
            {session.description}
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
                {session.creator.name[0].toUpperCase()}
              </div>
              <span className="max-w-[100px] truncate text-sm text-gray-600">
                {session.creator.name}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span>{session.duration}m</span>
              <span>{session.booking_count} booked</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
