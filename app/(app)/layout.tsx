"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Mirror", icon: "🪞" },
  { href: "/visions", label: "Visioni", icon: "🔮" },
  { href: "/ritual", label: "Rituale", icon: "⚡" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border p-6 shrink-0">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight mb-10">
          <span className="text-gradient">un</span>
          <span className="text-text-primary">consciousness</span>
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                pathname === item.href
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-glass"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all",
                pathname === item.href
                  ? "text-accent"
                  : "text-text-muted"
              )}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
