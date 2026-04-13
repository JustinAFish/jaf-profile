"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMinWidth } from "@/hooks/useMinWidth";
import {
  SKILLS_SCENE_MIN_WIDTH_PX,
  SKILLS_SCROLL_SCENE_ANIM_RATIO,
  SKILLS_SCROLL_SCENE_HEIGHT_VH,
} from "@/lib/homeSkillsSection";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef } from "react";

type SkillCategory = {
  id: string;
  title: string;
  skills: string[];
  /** Sort order for the static grid (original layout). */
  gridOrder: number;
  /** Left-to-right column in the scroll scene (0–3). */
  rowIndex: number;
  /** Product card: visible first, drawn above the stack while collapsed. */
  isPrimary: boolean;
};

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: "generative-ai",
    gridOrder: 0,
    rowIndex: 0,
    isPrimary: false,
    title: "Generative AI & LLMs",
    skills: [
      "Large Language Models (LLMs)",
      "LangChain / Agentic Frameworks",
      "RAG Pipelines",
      "Prompt Engineering",
      "Machine Learning",
      "Deep Learning / Neural Networks",
      "AI Safety & Governance",
    ],
  },
  {
    id: "engineering-cloud",
    gridOrder: 1,
    rowIndex: 1,
    isPrimary: false,
    title: "Engineering & Cloud",
    skills: [
      "Python",
      "React / Next.js",
      "TypeScript / JavaScript",
      "AWS / Azure / GCP",
      "FastAPI / REST APIs",
      "CI/CD Pipelines",
      "Database Design",
    ],
  },
  {
    id: "product-gtm",
    gridOrder: 2,
    rowIndex: 2,
    isPrimary: true,
    title: "Product & GTM",
    skills: [
      "AI Product Strategy",
      "End-to-End Product Lifecycle",
      "Agile / SCRUM",
      "User Research & Design Thinking",
      "Roadmap Development",
      "Go-to-Market Strategy",
      "Stakeholder Management",
    ],
  },
  {
    id: "consulting-leadership",
    gridOrder: 3,
    rowIndex: 3,
    isPrimary: false,
    title: "Consulting & Leadership",
    skills: [
      "Enterprise Client Engagement",
      "C-Suite Communication",
      "Workshop Facilitation",
      "Team Leadership & Mentoring",
      "Operating Model Design",
      "Cross-Functional Collaboration",
      "Multi-Sector Experience",
    ],
  },
];

/** Column centers across full width (percent), using nearly the full viewport. */
const ROW_LEFT_PCT = [11, 36.33, 63.67, 89] as const;

/** Subtle fan rotation so the row still reads as one line (shared baseline). */
const ROW_ROTATE_DEG = [-14, -5, 5, 14] as const;

const cardClassName =
  "group relative rounded-md bg-surface-container-high/90 backdrop-blur-md border-0 shadow-none transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_40px_60px_rgba(129,236,255,0.08)]";

function SkillCategoryCard({
  category,
  variant = "default",
}: {
  category: SkillCategory;
  variant?: "default" | "scene";
}) {
  const compact = variant === "scene";
  return (
    <Card className={cardClassName}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent rounded-md" />
      </div>
      <CardHeader className={compact ? "p-4 sm:p-5" : undefined}>
        <CardTitle
          className={
            compact
              ? "text-lg font-heading text-primary sm:text-xl"
              : "text-2xl font-heading text-primary"
          }
        >
          {category.title}
        </CardTitle>
      </CardHeader>
      <CardContent className={compact ? "p-4 pt-0 sm:p-5 sm:pt-0" : undefined}>
        <div className={compact ? "space-y-2 sm:space-y-2.5" : "space-y-3"}>
          {category.skills.map((skill, skillIndex) => (
            <div
              key={skillIndex}
              className={
                compact
                  ? "rounded-md bg-surface-container-lowest/80 p-2 ghost-border transform transition-all duration-200 hover:bg-surface-container/90 group/skill sm:p-2.5"
                  : "p-3 rounded-md bg-surface-container-lowest/80 ghost-border transform transition-all duration-200 hover:bg-surface-container/90 group/skill"
              }
            >
              <p
                className={
                  compact
                    ? "text-paragraph text-xs font-medium group-hover/skill:text-foreground transition-colors sm:text-sm"
                    : "text-paragraph font-medium group-hover/skill:text-foreground transition-colors"
                }
              >
                {skill}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SceneRowCard({
  category,
  sceneProgress,
}: {
  category: SkillCategory;
  sceneProgress: MotionValue<number>;
}) {
  const targetLeft = ROW_LEFT_PCT[category.rowIndex];
  /** Spread uses most of 0→1 so the fan-out isn’t “done” in the first few scroll ticks. */
  const leftPct = useTransform(sceneProgress, [0.04, 0.88], [50, targetLeft]);
  const left = useTransform(leftPct, (v) => `${v}%`);
  const rotate = useTransform(
    sceneProgress,
    [0.04, 0.88],
    [0, ROW_ROTATE_DEG[category.rowIndex]],
  );
  const opacityAsPrimary = useTransform(sceneProgress, [0, 1], [1, 1]);
  const opacityAsSecondary = useTransform(
    sceneProgress,
    [0, 0.06, 0.22, 1],
    [0, 0, 1, 1],
  );
  const opacity = category.isPrimary ? opacityAsPrimary : opacityAsSecondary;
  const scalePrimary = useTransform(sceneProgress, [0, 0.14, 1], [0.94, 1, 1]);
  const scaleSecondary = useTransform(
    sceneProgress,
    [0, 0.14, 1],
    [0.88, 1, 1],
  );
  const scale = category.isPrimary ? scalePrimary : scaleSecondary;

  return (
    <motion.div
      className={
        category.isPrimary
          ? "pointer-events-auto absolute top-14 z-30 w-[min(24vw,18rem)] overflow-visible sm:top-16 md:top-20 md:w-[min(24.5vw,19rem)] lg:top-20 lg:w-[min(25vw,20rem)]"
          : "pointer-events-auto absolute top-14 z-10 w-[min(24vw,18rem)] overflow-visible sm:top-16 md:top-20 md:w-[min(24.5vw,19rem)] lg:top-20 lg:w-[min(25vw,20rem)]"
      }
      style={{
        left,
        x: "-50%",
        rotate,
        opacity,
        scale,
        transformOrigin: "50% 50%",
      }}
    >
      <SkillCategoryCard category={category} variant="scene" />
    </motion.div>
  );
}

function HomeSkillsScrollScene() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const sceneProgress = useTransform(scrollYProgress, (v) =>
    Math.min(v / SKILLS_SCROLL_SCENE_ANIM_RATIO, 1),
  );

  const titleOpacity = useTransform(sceneProgress, [0, 0.12], [0.55, 1]);

  const rowOrdered = [...SKILL_CATEGORIES].sort(
    (a, b) => a.rowIndex - b.rowIndex,
  );

  return (
    <section
      ref={sectionRef}
      id="skills"
      data-skills-variant="scene"
      className="relative scroll-mt-[var(--site-header-height)] bg-background px-4"
      style={{ height: `${SKILLS_SCROLL_SCENE_HEIGHT_VH}vh` }}
    >
      <div className="sticky top-[var(--site-header-height)] h-[calc(100dvh-var(--site-header-height))] overflow-x-clip overflow-y-visible [overscroll-behavior-y:none] touch-pan-y">
        <div className="pointer-events-none relative flex h-full flex-col pt-6 pb-6 sm:pt-8 sm:pb-8">
          <motion.div
            className="relative z-20 text-center"
            style={{ opacity: titleOpacity }}
          >
            <h2 className="text-4xl font-heading font-bold text-header md:text-5xl">
            Broad range of skills with deep expertise
            </h2>
            <p className="text-md mt-4 uppercase tracking-widest text-tertiary">
            Through continous upskilling to deliver results
            </p>
          </motion.div>

          {/* Full-bleed row stage; pointer-events-none so wheel/touch scroll the document (cards opt in). */}
          <div className="relative mx-[calc(50%-50vw)] min-h-0 w-screen max-w-[100vw] flex-1 px-2 sm:px-3 md:px-4">
            {rowOrdered.map((cat) => (
              <SceneRowCard
                key={cat.id}
                category={cat}
                sceneProgress={sceneProgress}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeSkillsStatic() {
  const ordered = [...SKILL_CATEGORIES].sort((a, b) => a.gridOrder - b.gridOrder);

  return (
    <section
      id="skills"
      data-skills-variant="static"
      className="scroll-mt-[var(--site-header-height)] bg-background px-4 py-16"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 sm:gap-3">
        <div className="text-center">
          <h2 className="mb-2 text-4xl font-heading font-bold text-header md:text-5xl sm:mb-3">
            Skills
          </h2>
          <p className="text-label-md m-0 uppercase tracking-widest text-tertiary">
            Capabilities
          </p>
        </div>

        <div className="mx-auto grid w-full gap-8 sm:grid-cols-2 2xl:grid-cols-4">
          {ordered.map((category) => (
            <SkillCategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomeSkills() {
  const prefersReducedMotion = useReducedMotion();
  const wideForScene = useMinWidth(SKILLS_SCENE_MIN_WIDTH_PX);

  if (prefersReducedMotion === true) {
    return <HomeSkillsStatic />;
  }
  if (wideForScene !== true) {
    return <HomeSkillsStatic />;
  }
  return <HomeSkillsScrollScene />;
}
