"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/oggi", icon: "&#9670;", label: "Oggi" },
  { href: "/mappa", icon: "&#9672;", label: "Mappa" },
  { href: "/chiedi", icon: "&#10038;", label: "Oracolo", center: true },
  { href: "/diario", icon: "&#9790;", label: "Diario" },
  { href: "/profilo", icon: "&#9681;", label: "Profilo" },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50" aria-label="Navigazione principale">
      <div className="flex items-end justify-around px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const active = pathname === tab.href || (tab.href !== "/oggi" && pathname.startsWith(tab.href));
          const isCenter = tab.center;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-300 relative",
                active ? "text-amber" : "text-text-muted hover:text-text-secondary",
                isCenter && "relative -top-3"
              )}
            >
              {isCenter ? (
                <span
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 dimensional star-pulse",
                    active
                      ? "bg-amber text-bg-base"
                      : "bg-bg-card border border-border text-amber"
                  )}
                  dangerouslySetInnerHTML={{ __html: tab.icon }}
                />
              ) : (
                <span
                  className={cn("text-xl transition-all", active && "scale-110")}
                  dangerouslySetInnerHTML={{ __html: tab.icon }}
                />
              )}
              <span className={cn(
                "text-[10px] font-ui tracking-wide",
                isCenter && "mt-0.5"
              )}>
                {tab.label}
              </span>
              {active && !isCenter && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
