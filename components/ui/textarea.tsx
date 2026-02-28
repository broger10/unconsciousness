import { cn } from "@/lib/utils";
import { forwardRef, type TextareaHTMLAttributes } from "react";

const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full px-4 py-3 rounded-xl bg-bg-secondary border border-border",
        "text-text-primary placeholder:text-text-muted",
        "focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20",
        "transition-all duration-200 resize-none",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
