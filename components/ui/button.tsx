"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 cursor-pointer font-ui",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          {
            primary:
              "bg-amber text-bg-base hover:bg-amber-glow shadow-lg shadow-amber/20 hover:shadow-amber/40",
            secondary:
              "bg-bg-surface text-text-primary border border-border hover:border-border-light hover:bg-bg-card",
            ghost:
              "text-text-secondary hover:text-text-primary hover:bg-bg-glass",
            outline:
              "border border-amber/30 text-amber hover:bg-amber/10 hover:border-amber",
          }[variant],
          {
            sm: "px-4 py-2 text-sm",
            md: "px-6 py-3 text-base",
            lg: "px-8 py-4 text-lg",
          }[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
