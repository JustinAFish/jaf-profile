/**
 * Fixed grid overlay — DESIGN.md “Grid Overlay” (subtle digital ground, ~5% opacity).
 */
export function AppChrome() {
  const gridSvg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><defs><pattern id="g" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M64 0H0V64" fill="none" stroke="%2381ecff" stroke-width="0.5" opacity="0.35"/><path d="M0 0h64v64H0z" fill="none" stroke="%2381ecff" stroke-width="0.35" opacity="0.2"/></pattern></defs><rect width="100%" height="100%" fill="url(%23g)"/></svg>`,
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] opacity-[0.05]"
      style={{
        backgroundImage: `url("data:image/svg+xml,${gridSvg}")`,
      }}
    />
  );
}
