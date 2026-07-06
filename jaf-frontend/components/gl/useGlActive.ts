/**
 * Shared gate for the WebGL ambience layer. GL is active only when the device
 * and user allow it: motion not reduced, WebGL available, no data-saver, and
 * not running under Playwright (NEXT_PUBLIC_E2E). The probe result is cached
 * module-wide so the context check runs once per page load.
 */
"use client";

import { useSyncExternalStore } from "react";

let cachedDecision: boolean | null = null;

/** Probes the environment once; safe to call repeatedly. */
function decideGlActive(): boolean {
  if (cachedDecision !== null) return cachedDecision;
  if (typeof window === "undefined") return false;

  let ok = true;
  if (process.env.NEXT_PUBLIC_E2E === "true") ok = false;
  if (ok && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    ok = false;
  }
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  if (ok && connection?.saveData) ok = false;
  if (ok) {
    try {
      const canvas = document.createElement("canvas");
      ok = !!(
        canvas.getContext("webgl2") ??
        canvas.getContext("webgl")
      );
    } catch {
      ok = false;
    }
  }

  cachedDecision = ok;
  return ok;
}

const subscribe = () => () => {};

/**
 * True when the WebGL ambience layer should render (and static fallbacks hide).
 * Server-renders false, so fallback visuals are always the SSR/hydration state.
 */
export function useGlActive(): boolean {
  return useSyncExternalStore(subscribe, decideGlActive, () => false);
}
