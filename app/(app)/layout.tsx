"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: "✦", label: "Specchio" },
  { href: "/visions", icon: "🔮", label: "Visioni" },
  { href: "/ritual", icon: "🌙", label: "Rituale" },
  { href: "/settings", icon: "⚙", label: "Cielo" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/onboarding") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-20 border-r border-border glass fixed h-full z-40">
        <div className="p-4 flex flex-col items-center">
          <Link href="/dashboard" className="text-2xl mb-8 mt-2 glow-pulse">
            ✦
          </Link>
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-xl transition-all text-center",
                  pathname === item.href
                    ? "bg-accent/10 text-accent"
                    : "text-text-muted hover:text-text-secondary hover:bg-bg-glass"
                )}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px]">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-20 pb-24 md:pb-0">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass z-50 border-t border-border">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                pathname === item.href
                  ? "text-accent"
                  : "text-text-muted"
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px]">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
