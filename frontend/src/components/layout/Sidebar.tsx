"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  items: NavItem[];
  title?: string;
}

export default function Sidebar({ items, title }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile: horizontal scrollable tab bar */}
      <nav className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-gray-100 bg-white p-1 shadow-sm md:hidden">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors
                ${active ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Desktop: vertical sidebar */}
      <aside className="hidden w-52 shrink-0 md:block">
        <div className="sticky top-20 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
          {title && (
            <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
              {title}
            </p>
          )}
          <nav className="flex flex-col gap-0.5">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all
                    ${active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
