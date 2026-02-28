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
          "relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          {
            primary:
              "bg-accent text-white hover:bg-accent-secondary shadow-lg shadow-accent-glow/20 hover:shadow-accent-glow/40",
            secondary:
              "bg-bg-secondary text-text-primary border border-border hover:border-border-light hover:bg-bg-tertiary",
            ghost:
              "text-text-secondary hover:text-text-primary hover:bg-bg-glass",
            outline:
              "border border-accent/30 text-accent hover:bg-accent/10 hover:border-accent",
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
