import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "glow";
}

export function Card({
  className,
  variant = "default",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 transition-all duration-300",
        {
          default: "bg-bg-secondary border border-border",
          glass: "glass",
          glow: "bg-bg-secondary border border-border glow",
        }[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
