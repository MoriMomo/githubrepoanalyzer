import * as React from "react";

const LazyMotion = React.lazy(() => import("./LazyMotionView"));

export interface MotionViewProps {
  children: React.ReactNode;
  animationKey?: string | number;
  className?: string;
}

export function MotionView({
  children,
  animationKey,
  className,
}: MotionViewProps) {
  return (
    <React.Suspense fallback={<div className={className}>{children}</div>}>
      <LazyMotion animationKey={animationKey} className={className}>
        {children}
      </LazyMotion>
    </React.Suspense>
  );
}
