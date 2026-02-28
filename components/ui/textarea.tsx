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
        "w-full px-4 py-3 rounded-xl bg-bg-surface border border-border",
        "text-text-primary placeholder:text-text-muted font-ui",
        "focus:outline-none focus:border-amber/40 focus:ring-1 focus:ring-amber/15",
        "transition-all duration-200 resize-none",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
