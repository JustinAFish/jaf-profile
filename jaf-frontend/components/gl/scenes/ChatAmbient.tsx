/**
 * Chat-route ambience: a slow orbital particle cloud that "wakes up" while the
 * assistant is responding — energy (speed + brightness) eases up when
 * glBus.chatThinking is set, and each streamed token flush (chatStreamPulse)
 * triggers a brief brightness ripple that decays over ~a second.
 */
"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { glBus } from "@/lib/glBus";

const COUNT = 1600;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uEnergy;
  attribute float aSeed;
  attribute float aRadius;
  attribute float aAngle;
  varying float vSeed;

  void main() {
    // Orbit in the xy plane; energy speeds the orbit up subtly.
    float speed = (0.02 + aSeed * 0.05) * (1.0 + uEnergy * 2.0);
    float angle = aAngle + uTime * speed;
    vec3 p = vec3(
      cos(angle) * aRadius,
      sin(angle) * aRadius * 0.55,
      position.z
    );
    p.y += sin(uTime * 0.2 + aSeed * 90.0) * 0.4;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.8 + aSeed * 2.6) * (12.0 / max(0.5, -mv.z));
    vSeed = aSeed;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uEnergy;
  uniform float uRipple;
  uniform vec3 uCyan;
  uniform vec3 uViolet;
  varying float vSeed;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float base = 0.10 + uEnergy * 0.18 + uRipple * 0.15;
    float a = smoothstep(0.5, 0.1, d) * base;
    if (a < 0.005) discard;
    vec3 col = mix(uCyan, uViolet, vSeed);
    gl_FragColor = vec4(col, a);
  }
`;

export function ChatAmbient() {
  const material = useRef<THREE.ShaderMaterial>(null!);
  const lastPulse = useRef(0);
  const rippleAge = useRef(10);

  const { positions, seeds, radii, angles } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    const radii = new Float32Array(COUNT);
    const angles = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions.set([0, 0, -3 + Math.random() * 4], i * 3);
      seeds[i] = Math.random();
      radii[i] = 4 + Math.random() * 12;
      angles[i] = Math.random() * Math.PI * 2;
    }
    return { positions, seeds, radii, angles };
  }, []);

  useFrame((_, delta) => {
    const u = material.current.uniforms;
    u.uTime.value += delta;

    const targetEnergy = glBus.chatThinking ? 1 : 0;
    u.uEnergy.value += (targetEnergy - u.uEnergy.value) * Math.min(1, delta * 2);

    if (glBus.chatStreamPulse !== lastPulse.current) {
      lastPulse.current = glBus.chatStreamPulse;
      rippleAge.current = 0;
    }
    rippleAge.current += delta;
    u.uRipple.value = Math.exp(-rippleAge.current * 3);
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
        <bufferAttribute attach="attributes-aRadius" args={[radii, 1]} />
        <bufferAttribute attach="attributes-aAngle" args={[angles, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uEnergy: { value: 0 },
          uRipple: { value: 0 },
          uCyan: { value: new THREE.Color("#81ecff") },
          uViolet: { value: new THREE.Color("#7e51ff") },
        }}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </points>
  );
}
