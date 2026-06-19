import Link from "next/link";
import Image from "next/image";
import type { Session } from "@/types";

interface SessionCardProps {
  session: Session;
}

const GRADIENTS = [
  "from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-500",
  "from-emerald-400 to-teal-500",
  "from-orange-400 to-rose-500",
  "from-cyan-400 to-blue-500",
  "from-pink-400 to-fuchsia-500",
];

function hashGradient(id: string) {
  const code = id.charCodeAt(0) + id.charCodeAt(id.length - 1);
  return GRADIENTS[code % GRADIENTS.length];
}

export default function SessionCard({ session }: SessionCardProps) {
  const gradient = hashGradient(session.id);

  return (
    <Link href={`/session/${session.id}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
        {/* Thumbnail */}
        <div className={`relative h-44 w-full bg-gradient-to-br ${gradient} overflow-hidden`}>
          {session.image_url ? (
            <Image
              src={session.image_url}
              alt={session.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-5xl drop-shadow-sm">🎓</span>
            </div>
          )}

          {/* Price pill */}
          <div className="absolute bottom-3 right-3">
            <span className="rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-gray-900 shadow-sm backdrop-blur-sm">
              ${parseFloat(session.price).toFixed(2)}
            </span>
          </div>

          {session.is_booked && (
            <div className="absolute left-3 top-3">
              <span className="rounded-full bg-green-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                ✓ Booked
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-1 font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
            {session.title}
          </h3>
          <p className="mt-1 line-clamp-2 flex-1 text-sm leading-relaxed text-gray-500">
            {session.description}
          </p>

          {/* Meta */}
          <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-xs font-bold text-white`}
              >
                {session.creator.name[0].toUpperCase()}
              </div>
              <span className="max-w-[100px] truncate text-xs font-medium text-gray-600">
                {session.creator.name}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                </svg>
                {session.duration}m
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                </svg>
                {session.booking_count}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
