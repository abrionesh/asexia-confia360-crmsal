import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[color,background-color,box-shadow,transform,opacity] duration-quick ease-out-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0 active:not-disabled:scale-press",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-fg shadow-border hover:opacity-90",
        secondary: "bg-accent-soft text-accent hover:bg-accent-soft/80",
        outline: "bg-surface text-ink shadow-border hover:shadow-border-hover",
        ghost: "text-ink-muted hover:bg-accent-soft hover:text-ink",
        fab: "bg-accent text-accent-fg shadow-overlay",
      },
      size: {
        default: "h-11 rounded-md px-4 text-sm",
        sm: "h-9 rounded-sm px-3 text-xs",
        lg: "h-12 rounded-lg px-5 text-sm",
        icon: "size-11 rounded-md",
        pill: "h-12 rounded-full px-5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}

export { buttonVariants };
