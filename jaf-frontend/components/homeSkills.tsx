"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomeSkills() {
  const skillCategories = [
    {
      title: "Data Science",
      skills: [
        "Solution Architecture",
        "Machine Learning",
        "Generative AI / LLMs",
        "Deep Learning",
        "Natural Language Processing",
        "Git / Github",
        "Data Storytelling",
      ],
    },
    {
      title: "Programming",
      skills: [
        "Python",
        "React / Next.js",
        "SQL",
        "JavaScript / TypeScript",
        "TensorFlow / PyTorch",
        "Cloud Platforms (AWS, Azure, GCP)",
        "Database Design",
      ],
    },
    {
      title: "Product",
      skills: [
        "Agile Methodologies",
        "Product Strategy",
        "User Research",
        "Roadmap Development",
        "Stakeholder Management",
        "Product Development",
        "Product Lifecycles",
      ],
    },
    {
      title: "Soft Skills",
      skills: [
        "Leadership",
        "Communication",
        "Problem Solving",
        "Adaptability",
        "Decision Making",
        "Building Cohesive Teams",
        "Multiple Sector Experience",
      ],
    },
  ];

  return (
    <section id="skills" className="py-16 px-4 bg-background">
      <div className="px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-header">
            Skills
          </h2>
          <p className="text-label-md uppercase tracking-widest text-tertiary">
            Capabilities
          </p>
        </div>

        <div className="grid sm:grid-cols-2 2xl:grid-cols-4 gap-8">
          {skillCategories.map((category, index) => (
            <Card
              key={index}
              className="group relative rounded-md bg-surface-container-high/90 backdrop-blur-md border-0 shadow-none transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_40px_60px_rgba(129,236,255,0.08)]"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent rounded-md" />
              </div>
              <CardHeader>
                <CardTitle className="text-2xl font-heading text-primary">
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.skills.map((skill, skillIndex) => (
                    <div
                      key={skillIndex}
                      className="p-3 rounded-md bg-surface-container-lowest/80 ghost-border transform transition-all duration-200 hover:bg-surface-container/90 group/skill"
                    >
                      <p className="text-paragraph font-medium group-hover/skill:text-foreground transition-colors">
                        {skill}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
