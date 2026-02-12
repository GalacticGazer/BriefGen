"use client";

import { useMemo, useState } from "react";
import { heroContent } from "@/lib/landing-content";

export default function Hero() {
  const [activeTabId, setActiveTabId] = useState(heroContent.preview.tabs[0]?.id ?? "");
  const activeTab = useMemo(
    () => heroContent.preview.tabs.find((tab) => tab.id === activeTabId) ?? heroContent.preview.tabs[0],
    [activeTabId],
  );
  const activePageLabel = `${heroContent.preview.pageLabelPrefix} • ${activeTab?.page ?? "Page 1"} of ${
    heroContent.preview.totalPages
  }`;

  return (
    <section className="relative overflow-hidden border-b border-[var(--border-subtle)] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_20%_20%,rgba(26,86,219,0.18),transparent_48%),radial-gradient(circle_at_82%_8%,rgba(26,86,219,0.14),transparent_44%)]" />
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
        <div className="relative">
          <p className="inline-flex rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--accent)]">
            {heroContent.eyebrow}
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-[var(--text-strong)] sm:text-[3.35rem] sm:leading-[1.06]">
            {heroContent.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--text-muted)]">{heroContent.description}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#report-form"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--accent)] bg-[var(--accent)] px-7 py-3.5 text-base font-semibold text-white shadow-[0_20px_36px_-18px_rgba(26,86,219,0.74)] transition-all hover:-translate-y-0.5 hover:bg-[color-mix(in_oklab,var(--accent)_90%,black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-page)]"
            >
              {heroContent.primaryCta}
            </a>
            <a
              href="#sample-report"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--accent)] bg-[var(--bg-surface-muted)] px-6 py-3.5 text-base font-semibold text-[var(--text-strong)] transition-colors hover:bg-[var(--accent-muted)] hover:text-[var(--text-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-page)]"
            >
              {heroContent.secondaryCta}
            </a>
          </div>

          <p className="mt-5 text-sm text-[var(--text-muted)]">{heroContent.pricingLine}</p>
          <p className="mt-3 text-sm text-[var(--text-muted)]">{heroContent.reassurance}</p>

          <ul className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-[var(--text-strong)]">
            {heroContent.trustChips.map((chip) => (
              <li
                key={chip}
                className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5"
              >
                {chip}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute -inset-x-2 -inset-y-3 rounded-[1.75rem] bg-gradient-to-br from-brand-200/40 via-brand-50/15 to-transparent blur-lg" />
          <div className="relative rounded-[1.6rem] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[0_24px_58px_-36px_rgba(15,23,42,0.45)] sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--text-strong)]">{heroContent.preview.title}</p>
              <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                {heroContent.preview.badge}
              </span>
            </div>

            <ul className="mb-4 flex flex-wrap gap-2">
              {heroContent.preview.quickProof.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-slate-600/80 bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-200"
                >
                  {item}
                </li>
              ))}
            </ul>

            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-3 sm:p-4">
              <p className="mb-3 text-xs font-medium text-slate-300">{activePageLabel}</p>
              <div className="mb-3 grid grid-cols-3 gap-2 sm:hidden">
                {heroContent.preview.tabs.map((tab) => {
                  const isActive = tab.id === activeTab?.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTabId(tab.id)}
                      className={`rounded-md border px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 ${
                        isActive
                          ? "border-slate-400 bg-slate-600/50"
                          : "border-slate-600 bg-slate-700/70 hover:border-slate-500"
                      }`}
                    >
                      <p className="text-[10px] font-medium leading-tight text-slate-100">{tab.label}</p>
                      <p className="mt-0.5 text-[10px] text-slate-300">{tab.page}</p>
                    </button>
                  );
                })}
              </div>
              <div className="grid gap-3 sm:grid-cols-[0.3fr_1fr]">
                <aside className="hidden rounded-xl border border-slate-700 bg-slate-800 p-2 sm:block">
                  <div className="space-y-2">
                    {heroContent.preview.tabs.map((tab) => {
                      const isActive = tab.id === activeTab?.id;

                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTabId(tab.id)}
                          className={`w-full rounded-lg border p-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 ${
                            isActive
                              ? "border-slate-400 bg-slate-600/40"
                              : "border-slate-600 bg-slate-700/70 hover:border-slate-500"
                          }`}
                        >
                          <p className="text-[10px] font-medium text-slate-100">{tab.label}</p>
                          <p className="mt-1 text-[10px] text-slate-300">{tab.page}</p>
                          <div className="mt-2 h-8 rounded bg-slate-600/80" />
                        </button>
                      );
                    })}
                  </div>
                </aside>

                <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                  {activeTab ? (
                    <div className="h-[320px] overflow-y-auto rounded-lg border border-slate-300 bg-[#fcfcf9] px-4 py-3 text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.18)] sm:h-[340px] sm:px-5 sm:py-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{activeTab.heading}</p>
                      <p className="mt-2.5 text-[13px] leading-5 sm:text-sm sm:leading-6">
                        <strong>{activeTab.leadLabel}</strong> {activeTab.leadText}
                      </p>

                      <p className="mt-2.5 text-[13px] font-semibold text-slate-600 sm:text-sm">{activeTab.bulletsTitle}</p>
                      <ul className="mt-1.5 space-y-1.5 text-[13px] leading-5 text-slate-600 sm:text-sm sm:leading-6">
                        {activeTab.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-2">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>

                      <p className="mt-2.5 text-[13px] leading-5 text-slate-600 sm:text-sm sm:leading-6">
                        <strong>{activeTab.closingLabel}</strong> {activeTab.closingText}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
