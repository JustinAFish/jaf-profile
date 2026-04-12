/** Minimum viewport width (px) for the scroll-driven Skills fan-out; below this, grid layout is used. */
export const SKILLS_SCENE_MIN_WIDTH_PX = 1024;

/**
 * Scroll distance (vh) over which the pinned #skills scene animates 0→1.
 * Higher = more wheel/trackpad travel before the fan-out finishes (avoids rushing past the sprout).
 */
export const SKILLS_SCROLL_SCENE_ANIM_HEIGHT_VH = 175;
/**
 * Extra section height (vh) after the fan-out finishes: scroll still advances but `sceneProgress`
 * stays at 1 so the layout is frozen while the user reads. Larger = longer “dead” scroll before #skills unpins.
 */
export const SKILLS_SCROLL_SCENE_HOLD_VH = 145;
export const SKILLS_SCROLL_SCENE_HEIGHT_VH =
  SKILLS_SCROLL_SCENE_ANIM_HEIGHT_VH + SKILLS_SCROLL_SCENE_HOLD_VH;

/** Matches `sceneProgress` clamp in `homeSkills.tsx`: full fan when raw section progress ≥ this. */
export const SKILLS_SCROLL_SCENE_ANIM_RATIO =
  SKILLS_SCROLL_SCENE_ANIM_HEIGHT_VH / SKILLS_SCROLL_SCENE_HEIGHT_VH;

/**
 * Scroll so the pinned Skills scene shows all cards spread (animation at full progress).
 * For the static grid layout, scrolls to the section start only.
 */
export function scrollToSkillsSectionComplete(opts?: {
  behavior?: ScrollBehavior;
}): boolean {
  if (typeof document === "undefined") return false;
  const el = document.getElementById("skills");
  if (!el) return false;

  const behavior = opts?.behavior ?? "smooth";
  const scrollMarginTop = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  const absTop = el.getBoundingClientRect().top + window.scrollY;
  const yAlignStart = absTop - scrollMarginTop;

  const variant = el.getAttribute("data-skills-variant");
  if (variant !== "scene") {
    window.scrollTo({ top: Math.max(0, yAlignStart), behavior });
    return true;
  }

  const height = el.offsetHeight;
  const targetY = yAlignStart + SKILLS_SCROLL_SCENE_ANIM_RATIO * height;
  window.scrollTo({ top: Math.max(0, targetY), behavior });
  return true;
}
