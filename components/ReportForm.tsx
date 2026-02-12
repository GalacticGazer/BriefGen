"use client";

import { FormEvent, useMemo, useState } from "react";

type Category = {
  id: string;
  label: string;
  hint: string;
  questionPlaceholder: string;
  contextPlaceholder: string;
};

type ReportType = "standard" | "premium";

const categories: Category[] = [
  {
    id: "ai_tech",
    label: "AI & Technology Analysis",
    hint: "Trends, architecture, vendors, and implementation tradeoffs.",
    questionPlaceholder:
      "Example: Should a 250-person SaaS company adopt AI support copilots now or wait 12 months?",
    contextPlaceholder:
      "Industry, stack, security constraints, budget range, and required integrations.",
  },
  {
    id: "market_research",
    label: "Market & Industry Research",
    hint: "TAM/SAM/SOM context, growth drivers, and timing windows.",
    questionPlaceholder:
      "Example: Is there a strong 2026 opportunity for AI compliance tooling in fintech?",
    contextPlaceholder:
      "Target geography, customer segment, timeframe, and key assumptions.",
  },
  {
    id: "competitive",
    label: "Competitive Analysis",
    hint: "Positioning, pricing, strengths, and decision criteria.",
    questionPlaceholder:
      "Example: Compare Notion AI, Coda AI, and ClickUp AI for a 60-person product org.",
    contextPlaceholder:
      "Current tools, required features, adoption concerns, and decision deadline.",
  },
  {
    id: "business_strategy",
    label: "Business Strategy",
    hint: "Unit economics, strategic risks, and recommendation path.",
    questionPlaceholder:
      "Example: What is the best GTM strategy for launching an AI research agency in healthcare?",
    contextPlaceholder:
      "Business model, pricing assumptions, target buyers, team size, and runway.",
  },
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_QUESTION_LENGTH = 20;
const MAX_PROMPT_LENGTH = 2000;

const examplePrompt = {
  categoryId: "competitive",
  researchQuestion:
    "Compare AI documentation tools for mid-size hospital systems and recommend the best fit for reducing clinician note time in 2026.",
  optionalContext:
    "Region: United States. Budget: up to $400k annually. Must integrate with Epic. Priorities: measurable time saved per clinician, implementation risk, and privacy controls.",
};

function buildQuestionPayload(mainQuestion: string, optionalContext: string): string {
  const trimmedQuestion = mainQuestion.trim();
  const trimmedContext = optionalContext.trim();

  if (!trimmedContext) {
    return trimmedQuestion;
  }

  return `${trimmedQuestion}\n\nAdditional context:\n${trimmedContext}`;
}

function CategoryIcon({ id }: { id: string }) {
  const baseClasses = "h-5 w-5 text-brand-600";

  if (id === "ai_tech") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={baseClasses}>
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <path d="M9 9h6v6H9z" />
      </svg>
    );
  }

  if (id === "market_research") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={baseClasses}>
        <path d="M5 18V8" />
        <path d="M12 18V5" />
        <path d="M19 18v-7" />
      </svg>
    );
  }

  if (id === "competitive") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={baseClasses}>
        <path d="M5 17l5-5 3 3 6-7" />
        <path d="M17 8h2v2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={baseClasses}>
      <path d="M12 4v16" />
      <path d="M4 12h16" />
      <path d="M7.5 7.5l9 9" />
      <path d="M16.5 7.5l-9 9" />
    </svg>
  );
}

export default function ReportForm() {
  const [categoryId, setCategoryId] = useState<string>(categories[0].id);
  const [email, setEmail] = useState("");
  const [researchQuestion, setResearchQuestion] = useState("");
  const [optionalContext, setOptionalContext] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId),
    [categoryId],
  );

  const questionLength = researchQuestion.trim().length;
  const payloadLength = buildQuestionPayload(researchQuestion, optionalContext).trim().length;
  const isWithinLimit = payloadLength <= MAX_PROMPT_LENGTH;
  const isQuestionReady = questionLength >= MIN_QUESTION_LENGTH;

  const isValid = emailRegex.test(email.trim()) && isQuestionReady && isWithinLimit && Boolean(selectedCategory);

  const createCheckoutSession = async (reportType: ReportType) => {
    if (!selectedCategory || !isValid) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory.id,
          question: buildQuestionPayload(researchQuestion, optionalContext),
          email: email.trim(),
          reportType,
        }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setError("Checkout URL was not returned. Please try again.");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValid || isLoading) {
      return;
    }

    await createCheckoutSession("standard");
  };

  const handlePremiumClick = async () => {
    if (!isValid || isLoading) {
      return;
    }

    await createCheckoutSession("premium");
  };

  const fillExample = () => {
    setCategoryId(examplePrompt.categoryId);
    setResearchQuestion(examplePrompt.researchQuestion);
    setOptionalContext(examplePrompt.optionalContext);
  };

  return (
    <section id="report-form" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-gray-900">Generate Your Report</h2>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-600">
          Submit your research question, choose delivery depth, and continue to secure checkout.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-7">
            <fieldset>
              <legend className="mb-4 text-sm font-medium text-gray-700">Research category</legend>
              <div className="grid gap-3 md:grid-cols-2">
                {categories.map((category) => {
                  const isSelected = category.id === categoryId;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setCategoryId(category.id)}
                      disabled={isLoading}
                      className={`relative rounded-2xl border bg-white p-5 text-left shadow-sm transition-all ${
                        isSelected
                          ? "border-brand-500 bg-brand-50/60"
                          : "border-gray-200 hover:-translate-y-0.5 hover:border-brand-300"
                      } disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50`}
                    >
                      {isSelected && (
                        <span className="absolute top-3 right-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white">
                          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                            <path d="m4 10 4 4 8-8" />
                          </svg>
                        </span>
                      )}
                      <div className="flex items-start gap-3">
                        <CategoryIcon id={category.id} />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{category.label}</p>
                          <p className="mt-1 text-xs leading-5 text-gray-600">{category.hint}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Work email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="you@company.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="research-question" className="text-sm font-medium text-gray-700">
                  Your research question
                </label>
                <button
                  type="button"
                  onClick={fillExample}
                  disabled={isLoading}
                  className="text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700 disabled:text-gray-400"
                >
                  Try an example
                </button>
              </div>
              <textarea
                id="research-question"
                value={researchQuestion}
                onChange={(event) => setResearchQuestion(event.target.value)}
                placeholder={selectedCategory?.questionPlaceholder}
                className="min-h-40 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
                disabled={isLoading}
              />
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <p
                  className={`${
                    questionLength === 0
                      ? "text-gray-500"
                      : isQuestionReady && isWithinLimit
                        ? "text-green-600"
                        : "text-amber-700"
                  }`}
                >
                  {questionLength === 0
                    ? "Minimum 20 characters required."
                    : isQuestionReady && isWithinLimit
                      ? "Looks good"
                      : questionLength < MIN_QUESTION_LENGTH
                        ? `Add ${MIN_QUESTION_LENGTH - questionLength} more characters.`
                        : `Shorten by ${payloadLength - MAX_PROMPT_LENGTH} characters.`}
                </p>
                <p className="text-gray-500">{payloadLength}/{MAX_PROMPT_LENGTH}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="optional-context" className="text-sm font-medium text-gray-700">
                Optional context
              </label>
              <textarea
                id="optional-context"
                value={optionalContext}
                onChange={(event) => setOptionalContext(event.target.value)}
                placeholder={selectedCategory?.contextPlaceholder}
                className="min-h-32 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                disabled={isLoading}
              />
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <p className="text-sm font-semibold text-gray-900">Best results include</p>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>Target market or buyer segment</li>
                <li>Timeframe and geography</li>
                <li>Competitors or alternatives you care about</li>
                <li>Constraints such as budget, compliance, or tooling</li>
              </ul>
            </div>
          </div>

          <aside className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-700">You&apos;ll review your prompt before paying.</p>
            <p className="mt-2 text-xs leading-5 text-gray-500">
              No account required. We retain your prompt and report only as needed to generate,
              deliver, and provide download access.
            </p>

            {error && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-6 space-y-4">
              <article className="rounded-2xl border border-brand-300 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">Standard</p>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    Most popular
                  </span>
                </div>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">$4.99</p>
                <p className="mt-1 text-sm text-gray-500">Delivered in minutes</p>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  AI-generated, structured, cited, and delivered fast for immediate decisions.
                </p>
                <button
                  type="submit"
                  disabled={!isValid || isLoading}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {isLoading ? "Redirecting..." : "Generate Standard Report"}
                </button>
                <p className="mt-2 text-center text-xs text-gray-500">You&apos;ll review your prompt before paying.</p>
              </article>

              <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">Premium</p>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    Deeper rigor
                  </span>
                </div>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">$14.99</p>
                <p className="mt-1 text-sm text-gray-500">Delivered within 24 hours</p>
                <ul className="mt-3 space-y-1 text-sm leading-6 text-gray-600">
                  <li>Scenario analysis with explicit tradeoffs</li>
                  <li>Competitive landscape + decision criteria</li>
                  <li>Prioritized recommendation plan (what to do first)</li>
                  <li>1-page decision brief at the top</li>
                </ul>
                <button
                  type="button"
                  onClick={handlePremiumClick}
                  disabled={!isValid || isLoading}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-brand-500 px-6 py-3.5 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
                >
                  {isLoading ? "Redirecting..." : "Generate Premium Report"}
                </button>
                <p className="mt-2 text-center text-xs text-gray-500">You&apos;ll review your prompt before paying.</p>
              </article>
            </div>

            <p className="mt-5 text-xs font-medium text-gray-600">
              Secure checkout via Stripe • No account required • Delivered by email + PDF
            </p>
            <p className="mt-4 text-xs font-medium text-gray-600">Not satisfied? We&apos;ll fix it.</p>
            <p className="mt-2 text-xs text-gray-500">
              Questions? Email{" "}
              <a
                href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@briefgen.ai"}`}
                className="font-medium text-brand-600 hover:text-brand-700"
              >
                {process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@briefgen.ai"}
              </a>
            </p>
          </aside>
        </form>
      </div>
    </section>
  );
}
