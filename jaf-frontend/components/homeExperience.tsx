"use client";

import Image from "next/image";
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
                  <Image
                    src="/CAP.svg"
                    alt=""
                    width={1571}
                    height={1448}
                    className="h-8 w-auto max-w-full object-contain md:h-9"
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
                Aug 2021 – Present
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

                {/* Innovation Lab */}
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
                      Public Sector Innovation Lab — GenAI Centre of Excellence &amp; Production Applications
                    </h4>
                    <h5 className="mt-1 text-xs tracking-tighter text-muted-foreground md:text-sm">
                      14 PoCs Delivered • 4 Solutions Operationalised • 20+ Vendor Partners • Secretary of State &amp; PM-Level Recognition
                    </h5>
                    <ul className={listClass}>
                      <li className={listItemClass}>
                        <p>
                          Led a team of 15 spanning researchers, service designers, data scientists, and engineers to deliver 14 PoCs and operationalise 4 production solutions; established the lab&apos;s operating model, KPIs, agile delivery framework, and vendor partnership strategy (20+ partners). Work recognised directly at Secretary of State and Prime Minister level, requiring regular high-stakes briefings to ministerial stakeholders.
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Designed and shipped the first GenAI application in UK Gov that transformed customer service operations: an LLM pipeline combining multi-step document retrieval, automated vulnerability detection, and real-time Q&amp;A against complex policy documents, engineered with carefully structured prompts, guardrails, and output validation to meet strict public sector safety and compliance requirements.
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Drove organisation-wide GenAI adoption by deploying sandbox environments across leading platforms (GCP, Azure, AWS), running 10+ technical Show and Tell sessions, and systematically cataloguing department-wide use cases — enabling the lab to prioritise high-impact initiatives and build a library of reusable AI assets and integration patterns deployed across multiple teams.
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Partnered with Google Cloud, AWS, and Azure account teams to integrate their platform offerings into PoC workstreams; managed technical partner relationships, co-developed integration architectures, and served as the primary technical contact bridging cloud vendor capabilities with client requirements.
                        </p>
                      </li>
                    </ul>
                  </div>
                </motion.div>

                {/* Police Force */}
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
                      Large UK Police Force — Production RAG Deployment &amp; AI Operating Model
                    </h4>
                    <h5 className="mt-1 text-xs tracking-tighter text-muted-foreground md:text-sm">
                      50% Processing Time Reduction • £250K Annual Cost Savings • Production RAG Deployment
                    </h5>
                    <ul className={listClass}>
                      <li className={listItemClass}>
                        <p>
                          Owned end-to-end technical delivery of a production GenAI FOI Assistant, cutting average case-handling time by 50% and delivering up to £250K in annual cost savings; personally architected the full solution stack (Azure OpenAI with semantic chunking and hybrid retrieval via Azure AI Search, Cosmos DB for session state, and containerised React/FastAPI microservices). Presented to the Architecture Authority Board to get approval to integrate it within the client&apos;s existing Azure estate.
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Designed and implemented an end-to-end AI product operating model for the force, defining governance structures, acceptance criteria, and repeatable delivery standards from initial concept through scaled production; this model became a reusable playbook for subsequent AI deployments across the organisation.
                        </p>
                      </li>
                    </ul>
                  </div>
                </motion.div>

                {/* Regulatory Body */}
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
                      UK Public Sector Regulatory Body — Technical Discovery to Board-Approved Prototype
                    </h4>
                    <h5 className="mt-1 text-xs tracking-tighter text-muted-foreground md:text-sm">
                      20 User Research Sessions • 4 Regulators • Board-Approved Prototype
                    </h5>
                    <ul className={listClass}>
                      <li className={listItemClass}>
                        <p>
                          Led the full discovery-to-prototype for an AI-powered Digital Regulatory Library aggregating compliance guidance from four UK regulators; conducted 20 moderated user research sessions and stakeholder co-design workshops to define requirements, then scoped and architected the technical solution before leading iterative prototyping through to a coded, board-approved prototype, demonstrating the complete pre-sales and technical advisory motion that defines Solutions Architect and FDE roles.
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Navigated a complex multi-stakeholder environment (four regulators, procurement, legal, and technical teams) to build consensus around the architecture and gain executive sign-off, while proactively identifying and mitigating AI adoption risk and safety concerns at each stage of delivery.
                        </p>
                      </li>
                    </ul>
                  </div>
                </motion.div>

                {/* AI Safety Institute */}
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
                      AI Safety Institute — Responsible AI Strategy &amp; Governance
                    </h4>
                    <h5 className="mt-1 text-xs tracking-tighter text-muted-foreground md:text-sm">
                      Technology Strategy • Enterprise Governance • AI Safety Research
                    </h5>
                    <ul className={listClass}>
                      <li className={listItemClass}>
                        <p>
                          Led technology strategy and operations for the UK Government&apos;s AI Safety Institute, the body established to evaluate frontier AI models, measure societal impacts, and set standards for responsible deployment; defined the organisation&apos;s technology roadmap and instilled enterprise governance structures that improved cross-functional alignment on AI safety research priorities.
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Developed a data strategy enabling data-driven decision-making across finance and talent functions, and advised on responsible AI frameworks for evaluating model safety.
                        </p>
                      </li>
                    </ul>
                  </div>
                </motion.div>

                {/* AI Innovation Product Lead */}
                <motion.div variants={timelineItemVariants} className="relative group">
                  <div
                    className="absolute top-2 left-[-32px] z-10 size-4 rounded-full border-2 border-primary/40 bg-surface-container-high transition-colors group-hover:border-primary md:left-[-59px]"
                    aria-hidden
                  />
                  <div className="rounded border-l-4 border-outline-variant/30 bg-surface-container p-6 transition-all duration-300 hover:border-primary hover:bg-surface-container-high md:p-8">
                    <h4 className="font-heading text-2xl font-bold text-header">
                      AI Innovation Product Lead — GTM, Patterns &amp; Capability Building
                    </h4>
                    <h5 className="mt-1 text-xs tracking-tighter text-muted-foreground md:text-sm">
                      20+ PoCs Delivered • 25+ Clients Engaged (Public &amp; Private) • Pre-Sales to Delivery Motion
                    </h5>
                    <ul className={listClass}>
                      <li className={listItemClass}>
                        <p>
                          Led Capgemini Invent&apos;s GenAI go-to-market capability, delivering 20+ PoCs across 25+ public and private sector clients; ran technical discovery workshops to identify high-value AI opportunities, shaped solution architectures, and led deals from initial technical qualification through to client sign-off, building the full pre-sales to delivery motion that underpins enterprise AI adoption roles.
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Codified repeatable deployment patterns and reusable technical assets across three GenAI workstreams (knowledge sharing, L&amp;D, and product delivery); these assets reduced time-to-prototype for new client engagements and were adopted by teams across the practice.
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Developed reusable design patterns and integration guidance for Government AI use cases, advising on enterprise architecture, data residency, security controls, and LLM deployment best practices, including context engineering, prompt design, and output validation strategies suited to regulated public sector environments.
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
                  <Image
                    src="/pa-logo.svg"
                    alt=""
                    width={546}
                    height={312}
                    className="h-8 w-auto max-w-full object-contain md:h-9"
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
                Apr 2019 – Aug 2021
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
                          Led a team of 5 data scientists to design, build, and deploy a production ML model predicting patient fall risk for a major healthcare client; architected the end-to-end solution including model training (ensemble classifiers, feature engineering on clinical data) and a Python web application enabling nursing staff to access real-time predictive insights, translating a complex data science output into a tool clinical users could trust and act on.
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Designed and delivered a cloud-based document intelligence pipeline on AWS (S3, Textract, Lambda) to digitise thousands of unstructured government PDF documents; applied NLP techniques including automated text classification, named entity recognition, and extractive summarisation to create a fully searchable structured knowledge base, an early-stage RAG precursor pattern now central to modern enterprise GenAI deployments.
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Applied advanced ML methods (Random Forest, LSTM neural networks) in the energy sector to model telemetry alarm occurrences at critical distribution sites and predict wind turbine equipment failures; enabled preventative maintenance scheduling that reduced operational downtime and identified significant cost savings through optimised field workflows.
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Designed and deployed a user-centric supply chain resilience tool (Agile delivery, multi-sprint) combining automated ML text classification, NLP extraction and summarisation, and geospatial visualisations, embedded directly within the client&apos;s data science team and shipped on cloud infrastructure, demonstrating the forward-deployed, co-build model that defines modern enterprise AI engagements.
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Ran a comprehensive NLP-driven customer insight programme for a consumer client, applying topic modelling, sentiment analysis, and scatter text visualisation to large-scale survey data; translated findings into clear executive narratives that shaped product and marketing strategy, building the executive communication and insight-to-action skills central to customer-facing technical roles.
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Improved hospital theatre scheduling by modelling patient flow and applying data-driven forecasting to resource allocation; increased utilisation and reduced patient wait times, an early example of applying AI to complex operational workflows with measurable, human-centred outcomes.
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
                  <Image
                    src="/sav-logo.png"
                    alt=""
                    width={512}
                    height={512}
                    className="h-8 w-auto max-w-full object-contain md:h-9"
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading font-bold text-header">
                    <span className="block text-3xl">
                      <span className="mr-2">SAV Systems</span>
                    </span>
                    <span className="mt-1 block text-sm uppercase tracking-widest text-secondary">
                      <span className="text-paragraph">
                        | Technical Manager &amp; R&amp;D
                      </span>
                    </span>
                  </h3>
                </div>
              </div>
              <span className="text-lg text-paragraph whitespace-normal sm:shrink-0 sm:whitespace-nowrap">
                Feb 2017 – Apr 2019
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
                          Developed billing software for a thermal disconnect system, enabling a new service offering and leading to a joint venture partnership; managed R&amp;D projects coordinating engineering teams and stakeholders.
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
