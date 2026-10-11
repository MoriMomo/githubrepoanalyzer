import * as React from "react";
import { cn } from "~/lib/utils";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  label?: string;
}

export function Divider({
  orientation = "horizontal",
  label,
  className,
  ...props
}: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div
        className={cn("h-full w-px bg-border", className)}
        {...props}
      />
    );
  }

  if (label) {
    return (
      <div
        className={cn("flex items-center gap-3 w-full my-4", className)}
        {...props}
      >
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-text-dim">
          {label}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
    );
  }

  return (
    <div
      className={cn("h-px w-full bg-border my-3", className)}
      {...props}
    />
  );
}
