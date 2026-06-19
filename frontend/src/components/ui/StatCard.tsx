interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: string;
  accent?: "blue" | "green" | "yellow" | "red" | "purple";
}

const accents = {
  blue:   { bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-100" },
  green:  { bg: "bg-green-50",  text: "text-green-600",  border: "border-green-100" },
  yellow: { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-100" },
  red:    { bg: "bg-red-50",    text: "text-red-500",    border: "border-red-100" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
};

export default function StatCard({ label, value, sub, icon, accent = "blue" }: StatCardProps) {
  const a = accents[accent];
  return (
    <div className={`rounded-2xl border ${a.border} bg-white p-5 shadow-sm`}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {icon && (
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${a.bg} text-lg`}>
            {icon}
          </span>
        )}
      </div>
      <p className={`mt-2 text-3xl font-extrabold tracking-tight ${a.text}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}
