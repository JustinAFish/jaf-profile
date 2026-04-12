"use client";

import { Card } from "@/components/ui/card";
import {
  executiveSummaryItems,
  type ExecutiveSummaryItem,
} from "@/lib/executiveSummaryItems";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, type RefObject } from "react";
import {
  ABOUT_OVERLAP_VH,
  SCROLL_SCENE_ANIM_RATIO,
  SCROLL_SCENE_HEIGHT_VH,
} from "@/lib/homeAboutSection";

function itemBody(item: ExecutiveSummaryItem, compact: boolean) {
  const p = compact
    ? "text-base leading-snug text-white/90 sm:text-lg md:text-sm md:leading-snug lg:text-base lg:leading-snug xl:text-lg xl:leading-snug 2xl:text-xl 2xl:leading-relaxed"
    : "text-base md:text-lg text-white/90 leading-relaxed";
  const ul = compact
    ? "mt-3 list-[circle] space-y-2.5 pl-4 text-sm text-white/80 sm:text-base md:text-base lg:text-sm xl:text-base"
    : "mt-3 list-[circle] space-y-2 pl-5 text-sm md:text-base text-white/80";

  return (
    <>
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
  const phaseStart = 0.26;
  const phaseEnd = 0.86;
  const slot = (phaseEnd - phaseStart) / total;
  const start = phaseStart + index * slot;
  const end = Math.min(start + slot * 0.92, phaseEnd);

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
        <Card className="glass-surface flex h-full min-h-0 w-full flex-col overflow-visible border border-white/10 bg-surface-container-high/90 p-5 shadow-none sm:p-6 md:p-5 lg:p-7">
          {itemBody(item, true)}
        </Card>
      </motion.article>
    </div>
  );
}

function HomeAboutScrollScene({
  homeSectionRef,
}: {
  homeSectionRef: RefObject<HTMLElement | null>;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: homeSectionRef,
    offset: ["start start", "end start"],
  });

  /** 0→1 over the first `SCROLL_SCENE_ANIM_RATIO` of section scroll; then stays at 1 for `SCROLL_SCENE_HOLD_VH`. */
  const sceneProgress = useTransform(scrollYProgress, (v) =>
    Math.min(v / SCROLL_SCENE_ANIM_RATIO, 1),
  );

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
        marginTop: `-${ABOUT_OVERLAP_VH}vh`,
        height: `${SCROLL_SCENE_HEIGHT_VH}vh`,
      }}
    >
      {/* No nested overflow-y-auto on cards: it captures wheel/touch and fights document scroll. */}
      <div className="sticky top-[var(--site-header-height)] h-[calc(100dvh-var(--site-header-height))] overflow-x-clip overflow-y-visible bg-transparent [overscroll-behavior-y:none] touch-pan-y">
        <motion.div
          className="pointer-events-none absolute inset-0 z-[1] bg-black"
          style={{ opacity: scrollUnderlayOpacity }}
          aria-hidden
        />
        <div className="relative z-[2] flex h-full flex-col pointer-events-none">
          <motion.h2
            className="absolute z-20 w-full max-w-5xl px-4 text-center font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-4xl lg:text-5xl left-1/2 pointer-events-auto select-text drop-shadow-[0_2px_24px_rgba(0,0,0,0.85)]"
            style={{
              top: titleTop,
              scale: titleScale,
              opacity: titleOpacity,
              x: "-50%",
            }}
          >
            Executive Summary
          </motion.h2>

          {/* Clear space below absolute heading (title ~11% + line height); extra gap before cards */}
          <div className="flex min-h-0 flex-1 flex-col justify-start px-4 pt-[clamp(11.5rem,26vh,15.5rem)] pb-10 sm:px-6 sm:pt-[clamp(12rem,24vh,15rem)] sm:pb-12 md:px-8 md:pt-[clamp(12.5rem,23vh,15.5rem)] md:pb-14 lg:px-10 lg:pb-16">
            <div className="mx-auto w-full max-w-[min(88vw,1520px)] [perspective:900px]">
              <div className="grid grid-cols-2 items-stretch gap-5 sm:gap-6 md:grid-cols-4 md:gap-7 lg:gap-9 [transform-style:preserve-3d]">
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

function HomeAboutStatic() {
  return (
    <section
      id="about"
      data-about-variant="static"
      className="scroll-mt-[var(--site-header-height)] bg-black px-5 py-20 text-foreground sm:px-10 md:px-14 lg:px-20"
    >
      <h2 className="mb-10 text-center font-heading text-3xl font-bold text-white sm:text-4xl md:text-4xl lg:text-5xl">
        Executive Summary
      </h2>
      <div className="mx-auto grid w-full max-w-[min(88vw,1520px)] grid-cols-2 gap-6 sm:grid-cols-2 sm:gap-7 md:grid-cols-4 md:gap-8 lg:gap-9">
        {executiveSummaryItems.map((item) => (
          <Card
            key={item.id}
            className="glass-surface flex h-full min-h-0 flex-col overflow-y-auto border border-white/10 bg-surface-container-high/85 p-5 shadow-none sm:p-6 md:p-5 lg:p-7"
          >
            {itemBody(item, true)}
          </Card>
        ))}
      </div>
    </section>
  );
}

export default function HomeAbout({
  homeSectionRef,
}: {
  homeSectionRef: RefObject<HTMLElement | null>;
}) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion === true) {
    return <HomeAboutStatic />;
  }
  return <HomeAboutScrollScene homeSectionRef={homeSectionRef} />;
}
