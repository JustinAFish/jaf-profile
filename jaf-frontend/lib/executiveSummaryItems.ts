export type ExecutiveSummaryItem = {
  id: string;
  text: string;
  subpoints?: string[];
};

export const executiveSummaryItems: ExecutiveSummaryItem[] = [
  {
    id: "1",
    text: "Highly Commended MCA Technology Consultant of the Year 2025 — recognised for bridging complex AI engineering and executive-level business value.",
  },
  {
    id: "2",
    text: "AI Consultant with 8+ years driving enterprise AI transformation — from identifying high-impact opportunities to building and deploying production-ready solutions with measurable business outcomes.",
  },
  {
    id: "3",
    text: "Proven track record leading multidisciplinary teams of up to 15 to deliver Generative AI, LLM, and agentic solutions for major UK Government and Enterprise clients — including £350m in cost efficiency and 50% reductions in processing time.",
  },
  {
    id: "4",
    text: "Skilled at engaging stakeholders at all levels — from frontline engineering teams to C-suite executives — through technical workshops, solution discovery, and clear business communication.",
  },
  {
    id: "5",
    text: "Full-stack AI engineering capability: Python with LLM integration (LangChain, RAG pipelines, agentic architectures), React/Next.js frontends, CI/CD, and cloud deployment across AWS, Azure, and GCP.",
  },
  {
    id: "6",
    text: "Strong product leadership — owning the end-to-end product lifecycle, translating AI capabilities into business value propositions, securing £5M+ in executive investment, and driving 90%+ user adoption through iterative design.",
  },
  {
    id: "7",
    text: "Cloud-certified across AWS, Azure, and GCP:",
    subpoints: [
      "Google Cloud Professional Data Engineer",
      "AWS Certified Solutions Architect — Associate",
      "Microsoft Azure OpenAI Service · Databricks Lakehouse Fundamentals",
    ],
  },
];
