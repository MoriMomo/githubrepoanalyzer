import * as React from "react";
import { cn } from "~/lib/utils";

export interface PanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, title, subtitle, badge, actions, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-md border border-border bg-surface overflow-hidden",
          className,
        )}
        {...props}
      >
        {(title || actions || badge) && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border bg-surface-2/40">
            <div className="flex items-center gap-2.5">
              {title && (
                <h3 className="font-display font-semibold text-xs tracking-tight text-text">
                  {title}
                </h3>
              )}
              {badge}
              {subtitle && (
                <p className="text-[11px] text-text-dim font-normal hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    );
  },
);
Panel.displayName = "Panel";
