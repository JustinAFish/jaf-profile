"use client";

import { Card } from "@nextui-org/react";
import { ShineBorder } from "@/components/magicui/shine-border";
import { ShineLine } from "@/components/magicui/shine-line";
import { Award } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { forwardRef, useEffect, useRef, type Ref } from "react";

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else ref.current = value;
}

const HomeHero = forwardRef<HTMLElement, object>(function HomeHero(_props, forwardedRef) {
  const scrollRootRef = useRef<HTMLElement | null>(null);
  const setSectionRef = (el: HTMLElement | null) => {
    scrollRootRef.current = el;
    assignRef(forwardedRef, el);
  };
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = prefersReducedMotion === true;

  const { scrollYProgress } = useScroll({
    target: scrollRootRef,
    offset: ["start start", "end start"],
  });

  const bgOpacity = useTransform(
    scrollYProgress,
    [0, 0.35, 0.58],
    reduceMotion ? [1, 0.85, 0.5] : [1, 0.55, 0.15],
  );
  const bgScale = useTransform(
    scrollYProgress,
    [0, 0.55],
    reduceMotion ? [1, 1] : [1, 1.12],
  );

  /** Ramp to solid black before the #about overlap reads as a separate “black sheet”. */
  const blackOpacity = useTransform(
    scrollYProgress,
    [0.18, 0.42, 0.58, 0.78],
    [0, 0.38, 0.78, 1],
  );

  const exitEnd = 0.52;

  const leftScale = useTransform(
    scrollYProgress,
    [0, exitEnd],
    reduceMotion ? [1, 1] : [1, 2.35],
  );
  /** Nearly edge-on + twist so copy visibly rolls off the left/top of the viewport */
  const leftRotateY = useTransform(
    scrollYProgress,
    [0, exitEnd],
    reduceMotion ? [0, 0] : [0, -92],
  );
  const leftRotateX = useTransform(
    scrollYProgress,
    [0, exitEnd],
    reduceMotion ? [0, 0] : [0, 48],
  );
  const leftRotateZ = useTransform(
    scrollYProgress,
    [0, exitEnd],
    reduceMotion ? [0, 0] : [0, -32],
  );
  const leftX = useTransform(
    scrollYProgress,
    [0, exitEnd],
    reduceMotion ? ["0vw", "0vw"] : ["0vw", "-108vw"],
  );
  const leftY = useTransform(
    scrollYProgress,
    [0, exitEnd],
    reduceMotion ? ["0vh", "0vh"] : ["0vh", "-95vh"],
  );
  const leftOpacity = useTransform(
    scrollYProgress,
    [0.1, 0.22, 0.5],
    reduceMotion ? [1, 1, 0.25] : [1, 1, 0],
  );

  const rightScale = useTransform(
    scrollYProgress,
    [0, exitEnd],
    reduceMotion ? [1, 1] : [1, 2.45],
  );
  const rightRotateY = useTransform(
    scrollYProgress,
    [0, exitEnd],
    reduceMotion ? [0, 0] : [0, 94],
  );
  const rightRotateX = useTransform(
    scrollYProgress,
    [0, exitEnd],
    reduceMotion ? [0, 0] : [0, 44],
  );
  const rightRotateZ = useTransform(
    scrollYProgress,
    [0, exitEnd],
    reduceMotion ? [0, 0] : [0, 36],
  );
  const rightX = useTransform(
    scrollYProgress,
    [0, exitEnd],
    reduceMotion ? ["0vw", "0vw"] : ["0vw", "112vw"],
  );
  const rightY = useTransform(
    scrollYProgress,
    [0, exitEnd],
    reduceMotion ? ["0vh", "0vh"] : ["0vh", "-88vh"],
  );
  const rightOpacity = useTransform(
    scrollYProgress,
    [0.12, 0.24, 0.52],
    reduceMotion ? [1, 1, 0.2] : [1, 1, 0],
  );

  useEffect(() => {
    const titles = [
      "Full Stack Data Scientist",
      "Product Owner",
      "Solution Architect",
    ];
    let index = 0;
    const changingText = document.getElementById("changing-text");

    if (!changingText) {
      return;
    }

    const interval = setInterval(() => {
      index = (index + 1) % titles.length;
      changingText.style.opacity = "0";

      setTimeout(() => {
        changingText.textContent = titles[index];
        changingText.style.opacity = "1";
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={setSectionRef}
      id="home"
      className="relative -mt-[var(--site-header-height)] h-[280vh] scroll-mt-[var(--site-header-height)]"
    >
      <div className="sticky top-0 h-[100dvh] min-h-[100dvh] overflow-hidden flex items-start lg:items-center pt-[var(--site-header-height)] pb-8 sm:pb-12 md:pb-10 lg:pb-16 xl:pb-20 2xl:pb-28 min-[1800px]:pb-32">
        <motion.div
          className="absolute inset-0 z-0"
          style={{ opacity: bgOpacity, scale: bgScale }}
        >
          <Image
            src="/data-background.jpeg"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-surface/75" />
        </motion.div>

        <motion.div
          className="absolute inset-0 z-[15] bg-black pointer-events-none"
          style={{ opacity: blackOpacity }}
          aria-hidden
        />

        <motion.div
          className="relative z-10 w-full max-w-7xl xl:max-w-[84rem] 2xl:max-w-[min(112rem,92vw)] min-[1800px]:max-w-[min(132rem,94vw)] min-[2200px]:max-w-[min(152rem,96vw)] mx-auto px-5 sm:px-8 md:px-8 lg:px-16 xl:px-20 2xl:px-16 min-[1800px]:px-20 min-[2200px]:px-24 [perspective:min(900px,100vw)] [perspective-origin:50%_45%]"
        >
          <div
            className="grid lg:grid-cols-2 gap-8 md:gap-9 lg:gap-16 xl:gap-20 2xl:gap-32 min-[1800px]:gap-44 min-[2200px]:gap-56 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.22fr)] min-[1800px]:grid-cols-[minmax(0,1fr)_minmax(0,1.28fr)] items-start lg:items-center"
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.div
              className="space-y-6 md:space-y-7 lg:space-y-12 xl:space-y-14 2xl:space-y-16 pt-2 sm:pt-3 md:pt-3 lg:pt-8 xl:pt-10 w-full 2xl:justify-self-start origin-left will-change-transform [transform-style:preserve-3d]"
              style={{
                scale: leftScale,
                rotateX: leftRotateX,
                rotateY: leftRotateY,
                rotateZ: leftRotateZ,
                x: leftX,
                y: leftY,
                opacity: leftOpacity,
              }}
            >
              <div className="space-y-3 sm:space-y-4 md:space-y-4 xl:space-y-6 2xl:space-y-8">
                <span className="inline-block px-2.5 py-0.5 md:px-3 md:py-1 xl:px-4 xl:py-1.5 2xl:px-5 2xl:py-2 text-[9px] sm:text-[10px] md:text-[10px] xl:text-xs 2xl:text-sm min-[1800px]:text-base font-heading uppercase tracking-[0.3em] text-primary border border-primary/30 rounded-sm bg-primary/5">
                  Mission strategy
                </span>
                <h1 className="font-heading text-4xl sm:text-5xl md:text-5xl lg:text-7xl xl:text-8xl 2xl:text-8xl min-[1800px]:text-9xl font-bold text-foreground tracking-tighter leading-[0.95]">
                  Innovative <br />
                  <span className="text-primary">strategic</span> <br />
                  leader.
                </h1>
                <p
                  id="changing-text"
                  className="text-base sm:text-lg md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl min-[1800px]:text-4xl text-tertiary transition-opacity duration-500 font-medium tracking-tight"
                >
                  Full Stack Data Scientist
                </p>
              </div>

              <div className="max-w-md sm:max-w-lg md:max-w-lg xl:max-w-xl 2xl:max-w-2xl min-[1800px]:max-w-3xl space-y-5 md:space-y-6 xl:space-y-10 2xl:space-y-12">
                <p className="text-base sm:text-lg md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl min-[1800px]:text-4xl text-muted-foreground font-light leading-snug md:leading-relaxed">
                  Innovative strategic leader with a proven track record of
                  leveraging AI to drive business growth.
                </p>
                <div className="flex flex-col gap-3 md:gap-3.5 xl:gap-5 2xl:gap-6">
                  <a
                    href="/data/Justin_Fish_CV_2025.pdf"
                    download="Justin_Fish_CV_2025.pdf"
                    className="flex items-center gap-3 md:gap-3.5 xl:gap-5 2xl:gap-6 group cursor-pointer"
                  >
                    <div className="w-10 sm:w-11 md:w-11 xl:w-14 2xl:w-16 min-[1800px]:w-20 h-px bg-primary group-hover:w-16 sm:group-hover:w-[4.5rem] md:group-hover:w-[4.5rem] xl:group-hover:w-24 2xl:group-hover:w-28 min-[1800px]:group-hover:w-32 transition-all duration-500" />
                    <span className="font-heading text-xs sm:text-sm md:text-sm xl:text-base 2xl:text-lg min-[1800px]:text-xl uppercase tracking-widest text-foreground/90 group-hover:text-primary transition-colors">
                      Download CV
                    </span>
                  </a>
                  <Link
                    href="/chat"
                    className="flex items-center gap-3 md:gap-3.5 xl:gap-5 2xl:gap-6 group cursor-pointer"
                  >
                    <ShineLine className="w-10 sm:w-11 md:w-11 xl:w-14 2xl:w-16 min-[1800px]:w-20 group-hover:w-16 sm:group-hover:w-[4.5rem] md:group-hover:w-[4.5rem] xl:group-hover:w-24 2xl:group-hover:w-28 min-[1800px]:group-hover:w-32 h-px sm:h-px md:h-px xl:h-[2.5px] 2xl:h-[3px]" />
                    <span className="font-heading text-xs sm:text-sm md:text-sm xl:text-base 2xl:text-lg min-[1800px]:text-xl uppercase tracking-widest text-foreground/90 group-hover:text-primary transition-colors">
                      AI chat
                    </span>
                  </Link>
                </div>
              </div>

              <div className="pt-5 sm:pt-6 md:pt-6 xl:pt-10 2xl:pt-12 grid grid-cols-2 gap-4 sm:gap-5 md:gap-6 xl:gap-10 2xl:gap-12 border-t border-outline/20 max-w-sm sm:max-w-md md:max-w-md xl:max-w-lg 2xl:max-w-xl min-[1800px]:max-w-2xl">
                <div>
                  <div className="text-[9px] sm:text-[10px] md:text-[10px] xl:text-xs 2xl:text-sm min-[1800px]:text-base font-heading text-muted-foreground uppercase tracking-widest mb-0.5 md:mb-1 xl:mb-2">
                    Coordinates
                  </div>
                  <div className="text-xs sm:text-sm md:text-sm xl:text-base 2xl:text-lg min-[1800px]:text-xl font-heading text-foreground">
                    LAT: 51.5074° N
                    <br />
                    LNG: 0.1278° W
                  </div>
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] md:text-[10px] xl:text-xs 2xl:text-sm min-[1800px]:text-base font-heading text-muted-foreground uppercase tracking-widest mb-0.5 md:mb-1 xl:mb-2">
                    Status
                  </div>
                  <div className="text-xs sm:text-sm md:text-sm xl:text-base 2xl:text-lg min-[1800px]:text-xl font-heading text-primary flex items-center gap-1.5 md:gap-2 xl:gap-3">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2 md:h-2 xl:w-2.5 xl:h-2.5 2xl:w-3 2xl:h-3 rounded-full bg-primary animate-pulse shrink-0" />
                    ACTIVE_SYSTEM
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative w-full flex justify-center lg:justify-end 2xl:w-full origin-right will-change-transform [transform-style:preserve-3d]"
              style={{
                scale: rightScale,
                rotateX: rightRotateX,
                rotateY: rightRotateY,
                rotateZ: rightRotateZ,
                x: rightX,
                y: rightY,
                opacity: rightOpacity,
              }}
            >
              <div className="relative w-full max-w-[min(100%,420px)] sm:max-w-[480px] md:max-w-[min(100%,480px)] lg:max-w-[560px] xl:max-w-[640px] 2xl:max-w-[min(840px,100%)] min-[1800px]:max-w-[min(1020px,100%)] min-[2200px]:max-w-[min(1180px,100%)] mx-auto lg:mx-0 2xl:justify-self-end">
                <div className="absolute -top-4 -left-4 w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20 xl:-top-6 xl:-left-6 xl:w-28 xl:h-28 2xl:-top-7 2xl:-left-7 2xl:w-32 2xl:h-32 min-[1800px]:-top-8 min-[1800px]:-left-8 min-[1800px]:w-36 min-[1800px]:h-36 border-t-2 border-l-2 border-primary/40 z-20 pointer-events-none" />
                <div className="absolute -bottom-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20 xl:-bottom-6 xl:-right-6 xl:w-28 xl:h-28 2xl:-bottom-7 2xl:-right-7 2xl:w-32 2xl:h-32 min-[1800px]:-bottom-8 min-[1800px]:-right-8 min-[1800px]:w-36 min-[1800px]:h-36 border-b-2 border-r-2 border-primary/40 z-20 pointer-events-none" />

                <div className="absolute top-16 -right-2 xl:-right-10 2xl:-right-12 min-[1800px]:-right-14 z-30 hidden xl:block p-3 sm:p-4 xl:p-5 2xl:p-6 min-[1800px]:p-7 bg-surface-container/80 backdrop-blur-md border border-primary/20 shadow-xl rounded-sm">
                  <div className="text-[10px] xl:text-xs 2xl:text-sm min-[1800px]:text-base font-heading text-primary uppercase mb-2 xl:mb-3 tracking-wider">
                    Metrics_v.02
                  </div>
                  <div className="flex gap-4 xl:gap-5 2xl:gap-6 min-[1800px]:gap-7">
                    <div className="space-y-1 flex flex-col items-center">
                      <div className="h-12 xl:h-14 2xl:h-16 min-[1800px]:h-[4.5rem] w-1 bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-[80%] w-full bg-primary rounded-full" />
                      </div>
                      <div className="text-[8px] xl:text-[10px] 2xl:text-xs min-[1800px]:text-sm font-heading text-muted-foreground">
                        STR
                      </div>
                    </div>
                    <div className="space-y-1 flex flex-col items-center">
                      <div className="h-12 xl:h-14 2xl:h-16 min-[1800px]:h-[4.5rem] w-1 bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-[95%] w-full bg-secondary rounded-full" />
                      </div>
                      <div className="text-[8px] xl:text-[10px] 2xl:text-xs min-[1800px]:text-sm font-heading text-muted-foreground">
                        EXP
                      </div>
                    </div>
                    <div className="space-y-1 flex flex-col items-center">
                      <div className="h-12 xl:h-14 2xl:h-16 min-[1800px]:h-[4.5rem] w-1 bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-[60%] w-full bg-tertiary rounded-full" />
                      </div>
                      <div className="text-[8px] xl:text-[10px] 2xl:text-xs min-[1800px]:text-sm font-heading text-muted-foreground">
                        TEC
                      </div>
                    </div>
                  </div>
                </div>

                <a
                  href="https://www.mca.org.uk/awards/finalists-2025/individuals-2025/justin-fish-capgemini-invent"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative group"
                >
                  <Card className="relative w-full aspect-[4/5] max-h-[min(340px,40dvh)] sm:max-h-[min(380px,42dvh)] md:max-h-[min(400px,44dvh)] lg:max-h-[560px] xl:max-h-[640px] 2xl:max-h-[min(840px,78vh)] min-[1800px]:max-h-[min(1020px,82vh)] min-[2200px]:max-h-[min(1180px,85vh)] bg-surface-container rounded-md overflow-hidden transform transition-all duration-300 hover:scale-[1.01] border-0 shadow-none hover:shadow-[0_40px_60px_rgba(129,236,255,0.12)] 2xl:hover:shadow-[0_52px_80px_rgba(129,236,255,0.14)]">
                    <ShineBorder
                      shineColor={["#81ecff", "#a68cff", "#7e51ff"]}
                      borderWidth={1}
                      duration={18}
                    />
                    <Image
                      src="/MCA.png"
                      alt="MCA Technology Consultant of the Year"
                      fill
                      className="object-contain p-3 sm:p-4 md:p-4 xl:p-6 2xl:p-8 min-[1800px]:p-10 rounded-md transition-transform duration-300 group-hover:scale-[1.03]"
                      priority
                    />
                    <div className="absolute inset-0 bg-surface/25 transition-opacity duration-300 group-hover:opacity-0 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-5 xl:p-10 2xl:p-12 min-[1800px]:p-14 bg-gradient-to-t from-surface/95 to-transparent">
                      <div className="flex items-end justify-between gap-3 md:gap-3 xl:gap-5 2xl:gap-6">
                        <div>
                          <h3 className="font-heading text-lg sm:text-xl md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl min-[1800px]:text-5xl font-bold text-foreground">
                            MCA Awards 2025
                          </h3>
                          <p className="font-heading text-primary tracking-widest text-[10px] sm:text-xs md:text-xs xl:text-sm 2xl:text-base min-[1800px]:text-lg uppercase mt-0.5 md:mt-1 xl:mt-2">
                            Technology Consultant of the Year
                          </p>
                        </div>
                        <Award
                          className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 xl:w-14 xl:h-14 2xl:w-16 2xl:h-16 min-[1800px]:w-[4.5rem] min-[1800px]:h-[4.5rem] text-primary/60 shrink-0"
                          strokeWidth={1.25}
                          aria-hidden
                        />
                      </div>
                    </div>
                  </Card>
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

export default HomeHero;
