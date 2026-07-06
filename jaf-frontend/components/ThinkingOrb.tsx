/**
 * Animated "AI thinking" orb — a layered conic-gradient sphere (cyan → violet)
 * with a blurred halo and a slow rotate/breathe pulse. Replaces the bouncing-dot
 * loader and doubles as the trailing cursor while a response streams in.
 * Renders a static gradient dot when the user prefers reduced motion.
 */
"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

interface ThinkingOrbProps {
  /** Diameter in pixels; use a small size (~14) for the inline streaming cursor. */
  size?: number;
  className?: string;
}

const ORB_GRADIENT =
  "conic-gradient(from 0deg, #81ecff, #57bcff, #7e51ff, #a68cff, #81ecff)";

/**
 * Thinking/streaming indicator orb. Purely decorative — hidden from the
 * accessibility tree; loading state is conveyed by surrounding content.
 */
export function ThinkingOrb({ size = 28, className = "" }: ThinkingOrbProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <span
        aria-hidden
        className={`inline-block rounded-full ${className}`}
        style={{
          width: size,
          height: size,
          background: ORB_GRADIENT,
          opacity: 0.85,
        }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Blurred halo behind the core */}
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{
          background: ORB_GRADIENT,
          filter: `blur(${Math.max(4, size / 3)}px)`,
        }}
        animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.25, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Rotating gradient core */}
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ background: ORB_GRADIENT }}
        animate={{ rotate: 360, scale: [1, 1.08, 1] }}
        transition={{
          rotate: { duration: 3.5, repeat: Infinity, ease: "linear" },
          scale: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
        }}
      />
      {/* Inner highlight to sell the sphere */}
      <span
        className="absolute rounded-full"
        style={{
          inset: size * 0.18,
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0) 55%)",
        }}
      />
    </span>
  );
}
