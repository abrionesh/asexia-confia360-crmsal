import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md bg-surface px-3 text-sm text-ink shadow-border outline-none transition-[box-shadow] duration-quick ease-out-smooth placeholder:text-ink-subtle focus-visible:ring-2 focus-visible:ring-accent/35",
        className,
      )}
      suppressHydrationWarning
      {...props}
    />
  );
}
