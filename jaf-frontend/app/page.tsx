"use client";
import HomeHero from "@/components/homeHero";
import HomeAbout from "@/components/homeAbout";
import HomeSkills from "@/components/homeSkills";
import HomeExperience from "@/components/homeExperience";
import HomeContact from "@/components/homeContact";
import HomeAwardsEdu from "@/components/homeAwardsEdu";
import { scrollToAboutSectionComplete } from "@/lib/homeAboutSection";
import { scrollToSkillsSectionComplete } from "@/lib/homeSkillsSection";
import { useEffect, useRef } from "react";
import { useGlActive } from "@/components/gl/useGlActive";

export default function Home() {
  const homeSectionRef = useRef<HTMLElement | null>(null);
  // When the WebGL layer is on, the wrapper goes transparent so the canvas
  // shows through the hero; every section below paints its own background.
  const glActive = useGlActive();
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash !== "#about" && hash !== "#skills") return;
    const t = window.setTimeout(() => {
      if (hash === "#about") {
        scrollToAboutSectionComplete({ behavior: "auto" });
      } else {
        scrollToSkillsSectionComplete({ behavior: "auto" });
      }
    }, 100);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      className={`flex min-h-screen text-foreground pt-[var(--site-header-height)] ${glActive ? "bg-transparent" : "bg-black"}`}
    >
      <main className="flex-1 w-full">
        <HomeHero ref={homeSectionRef} />

        <HomeAbout homeSectionRef={homeSectionRef} />

        <HomeSkills />

        <HomeExperience />

        <HomeAwardsEdu />

        <HomeContact />

        <footer className="py-8 text-center text-paragraph bg-background">
          <p>© {new Date().getFullYear()} Justin Fish. All Rights Reserved.</p>
        </footer>
      </main>
    </div>
  );
}
