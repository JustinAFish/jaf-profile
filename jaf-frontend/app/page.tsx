"use client";
import HomeHero from "@/components/homeHero";
import HomeAbout from "@/components/homeAbout";
import HomeSkills from "@/components/homeSkills";
import HomeExperience from "@/components/homeExperience";
import HomeContact from "@/components/homeContact";
import HomeAwardsEdu from "@/components/homeAwardsEdu";
import { scrollToAboutSectionComplete } from "@/lib/homeAboutSection";
import { useEffect, useRef } from "react";

export default function Home() {
  const homeSectionRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (typeof window === "undefined" || window.location.hash !== "#about") {
      return;
    }
    const t = window.setTimeout(() => {
      scrollToAboutSectionComplete({ behavior: "auto" });
    }, 100);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="flex min-h-screen bg-black text-foreground pt-[var(--site-header-height)]">
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
