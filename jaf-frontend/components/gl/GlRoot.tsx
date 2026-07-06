/**
 * Entry point for the WebGL ambience layer. Mounted once in the root layout;
 * renders nothing unless the useGlActive gate passes, and loads the actual
 * three.js canvas only on the client via next/dynamic (never in the server
 * bundle, never blocking LCP).
 */
"use client";

import dynamic from "next/dynamic";
import { useGlActive } from "./useGlActive";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

/** Conditionally mounts the shared scene canvas behind all page content. */
export function GlRoot() {
  const glActive = useGlActive();
  if (!glActive) return null;
  return <SceneCanvas />;
}
