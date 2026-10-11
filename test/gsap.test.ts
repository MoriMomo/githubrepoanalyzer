import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isReducedMotion, staggerFadeUp, fadeIn, gsap } from "~/lib/gsap";

describe("GSAP Animation Integration (test/gsap.test.ts)", () => {
  const originalWindow = (globalThis as unknown as { window?: unknown }).window;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    (globalThis as unknown as { window?: unknown }).window = originalWindow;
    vi.restoreAllMocks();
  });

  it("exports a configured gsap instance", () => {
    expect(gsap).toBeDefined();
    expect(typeof gsap.to).toBe("function");
    expect(typeof gsap.fromTo).toBe("function");
    expect(typeof gsap.context).toBe("function");
  });

  it("detects prefers-reduced-motion correctly", () => {
    (globalThis as unknown as { window: { matchMedia: (query: string) => { matches: boolean } } }).window = {
      matchMedia: vi.fn().mockImplementation(() => ({
        matches: false,
      })),
    };
    expect(isReducedMotion()).toBe(false);

    (globalThis as unknown as { window: { matchMedia: (query: string) => { matches: boolean } } }).window = {
      matchMedia: vi.fn().mockImplementation(() => ({
        matches: true,
      })),
    };
    expect(isReducedMotion()).toBe(true);
  });

  it("respects reduced-motion preference in staggerFadeUp and fadeIn", () => {
    const mockElement = {} as Element;

    // Enable reduced motion
    (globalThis as unknown as { window: { matchMedia: () => { matches: boolean } } }).window = {
      matchMedia: vi.fn().mockImplementation(() => ({
        matches: true,
      })),
    };

    const setSpy = vi.spyOn(gsap, "set").mockReturnValue({} as gsap.core.Tween);
    staggerFadeUp(mockElement);
    expect(setSpy).toHaveBeenCalledWith(mockElement, { opacity: 1, y: 0 });

    fadeIn(mockElement);
    expect(setSpy).toHaveBeenCalledWith(mockElement, { opacity: 1 });
  });

  it("animates elements with fromTo when reduced motion is disabled", () => {
    const mockElement = {} as Element;

    // Disable reduced motion
    (globalThis as unknown as { window: { matchMedia: () => { matches: boolean } } }).window = {
      matchMedia: vi.fn().mockImplementation(() => ({
        matches: false,
      })),
    };

    const fromToSpy = vi.spyOn(gsap, "fromTo").mockReturnValue({} as gsap.core.Tween);
    staggerFadeUp(mockElement, { duration: 0.3, y: 12 });
    expect(fromToSpy).toHaveBeenCalledWith(
      mockElement,
      { opacity: 0, y: 12 },
      expect.objectContaining({ opacity: 1, y: 0, duration: 0.3 }),
    );

    fadeIn(mockElement, { duration: 0.2 });
    expect(fromToSpy).toHaveBeenCalledWith(
      mockElement,
      { opacity: 0 },
      expect.objectContaining({ opacity: 1, duration: 0.2 }),
    );
  });
});
