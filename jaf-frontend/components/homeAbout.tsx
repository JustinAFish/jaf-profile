import { Card, CardHeader } from "./ui/card";

export default function HomeAbout() {
  return (
    <section
      id="about"
      className="py-20 px-16 bg-surface-container-low"
    >
      <Card className="group relative glass-surface rounded-md h-fit w-full mx-auto bg-surface-container-high/80 border-0 shadow-none transform transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 hover:shadow-[0_40px_60px_rgba(129,236,255,0.08)]">
        <h2 className="text-4xl font-heading font-bold text-header text-center pt-6 px-6">
          Executive Summary
        </h2>

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-md" />
        </div>
        <CardHeader>
          <ul className="space-y-4 text-lg md:text-xl text-paragraph list-disc pl-6">
            <li>
              Innovative and strategic leader with a proven track record of
              driving business growth through emerging technologies, including
              Generative AI
            </li>
            <li>
              Adept at identifying opportunities, developing robust strategies,
              and delivering high-impact solutions that accelerate
              organisational success
            </li>
            <li>
              Combines deep technical expertise with business acumen to apply
              design thinking and orchestrate AI-driven initiatives
            </li>
            <li>
              Creates user-centric solutions that address key stakeholder needs
            </li>
            <li>
              Experienced in leading multi-disciplinary teams to deliver
              high-value AI-driven initiatives that enhance revenue streams and
              competitive advantage
            </li>
            <li>
              Articulate communicator skilled in crafting compelling
              business/technical documentation and delivering engaging
              presentations to diverse audiences
            </li>
            <li>
              Full Stack Developer with strong Data Science expertise:
              <ul className="list-[circle] pl-6 mt-2 space-y-2">
                <li>
                  Experienced in building Python backends with LLM integration
                </li>
                <li>
                  Develop Next.js/React frontends and connecting APIs with
                  FastAPI
                </li>
                <li>
                  Proficient in deploying end-to-end solutions on cloud platforms
                </li>
              </ul>
            </li>
            <li>
              Technology Consultant of the Year nominee for 2025 MCA Awards
              (Winner announced November 2025)
            </li>
          </ul>
        </CardHeader>
      </Card>
    </section>
  );
}
