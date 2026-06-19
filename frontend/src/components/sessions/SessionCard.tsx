import Link from "next/link";
import Image from "next/image";
import type { Session } from "@/types";
import Badge from "@/components/ui/Badge";

interface SessionCardProps {
  session: Session;
}

export default function SessionCard({ session }: SessionCardProps) {
  return (
    <Link href={`/session/${session.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
        <div className="relative h-44 w-full bg-gradient-to-br from-blue-50 to-indigo-100">
          {session.image_url ? (
            <Image
              src={session.image_url}
              alt={session.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl">🎓</div>
          )}
          {session.is_booked && (
            <div className="absolute right-2 top-2">
              <Badge label="Booked" variant="CONFIRMED" />
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="line-clamp-1 font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {session.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-500">{session.description}</p>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <span>🕐</span>
              <span>{session.duration} min</span>
            </div>
            <span className="text-lg font-bold text-blue-600">
              ${parseFloat(session.price).toFixed(2)}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2 border-t border-gray-50 pt-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
              {session.creator.name[0]}
            </div>
            <span className="text-xs text-gray-500">{session.creator.name}</span>
            <span className="ml-auto text-xs text-gray-400">
              {session.booking_count} booked
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
