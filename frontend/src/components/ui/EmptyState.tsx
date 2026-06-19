import type { ReactNode } from "react";

interface Props {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon = "📭", title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 py-16 px-4 text-center">
      <div className="mb-4 text-5xl">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-gray-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
