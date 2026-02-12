export type NavLink = {
  label: string;
  href: string;
  sectionId: string;
  trackActive: boolean;
};

export type Category = {
  id: string;
  label: string;
  hint: string;
  questionPlaceholder: string;
  contextPlaceholder: string;
  icon: "ai_tech" | "market_research" | "competitive" | "business_strategy";
};

export type PromptExample = {
  id: string;
  label: string;
  categoryId: Category["id"];
  researchQuestion: string;
  optionalContext: string;
};

export type ReportType = "standard" | "premium";

export type PricingTier = {
  id: ReportType;
  label: string;
  badge: string;
  price: string;
  delivery: string;
  description: string;
  features: string[];
  cta: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqGroup = {
  id: string;
  title: string;
  description: string;
  items: FaqItem[];
};

export const landingSeo = {
  title: "BriefGen.ai | Analyst-Grade Research Reports On Demand",
  description:
    "Order analyst-grade research reports in minutes. Choose Standard (2-5 minutes) or Premium (within 24 hours), pay securely with Stripe, and receive a branded PDF by email.",
  ogTitle: "BriefGen.ai",
  ogDescription:
    "Analyst-grade AI, market, competitive, and strategy research reports. No accounts. Secure Stripe checkout. Delivered by email + PDF.",
};

export const headerContent = {
  brand: "BriefGen.ai",
  primaryCta: "Generate Report",
};

export const navLinks: NavLink[] = [
  { label: "How It Works", href: "#how-it-works", sectionId: "how-it-works", trackActive: true },
  { label: "Preview", href: "#sample-report", sectionId: "sample-report", trackActive: true },
  { label: "Pricing", href: "#report-form", sectionId: "report-form", trackActive: true },
  { label: "FAQ", href: "#faq", sectionId: "faq", trackActive: true },
];

export const heroContent = {
  eyebrow: "Pay-per-report research",
  title: "Professional research for $4.99 — delivered in minutes.",
  description:
    "Skip the $200/month commitment. Get an analyst-style PDF report with clear takeaways and sources, ready to share with clients or stakeholders.",
  primaryCta: "Generate Report",
  secondaryCta: "View Sample",
  pricingLine: "$14.99 Premium available for deeper rigor and delivery within 24 hours.",
  reassurance: "Review your prompt before checkout. Secure Stripe payment. Delivered by email as a branded PDF.",
  trustChips: ["Pay once", "No account", "Stripe checkout", "PDF delivered by email"],
  preview: {
    title: "Research report preview",
    badge: "Generated example",
    quickProof: ["Analyst-grade depth", "Pay once, no subscription", "PDF in 2-5 minutes"],
    pageLabelPrefix: "PDF Preview",
    totalPages: 8,
    tabs: [
      {
        id: "exec_summary",
        label: "Executive Summary",
        page: "Page 1",
        heading: "EXECUTIVE SUMMARY (Preview)",
        leadLabel: "Recommendation:",
        leadText:
          "For a 10-25 person services business, start with HubSpot Starter for fast setup and clean follow-up. Use Salesforce only if you have admin bandwidth or complex workflows.",
        bulletsTitle: "Why this default works:",
        bullets: [
          "Time-to-value: HubSpot is often live in a day with a basic pipeline and automations.",
          "Adoption risk: teams usually use HubSpot without heavy training.",
          "Cost control: spend tends to stay more predictable at small-team scale.",
        ],
        closingLabel: "Next step:",
        closingText:
          "Import 50 recent leads and run lead -> meeting -> follow-up end-to-end.",
      },
      {
        id: "deep_analysis",
        label: "Deep Analysis",
        page: "Page 4",
        heading: "DEEP ANALYSIS (Preview)",
        leadLabel: "What gets compared:",
        leadText:
          "The report scores each option across setup speed, adoption risk, reporting depth, and long-term operating cost.",
        bulletsTitle: "What you will see:",
        bullets: [
          "A side-by-side scorecard with practical tradeoffs",
          "Key implementation constraints and hidden risks",
          "A clear decision path, not just a list of pros/cons",
        ],
        closingLabel: "Watch-outs:",
        closingText:
          "Needs like advanced quoting, territory rules, or heavy permissioning can change the recommendation.",
      },
      {
        id: "sources",
        label: "Sources",
        page: "Page 8",
        heading: "SOURCES (Preview)",
        leadLabel: "Cited references:",
        leadText:
          "Each report includes a Sources & Further Reading section to validate key claims and speed up follow-up research.",
        bulletsTitle: "Typical source types:",
        bullets: [
          "Official product documentation and vendor resources",
          "Industry bodies, standards groups, and benchmarks",
          "Regulatory and market context references",
        ],
        closingLabel: "Result:",
        closingText:
          "You get a recommendation plus evidence you can defend with stakeholders.",
      },
    ],
  },
};

export const howItWorksContent = {
  title: "How It Works",
  description:
    "A focused flow for founders, consultants, and operators who need credible analysis without account setup or subscriptions.",
  steps: [
    {
      title: "Choose a category",
      description:
        "Select AI & technology, market research, competitive analysis, or business strategy.",
    },
    {
      title: "Enter your question",
      description:
        "Add your main question and optional context like geography, timeframe, constraints, or competitors.",
    },
    {
      title: "Review, then pay",
      description:
        "Confirm your prompt and tier, then complete secure Stripe checkout.",
    },
    {
      title: "Receive your report",
      description:
        "Get a branded PDF by email, with download access from your success page.",
    },
  ],
};

export const sampleReportContent = {
  title: "Sample Report",
  description: "See the exact deliverable before you pay — real pages from a generated report.",
  microcopy:
    "Sample generated from the prompt shown below. Your report will follow the same structure, tailored to your inputs.",
  includedTitle: "What's included",
  includedItems: [
    "Executive summary with bottom-line recommendation",
    "Background and context framing",
    "Detailed analysis with practical tradeoffs",
    "Opportunities, risks, and key takeaways",
    "Sources and further reading section",
  ],
  secondaryCta: "Generate your report",
};

export const reportCategories: Category[] = [
  {
    id: "ai_tech",
    icon: "ai_tech",
    label: "AI & Technology Analysis",
    hint: "Trends, architecture choices, vendor tradeoffs, and implementation timing.",
    questionPlaceholder:
      "Example: Should a 250-person SaaS company adopt AI support copilots now or wait 12 months?",
    contextPlaceholder:
      "Industry, stack, security requirements, budget range, and required integrations.",
  },
  {
    id: "market_research",
    icon: "market_research",
    label: "Market & Industry Research",
    hint: "Market size context, growth drivers, demand signals, and strategic timing windows.",
    questionPlaceholder:
      "Example: Is there a strong 2026 opportunity for AI compliance tooling in fintech?",
    contextPlaceholder:
      "Target geography, customer segment, timeframe, and key assumptions.",
  },
  {
    id: "competitive",
    icon: "competitive",
    label: "Competitive Analysis",
    hint: "Positioning, pricing, strengths, weaknesses, and decision criteria.",
    questionPlaceholder:
      "Example: Compare Notion AI, Coda AI, and ClickUp AI for a 60-person product org.",
    contextPlaceholder:
      "Current tools, required features, adoption concerns, and decision deadline.",
  },
  {
    id: "business_strategy",
    icon: "business_strategy",
    label: "Business Strategy",
    hint: "Unit economics, strategic risks, scenario planning, and execution priorities.",
    questionPlaceholder:
      "Example: What is the best GTM strategy for launching an AI research agency in healthcare?",
    contextPlaceholder:
      "Business model, pricing assumptions, target buyers, team size, and runway.",
  },
];

export const promptExamples: PromptExample[] = [
  {
    id: "ai-ops",
    label: "AI rollout timing for support",
    categoryId: "ai_tech",
    researchQuestion:
      "Should a 300-person B2B SaaS company deploy an AI support copilot in 2026, and what rollout plan minimizes risk?",
    optionalContext:
      "Current stack: Zendesk + Salesforce. Priorities: agent productivity and CSAT. Constraints: SOC 2, no customer data retention by vendors.",
  },
  {
    id: "fintech-market",
    label: "Fintech compliance market window",
    categoryId: "market_research",
    researchQuestion:
      "How attractive is the US fintech AI compliance software market for a new entrant over the next 18 months?",
    optionalContext:
      "Focus on mid-market financial services. Need TAM/SAM framing, buyer urgency signals, and likely sales-cycle blockers.",
  },
  {
    id: "ehr-competitive",
    label: "Healthcare AI vendor shortlisting",
    categoryId: "competitive",
    researchQuestion:
      "Compare AI clinical documentation vendors for regional hospital systems and recommend the best fit for reducing clinician note time.",
    optionalContext:
      "Region: United States. Budget up to $400k annually. Must integrate with Epic. Priorities: measurable time saved, implementation risk, and privacy controls.",
  },
  {
    id: "gTM-launch",
    label: "B2B GTM strategy decision",
    categoryId: "business_strategy",
    researchQuestion:
      "What GTM strategy should a new AI risk analytics startup prioritize in year one: direct sales, channel partners, or product-led growth?",
    optionalContext:
      "Team: 7 people. Runway: 15 months. ICP: US mid-market insurers. Need a phased plan with risks and milestone metrics.",
  },
  {
    id: "eu-market",
    label: "EU expansion opportunity",
    categoryId: "market_research",
    researchQuestion:
      "Is expanding a developer tooling SaaS into Germany and the Nordics a strong 2026 move versus doubling down in North America?",
    optionalContext:
      "Current ARR: $4.2M, primarily US. Need market-entry timing, buyer behavior differences, and pricing sensitivity signals.",
  },
  {
    id: "pricing-competition",
    label: "Pricing model comparison",
    categoryId: "competitive",
    researchQuestion:
      "Evaluate seat-based vs usage-based pricing for AI workflow platforms and recommend a model for a growing vertical SaaS product.",
    optionalContext:
      "Audience: compliance teams in healthcare. Goal: improve expansion revenue without increasing churn.",
  },
];

export const formContent = {
  title: "Generate Your Report",
  description: "",
  categoryLegend: "Research category",
  emailLabel: "Email for delivery",
  emailPlaceholder: "you@company.com",
  questionLabel: "Your research question",
  questionCta: "Try an example",
  contextLabel: "Optional context",
  guidanceTitle: "Some of our customer's previous questions",
  guidanceItems: [
    "Should a regional dental group open two new clinics in 2026 or focus on increasing utilization at existing locations first?",
    "Compare HubSpot, Salesforce, and Pipedrive for a 12-person services company that needs better lead tracking without a full-time admin.",
    "Is now a good time for a mid-size food manufacturer to expand into private-label products, and what margin risks should we expect?",
    "I run a neighborhood daycare. What is the best way to price part-time vs full-time plans so we stay profitable and keep families happy?",
    "I am a high school principal. Which AI tutoring tools are realistic for our budget, and what rollout plan would protect teacher adoption?",
    "My family runs a roofing business. Should we hire one more crew or invest in better scheduling software first for next season?",
    "What market entry strategy should a bootstrapped cybersecurity startup prioritize for its first 20 enterprise customers?",
  ],
  reviewHint:
    "Pay-per-report with no subscription. You will review your category, question, context, email, and tier before checkout.",
  reassuranceLine: "Secure checkout via Stripe • No account required • Pay-per-report • Delivered by email + PDF",
  emailHelper: {
    empty: "We send your PDF report to this email.",
    valid: "Email looks good.",
    invalid: "Please enter a valid email address.",
  },
  questionHelper: {
    empty: "Minimum 20 characters required.",
    valid: "Looks good",
  },
  validation: {
    categoryRequired: "Choose a category to continue.",
    emailInvalid: "Enter a valid email address for delivery.",
    addCharacters: "Add {count} more characters to your question.",
    shortenCharacters: "Shorten your input by {count} characters.",
    requiredFields: "Please complete required fields before checkout.",
  },
  ui: {
    promptReviewHint: "Prompt review before checkout",
    comparisonTitle: "What should I choose?",
    comparisonFeature: "Question",
    comparisonStandard: "Standard",
    comparisonPremium: "Premium",
    afterCheckoutTitle: "After checkout",
    supportPrefix: "Questions? Email",
    questionGuidance: "Add enough detail for a useful report.",
  },
  modal: {
    eyebrow: "Prompt review",
    title: "Confirm details before secure checkout",
    categoryLabel: "Category",
    tierLabel: "Tier",
    emailLabel: "Delivery email",
    questionLabel: "Research question",
    contextLabel: "Optional context",
    reassurance: "Secure checkout via Stripe. No account required. You will be redirected to Stripe to complete checkout.",
    editButton: "Edit Prompt",
    confirmPrefix: "Confirm & Continue",
  },
};

export const pricingTiers: PricingTier[] = [
  {
    id: "standard",
    label: "Standard",
    badge: "Most popular",
    price: "$4.99",
    delivery: "Typically 2-5 minutes",
    description: "Optimized for speed and strong decision support when you need an answer quickly.",
    features: [
      "Structured analyst-style report",
      "Executive summary + key takeaways",
      "Cited sources section",
      "Delivered as branded PDF by email",
    ],
    cta: "Review Standard",
  },
  {
    id: "premium",
    label: "Premium",
    badge: "Deeper rigor",
    price: "$14.99",
    delivery: "Delivered within 24 hours",
    description: "Optimized for rigor, nuance, and higher-stakes decisions with deeper analysis depth.",
    features: [
      "Everything in Standard",
      "Scenario analysis with explicit tradeoffs",
      "Prioritized action plan",
      "1-page decision brief at the top",
    ],
    cta: "Review Premium",
  },
];

export const pricingComparisonRows = [
  {
    label: "Best when...",
    standard: "You want full analyst-style depth quickly for most important decisions",
    premium: "You need deeper analysis before a bigger decision",
  },
  {
    label: "How fast?",
    standard: "Usually 2-5 minutes",
    premium: "Delivered within 24 hours",
  },
  {
    label: "What you get",
    standard: "Executive summary, analysis, risks, and sources",
    premium: "Everything in Standard plus a 1-page decision brief and scenario analysis",
  },
  {
    label: "If you're unsure",
    standard: "Start here for most everyday decisions",
    premium: "Choose this for board, client, or higher-stakes calls",
  },
];

export const afterCheckoutItems = [
  "Standard reports usually arrive in 2-5 minutes. Premium reports are delivered within 24 hours.",
  "Delivery includes a download link and a PDF copy in your email inbox.",
  "If you do not see it, check spam or promotions and search for BriefGen.ai.",
  "Need help or made a mistake? Contact support and include your order email.",
  "Reports are retained for 30 days to support re-download, then deleted.",
];

export const trustItems = [
  {
    title: "Decision-ready structure",
    description: "Executive-summary-first format built for fast reading and stakeholder alignment.",
    icon: "structure",
  },
  {
    title: "Cited sources",
    description: "Each report includes a curated source list for deeper follow-up and verification.",
    icon: "sources",
  },
  {
    title: "Secure checkout",
    description: "Payments are processed through Stripe with industry-standard security controls.",
    icon: "stripe",
  },
  {
    title: "Email + PDF delivery",
    description: "You receive a branded PDF by email and can also download from the success page.",
    icon: "delivery",
  },
] as const;

export const whatYouGetContent = {
  title: "Built for Real Decisions",
  description: "Product-grade experience with practical delivery standards and clear trust cues.",
};

export const faqContent = {
  title: "Frequently Asked Questions",
  description: "Clear answers on delivery, quality, billing, and data handling.",
};

export const faqGroups: FaqGroup[] = [
  {
    id: "delivery",
    title: "Delivery & Access",
    description: "Timing, email delivery, and download access.",
    items: [
      {
        question: "How long does delivery take, and what can cause delays?",
        answer:
          "Standard reports are typically delivered in 2-5 minutes. Premium reports are delivered within 24 hours. Delays are uncommon but can happen during payment verification, provider outages, or unusual queue spikes.",
      },
      {
        question: "What if I do not receive the email?",
        answer:
          "Check spam, promotions, and any security filters first. Then search for BriefGen.ai in your inbox. If it is still missing, contact support with the email used at checkout so we can resend access.",
      },
      {
        question: "Can I download the report later, and do links expire?",
        answer:
          "Yes. Your success page includes a download link, and the report is also sent by email. We retain reports for up to 30 days to support delivery and re-download, then delete them.",
      },
      {
        question: "Can I regenerate a report if I lose access?",
        answer:
          "Yes, within the 30-day retention window. Contact support with your order details and we can re-send access after verification.",
      },
    ],
  },
  {
    id: "quality",
    title: "Content & Quality",
    description: "What is included and how depth differs by tier.",
    items: [
      {
        question: "What is included in a Standard report?",
        answer:
          "Standard includes a structured report with an executive summary, deep analysis sections, opportunities and risks, key takeaways, and cited sources, optimized for speed.",
      },
      {
        question: "What is included in Premium, and what makes it different?",
        answer:
          "Premium adds deeper rigor, scenario analysis with explicit tradeoffs, and a prioritized action plan. It also includes a one-page decision brief at the top for faster executive review.",
      },
      {
        question: "What does cited sources mean, and are sources clickable?",
        answer:
          "Reports include a sources section pointing to publications, company materials, and research references used during analysis. When available, links are provided in a clickable format.",
      },
      {
        question: "Are some sources paywalled or restricted?",
        answer:
          "Yes. Some high-value market reports and journals may require subscriptions. We reference them when relevant and balance with publicly accessible sources where possible.",
      },
      {
        question: "How current is the information?",
        answer:
          "Reports use information available at generation time, including recent public sources when relevant. For fast-moving topics, treat the report as a decision input and verify critical facts before acting.",
      },
      {
        question: "Can you research niche industries or non-US markets?",
        answer:
          "Yes. Include your geography, market segment, and constraints in the prompt. More specific context improves coverage for niche sectors and international analysis.",
      },
      {
        question: "Can I request a different structure or emphasis?",
        answer:
          "Yes. Use the optional context field to specify what matters most, such as pricing analysis, risk framing, GTM options, or implementation sequencing.",
      },
    ],
  },
  {
    id: "support",
    title: "Edits, Corrections, Support",
    description: "How to resolve mistakes or quality issues quickly.",
    items: [
      {
        question: "Can I request revisions or corrections?",
        answer:
          "Yes. If a report is clearly off-prompt, contact support within 7 days with your report ID and correction notes. We will offer one free regeneration or a refund.",
      },
      {
        question: "What if I typed the wrong email or made a mistake in the prompt?",
        answer:
          "Contact support immediately with your order email and corrected details. If we catch it before delivery finalizes, we can update routing and prompt details.",
      },
      {
        question: "What if the report misses the mark?",
        answer:
          "Send your report ID and where it missed. For clear off-prompt output reported within 7 days, we offer one free regeneration or a refund.",
      },
    ],
  },
  {
    id: "billing",
    title: "Billing & Receipts",
    description: "Payments, invoices, and pricing questions.",
    items: [
      {
        question: "Is payment secure?",
        answer:
          "Yes. Checkout is handled by Stripe using secure, industry-standard payment infrastructure. BriefGen.ai does not directly store your card details.",
      },
      {
        question: "Will I get a receipt or invoice?",
        answer:
          "Yes. Stripe provides payment confirmation at checkout, and you can contact support if your finance team needs additional documentation.",
      },
      {
        question: "Do you offer refunds or team pricing?",
        answer:
          "If a report is not delivered or the download link is broken, we will refund you. If a report is clearly off-prompt, we will regenerate it once at no charge or refund it. Requests must be made within 7 days of purchase. For team or volume pricing, contact support@briefgen.ai.",
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy & Appropriate Use",
    description: "How data is handled and what reports are for.",
    items: [
      {
        question: "How long do you retain reports?",
        answer:
          "We retain reports for up to 30 days to support delivery and re-download, then delete them.",
      },
      {
        question: "Who can access my prompts and reports?",
        answer:
          "Access is limited to production systems and authorized staff supporting generation, delivery, and customer support.",
      },
      {
        question: "Do you use my data to train models?",
        answer:
          "No. We do not use your prompts or reports to train models.",
      },
      {
        question: "Do you sell my data?",
        answer:
          "No. We do not sell or resell prompts, reports, or customer data.",
      },
      {
        question: "Is this legal, medical, or financial advice?",
        answer:
          "No. Reports are for research support and decision preparation, not professional legal, medical, or investment advice. Verify critical claims with qualified advisors.",
      },
    ],
  },
];

const flattenedFaqItems = faqGroups.flatMap((group) => group.items);

export const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: flattenedFaqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export const footerContent = {
  legal: "BriefGen.ai",
  trustLine: "Secure checkout by Stripe. Reports delivered by email as downloadable PDFs.",
};
