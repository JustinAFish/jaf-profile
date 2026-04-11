"use client";

import { cn } from "@/lib/utils";

/** Same spectrum as hero `ShineBorder` on the MCA card */
const SHINE_STOPS =
  "#81ecff, #a68cff, #7e51ff, #81ecff, #a68cff, #7e51ff, #81ecff";

type ShineLineProps = {
  className?: string;
};

/**
 * Horizontal accent line with animated rainbow glimmer (matches ShineBorder colors / cadence).
 */
export function ShineLine({ className }: ShineLineProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "shine-line-glimmer relative h-[2px] w-12 shrink-0 overflow-visible rounded-full",
        "motion-safe:animate-shine-line",
        "transition-[width] duration-500 group-hover:w-20",
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(90deg, ${SHINE_STOPS})`,
        backgroundSize: "280% 100%",
        boxShadow:
          "0 0 6px rgba(129, 236, 255, 0.45), 0 0 14px rgba(166, 140, 255, 0.25), 0 0 20px rgba(126, 81, 255, 0.15)",
      }}
    />
  );
}
