import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full min-w-0 rounded-xl border border-input bg-surface px-4 text-base text-fg outline-none transition-colors placeholder:text-fg-muted/60",
        "focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
