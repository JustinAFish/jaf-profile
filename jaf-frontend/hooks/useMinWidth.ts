"use client";

import { useEffect, useState } from "react";

/**
 * `null` until mounted (use for SSR-safe defaults). Then whether `window` is at least `minWidth` px.
 */
export function useMinWidth(minWidth: number): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [minWidth]);

  return matches;
}
