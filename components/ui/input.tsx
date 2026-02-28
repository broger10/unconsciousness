import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full px-4 py-3 rounded-xl bg-bg-secondary border border-border",
        "text-text-primary placeholder:text-text-muted",
        "focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20",
        "transition-all duration-200",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
