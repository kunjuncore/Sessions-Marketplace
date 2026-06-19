const colors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  USER: "bg-blue-100 text-blue-800",
  CREATOR: "bg-purple-100 text-purple-800",
};

interface BadgeProps {
  label: string;
  variant?: keyof typeof colors;
}

export default function Badge({ label, variant }: BadgeProps) {
  const cls = variant ? colors[variant] : "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
