import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const cardVariants = cva(
  "rounded-md transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-surface border border-border text-text",
        surface2:
          "bg-surface-2 border border-border text-text",
        interactive:
          "bg-surface border border-border hover:border-accent/40 hover:bg-surface-2/50 cursor-pointer text-text",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-4",
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
