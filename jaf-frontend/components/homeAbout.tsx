/**
 * Home page "About" / Executive Overview section: renders executive summary cards in one of three layouts:
 *   • Scroll scene (wide viewports): sticky scroll-driven animation — title scales in, cards "fly" in with scale/opacity/rotateX transforms tied to scroll progress
 *   • Flow (narrow): simple stacked cards (no scroll animation)
 *   • Static (reduced motion): 4-column grid, no animation
 * Black underlay fades in sync with hero scroll (not #about scroll) to avoid a visible seam over the hero image
 */
"use client";

import { Card } from "@/components/ui/card";
import { useMinWidth } from "@/hooks/useMinWidth";
import {
  executiveSummaryItems,
  type ExecutiveSummaryItem,
} from "@/lib/executiveSummaryItems";
import {
  ABOUT_OVERLAP_VH,
  ABOUT_SCENE_MIN_WIDTH_PX,
  SCROLL_SCENE_ANIM_RATIO,
  SCROLL_SCENE_HEIGHT_VH,
} from "@/lib/homeAboutSection";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

/** Renders one executive summary item (title, body, optional bullet list) with compact or spacious typography. */
function itemBody(
  item: ExecutiveSummaryItem,
  compact: boolean,
  /** Scroll-scene flying cards only: scale type on 2200px+ viewports. */
  ultrawide?: boolean,
) {
  // Tailwind class sets differ by layout: compact cards use smaller type and tighter spacing.
  const titleClass = compact
    ? ultrawide
      ? "mb-2 font-heading text-sm font-semibold tracking-tight text-primary sm:text-base md:mb-1.5 md:text-xs lg:text-sm xl:text-base 2xl:text-lg min-[2200px]:mb-3 min-[2200px]:text-6xl"
      : "mb-2 font-heading text-sm font-semibold tracking-tight text-primary sm:text-base md:mb-1.5 md:text-xs lg:text-sm xl:text-base 2xl:text-lg"
    : "mb-3 font-heading text-lg font-semibold tracking-tight text-primary md:text-xl";
  const p = compact
    ? ultrawide
      ? "whitespace-pre-line text-base leading-snug text-white/90 sm:text-lg md:text-sm md:leading-snug lg:text-base lg:leading-snug xl:text-lg xl:leading-snug 2xl:text-xl 2xl:leading-relaxed min-[2200px]:text-4xl min-[2200px]:leading-relaxed"
      : "whitespace-pre-line text-base leading-snug text-white/90 sm:text-lg md:text-sm md:leading-snug lg:text-base lg:leading-snug xl:text-lg xl:leading-snug 2xl:text-xl 2xl:leading-relaxed"
    : "whitespace-pre-line text-base md:text-lg text-white/90 leading-relaxed";
  const ul = compact
    ? ultrawide
      ? "mt-3 list-[circle] space-y-2.5 pl-4 text-sm text-white/80 sm:text-base md:text-base lg:text-sm xl:text-base min-[2200px]:mt-5 min-[2200px]:space-y-3.5 min-[2200px]:pl-6 min-[2200px]:text-2xl"
      : "mt-3 list-[circle] space-y-2.5 pl-4 text-sm text-white/80 sm:text-base md:text-base lg:text-sm xl:text-base"
    : "mt-3 list-[circle] space-y-2 pl-5 text-sm md:text-base text-white/80";

  return (
    <>
      <h3 className={titleClass}>{item.title}</h3>
      <p className={p}>{item.text}</p>
      {item.subpoints && item.subpoints.length > 0 ? (
        <ul className={ul}>
          {item.subpoints.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

const executiveSummaryFlowCardClass =
  "glass-surface flex min-h-0 flex-col border border-white/10 bg-surface-container-high/85 p-5 shadow-none sm:p-6 md:justify-center md:p-5 lg:p-7";

/** Document scroll + one card per item (narrow viewports; same idea as HomeSkillsStatic). */
function HomeAboutFlow() {
  // Single-column stack — no sticky/scroll math on small screens.
  return (
    <section
      id="about"
      data-about-variant="flow"
      className="scroll-mt-[var(--site-header-height)] bg-black px-5 py-20 text-foreground sm:px-10 md:px-14 lg:px-20"
    >
      <h2 className="mb-10 text-center font-heading text-3xl font-bold text-white sm:text-4xl md:text-4xl lg:text-5xl">
        Executive Overview
      </h2>
      <div className="mx-auto grid w-full max-w-[min(88vw,1520px)] grid-cols-1 gap-8">
        {executiveSummaryItems.map((item) => (
          <Card
            key={item.id}
            className={`${executiveSummaryFlowCardClass} select-text`}
          >
            {itemBody(item, true)}
          </Card>
        ))}
      </div>
    </section>
  );
}

/** Left-to-right: each card gets one scroll slice; zooms from small to full in its slot. */
function FlyingCard({
  item,
  index,
  total,
  scrollYProgress,
}: {
  item: ExecutiveSummaryItem;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  // Map scroll progress 0→1 onto a middle band (phaseStart→phaseEnd); divide that band evenly per card.
  const phaseStart = 0.26;
  const phaseEnd = 0.86;
  const slot = (phaseEnd - phaseStart) / total;
  const start = phaseStart + index * slot;
  const end = Math.min(start + slot * 0.92, phaseEnd);

  // Each card stays tiny until its slot, then scales, fades, and tilts into place.
  const scale = useTransform(scrollYProgress, [0, start, end], [0.14, 0.14, 1]);
  const opacity = useTransform(scrollYProgress, [0, start, start + slot * 0.06, end], [0, 0, 1, 1]);
  const rotateX = useTransform(scrollYProgress, [0, start, end], [0, 10, 0]);

  return (
    <div className="flex min-h-0 min-w-0 h-full justify-center self-stretch">
      <motion.article
        className="pointer-events-auto flex h-full min-h-0 w-full min-w-0 max-w-none flex-col origin-bottom select-text will-change-transform [transform-style:preserve-3d]"
        style={{
          opacity,
          scale,
          rotateX,
        }}
      >
        <Card className="glass-surface flex h-full min-h-0 w-full flex-col justify-center overflow-visible border border-white/10 bg-surface-container-high/90 p-5 shadow-none sm:p-6 md:p-5 lg:p-7 min-[2200px]:p-9">
          {itemBody(item, true, true)}
        </Card>
      </motion.article>
    </div>
  );
}

/** Wide-viewport sticky scroll scene: title animates in, then cards fly in sequentially. */
function HomeAboutScrollScene({
  homeSectionRef,
}: {
  homeSectionRef: RefObject<HTMLElement | null>;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRootRef = useRef<HTMLDivElement>(null);
  const [sectionMinHeightPx, setSectionMinHeightPx] = useState<number | null>(
    null,
  );

  // Section must be tall enough for scroll distance *and* sticky content; ResizeObserver keeps this in sync when cards reflow.
  const updateSectionMinHeight = useCallback(() => {
    const sticky = stickyRootRef.current;
    if (!sticky) return;
    const vh = window.innerHeight;
    const baselinePx = (SCROLL_SCENE_HEIGHT_VH / 100) * vh;
    const stickyH = Math.ceil(sticky.getBoundingClientRect().height);
    setSectionMinHeightPx(Math.max(baselinePx, stickyH));
  }, []);

  useLayoutEffect(() => {
    updateSectionMinHeight();
    const sticky = stickyRootRef.current;
    if (!sticky) return;
    const ro = new ResizeObserver(() => updateSectionMinHeight());
    ro.observe(sticky);
    window.addEventListener("resize", updateSectionMinHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateSectionMinHeight);
    };
  }, [updateSectionMinHeight]);

  // Progress while #about travels from top of viewport to top leaving viewport (drives sticky scene).
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Separate tracker on hero — used only for black underlay so fade matches hero unpinned, not about section timing.
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: homeSectionRef,
    offset: ["start start", "end start"],
  });

  /** 0→1 over the first `SCROLL_SCENE_ANIM_RATIO` of section scroll; then stays at 1 for the hold segment. */
  const sceneProgress = useTransform(scrollYProgress, (v) =>
    Math.min(v / SCROLL_SCENE_ANIM_RATIO, 1),
  );

  // Title entrance: grow from center, fade in, then move up to make room for the card grid.
  const titleScale = useTransform(sceneProgress, [0, 0.2], [0.06, 1]);
  const titleOpacity = useTransform(sceneProgress, [0, 0.05, 0.17], [0, 0.5, 1]);
  const titleTop = useTransform(sceneProgress, [0, 0.14, 0.36], ["44%", "44%", "11%"]);

  /**
   * Fades in with the hero’s own black ramp (not #about scene progress), so we never paint a second
   * black “sheet” over the image while the hero is still visible — avoids the moving seam.
   * Stays opaque after the hero unpins so the page background never flashes through.
   */
  const scrollUnderlayOpacity = useTransform(
    heroScrollProgress,
    [0.58, 0.82],
    [0, 1],
  );

  const total = executiveSummaryItems.length;

  return (
    <section
      ref={sectionRef}
      id="about"
      data-about-variant="scene"
      className="relative bg-transparent text-foreground scroll-mt-[var(--site-header-height)]"
      style={{
        // Pull section up under hero so scroll scene begins while hero is still visible.
        marginTop: `-${ABOUT_OVERLAP_VH}vh`,
        minHeight:
          sectionMinHeightPx !== null
            ? `${sectionMinHeightPx}px`
            : `${SCROLL_SCENE_HEIGHT_VH}vh`,
      }}
    >
      {/* No nested overflow-y on flying cards: it captures wheel/touch and fights document scroll. */}
      <div
        ref={stickyRootRef}
        className="sticky top-[var(--site-header-height)] min-h-[calc(100dvh-var(--site-header-height))] h-auto overflow-visible bg-transparent [overscroll-behavior-y:none] touch-pan-y min-[1216px]:overflow-x-clip min-[1216px]:overflow-y-visible"
      >
        <motion.div
          className="pointer-events-none absolute inset-0 z-[1] bg-black"
          style={{ opacity: scrollUnderlayOpacity }}
          aria-hidden
        />
        <div className="relative z-[2] flex flex-col pointer-events-none">
          <motion.h2
            className="absolute z-20 w-full max-w-5xl px-4 text-center font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-4xl lg:text-5xl left-1/2 pointer-events-auto select-text drop-shadow-[0_2px_24px_rgba(0,0,0,0.85)]"
            style={{
              top: titleTop,
              scale: titleScale,
              opacity: titleOpacity,
              x: "-50%",
            }}
          >
            Executive Overview
          </motion.h2>

          {/* Clear space below absolute heading (title ~11% + line height); extra gap before cards */}
          <div className="flex flex-col justify-start px-4 pt-[clamp(11.5rem,26vh,15.5rem)] pb-10 sm:px-6 sm:pt-[clamp(12rem,24vh,15rem)] sm:pb-12 md:px-8 md:pt-[clamp(12.5rem,23vh,15.5rem)] md:pb-14 lg:px-10 lg:pb-16 [@media(min-width:768px)_and_(max-width:1215px)]:!pt-[clamp(10.5rem,18vh,13.5rem)] [@media(min-width:768px)_and_(max-width:1215px)]:!pb-[clamp(4rem,11vh,7rem)] [@media(min-width:1216px)_and_(max-height:920px)]:!pb-[clamp(3.5rem,10vh,6rem)]">
            <div className="mx-auto w-full max-w-[min(88vw,1520px)] min-[2200px]:max-w-[min(88vw,2100px)] min-[2200px]:[perspective:1200px] [perspective:900px]">
              {/* Below 1216px, 4 columns are too narrow and rows exceed the sticky viewport; 2×4 matches readable width. */}
              <div className="grid grid-cols-2 items-stretch gap-6 [transform-style:preserve-3d] min-[1216px]:grid-cols-3 min-[1216px]:gap-7 xl:gap-9 min-[2200px]:gap-11">
                {executiveSummaryItems.map((item, index) => (
                  <FlyingCard
                    key={item.id}
                    item={item}
                    index={index}
                    total={total}
                    scrollYProgress={sceneProgress}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Reduced-motion fallback: static 4-column grid, no scroll-linked transforms. */
function HomeAboutStatic() {
  return (
    <section
      id="about"
      data-about-variant="static"
      className="scroll-mt-[var(--site-header-height)] bg-black px-5 py-20 text-foreground sm:px-10 md:px-14 lg:px-20"
    >
      <h2 className="mb-10 text-center font-heading text-3xl font-bold text-white sm:text-4xl md:text-4xl lg:text-5xl">
        About Me
      </h2>
      <div className="mx-auto grid w-full max-w-[min(88vw,1520px)] grid-cols-1 gap-8 md:grid-cols-4 md:gap-8 lg:gap-9">
        {executiveSummaryItems.map((item) => (
          <Card
            key={item.id}
            className={`${executiveSummaryFlowCardClass} select-text`}
          >
            {itemBody(item, true)}
          </Card>
        ))}
      </div>
    </section>
  );
}

/** Picks layout by motion preference and viewport width; scroll scene needs hero ref for underlay sync. */
export default function HomeAbout({
  homeSectionRef,
}: {
  homeSectionRef: RefObject<HTMLElement | null>;
}) {
  const prefersReducedMotion = useReducedMotion();
  const wideForAboutScene = useMinWidth(ABOUT_SCENE_MIN_WIDTH_PX);

  if (prefersReducedMotion === true) {
    return <HomeAboutStatic />;
  }
  if (wideForAboutScene !== true) {
    return <HomeAboutFlow />;
  }
  return <HomeAboutScrollScene homeSectionRef={homeSectionRef} />;
}
