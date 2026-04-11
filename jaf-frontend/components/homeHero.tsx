import { Card } from "@nextui-org/react";
import { ShineBorder } from "@/components/magicui/shine-border";
import { ShineLine } from "@/components/magicui/shine-line";
import { Award } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomeHero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center py-24 md:py-16">
      <div className="absolute inset-0 z-0 -mt-8">
        <Image
          src="/data-background.jpeg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-surface/75" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start lg:items-center">
          {/* Editorial column */}
          <div className="space-y-10 lg:space-y-12 pt-4 lg:pt-8">
            <div className="space-y-5">
              <span className="inline-block px-3 py-1 text-[10px] font-heading uppercase tracking-[0.3em] text-primary border border-primary/30 rounded-sm bg-primary/5">
                Mission strategy
              </span>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tighter leading-[0.95]">
                Innovative <br />
                <span className="text-primary">strategic</span> <br />
                leader.
              </h1>
              <p
                id="changing-text"
                className="text-lg md:text-xl text-tertiary transition-opacity duration-500 font-medium tracking-tight"
              >
                Full Stack Data Scientist
              </p>
            </div>

            <div className="max-w-lg space-y-8">
              <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
                Innovative strategic leader with a proven track record of
                leveraging AI to drive business growth.
              </p>
              <div className="flex flex-col gap-4">
                <a
                  href="/data/Justin_Fish_CV_2025.pdf"
                  download="Justin_Fish_CV_2025.pdf"
                  className="flex items-center gap-4 group cursor-pointer"
                >
                  <div className="w-12 h-px bg-primary group-hover:w-20 transition-all duration-500" />
                  <span className="font-heading text-sm uppercase tracking-widest text-foreground/90 group-hover:text-primary transition-colors">
                    Download CV
                  </span>
                </a>
                <Link
                  href="/chat"
                  className="flex items-center gap-4 group cursor-pointer"
                >
                  <ShineLine />
                  <span className="font-heading text-sm uppercase tracking-widest text-foreground/90 group-hover:text-primary transition-colors">
                    AI chat
                  </span>
                </Link>
              </div>
            </div>

            <div className="pt-8 grid grid-cols-2 gap-8 border-t border-outline/20 max-w-md">
              <div>
                <div className="text-[10px] font-heading text-muted-foreground uppercase tracking-widest mb-1">
                  Coordinates
                </div>
                <div className="text-sm font-heading text-foreground">
                  LAT: 51.5074° N
                  <br />
                  LNG: 0.1278° W
                </div>
              </div>
              <div>
                <div className="text-[10px] font-heading text-muted-foreground uppercase tracking-widest mb-1">
                  Status
                </div>
                <div className="text-sm font-heading text-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                  ACTIVE_SYSTEM
                </div>
              </div>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative w-full flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[560px]">
              <div className="absolute -top-5 -left-5 w-20 h-20 sm:w-24 sm:h-24 border-t-2 border-l-2 border-primary/40 z-20 pointer-events-none" />
              <div className="absolute -bottom-5 -right-5 w-20 h-20 sm:w-24 sm:h-24 border-b-2 border-r-2 border-primary/40 z-20 pointer-events-none" />

              <div className="absolute top-16 -right-2 xl:-right-10 z-30 hidden xl:block p-3 sm:p-4 bg-surface-container/80 backdrop-blur-md border border-primary/20 shadow-xl rounded-sm">
                <div className="text-[10px] font-heading text-primary uppercase mb-2 tracking-wider">
                  Metrics_v.02
                </div>
                <div className="flex gap-4">
                  <div className="space-y-1 flex flex-col items-center">
                    <div className="h-12 w-1 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-[80%] w-full bg-primary rounded-full" />
                    </div>
                    <div className="text-[8px] font-heading text-muted-foreground">
                      STR
                    </div>
                  </div>
                  <div className="space-y-1 flex flex-col items-center">
                    <div className="h-12 w-1 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-[95%] w-full bg-secondary rounded-full" />
                    </div>
                    <div className="text-[8px] font-heading text-muted-foreground">
                      EXP
                    </div>
                  </div>
                  <div className="space-y-1 flex flex-col items-center">
                    <div className="h-12 w-1 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-[60%] w-full bg-tertiary rounded-full" />
                    </div>
                    <div className="text-[8px] font-heading text-muted-foreground">
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
                <Card className="relative w-full aspect-[4/5] max-h-[560px] bg-surface-container rounded-md overflow-hidden transform transition-all duration-300 hover:scale-[1.01] border-0 shadow-none hover:shadow-[0_40px_60px_rgba(129,236,255,0.12)]">
                  <ShineBorder
                    shineColor={["#81ecff", "#a68cff", "#7e51ff"]}
                    borderWidth={1}
                    duration={18}
                  />
                  <Image
                    src="/MCA.png"
                    alt="MCA Technology Consultant of the Year"
                    fill
                    className="object-contain p-4 rounded-md transition-transform duration-300 group-hover:scale-[1.03]"
                    priority
                  />
                  <div className="absolute inset-0 bg-surface/25 transition-opacity duration-300 group-hover:opacity-0 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 bg-gradient-to-t from-surface/95 to-transparent">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <h3 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                          MCA Awards 2025
                        </h3>
                        <p className="font-heading text-primary tracking-widest text-xs uppercase mt-1">
                          Technology Consultant of the Year
                        </p>
                      </div>
                      <Award
                        className="w-9 h-9 sm:w-11 sm:h-11 text-primary/60 shrink-0"
                        strokeWidth={1.25}
                        aria-hidden
                      />
                    </div>
                  </div>
                </Card>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
