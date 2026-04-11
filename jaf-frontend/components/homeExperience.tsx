"use client";

import { Building2 } from "lucide-react";

const listClass =
  "mt-4 list-none space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg [counter-reset:exp]";

const listItemClass =
  "flex gap-4 before:mt-1 before:shrink-0 before:font-heading before:tabular-nums before:text-primary before:[counter-increment:exp] before:[content:counter(exp,decimal-leading-zero)]";

export default function HomeExperience() {
  return (
    <section
      id="resume"
      className="scroll-mt-[var(--site-header-height)] bg-background px-4 py-20 [background-image:radial-gradient(circle_at_2px_2px,rgba(129,236,255,0.05)_1px,transparent_0)] [background-size:40px_40px] sm:px-8 md:px-12 lg:px-16"
    >
      <div className="mx-auto max-w-7xl">
        <header className="mb-16 text-center md:mb-20 md:text-left">
          <h2 className="font-heading text-4xl font-bold tracking-tighter text-header md:text-5xl lg:text-6xl">
            <span>Work </span>
            <span className="text-primary-dim [text-shadow:0_0_12px_rgba(0,212,236,0.45)]">
              Experience
            </span>
          </h2>
        </header>

        <div className="space-y-24">
          {/* Capgemini */}
          <div>
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
                        | Data Science and AI Product Managing Consultant
                      </span>
                    </span>
                  </h3>
                </div>
              </div>
              <span className="shrink-0 text-lg whitespace-nowrap text-paragraph">
                2021 - Present
              </span>
            </div>

            <div className="grid grid-cols-1 gap-0 md:grid-cols-[100px_1fr] md:gap-12">
              <div className="hidden md:block" aria-hidden />
              <div className="relative pl-12 md:pl-0">
                <div
                  className="pointer-events-none absolute top-0 bottom-0 left-3 w-0.5 bg-[linear-gradient(to_bottom,transparent,_#81ecff_15%,_#81ecff_85%,_transparent)] opacity-30 md:left-[-51px]"
                  aria-hidden
                />

                <div className="relative mb-16 group last:mb-0">
                  <div
                    className="absolute top-2 left-[-36px] z-10 size-6 rounded-full border-2 border-primary bg-background shadow-[0_0_15px_#81ecff] md:left-[-63px]"
                    aria-hidden
                  >
                    <div className="absolute inset-1 rounded-full bg-primary motion-safe:animate-pulse motion-reduce:animate-none" />
                  </div>
                  <div className="rounded border-l-4 border-primary bg-surface-container p-6 transition-colors duration-300 hover:bg-surface-container-high md:p-8">
                    <h4 className="font-heading text-2xl font-bold text-primary-dim">
                      UK Government Innovation Lab Solution Architect
                    </h4>
                    <h5 className="mt-1 text-xs tracking-tighter text-muted-foreground md:text-sm">
                      £350m Cost Efficiency • 14 PoVs • 50+ Reusable Assets • 6
                      Solutions Operationalised
                    </h5>
                    <ul className={listClass}>
                      <li className={listItemClass}>
                        <p>
                          Led client engagement and multidisciplinary team of 15
                          (including 7 Data Scientists) in developing user-centric
                          solutions using Analytics and AI, primarily Generative AI
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Developed operating model for identifying opportunities,
                          delivering MVPs, and scaling solutions through
                          cross-functional collaboration
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Established GenAI Center of Excellence (COE) through
                          workshops and use case collection, building reusable
                          assets for department-wide adoption
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Led development of GenAI-powered app for real-time
                          document analysis and vulnerability detection, improving
                          user experience and social outcomes
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Partnered with AWS, Azure, GCP, and startups to integrate
                          technologies accelerating proof-of-concept development
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Led expansion of energy metering department, later
                          integrating wiring division to create cross-functional
                          capabilities
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Developed billing application for thermal disconnect
                          systems that facilitated joint venture partnership
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Managed full project lifecycle from concept to
                          operations, overseeing technical implementation and
                          stakeholder alignment
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="relative mb-16 group last:mb-0">
                  <div
                    className="absolute top-2 left-[-32px] z-10 size-4 rounded-full border-2 border-primary/40 bg-surface-container-high transition-colors group-hover:border-primary md:left-[-59px]"
                    aria-hidden
                  />
                  <div className="rounded border-l-4 border-outline-variant/30 bg-surface-container p-6 transition-all duration-300 hover:border-primary hover:bg-surface-container-high md:p-8">
                    <h4 className="font-heading text-2xl font-bold text-header">
                      AI Innovation Product Lead
                    </h4>
                    <ul className={listClass}>
                      <li className={listItemClass}>
                        <p>
                          Founding leader driving operationalization of AI products
                          from concept to production
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Own end-to-end product lifecycle management with 100%
                          on-time delivery of major features
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Translate technical capabilities into business value
                          propositions for C-suite stakeholders, securing £5M+ in
                          AI initiative funding
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Lead user-centered design processes achieving 90%+
                          adoption rates through iterative UI/UX improvements
                          based on customer feedback
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Orchestrate cross-functional teams (data engineers,
                          scientists, developers) to deliver enterprise-grade AI
                          solutions meeting strict success criteria
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Pioneer communication frameworks bridging technical
                          implementation with strategic business objectives
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="relative mb-16 group last:mb-0">
                  <div
                    className="absolute top-2 left-[-32px] z-10 size-4 rounded-full border-2 border-primary/40 bg-surface-container-high transition-colors group-hover:border-primary md:left-[-59px]"
                    aria-hidden
                  />
                  <div className="rounded border-l-4 border-outline-variant/30 bg-surface-container p-6 transition-all duration-300 hover:border-primary hover:bg-surface-container-high md:p-8">
                    <h4 className="font-heading text-2xl font-bold text-header">
                      Head of the GenAI Demo Division
                    </h4>
                    <h5 className="mt-1 text-xs tracking-tighter text-muted-foreground md:text-sm">
                      12 PoCs Developed • 10 different clients engaged (Public and
                      Private)
                    </h5>
                    <ul className={listClass}>
                      <li className={listItemClass}>
                        <p>
                          Founded and led GenAI capability for product delivery
                          supporting client proposals and maintaining market
                          leadership in AI transformation
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Designed program delivery model for three workstreams:
                          GenAI knowledge dissemination, L&D, and
                          client-specific product development
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Implemented CI/CD pipelines, opportunity tracking, and
                          marketplace asset management systems for simultaneous
                          multi-client development
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Ensured product quality through hands-on technical
                          leadership and mentorship of junior developers/product
                          owners
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Drove development of industry-specific solutions while
                          maintaining best practices for value-driven outcomes
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="relative group">
                  <div
                    className="absolute top-2 left-[-32px] z-10 size-4 rounded-full border-2 border-primary/40 bg-surface-container-high transition-colors group-hover:border-primary md:left-[-59px]"
                    aria-hidden
                  />
                  <div className="rounded border-l-4 border-outline-variant/30 bg-surface-container p-6 transition-all duration-300 hover:border-primary hover:bg-surface-container-high md:p-8">
                    <h4 className="font-heading text-2xl font-bold text-header">
                      UK Government AI Security Institute
                    </h4>
                    <h5 className="mt-1 text-xs tracking-tighter text-muted-foreground md:text-sm">
                      AI Security Infrastructure • Cross-Departmental Alignment •
                      Data-Driven Insights
                    </h5>
                    <ul className={listClass}>
                      <li className={listItemClass}>
                        <p>
                          Led strategy and operations for government department
                          overseeing AI safety research and infrastructure
                          development
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Established enterprise governance frameworks improving
                          cross-departmental alignment on AI safety initiatives
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Architected data strategy delivering financial and talent
                          insights through advanced analytics
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Developed testing protocols for advanced AI systems&apos;
                          societal impacts and safety measures
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Spearheaded infrastructure development for large-scale AI
                          safety evaluation frameworks
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Implemented metrics-driven approach to quantify AI&apos;s
                          societal impacts across diverse demographics
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PA Consulting */}
          <div>
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
                      <span className="mr-2">PA Consulating</span>
                    </span>
                    <span className="mt-1 block text-sm uppercase tracking-widest text-secondary">
                      <span className="text-paragraph">
                        | Data Science Consultant
                      </span>
                    </span>
                  </h3>
                </div>
              </div>
              <span className="shrink-0 text-lg whitespace-nowrap text-paragraph">
                2019 - 2021
              </span>
            </div>

            <div className="grid grid-cols-1 gap-0 md:grid-cols-[100px_1fr] md:gap-12">
              <div className="hidden md:block" aria-hidden />
              <div className="relative pl-12 md:pl-0">
                <div
                  className="pointer-events-none absolute top-0 bottom-0 left-3 w-0.5 bg-[linear-gradient(to_bottom,transparent,_#81ecff_15%,_#81ecff_85%,_transparent)] opacity-30 md:left-[-51px]"
                  aria-hidden
                />

                <div className="relative group 2xl:max-w-[83.333333%]">
                  <div
                    className="absolute top-2 left-[-36px] z-10 size-6 rounded-full border-2 border-primary bg-background shadow-[0_0_15px_#81ecff] md:left-[-63px]"
                    aria-hidden
                  >
                    <div className="absolute inset-1 rounded-full bg-primary motion-safe:animate-pulse motion-reduce:animate-none" />
                  </div>
                  <div className="rounded border-l-4 border-primary bg-surface-container p-6 transition-colors duration-300 hover:bg-surface-container-high md:p-8">
                    <h5 className="text-xs tracking-tighter text-muted-foreground md:text-sm">
                      Application of a wide range of data science skills to five
                      different sectors including Healthcare, Consumer, Financial
                      Services, Energy and Utilities, and Public Services. The
                      projects involved delivering the insights or the products to
                      the client by presenting it in a clear manner ensuring a deep
                      understanding during the handover. Most project involved the
                      usage of project management tools and collaboration within a
                      team.
                    </h5>
                    <ul className={listClass}>
                      <li className={listItemClass}>
                        <p>
                          Led team of 5 data scientists developing machine learning
                          model to predict elderly patient falls, deployed via web
                          app for actionable insights
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Analyzed wind turbine performance using Random Forest
                          regression/classification and neural networks to predict
                          failures and optimize maintenance schedules
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Digitized unstructured PDF documents into searchable
                          databases using AWS extraction tools enhanced with NLP
                          features
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Designed and deployed supply chain resilience tool combining
                          ML text-classification, NLP text-extraction/summarization,
                          and geospatial visualizations
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Developed LSTM model predicting telemetry alarm occurrences
                          at distribution sites, enabling optimized scheduling and
                          operational cost savings
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SAV */}
          <div>
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
              <span className="shrink-0 text-lg whitespace-nowrap text-paragraph">
                2017 - 2019
              </span>
            </div>

            <div className="grid grid-cols-1 gap-0 md:grid-cols-[100px_1fr] md:gap-12">
              <div className="hidden md:block" aria-hidden />
              <div className="relative pl-12 md:pl-0">
                <div
                  className="pointer-events-none absolute top-0 bottom-0 left-3 w-0.5 bg-[linear-gradient(to_bottom,transparent,_#81ecff_15%,_#81ecff_85%,_transparent)] opacity-30 md:left-[-51px]"
                  aria-hidden
                />

                <div className="relative group">
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
                          Led expansion of energy metering department, later
                          integrating wiring division to create cross-functional
                          capabilities
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Developed billing application for thermal disconnect
                          systems that facilitated joint venture partnership
                        </p>
                      </li>
                      <li className={listItemClass}>
                        <p>
                          Managed full project lifecycle from concept to operations,
                          overseeing technical implementation and stakeholder
                          alignment
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
