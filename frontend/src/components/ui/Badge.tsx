const variants = {
  PENDING:   "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",
  CONFIRMED: "bg-green-50 text-green-700 ring-1 ring-green-200",
  CANCELLED: "bg-red-50 text-red-600 ring-1 ring-red-200",
  USER:      "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  CREATOR:   "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
};

interface BadgeProps {
  label: string;
  variant?: keyof typeof variants;
}

export default function Badge({ label, variant }: BadgeProps) {
  const cls = variant ? variants[variant] : "bg-gray-100 text-gray-600 ring-1 ring-gray-200";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}
