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
    category: "Market & Industry Research",
    generatedAt: "February 2026",
    prompt:
      "How attractive is the U.S. fintech AI compliance software market for a new entrant over the next 18 months?",
    optionalContext:
      "Focus on mid-market financial services. Need TAM/SAM framing, buyer urgency signals, and likely sales-cycle blockers.",
    downloadUrl: "/samples/premium-report.pdf",
    available: true,
    pages: [
      {
        id: "market_overview",
        label: "Market overview",
        page: "Page 1",
        image: "/samples/premium/market-overview.webp",
        alt: "Premium sample market overview page with TAM and growth context",
      },
      {
        id: "buyer_urgency",
        label: "Buyer urgency",
        page: "Page 3",
        image: "/samples/premium/buyer-urgency.webp",
        alt: "Premium sample page outlining urgency signals for compliance software buyers",
      },
      {
        id: "sales_cycle_blockers",
        label: "Sales blockers",
        page: "Page 5",
        image: "/samples/premium/sales-cycle-blockers.webp",
        alt: "Premium sample page covering common blockers in RegTech sales cycles",
      },
      {
        id: "sources",
        label: "Sources",
        page: "Page 8",
        image: "/samples/premium/sources.webp",
        alt: "Premium sample sources section with citations and links",
      },
    ],
  },
];
