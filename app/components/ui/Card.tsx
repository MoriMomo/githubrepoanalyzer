import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const cardVariants = cva(
  "rounded-lg transition-all duration-150 relative",
  {
    variants: {
      variant: {
        default:
          "bg-surface border border-border text-text shadow-xs",
        surface2:
          "bg-surface-2 border border-border text-text shadow-xs",
        surface3:
          "bg-surface-3 border border-border-strong text-text shadow-sm",
        interactive:
          "bg-surface border border-border hover:border-accent/40 hover:bg-surface-2 text-text cursor-pointer hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)] active:scale-[0.998]",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-4.5",
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, className }))}
        {...props}
      />
    );
  },
);
Card.displayName = "Card";
