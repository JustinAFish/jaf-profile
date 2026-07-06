/**
 * Landing-page hero scene: a cyan→violet particle field that drifts with
 * sin-noise, repels away from the cursor, and — as the hero's 280vh scroll
 * choreography progresses (glBus.heroProgress) — flies past the camera and
 * fades, matching the existing faux-3D text exit. Single draw call.
 */
"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { glBus } from "@/lib/glBus";

const COUNT = 5000;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uPointer;
  attribute float aSeed;
  varying float vSeed;
  varying float vAlpha;

  void main() {
    vec3 p = position;

    // Layered sin drift — cheap curl-ish motion, unique per seed.
    p.x += sin(uTime * 0.28 + aSeed * 43.0) * 0.5;
    p.y += cos(uTime * 0.22 + aSeed * 71.0) * 0.5;
    p.z += sin(uTime * 0.15 + aSeed * 29.0) * 0.3;

    // Radial repulsion from the (world-space) pointer.
    vec2 fromPointer = p.xy - uPointer;
    float dist = length(fromPointer);
    float force = smoothstep(3.5, 0.0, dist);
    p.xy += normalize(fromPointer + 1e-4) * force * 1.8;

    // Scroll exit: points accelerate toward/past the camera and fade out.
    p.z += uScroll * (7.0 + aSeed * 10.0);
    vAlpha = 1.0 - smoothstep(0.35, 0.9, uScroll);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (2.0 + aSeed * 3.5) * (14.0 / max(0.5, -mv.z));
    vSeed = aSeed;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uCyan;
  uniform vec3 uViolet;
  varying float vSeed;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.08, d) * 0.5 * vAlpha;
    if (a < 0.005) discard;
    vec3 col = mix(uCyan, uViolet, vSeed);
    gl_FragColor = vec4(col, a);
  }
`;

export function HeroParticles() {
  const material = useRef<THREE.ShaderMaterial>(null!);
  const { viewport } = useThree();
  const pointerTarget = useRef(new THREE.Vector2());

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions.set(
        [
          (Math.random() - 0.5) * 24,
          (Math.random() - 0.5) * 13,
          (Math.random() - 0.5) * 6,
        ],
        i * 3,
      );
      seeds[i] = Math.random();
    }
    return { positions, seeds };
  }, []);

  useFrame((_, delta) => {
    const u = material.current.uniforms;
    u.uTime.value += delta;
    // Damp toward the bus values so pointer/scroll feel eased, not jittery.
    pointerTarget.current.set(
      (glBus.pointer.x * viewport.width) / 2,
      (glBus.pointer.y * viewport.height) / 2,
    );
    u.uPointer.value.lerp(pointerTarget.current, 0.08);
    u.uScroll.value += (glBus.heroProgress - u.uScroll.value) * 0.1;
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
          uScroll: { value: 0 },
          uPointer: { value: new THREE.Vector2() },
          uCyan: { value: new THREE.Color("#81ecff") },
          uViolet: { value: new THREE.Color("#7e51ff") },
        }}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </points>
  );
}
