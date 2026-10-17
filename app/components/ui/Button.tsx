import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-all duration-150 cursor-pointer disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg select-none",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-[#04120b] font-bold hover:bg-accent-dim shadow-sm shadow-accent/20 active:translate-y-px border border-accent/40",
        primary:
          "bg-accent text-[#04120b] font-bold hover:bg-accent-dim shadow-sm shadow-accent/20 active:translate-y-px border border-accent/40",
        secondary:
          "bg-surface-2 text-text border border-border hover:bg-surface-3 hover:border-border-strong active:translate-y-px shadow-xs",
        ghost:
          "text-text-dim hover:text-text hover:bg-surface-2 active:bg-surface-3",
        destructive:
          "bg-flag/10 text-flag border border-flag/30 hover:bg-flag/20 hover:border-flag/50 active:translate-y-px",
        outline:
          "border border-border text-text hover:text-text hover:bg-surface-2 hover:border-border-strong active:translate-y-px",
        link:
          "text-accent underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-8.5 px-3.5 text-xs font-medium",
        sm: "h-7.5 px-3 text-[11px] font-medium",
        md: "h-8.5 px-3.5 text-xs font-medium",
        lg: "h-10 px-4.5 text-xs font-semibold tracking-wide",
        icon: "h-8.5 w-8.5 p-0",
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
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
