import { useLayoutEffect, useEffect } from "react";
import gsap from "gsap";

/**
 * Checks if the user prefers reduced motion.
 */
export function isReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Custom React hook for scoped GSAP animations with automatic React 19 cleanup (via gsap.context()).
 * Automatically bypasses motion when the user prefers reduced motion.
 */
export function useGSAP(
  callback: (context: gsap.Context) => void | (() => void),
  deps: React.DependencyList = [],
  scopeRef?: React.RefObject<Element | null>,
): void {
  useIsomorphicLayoutEffect(() => {
    const prefersReduced = isReducedMotion();

    const ctx = gsap.context((self) => {
      if (prefersReduced) {
        gsap.globalTimeline.timeScale(100);
      } else {
        gsap.globalTimeline.timeScale(1);
      }
      return callback(self);
    }, scopeRef?.current || undefined);

    return () => {
      ctx.revert();
    };
  }, deps);
}

/**
 * Reusable micro-animation: staggered fade-up for cards, badges, and bullet lists.
 * Respects 'prefers-reduced-motion' by setting final values immediately.
 */
export function staggerFadeUp(
  target: gsap.DOMTarget,
  options: {
    duration?: number;
    stagger?: number;
    y?: number;
    delay?: number;
    ease?: string;
  } = {},
): gsap.core.Tween | gsap.core.Timeline | void {
  if (isReducedMotion()) {
    gsap.set(target, { opacity: 1, y: 0 });
    return;
  }

  const {
    duration = 0.35,
    stagger = 0.08,
    y = 10,
    delay = 0,
    ease = "power2.out",
  } = options;

  return gsap.fromTo(
    target,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      delay,
      ease,
      clearProps: "transform,opacity",
    },
  );
}

/**
 * Reusable micro-animation: smooth fade-in for alert callouts and lineage pills.
 */
export function fadeIn(
  target: gsap.DOMTarget,
  options: {
    duration?: number;
    delay?: number;
  } = {},
): gsap.core.Tween | void {
  if (isReducedMotion()) {
    gsap.set(target, { opacity: 1 });
    return;
  }

  const { duration = 0.25, delay = 0 } = options;

  return gsap.fromTo(
    target,
    { opacity: 0 },
    {
      opacity: 1,
      duration,
      delay,
      ease: "power1.out",
      clearProps: "opacity",
    },
  );
}

export { gsap };
