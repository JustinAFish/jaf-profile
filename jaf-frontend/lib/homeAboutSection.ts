/** Scroll distance (vh) over which the pinned #about scene animates 0→1. Shorter = less “stuck” feel. */
export const SCROLL_SCENE_ANIM_HEIGHT_VH = 185;
/**
 * Extra section height (vh) after the scene reaches full progress: scroll advances but the layout
 * stays fixed so readers can finish the Executive Summary cards before #about unpins.
 */
export const SCROLL_SCENE_HOLD_VH = 125;
export const SCROLL_SCENE_HEIGHT_VH =
  SCROLL_SCENE_ANIM_HEIGHT_VH + SCROLL_SCENE_HOLD_VH;

/** Matches `sceneProgress` clamp in `homeAbout.tsx`: full cards when raw section progress ≥ this. */
export const SCROLL_SCENE_ANIM_RATIO =
  SCROLL_SCENE_ANIM_HEIGHT_VH / SCROLL_SCENE_HEIGHT_VH;

export const ABOUT_OVERLAP_VH = 180;

/**
 * Scroll so the Executive Summary scroll-scene shows all cards (animation complete).
 * For the reduced-motion static block, scrolls to the section start only.
 */
export function scrollToAboutSectionComplete(opts?: {
  behavior?: ScrollBehavior;
}): boolean {
  if (typeof document === "undefined") return false;
  const el = document.getElementById("about");
  if (!el) return false;

  const behavior = opts?.behavior ?? "smooth";
  const scrollMarginTop = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  const absTop = el.getBoundingClientRect().top + window.scrollY;
  const yAlignStart = absTop - scrollMarginTop;

  const variant = el.getAttribute("data-about-variant");
  if (variant === "static") {
    window.scrollTo({ top: Math.max(0, yAlignStart), behavior });
    return true;
  }

  const height = el.offsetHeight;
  const targetY = yAlignStart + SCROLL_SCENE_ANIM_RATIO * height;
  window.scrollTo({ top: Math.max(0, targetY), behavior });
  return true;
}
