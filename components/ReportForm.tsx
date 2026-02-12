"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  afterCheckoutItems,
  formContent,
  pricingComparisonRows,
  pricingTiers,
  promptExamples,
  reportCategories,
  type Category,
  type ReportType,
} from "@/lib/landing-content";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_QUESTION_LENGTH = 20;
const MAX_PROMPT_LENGTH = 2000;

function buildQuestionPayload(mainQuestion: string, optionalContext: string): string {
  const trimmedQuestion = mainQuestion.trim();
  const trimmedContext = optionalContext.trim();

  if (!trimmedContext) {
    return trimmedQuestion;
  }

  return `${trimmedQuestion}\n\n${trimmedContext}`;
}

function CategoryIcon({ id }: { id: Category["icon"] }) {
  const baseClasses = "h-5 w-5 text-[var(--accent)]";

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
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@briefgen.ai";

  const [categoryId, setCategoryId] = useState<string>(reportCategories[0].id);
  const [email, setEmail] = useState("");
  const [researchQuestion, setResearchQuestion] = useState("");
  const [optionalContext, setOptionalContext] = useState("");
  const [selectedExample, setSelectedExample] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [questionTouched, setQuestionTouched] = useState(false);
  const [reviewType, setReviewType] = useState<ReportType | null>(null);

  const selectedCategory = useMemo(
    () => reportCategories.find((category) => category.id === categoryId),
    [categoryId],
  );

  const selectedTier = useMemo(() => pricingTiers.find((tier) => tier.id === reviewType) ?? null, [reviewType]);

  const trimmedEmail = email.trim();
  const isEmailValid = emailRegex.test(trimmedEmail);
  const questionFieldLength = researchQuestion.length;
  const trimmedQuestionLength = researchQuestion.trim().length;
  const payloadLength = buildQuestionPayload(researchQuestion, optionalContext).length;
  const isWithinLimit = payloadLength <= MAX_PROMPT_LENGTH;
  const isQuestionReady = trimmedQuestionLength >= MIN_QUESTION_LENGTH;
  const shouldShowQuestionValidation = questionTouched || Boolean(reviewType) || Boolean(error);

  const isValid = isEmailValid && isQuestionReady && isWithinLimit && Boolean(selectedCategory);

  const validationMessage = useMemo(() => {
    if (!selectedCategory) {
      return formContent.validation.categoryRequired;
    }

    if (!isEmailValid) {
      return formContent.validation.emailInvalid;
    }

    if (!isQuestionReady) {
      return formContent.validation.addCharacters.replace(
        "{count}",
        String(MIN_QUESTION_LENGTH - trimmedQuestionLength),
      );
    }

    if (!isWithinLimit) {
      return formContent.validation.shortenCharacters.replace(
        "{count}",
        String(payloadLength - MAX_PROMPT_LENGTH),
      );
    }

    return "";
  }, [isEmailValid, isQuestionReady, isWithinLimit, payloadLength, trimmedQuestionLength, selectedCategory]);

  const emailHelperText =
    trimmedEmail.length === 0
      ? formContent.emailHelper.empty
      : isEmailValid
        ? formContent.emailHelper.valid
        : formContent.emailHelper.invalid;

  const questionHelperText = (() => {
    if (!shouldShowQuestionValidation) {
      return formContent.ui.questionGuidance;
    }

    if (isQuestionReady && isWithinLimit) {
      return formContent.questionHelper.valid;
    }

    if (!isQuestionReady) {
      return formContent.validation.addCharacters.replace(
        "{count}",
        String(MIN_QUESTION_LENGTH - trimmedQuestionLength),
      );
    }

    return formContent.validation.shortenCharacters.replace(
      "{count}",
      String(payloadLength - MAX_PROMPT_LENGTH),
    );
  })();

  useEffect(() => {
    if (!reviewType) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) {
        setReviewType(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [reviewType, isLoading]);

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
          email: trimmedEmail,
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

  const openReview = (targetType: ReportType) => {
    setEmailTouched(true);
    setQuestionTouched(true);

    if (!isValid) {
      setError(validationMessage || formContent.validation.requiredFields);
      return;
    }

    setError(null);
    setReviewType(targetType);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    openReview("standard");
  };

  const handleConfirmCheckout = async () => {
    if (!reviewType || isLoading) {
      return;
    }

    await createCheckoutSession(reviewType);
  };

  const handlePremiumClick = () => {
    if (isLoading) {
      return;
    }

    openReview("premium");
  };

  const fillExample = (exampleId: string) => {
    setSelectedExample(exampleId);

    if (!exampleId) {
      return;
    }

    const example = promptExamples.find((entry) => entry.id === exampleId);

    if (!example) {
      return;
    }

    setCategoryId(example.categoryId);
    setResearchQuestion(example.researchQuestion);
    setOptionalContext(example.optionalContext);
    setQuestionTouched(true);
    setError(null);
  };

  return (
    <section id="report-form" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-[var(--text-strong)]">{formContent.title}</h2>
        {formContent.description ? (
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--text-muted)]">{formContent.description}</p>
        ) : null}

        <form onSubmit={handleSubmit} className={`${formContent.description ? "mt-10" : "mt-8"} grid gap-8 lg:grid-cols-[1.08fr_0.92fr]`}>
          <div className="space-y-7">
            <fieldset>
              <legend className="mb-4 text-sm font-medium text-[var(--text-strong)]">{formContent.categoryLegend}</legend>
              <div className="grid gap-3 md:grid-cols-2">
                {reportCategories.map((category) => {
                  const isSelected = category.id === categoryId;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setCategoryId(category.id)}
                      disabled={isLoading}
                      className={`relative rounded-2xl border p-5 text-left shadow-[0_14px_30px_-26px_rgba(15,23,42,0.75)] transition-all ${
                        isSelected
                          ? "border-[var(--accent)] bg-[var(--accent-muted)]"
                          : "border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:-translate-y-0.5 hover:border-[var(--accent)]"
                      } disabled:cursor-not-allowed disabled:border-[var(--border-subtle)] disabled:bg-[var(--bg-surface-muted)]`}
                    >
                      {isSelected && (
                        <span className="absolute top-3 right-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-white">
                          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                            <path d="m4 10 4 4 8-8" />
                          </svg>
                        </span>
                      )}
                      <div className="flex items-start gap-3">
                        <CategoryIcon id={category.icon} />
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-strong)]">{category.label}</p>
                          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{category.hint}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[var(--text-strong)]">
                {formContent.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onBlur={() => setEmailTouched(true)}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-[var(--text-strong)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
                placeholder={formContent.emailPlaceholder}
                required
                disabled={isLoading}
                aria-invalid={emailTouched && trimmedEmail.length > 0 && !isEmailValid}
                aria-describedby="email-helper"
              />
              <p
                id="email-helper"
                className={`text-xs ${
                  emailTouched && trimmedEmail.length > 0 && !isEmailValid
                    ? "text-[var(--warn)]"
                    : trimmedEmail.length > 0 && isEmailValid
                      ? "text-[var(--success)]"
                      : "text-[var(--text-muted)]"
                }`}
              >
                {emailHelperText}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="research-question" className="text-sm font-medium text-[var(--text-strong)]">
                  {formContent.questionLabel}
                </label>
                <div>
                  <label htmlFor="prompt-example" className="sr-only">
                    {formContent.questionCta}
                  </label>
                  <select
                    id="prompt-example"
                    value={selectedExample}
                    onChange={(event) => fillExample(event.target.value)}
                    disabled={isLoading}
                    className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--accent)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)] focus:outline-none disabled:cursor-not-allowed"
                  >
                    <option value="">{formContent.questionCta}</option>
                    {promptExamples.map((example) => (
                      <option key={example.id} value={example.id}>
                        {example.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <textarea
                id="research-question"
                value={researchQuestion}
                onChange={(event) => setResearchQuestion(event.target.value)}
                onBlur={() => setQuestionTouched(true)}
                placeholder={selectedCategory?.questionPlaceholder}
                className="min-h-40 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-[var(--text-strong)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
                required
                disabled={isLoading}
                aria-invalid={questionTouched && (!isQuestionReady || !isWithinLimit)}
                aria-describedby="question-helper"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <p
                  id="question-helper"
                  className={`rounded-full border px-2.5 py-1 font-medium ${
                    !shouldShowQuestionValidation
                      ? "border-[var(--border-subtle)] text-[var(--text-muted)]"
                      : isQuestionReady && isWithinLimit
                        ? "border-[var(--success)]/30 bg-[var(--success)]/10 text-[var(--success)]"
                        : "border-[var(--warn)]/30 bg-[var(--warn)]/10 text-[var(--warn)]"
                  }`}
                >
                  {questionHelperText}
                </p>
                <p className="rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[var(--text-muted)]">
                  {questionFieldLength} chars
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="optional-context" className="text-sm font-medium text-[var(--text-strong)]">
                {formContent.contextLabel}
              </label>
              <textarea
                id="optional-context"
                value={optionalContext}
                onChange={(event) => setOptionalContext(event.target.value)}
                placeholder={selectedCategory?.contextPlaceholder}
                className="min-h-32 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-[var(--text-strong)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
                disabled={isLoading}
              />
            </div>

            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.8)]">
              <p className="text-sm font-semibold text-[var(--text-strong)]">{formContent.guidanceTitle}</p>
              <ul className="mt-4 space-y-4 text-sm text-[var(--text-muted)]">
                {formContent.guidanceItems.map((item) => (
                  <li key={item} className="italic leading-7">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[0_20px_42px_-32px_rgba(15,23,42,0.8)]">
            <p className="text-sm font-medium text-[var(--text-strong)]">{formContent.reviewHint}</p>

            {error && (
              <p className="mt-4 rounded-xl border border-[var(--warn)]/40 bg-[var(--warn)]/10 px-3 py-2 text-sm text-[var(--warn)]">
                {error}
              </p>
            )}

            <div className="mt-6 space-y-4">
              {pricingTiers.map((tier) => {
                const isStandard = tier.id === "standard";

                return (
                  <article
                    key={tier.id}
                    className={`rounded-2xl border p-6 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.88)] ${
                      isStandard
                        ? "border-brand-300 bg-[var(--accent-muted)]/50"
                        : "border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[var(--text-strong)]">{tier.label}</p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isStandard
                            ? "border border-[var(--border-subtle)] bg-[var(--accent-muted)] text-[var(--accent)]"
                            : "border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] text-[var(--text-muted)]"
                        }`}
                      >
                        {tier.badge}
                      </span>
                    </div>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-strong)]">{tier.price}</p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{tier.delivery}</p>
                    <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{tier.description}</p>
                    <ul className="mt-3 space-y-1 text-sm leading-6 text-[var(--text-muted)]">
                      {tier.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                    <button
                      type={isStandard ? "submit" : "button"}
                      onClick={isStandard ? undefined : handlePremiumClick}
                      disabled={!isValid || isLoading}
                      className={`mt-4 inline-flex w-full items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)] ${
                        isStandard
                          ? "border border-[var(--accent)] bg-[var(--accent)] text-white hover:bg-[color-mix(in_oklab,var(--accent)_90%,black)] disabled:border-[var(--border-subtle)] disabled:bg-[var(--border-subtle)]"
                          : "border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-muted)] disabled:border-[var(--border-subtle)] disabled:text-[var(--text-muted)]"
                      } disabled:cursor-not-allowed`}
                    >
                      {isLoading && reviewType === tier.id ? "Redirecting..." : tier.cta}
                    </button>
                    <p className="mt-2 text-center text-xs text-[var(--text-muted)]">{formContent.ui.promptReviewHint}</p>
                  </article>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                {formContent.ui.comparisonTitle}
              </p>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[320px] border-separate border-spacing-y-2 text-left text-xs">
                  <thead>
                    <tr className="text-[var(--text-muted)]">
                      <th scope="col" className="pr-3 font-medium">
                        {formContent.ui.comparisonFeature}
                      </th>
                      <th scope="col" className="pr-3 font-medium text-[var(--text-strong)]">
                        {formContent.ui.comparisonStandard}
                      </th>
                      <th scope="col" className="font-medium text-[var(--text-strong)]">
                        {formContent.ui.comparisonPremium}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingComparisonRows.map((row) => (
                      <tr key={row.label} className="align-top">
                        <th scope="row" className="pr-3 text-[var(--text-muted)] font-medium">
                          {row.label}
                        </th>
                        <td className="pr-3 text-[var(--text-strong)]">{row.standard}</td>
                        <td className="text-[var(--text-strong)]">{row.premium}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="mt-5 text-xs font-medium text-[var(--text-muted)]">{formContent.reassuranceLine}</p>

            <div className="mt-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-4">
              <p className="text-sm font-semibold text-[var(--text-strong)]">{formContent.ui.afterCheckoutTitle}</p>
              <ul className="mt-2 space-y-1 text-xs leading-5 text-[var(--text-muted)]">
                {afterCheckoutItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <p className="mt-4 text-xs text-[var(--text-muted)]">
              {formContent.ui.supportPrefix}{" "}
              <a href={`mailto:${supportEmail}`} className="font-medium text-[var(--accent)] hover:text-[var(--text-strong)]">
                {supportEmail}
              </a>
            </p>
          </aside>
        </form>
      </div>

      {reviewType && selectedTier ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6" aria-live="polite">
          <button
            type="button"
            onClick={() => !isLoading && setReviewType(null)}
            className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm"
            aria-label="Close prompt review"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="prompt-review-title"
            className="relative z-10 w-full max-w-2xl rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[0_40px_90px_-48px_rgba(15,23,42,0.9)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{formContent.modal.eyebrow}</p>
            <h3 id="prompt-review-title" className="mt-2 text-xl font-semibold text-[var(--text-strong)]">
              {formContent.modal.title}
            </h3>

            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  {formContent.modal.categoryLabel}
                </dt>
                <dd className="mt-1 text-[var(--text-strong)]">{selectedCategory?.label}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  {formContent.modal.tierLabel}
                </dt>
                <dd className="mt-1 text-[var(--text-strong)]">
                  {selectedTier.label} ({selectedTier.price}, {selectedTier.delivery})
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  {formContent.modal.emailLabel}
                </dt>
                <dd className="mt-1 break-all text-[var(--text-strong)]">{trimmedEmail}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  {formContent.modal.questionLabel}
                </dt>
                <dd className="mt-1 text-[var(--text-strong)]">{researchQuestion.trim()}</dd>
              </div>
              {optionalContext.trim() ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    {formContent.modal.contextLabel}
                  </dt>
                  <dd className="mt-1 whitespace-pre-wrap text-[var(--text-strong)]">{optionalContext.trim()}</dd>
                </div>
              ) : null}
            </dl>

            <p className="mt-5 text-xs text-[var(--text-muted)]">{formContent.modal.reassurance}</p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setReviewType(null)}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-sm font-semibold text-[var(--text-strong)] transition-colors hover:bg-[var(--bg-surface-muted)] disabled:cursor-not-allowed"
              >
                {formContent.modal.editButton}
              </button>
              <button
                type="button"
                onClick={handleConfirmCheckout}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-xl border border-[var(--accent)] bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[color-mix(in_oklab,var(--accent)_90%,black)] disabled:cursor-not-allowed disabled:border-[var(--border-subtle)] disabled:bg-[var(--border-subtle)]"
              >
                {isLoading ? "Redirecting..." : `${formContent.modal.confirmPrefix} (${selectedTier.price})`}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
