"use client";
import { useEffect } from "react";
import HomeHero from "@/components/homeHero";
import HomeAbout from "@/components/homeAbout";
import HomeSkills from "@/components/homeSkills";
import HomeExperience from "@/components/homeExperience";
import HomeContact from "@/components/homeContact";
import HomeAwardsEdu from "@/components/homeAwardsEdu";

export default function Home() {
  useEffect(() => {
    const titles = [
      "Full Stack Data Scientist",
      "Product Owner",
      "Solution Architect",
    ];
    let index = 0;
    const changingText = document.getElementById("changing-text");

    if (changingText) {
      const interval = setInterval(() => {
        index = (index + 1) % titles.length;
        changingText.style.opacity = "0";

        setTimeout(() => {
          changingText.textContent = titles[index];
          changingText.style.opacity = "1";
        }, 500);
      }, 3000);

      return () => clearInterval(interval);
    } else {
      console.warn('Element with ID "changing-text" not found');
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground pt-16">
      <main className="flex-1 w-full">
        <HomeHero />

        <HomeAbout />

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
