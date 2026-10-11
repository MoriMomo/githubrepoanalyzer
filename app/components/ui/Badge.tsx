import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded font-mono transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-surface-2 text-text border border-border",
        accent:
          "bg-accent/10 text-accent border border-accent/30",
        ok:
          "bg-ok/10 text-ok border border-ok/30",
        warn:
          "bg-warn/10 text-warn border border-warn/30",
        flag:
          "bg-flag/10 text-flag border border-flag/30",
        neutral:
          "bg-surface text-text-dim border border-border",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-1 text-[11px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props} />
  );
}
