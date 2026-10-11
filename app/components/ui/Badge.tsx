import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-[5px] font-mono tracking-wide transition-colors select-none font-medium",
  {
    variants: {
      variant: {
        default:
          "bg-surface-2 text-text border border-border",
        accent:
          "bg-accent/10 text-accent border border-accent/30 shadow-[0_0_12px_rgba(0,229,153,0.06)]",
        ok:
          "bg-ok/10 text-ok border border-ok/30 shadow-[0_0_12px_rgba(16,185,129,0.06)]",
        warn:
          "bg-warn/10 text-warn border border-warn/30 shadow-[0_0_12px_rgba(245,158,11,0.06)]",
        flag:
          "bg-flag/10 text-flag border border-flag/30 shadow-[0_0_12px_rgba(244,63,94,0.06)]",
        info:
          "bg-info/10 text-info border border-info/30 shadow-[0_0_12px_rgba(56,189,248,0.06)]",
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
