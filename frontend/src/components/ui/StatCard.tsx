interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "blue" | "green" | "yellow" | "red" | "purple";
}

const accents = {
  blue:   { dot: "bg-blue-600", text: "text-blue-600" },
  green:  { dot: "bg-green-600", text: "text-green-600" },
  yellow: { dot: "bg-yellow-600", text: "text-yellow-600" },
  red:    { dot: "bg-red-600", text: "text-red-600" },
  purple: { dot: "bg-purple-600", text: "text-purple-600" },
};

export default function StatCard({ label, value, sub, accent = "blue" }: StatCardProps) {
  const a = accents[accent];
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${a.dot}`} />
        <p className="text-sm text-gray-500">{label}</p>
      </div>
      <p className={`mt-2 text-2xl font-bold tracking-tight ${a.text}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}
