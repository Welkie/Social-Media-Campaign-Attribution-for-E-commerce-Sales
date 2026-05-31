"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  Compass,
  GitCompare,
  Home,
  LineChart,
  Network,
  PieChart
} from "lucide-react";

const navItems = [
  { href: "/", label: "Overview", icon: Home },
  { href: "/attribution", label: "Attribution", icon: PieChart },
  { href: "/regression", label: "Regression", icon: LineChart },
  { href: "/comparison", label: "Comparison", icon: GitCompare },
  { href: "/simulation", label: "Simulation", icon: BarChart3 },
  { href: "/methodology", label: "Methodology", icon: Network }
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-x-0 top-0 z-30 border-b border-line bg-white/94 backdrop-blur md:inset-y-0 md:left-0 md:right-auto md:w-64 md:border-b-0 md:border-r">
      <div className="flex h-16 items-center justify-between px-4 md:h-auto md:flex-col md:items-stretch md:gap-6 md:px-5 md:py-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand text-white">
            <Compass size={22} />
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-[0.18em] text-muted">
              Journey
            </span>
            <span className="block text-lg font-bold leading-5 text-ink">Signal</span>
          </span>
        </Link>
        <div className="hidden items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-muted md:flex">
          <Bot size={14} />
          Signal Assistant
        </div>
      </div>

      <nav className="thin-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:px-4 md:pb-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex min-w-max items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-ink text-white"
                  : "text-muted hover:bg-surface hover:text-ink"
              ].join(" ")}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
