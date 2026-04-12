"use client";

import { Building2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const listClass =
  "mt-4 list-none space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg [counter-reset:exp]";

const listItemClass =
  "flex gap-4 before:mt-1 before:shrink-0 before:font-heading before:tabular-nums before:text-primary before:[counter-increment:exp] before:[content:counter(exp,decimal-leading-zero)]";

export default function HomeExperience() {
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = prefersReducedMotion === true;

  const blockTransition = {
    duration: reduceMotion ? 0 : 0.45,
    ease: "easeOut" as const,
  };

  const blockReveal = {
    initial: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-48px 0px" },
    transition: blockTransition,
  };

  const timelineListVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: reduceMotion ? 0 : 0.08 },
    },
  };

  const timelineItemVariants = {
    hidden: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.4,
        ease: "easeOut" as const,
      },
    },
  };

  const timelineColumnProps = {
    initial: "hidden" as const,
    whileInView: "visible" as const,
    viewport: { once: true, margin: "-10% 0px" },
    variants: timelineListVariants,
  };

  return (
    <section
      id="experience"
      className="scroll-mt-[var(--site-header-height)] bg-background px-4 py-20 [background-image:radial-gradient(circle_at_2px_2px,rgba(129,236,255,0.05)_1px,transparent_0)] [background-size:40px_40px] sm:px-8 md:px-12 lg:px-16"
    >
      <div className="mx-auto max-w-7xl">
        <motion.header
          className="mb-16 text-center md:mb-20 md:text-left"
          {...blockReveal}
        >
          <h2 className="font-heading text-4xl font-bold tracking-tighter text-header md:text-5xl lg:text-6xl">
            <span>Work </span>
            <span className="text-primary-dim [text-shadow:0_0_12px_rgba(0,212,236,0.45)]">
              Experience
            </span>
          </h2>
        </motion.header>

        <div className="space-y-24">
          {/* Capgemini */}
          <motion.div {...blockReveal}>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <div className="shrink-0 rounded-lg border border-primary/20 bg-surface-container-lowest p-4">
                  <Building2
                    className="size-8 text-primary md:size-9"
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading font-bold text-header">
                    <span className="block text-3xl">
                      <span className="mr-2">Capgemini Invent</span>
                    </span>
                    <span className="mt-1 block text-sm uppercase tracking-widest text-secondary">
                      <span className="text-paragraph">
                        | Senior Managing AI Consultant — Data Science &amp; AI Products
                      </span>
                    </span>
                  </h3>
                </div>
              </div>
              <span className="text-lg text-paragraph whitespace-normal sm:shrink-0 sm:whitespace-nowrap">
                2021 - Present
              </span>
            </div>

            <div className="grid grid-cols-1 gap-0 md:grid-cols-[100px_1fr] md:gap-12">
              <div className="hidden md:block" aria-hidden />
              <motion.div
                className="relative pl-12 md:pl-0"
                {...timelineColumnProps}
              >
                <div
                  className="pointer-events-none absolute top-0 bottom-0 left-3 w-0.5 bg-[linear-gradient(to_bottom,transparent,_#81ecff_15%,_#81ecff_85%,_transparent)] opacity-30 md:left-[-51px]"
                  aria-hidden
                />

                <motion.div
                  variants={timelineItemVariants}
                  className="relative mb-16 group last:mb-0"
                >
                  <div
                    className="absolute top-2 left-[-36px] z-10 size-6 rounded-full border-2 border-primary bg-background shadow-[0_0_15px_#81ecff] md:left-[-63px]"
                    aria-hidden
                  >
                    <div className="absolute inset-1 rounded-full bg-primary motion-safe:animate-pulse motion-reduce:animate-none" />
                  </div>
                  <div className="rounded border-l-4 border-primary bg-surface-container p-6 transition-colors duration-300 hover:bg-surface-container-high md:p-8">
                    <h4 className="font-heading text-2xl font-bold text-primary-dim">
                      UK Government — Innovation Lab
                    </h4>
                    <h5 className="mt-1 text-xs tracking-tighter text-muted-foreground md:text-sm">
                      £350m Cost Efficiency • 14 Solutions Designed &amp; Deployed • 50+ Reusable Assets • 4 Solutions Operationalised • 30+ Technologies Explored
                    </h5>
                    <ul className={listClass}>
                      <li className={listItemClass}>
                        <p>
                          Led client engagement and a multidisciplinary team of 15 in developing user-centric AI solutions for UK Government, delivering state-of-the-art PoCs using Generative AI and advanced analytics that proved production viability
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Architected and led development of a Generative AI-powered app enabling real-time document analysis, vulnerability detection, and RAG-based Q&amp;A from policy documents — improving both user and customer outcomes
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Established and scaled a Generative AI Centre of Excellence (CoE), running knowledge-sharing sessions, capturing department-wide use cases, and building reusable GenAI assets adopted across multiple teams
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Collaborated with AWS, Azure, and GCP to integrate cloud AI offerings into PoCs, accelerating multi-cloud development and briefing senior stakeholders up to C-suite level
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Managed full project lifecycle for multiple concurrent prototypes — timelines, budgets, risk mitigation — regularly building trust with executive sponsors to secure continued investment
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Developed and implemented the operating model for repeatedly identifying business opportunities, delivering MVPs, and scaling solutions cross-functionally from concept to production
                        </p>
                      </li>
                    </ul>
                  </div>
                </motion.div>

                <motion.div
                  variants={timelineItemVariants}
                  className="relative mb-16 group last:mb-0"
                >
                  <div
                    className="absolute top-2 left-[-32px] z-10 size-4 rounded-full border-2 border-primary/40 bg-surface-container-high transition-colors group-hover:border-primary md:left-[-59px]"
                    aria-hidden
                  />
                  <div className="rounded border-l-4 border-outline-variant/30 bg-surface-container p-6 transition-all duration-300 hover:border-primary hover:bg-surface-container-high md:p-8">
                    <h4 className="font-heading text-2xl font-bold text-header">
                      UK Government — AI Safety Institute
                    </h4>
                    <h5 className="mt-1 text-xs tracking-tighter text-muted-foreground md:text-sm">
                      Technology Strategy • Enterprise Governance • Data-Driven Insights
                    </h5>
                    <ul className={listClass}>
                      <li className={listItemClass}>
                        <p>
                          Led a strategic engagement defining the technology strategy and operating model for a national AI Safety Institute, establishing enterprise governance frameworks to improve cross-departmental alignment
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Architected a data strategy delivering financial and talent management insights through advanced analytics, enabling data-driven decision-making at scale
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Designed testing protocols and evaluation frameworks for assessing the societal impacts of advanced AI systems across diverse demographics
                        </p>
                      </li>
                    </ul>
                  </div>
                </motion.div>

                <motion.div
                  variants={timelineItemVariants}
                  className="relative mb-16 group last:mb-0"
                >
                  <div
                    className="absolute top-2 left-[-32px] z-10 size-4 rounded-full border-2 border-primary/40 bg-surface-container-high transition-colors group-hover:border-primary md:left-[-59px]"
                    aria-hidden
                  />
                  <div className="rounded border-l-4 border-outline-variant/30 bg-surface-container p-6 transition-all duration-300 hover:border-primary hover:bg-surface-container-high md:p-8">
                    <h4 className="font-heading text-2xl font-bold text-header">
                      UK Police Forces
                    </h4>
                    <h5 className="mt-1 text-xs tracking-tighter text-muted-foreground md:text-sm">
                      50% Processing Time Reduction • £250K Annual Cost Savings • Production AI Deployment
                    </h5>
                    <ul className={listClass}>
                      <li className={listItemClass}>
                        <p>
                          Led design and delivery of an AI-enabled FOI response accelerator, reducing processing time by 50% and delivering up to £250K in annual cost savings, mitigating statutory non-compliance risk amid rising request volumes
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Developed strategy to deliver multiple AI products enhancing operational decision-making, improving efficiency and resilience across policing
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Led end-to-end product development of an AI solution with geofencing, providing frontline officers with real-time patrol intelligence
                        </p>
                      </li>
                    </ul>
                  </div>
                </motion.div>

                <motion.div variants={timelineItemVariants} className="relative group">
                  <div
                    className="absolute top-2 left-[-32px] z-10 size-4 rounded-full border-2 border-primary/40 bg-surface-container-high transition-colors group-hover:border-primary md:left-[-59px]"
                    aria-hidden
                  />
                  <div className="rounded border-l-4 border-outline-variant/30 bg-surface-container p-6 transition-all duration-300 hover:border-primary hover:bg-surface-container-high md:p-8">
                    <h4 className="font-heading text-2xl font-bold text-header">
                      AI Innovation Product Lead &amp; GenAI GTM
                    </h4>
                    <h5 className="mt-1 text-xs tracking-tighter text-muted-foreground md:text-sm">
                      12 PoCs Developed • 10 Clients Engaged (Public &amp; Private) • £5M+ Investment Secured
                    </h5>
                    <ul className={listClass}>
                      <li className={listItemClass}>
                        <p>
                          Founded and led GenAI capability, establishing the delivery model across three workstreams: knowledge dissemination, L&amp;D, and client-specific product development to support go-to-market growth
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Oversaw end-to-end product lifecycle management with 100% on-time delivery of major features, translating AI capabilities into business value propositions for C-suite stakeholders
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Secured £5M+ in AI initiative funding by articulating LLM solutions as strategic business value to executive sponsors
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Implemented CI/CD pipelines, opportunity tracking, and reusable asset management to support simultaneous multi-client development at scale
                        </p>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* PA Consulting */}
          <motion.div {...blockReveal}>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <div className="shrink-0 rounded-lg border border-primary/20 bg-surface-container-lowest p-4">
                  <Building2
                    className="size-8 text-primary md:size-9"
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading font-bold text-header">
                    <span className="block text-3xl">
                      <span className="mr-2">PA Consulting</span>
                    </span>
                    <span className="mt-1 block text-sm uppercase tracking-widest text-secondary">
                      <span className="text-paragraph">
                        | Data Science Consultant
                      </span>
                    </span>
                  </h3>
                </div>
              </div>
              <span className="text-lg text-paragraph whitespace-normal sm:shrink-0 sm:whitespace-nowrap">
                2019 - 2021
              </span>
            </div>

            <div className="grid grid-cols-1 gap-0 md:grid-cols-[100px_1fr] md:gap-12">
              <div className="hidden md:block" aria-hidden />
              <motion.div
                className="relative pl-12 md:pl-0"
                {...timelineColumnProps}
              >
                <div
                  className="pointer-events-none absolute top-0 bottom-0 left-3 w-0.5 bg-[linear-gradient(to_bottom,transparent,_#81ecff_15%,_#81ecff_85%,_transparent)] opacity-30 md:left-[-51px]"
                  aria-hidden
                />

                <motion.div
                  variants={timelineItemVariants}
                  className="relative group 2xl:max-w-[83.333333%]"
                >
                  <div
                    className="absolute top-2 left-[-36px] z-10 size-6 rounded-full border-2 border-primary bg-background shadow-[0_0_15px_#81ecff] md:left-[-63px]"
                    aria-hidden
                  >
                    <div className="absolute inset-1 rounded-full bg-primary motion-safe:animate-pulse motion-reduce:animate-none" />
                  </div>
                  <div className="rounded border-l-4 border-primary bg-surface-container p-6 transition-colors duration-300 hover:bg-surface-container-high md:p-8">
                    <h5 className="text-xs tracking-tighter text-muted-foreground md:text-sm">
                      Delivered data science solutions across Healthcare, Public Sector, Consumer, Energy &amp; Utilities, and Financial Services — translating complex analyses into actionable insights and user-friendly tools for clients.
                    </h5>
                    <ul className={listClass}>
                      <li className={listItemClass}>
                        <p>
                          Led a team of 5 data scientists to develop a machine learning model predicting elderly patient fall risk, deployed as a web application enabling easy access to predictive insights for healthcare end-users
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Improved hospital theatre scheduling through data-driven patient workflow analysis and forecasting, increasing utilisation, reducing wait times, and optimising resource allocation
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Designed a cloud-based text analytics pipeline using AWS and NLP (text classification, summarisation) to digitise unstructured government documents into a searchable knowledge base
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Applied advanced ML methods (Random Forests, LSTM neural networks) to optimise energy sector operations — predicting equipment failures and enabling preventative maintenance to reduce downtime and costs
                        </p>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* SAV */}
          <motion.div {...blockReveal}>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <div className="shrink-0 rounded-lg border border-primary/20 bg-surface-container-lowest p-4">
                  <Building2
                    className="size-8 text-primary md:size-9"
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading font-bold text-header">
                    <span className="block text-3xl">
                      <span className="mr-2">SAV</span>
                    </span>
                    <span className="mt-1 block text-sm uppercase tracking-widest text-secondary">
                      <span className="text-paragraph">
                        | Technical Manager and R&D
                      </span>
                    </span>
                  </h3>
                </div>
              </div>
              <span className="text-lg text-paragraph whitespace-normal sm:shrink-0 sm:whitespace-nowrap">
                2017 - 2019
              </span>
            </div>

            <div className="grid grid-cols-1 gap-0 md:grid-cols-[100px_1fr] md:gap-12">
              <div className="hidden md:block" aria-hidden />
              <motion.div
                className="relative pl-12 md:pl-0"
                {...timelineColumnProps}
              >
                <div
                  className="pointer-events-none absolute top-0 bottom-0 left-3 w-0.5 bg-[linear-gradient(to_bottom,transparent,_#81ecff_15%,_#81ecff_85%,_transparent)] opacity-30 md:left-[-51px]"
                  aria-hidden
                />

                <motion.div variants={timelineItemVariants} className="relative group">
                  <div
                    className="absolute top-2 left-[-36px] z-10 size-6 rounded-full border-2 border-primary bg-background shadow-[0_0_15px_#81ecff] md:left-[-63px]"
                    aria-hidden
                  >
                    <div className="absolute inset-1 rounded-full bg-primary motion-safe:animate-pulse motion-reduce:animate-none" />
                  </div>
                  <div className="rounded border-l-4 border-primary bg-surface-container p-6 transition-colors duration-300 hover:bg-surface-container-high md:p-8">
                    <ul className={listClass}>
                      <li className={listItemClass}>
                        <p>
                          Developed a software application for a thermal disconnect billing system, enabling a new service offering and facilitating a joint venture partnership
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Managed R&amp;D projects and daily operations, coordinating engineering teams and stakeholders to deliver innovative energy-efficiency solutions on schedule
                        </p>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
