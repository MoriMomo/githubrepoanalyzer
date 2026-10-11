import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LazyMotionViewProps {
  children: React.ReactNode;
  animationKey?: string | number;
  className?: string;
}

export default function LazyMotionView({
  children,
  animationKey,
  className,
}: LazyMotionViewProps) {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={animationKey}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
