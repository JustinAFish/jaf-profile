/**
 * Site-wide ambience: a sparse, slowly drifting field of faint cyan points —
 * the WebGL successor to the AppChrome SVG grid ("digital ground", ~5% opacity).
 * Rendered on every route beneath the per-route hero/chat scenes.
 */
"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 900;

const vertexShader = /* glsl */ `
  uniform float uTime;
  attribute float aSeed;
  varying float vSeed;

  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.05 + aSeed * 50.0) * 0.6;
    p.y += cos(uTime * 0.04 + aSeed * 80.0) * 0.6;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.5 + aSeed * 2.0) * (10.0 / -mv.z);
    vSeed = aSeed;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying float vSeed;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    // Slow per-point twinkle keeps the field alive without drawing attention.
    float twinkle = 0.7 + 0.3 * sin(uTime * 0.3 + vSeed * 120.0);
    float a = smoothstep(0.5, 0.1, d) * 0.07 * twinkle;
    if (a < 0.005) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

export function AmbientField() {
  const material = useRef<THREE.ShaderMaterial>(null!);

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions.set(
        [
          (Math.random() - 0.5) * 36,
          (Math.random() - 0.5) * 20,
          -4 + Math.random() * 3,
        ],
        i * 3,
      );
      seeds[i] = Math.random();
    }
    return { positions, seeds };
  }, []);

  useFrame((_, delta) => {
    material.current.uniforms.uTime.value += delta;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uColor: { value: new THREE.Color("#81ecff") },
        }}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </points>
  );
}
