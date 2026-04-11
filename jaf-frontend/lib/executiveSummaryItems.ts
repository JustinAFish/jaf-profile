export type ExecutiveSummaryItem = {
  id: string;
  text: string;
  subpoints?: string[];
};

export const executiveSummaryItems: ExecutiveSummaryItem[] = [
  {
    id: "1",
    text: "Innovative and strategic leader with a proven track record of driving business growth through emerging technologies, including Generative AI",
  },
  {
    id: "2",
    text: "Adept at identifying opportunities, developing robust strategies, and delivering high-impact solutions that accelerate organisational success",
  },
  {
    id: "3",
    text: "Combines deep technical expertise with business acumen to apply design thinking and orchestrate AI-driven initiatives",
  },
  {
    id: "4",
    text: "Creates user-centric solutions that address key stakeholder needs",
  },
  {
    id: "5",
    text: "Experienced in leading multi-disciplinary teams to deliver high-value AI-driven initiatives that enhance revenue streams and competitive advantage",
  },
  {
    id: "6",
    text: "Articulate communicator skilled in crafting compelling business/technical documentation and delivering engaging presentations to diverse audiences",
  },
  {
    id: "7",
    text: "Full Stack Developer with strong Data Science expertise:",
    subpoints: [
      "Experienced in building Python backends with LLM integration",
      "Develop Next.js/React frontends and connecting APIs with FastAPI",
      "Proficient in deploying end-to-end solutions on cloud platforms",
    ],
  },
  {
    id: "8",
    text: "Technology Consultant of the Year nominee for 2025 MCA Awards (Winner announced November 2025)",
  },
];
