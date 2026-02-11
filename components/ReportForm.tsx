"use client";

import { FormEvent, useMemo, useState } from "react";

type Category = {
  id: string;
  label: string;
  placeholder: string;
};

type ReportType = "standard" | "premium";

const categories: Category[] = [
  {
    id: "sales",
    label: "Sales",
    placeholder:
      "Paste discovery notes, customer goals, objections, and timeline requirements.",
  },
  {
    id: "legal",
    label: "Legal",
    placeholder:
      "Paste case facts, parties involved, dates, open questions, and desired output.",
  },
  {
    id: "product",
    label: "Product",
    placeholder:
      "Paste user feedback, feature goals, constraints, and launch context.",
  },
  {
    id: "operations",
    label: "Operations",
    placeholder:
      "Paste process gaps, risks, stakeholder notes, and success criteria.",
  },
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ReportForm() {
  const [categoryId, setCategoryId] = useState<string>(categories[0].id);
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId),
    [categoryId],
  );

  const isValid =
    emailRegex.test(email.trim()) && question.trim().length >= 20 && Boolean(selectedCategory);

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
          question: question.trim(),
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
    <section
      id="report-form"
      className="border-y border-gray-200 bg-gray-50 px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-gray-900">
          Start Your Brief
        </h2>
        <p className="mt-4 max-w-3xl text-gray-600">
          Choose a category, add your details, and continue to secure checkout.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <fieldset>
            <legend className="mb-3 text-sm font-medium text-gray-700">Category</legend>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => {
                const isSelected = category.id === categoryId;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setCategoryId(category.id)}
                    disabled={isLoading}
                    className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
                      isSelected
                        ? "border-brand-500 text-brand-500"
                        : "border-gray-300 text-gray-700 hover:border-brand-500 hover:text-brand-500"
                    } disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Work Email
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
            <label htmlFor="question" className="text-sm font-medium text-gray-700">
              Context
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={selectedCategory?.placeholder}
              className="min-h-40 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">Minimum 20 characters. Maximum 2000.</p>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isLoading ? "Redirecting..." : "Generate Report — $4.99"}
            </button>
            <button
              type="button"
              onClick={handlePremiumClick}
              disabled={!isValid || isLoading}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-brand-500 hover:text-brand-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
            >
              {isLoading ? "Redirecting..." : "Generate Premium — $14.99"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
