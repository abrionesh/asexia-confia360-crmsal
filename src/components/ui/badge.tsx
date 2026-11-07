import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-medium tracking-wide",
  {
    variants: {
      tone: {
        muted: "bg-bg text-ink-muted",
        accent: "bg-accent-soft text-accent",
        ink: "bg-ink text-accent-fg",
        success: "bg-success/12 text-success",
        warning: "bg-warning/12 text-warning",
        wa: "bg-channel-wa/12 text-channel-wa",
        voice: "bg-channel-voice/12 text-channel-voice",
      },
    },
    defaultVariants: {
      tone: "muted",
    },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone, className }))} {...props} />;
}
