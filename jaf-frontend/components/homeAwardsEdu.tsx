import { Card, CardHeader } from "./ui/card";

export default function HomeAwardsEdu() {
  return (
    <section
      id="awards"
      className="scroll-mt-[var(--site-header-height)] py-20 px-4 sm:px-8 md:px-12 lg:px-16 bg-background"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="group relative rounded-md glass-surface bg-surface-container-high/85 border-0 shadow-none transform transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 hover:shadow-[0_40px_60px_rgba(129,236,255,0.08)] flex flex-col">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-md" />
          </div>
          <CardHeader className="flex-1 flex flex-col">
            <h2 className="text-4xl font-heading font-bold text-header text-center mb-8">
              Awards and Certifications
            </h2>
            <ul className="space-y-4 text-lg md:text-xl text-paragraph list-disc pl-6 flex-1">
              <li>
                2025 MCA Technology Consultant of the Year Finalist (Winner
                announced November 2025)
              </li>
              <li>
                AWS Certifications: Certified Solutions Architect - Associate,
                Generative AI Essentials
              </li>
              <li>
                Microsoft Certified: Develop Generative AI solutions with Azure
                OpenAI Service
              </li>
              <li>Google Cloud Certified: Professional Data Engineer</li>
              <li>Professional Scrum Master™ I</li>
              <li>Professional Scrum Product Owner™ I</li>
              <li>Databricks Lakehouse Fundamentals</li>
            </ul>
          </CardHeader>
        </Card>

        <Card className="group relative rounded-md glass-surface bg-surface-container-high/85 border-0 shadow-none transform transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 hover:shadow-[0_40px_60px_rgba(129,236,255,0.08)] flex flex-col">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent rounded-md" />
          </div>
          <CardHeader className="flex-1 flex flex-col">
            <div className="text-center flex-1 flex flex-col justify-center space-y-6">
              <p className="text-label-md uppercase tracking-widest text-tertiary">
                Stellenbosch University
              </p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-header">
                Bachelor of Engineering (Mechanical) (Honours)
              </h2>
              <h3 className="text-xl md:text-2xl text-header font-medium">
                Dean&apos;s Merit (Top 10% of the class)
              </h3>
              <h3 className="text-xl md:text-2xl text-header font-medium">
                Golden Key member (Top 15% in all of Engineering)
              </h3>
              <h3 className="text-xl md:text-2xl text-header font-medium">
                1st Class
              </h3>
            </div>
          </CardHeader>
        </Card>
      </div>
    </section>
  );
}
