export type SamplePage = {
  id: string;
  label: string;
  page: string;
  image: string;
  alt: string;
};

export type FeaturedSample = {
  id: string;
  title: string;
  tier: "Standard" | "Premium";
  category: string;
  generatedAt: string;
  prompt: string;
  optionalContext: string;
  downloadUrl?: string;
  available: boolean;
  pages: SamplePage[];
  decisionBriefPreview?: {
    heading: string;
    bullets: string[];
  };
  statusNote?: string;
};

export const featuredSamples: FeaturedSample[] = [
  {
    id: "standard",
    title: "Featured Sample: Standard",
    tier: "Standard",
    category: "Competitive Analysis",
    generatedAt: "February 12, 2026",
    prompt:
      "Evaluate seat-based vs usage-based pricing for AI workflow platforms and recommend a model for a growing vertical SaaS product.",
    optionalContext:
      "Audience: compliance teams in healthcare. Goal: improve expansion revenue without increasing churn.",
    downloadUrl: "/samples/standard-report.pdf",
    available: true,
    pages: [
      {
        id: "summary",
        label: "Exec Summary",
        page: "Page 1",
        image: "/samples/standard/executive-summary.webp",
        alt: "Standard sample executive summary with bottom-line recommendation",
      },
      {
        id: "analysis",
        label: "Deep analysis",
        page: "Page 4",
        image: "/samples/standard/deep-analysis.webp",
        alt: "Standard sample deep analysis page with pricing model evaluation",
      },
      {
        id: "key_takeaways",
        label: "Key takeaways",
        page: "Page 6",
        image: "/samples/standard/key-takeaways.webp",
        alt: "Standard sample key takeaways section with practical recommendations",
      },
      {
        id: "sources",
        label: "Sources",
        page: "Page 8",
        image: "/samples/standard/sources.webp",
        alt: "Standard sample sources and further reading section",
      },
    ],
  },
  {
    id: "premium",
    title: "Featured Sample: Premium",
    tier: "Premium",
    category: "Business Strategy",
    generatedAt: "Coming soon",
    prompt:
      "Should a vertical AI compliance platform expand into EU healthcare in 2026, and what entry strategy minimizes regulatory and execution risk?",
    optionalContext:
      "Current market: US mid-market providers. Need scenario modeling, a one-page decision brief, and a prioritized 90-day action plan.",
    available: false,
    pages: [],
    statusNote:
      "Premium sample pages are being finalized in this build. The viewer is ready and will display real Premium pages as soon as they are published.",
    decisionBriefPreview: {
      heading: "Premium one-page decision brief includes",
      bullets: [
        "Recommendation confidence score with top assumptions",
        "Scenario table: base / upside / downside outcomes",
        "Top 3 risks with immediate mitigations",
        "Prioritized 90-day action plan",
      ],
    },
  },
];
