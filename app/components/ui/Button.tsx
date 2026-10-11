import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-bg select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-bg font-semibold hover:bg-accent-dim shadow-sm shadow-(--color-accent)/10 active:translate-y-px",
        secondary:
          "bg-surface-2 text-text border border-border hover:bg-surface hover:border-slate-600 active:translate-y-px",
        ghost:
          "text-text-dim hover:text-text hover:bg-surface-2",
        destructive:
          "bg-flag/10 text-flag border border-flag/30 hover:bg-flag/20 active:translate-y-px",
        outline:
          "border border-border text-text-dim hover:text-text hover:bg-surface",
      },
      size: {
        sm: "h-7 px-2.5 text-[11px]",
        md: "h-8 px-3.5 text-xs",
        lg: "h-9 px-4 text-xs font-semibold",
        icon: "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
