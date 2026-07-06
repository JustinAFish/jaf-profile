/**
 * Frame-rate mutable bridge between DOM-land (scroll progress, pointer position,
 * chat streaming state) and the WebGL scenes. Components write to it imperatively;
 * scenes read it inside useFrame — it never triggers React renders.
 */

export const glBus = {
  /** Hero scroll progress 0..1, fed from homeHero's scrollYProgress MotionValue. */
  heroProgress: 0,
  /** Pointer in normalized device coordinates, -1..1 on both axes. */
  pointer: { x: 0, y: 0 },
  /** True while an assistant response is in flight. */
  chatThinking: false,
  /** Monotonic counter bumped on each streamed token flush; scenes ripple on change. */
  chatStreamPulse: 0,
};
