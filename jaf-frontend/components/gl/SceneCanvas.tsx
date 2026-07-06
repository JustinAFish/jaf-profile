/**
 * The single shared WebGL canvas: fixed fullscreen at z-[1] (same layer as the
 * AppChrome grid it replaces), beneath the z-[2] content wrapper. One context
 * for the whole app — scenes swap per route via usePathname. Rendering pauses
 * entirely while the tab is hidden.
 */
"use client";

import { Canvas } from "@react-three/fiber";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AmbientField } from "./scenes/AmbientField";
import { HeroParticles } from "./scenes/HeroParticles";
import { ChatAmbient } from "./scenes/ChatAmbient";

export default function SceneCanvas() {
  const pathname = usePathname();
  const [frameloop, setFrameloop] = useState<"always" | "never">("always");

  useEffect(() => {
    const onVisibility = () =>
      setFrameloop(document.visibilityState === "hidden" ? "never" : "always");
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[1]">
      <Canvas
        frameloop={frameloop}
        // DPR cap is the biggest single perf lever on retina/mobile screens.
        dpr={[1, 1.75]}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 8], fov: 50 }}
      >
        <AmbientField />
        {pathname === "/" && <HeroParticles />}
        {pathname.startsWith("/chat") && <ChatAmbient />}
      </Canvas>
    </div>
  );
}
