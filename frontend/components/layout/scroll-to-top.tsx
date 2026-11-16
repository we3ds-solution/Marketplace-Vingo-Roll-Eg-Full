"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const SHOW_AFTER = 360;
const RING_RADIUS = 23;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Circular "back to top" button with a scroll-progress ring around the arrow.
 * Fixed bottom-right; appears past `SHOW_AFTER` px, fades/scales in/out.
 * Smooth scrolling, unless the user prefers reduced motion.
 */
export function ScrollToTop() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const current = Math.max(0, Math.min(1, max > 0 ? window.scrollY / max : 0));
      setProgress(current);
      setVisible(window.scrollY > SHOW_AFTER);
    };

    const onScroll = () => update();

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const [everShown, setEverShown] = useState(false);

  useEffect(() => {
    if (visible) setEverShown(true);
  }, [visible]);

  const ringOffset = RING_CIRCUMFERENCE * (1 - progress);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" })}
      aria-label="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "group fixed bottom-6 end-5 z-40 flex h-14 w-14 items-center justify-center rounded-full",
        "border border-accent/40 bg-card/85 text-accent shadow-lg backdrop-blur-md",
        "hover:shadow-accent/25 hover:scale-110",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        visible
          ? "pointer-events-auto animate-scroll-btn-in opacity-100"
          : everShown
            ? "pointer-events-none animate-scroll-btn-out opacity-0"
            : "pointer-events-none opacity-0",
      )}
    >
      {/* Progress ring */}
      <svg
        viewBox="0 0 56 56"
        className="absolute inset-0 h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <circle cx="28" cy="28" r={RING_RADIUS} fill="none" strokeWidth="2" className="stroke-muted/40" />
        <circle
          cx="28"
          cy="28"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={ringOffset}
          className="stroke-accent transition-[stroke-dashoffset] duration-150 ease-out"
        />
      </svg>
      <ArrowUp
        className="relative h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5"
        aria-hidden="true"
      />
    </button>
  );
}
