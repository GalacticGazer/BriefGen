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
    hint: "Trends, architecture, vendors, implementation tradeoffs.",
    questionPlaceholder:
      "Example: Should a 250-person SaaS company adopt AI support copilots now or wait 12 months?",
    contextPlaceholder:
      "Industry, stack, security constraints, budget range, and required integrations.",
  },
  {
    id: "market_research",
    label: "Market & Industry Research",
    hint: "Market size, growth drivers, segments, and timing windows.",
    questionPlaceholder:
      "Example: Is there a strong 2026 opportunity for AI compliance tooling in fintech?",
    contextPlaceholder:
      "Target geography, customer segment, time horizon, and known assumptions.",
  },
  {
    id: "competitive",
    label: "Competitive Analysis",
    hint: "Positioning, pricing, strengths, weaknesses, and decision criteria.",
    questionPlaceholder:
      "Example: Compare Notion AI, Coda AI, and ClickUp AI for a 60-person product org.",
    contextPlaceholder:
      "Current tools, required features, adoption concerns, and decision deadline.",
  },
  {
    id: "business_strategy",
    label: "Business Strategy",
    hint: "Unit economics, risks, recommendations, and practical next steps.",
    questionPlaceholder:
      "Example: What is the best GTM strategy for launching an AI research agency in healthcare?",
    contextPlaceholder:
      "Business model, pricing ideas, target buyers, team size, and runway limits.",
  },
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildQuestionPayload(mainQuestion: string, optionalContext: string): string {
  const trimmedQuestion = mainQuestion.trim();
  const trimmedContext = optionalContext.trim();

  if (!trimmedContext) {
    return trimmedQuestion;
  }

  return `${trimmedQuestion}\n\nAdditional context:\n${trimmedContext}`;
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

  const isValid =
    emailRegex.test(email.trim()) && researchQuestion.trim().length >= 20 && Boolean(selectedCategory);

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

  return (
    <section id="report-form" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-gray-900">
          Generate Your Report
        </h2>
        <p className="mt-4 max-w-3xl text-gray-600">
          Submit your research question, choose delivery depth, and continue to secure checkout.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <fieldset>
              <legend className="mb-3 text-sm font-medium text-gray-700">Research category</legend>
              <div className="grid gap-3 md:grid-cols-2">
                {categories.map((category) => {
                  const isSelected = category.id === categoryId;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setCategoryId(category.id)}
                      disabled={isLoading}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        isSelected
                          ? "border-brand-500 bg-brand-50/60"
                          : "border-gray-200 bg-white hover:border-brand-300"
                      } disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50`}
                    >
                      <p className="text-sm font-semibold text-gray-900">{category.label}</p>
                      <p className="mt-1 text-xs leading-5 text-gray-600">{category.hint}</p>
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
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="you@company.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="research-question" className="text-sm font-medium text-gray-700">
                Your research question
              </label>
              <textarea
                id="research-question"
                value={researchQuestion}
                onChange={(event) => setResearchQuestion(event.target.value)}
                placeholder={selectedCategory?.questionPlaceholder}
                className="min-h-40 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
                disabled={isLoading}
              />
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
                className="min-h-28 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Minimum 20 characters in your research question. Maximum 2000 total characters.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">Best results include</p>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>Target market or buyer segment</li>
                <li>Timeframe and geography</li>
                <li>Competitors or alternatives you care about</li>
                <li>Constraints such as budget, compliance, or tooling</li>
              </ul>
            </div>
          </div>

          <aside className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-700">You&apos;ll review your prompt before paying.</p>
            <p className="mt-2 text-xs leading-5 text-gray-500">
              No account required. We store report inputs and outputs only to generate, deliver,
              and provide download access via your email link.
            </p>

            {error && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-5 space-y-4">
              <article className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-sm font-semibold text-gray-900">Standard</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">$4.99</p>
                <p className="mt-2 text-sm text-gray-600">
                  AI-generated, structured, cited, and delivered in minutes.
                </p>
                <ul className="mt-3 space-y-1 text-xs text-gray-600">
                  <li>Professional analyst format</li>
                  <li>PDF + email delivery</li>
                  <li>2-5 minute typical turnaround</li>
                </ul>
                <button
                  type="submit"
                  disabled={!isValid || isLoading}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {isLoading ? "Redirecting..." : "Generate Standard Report"}
                </button>
              </article>

              <article className="rounded-xl border border-brand-200 bg-white p-4">
                <p className="text-sm font-semibold text-gray-900">Premium</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">$14.99</p>
                <p className="mt-2 text-sm text-gray-600">
                  Deeper analysis, higher rigor, delivered within 24 hours.
                </p>
                <ul className="mt-3 space-y-1 text-xs text-gray-600">
                  <li>Scenario analysis with tradeoff framing</li>
                  <li>Deeper competitive landscape depth</li>
                  <li>Clearer recommendation path and prioritization</li>
                </ul>
                <button
                  type="button"
                  onClick={handlePremiumClick}
                  disabled={!isValid || isLoading}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-brand-500 px-5 py-3 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
                >
                  {isLoading ? "Redirecting..." : "Generate Premium Report"}
                </button>
              </article>
            </div>

            <p className="mt-5 text-xs text-gray-500">
              If your report misses the mark, we&apos;ll make it right.
            </p>
          </aside>
        </form>
      </div>
    </section>
  );
}
