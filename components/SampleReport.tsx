"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { sampleReportContent } from "@/lib/landing-content";
import { featuredSamples } from "@/lib/samples";

export default function SampleReport() {
  const [activeSampleId, setActiveSampleId] = useState<string>(featuredSamples[0]?.id ?? "");
  const [activePageId, setActivePageId] = useState<string>(featuredSamples[0]?.pages[0]?.id ?? "");

  const activeSample = useMemo(
    () => featuredSamples.find((sample) => sample.id === activeSampleId) ?? featuredSamples[0],
    [activeSampleId],
  );

  const activePage = useMemo(() => {
    if (!activeSample || !activeSample.pages.length) {
      return null;
    }

    return activeSample.pages.find((page) => page.id === activePageId) ?? activeSample.pages[0];
  }, [activePageId, activeSample]);

  const handleSampleSwitch = (sampleId: string) => {
    setActiveSampleId(sampleId);
    const switchedSample = featuredSamples.find((sample) => sample.id === sampleId);
    setActivePageId(switchedSample?.pages[0]?.id ?? "");
  };

  return (
    <section
      id="sample-report"
      className="border-y border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-strong)]">{sampleReportContent.title}</h2>
          <p className="mt-4 max-w-xl text-lg leading-8 text-[var(--text-muted)]">{sampleReportContent.description}</p>

          <div className="mt-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[0_18px_40px_-28px_rgba(6,10,22,0.85)]">
            <p className="text-sm font-semibold text-[var(--text-strong)]">{sampleReportContent.includedTitle}</p>
            <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
              {sampleReportContent.includedItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6 inline-flex rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1">
            {featuredSamples.map((sample) => {
              const isSelected = sample.id === activeSample?.id;

              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSampleSwitch(sample.id)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)] ${
                    isSelected
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--text-muted)] hover:text-[var(--text-strong)]"
                  }`}
                  aria-pressed={isSelected}
                >
                  {sample.tier} Sample
                </button>
              );
            })}
          </div>

          {activeSample ? (
            <div className="mt-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[0_18px_40px_-28px_rgba(6,10,22,0.85)]">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-2.5 py-1 text-[var(--text-muted)]">
                  {activeSample.category}
                </span>
                <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-2.5 py-1 text-[var(--text-muted)]">
                  {activeSample.tier}
                </span>
                <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-2.5 py-1 text-[var(--text-muted)]">
                  Generated {activeSample.generatedAt}
                </span>
              </div>

              <details className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-3">
                <summary className="cursor-pointer text-sm font-semibold text-[var(--text-strong)]">
                  Prompt and context
                </summary>
                <div className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
                  <p>
                    <span className="font-semibold text-[var(--text-strong)]">Prompt:</span> {activeSample.prompt}
                  </p>
                  {activeSample.optionalContext ? (
                    <p>
                      <span className="font-semibold text-[var(--text-strong)]">Optional context:</span>{" "}
                      {activeSample.optionalContext}
                    </p>
                  ) : null}
                </div>
              </details>

              {activeSample.downloadUrl ? (
                <a
                  href={activeSample.downloadUrl}
                  className="mt-4 inline-flex items-center justify-center rounded-xl border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_28px_-18px_rgba(26,86,219,0.75)] transition-colors hover:bg-[color-mix(in_oklab,var(--accent)_90%,black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)]"
                >
                  {`Download ${activeSample.tier} Sample (PDF)`}
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-4 inline-flex cursor-not-allowed items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-4 py-2 text-sm font-semibold text-[var(--text-muted)]"
                >
                  {`Download ${activeSample.tier} Sample (PDF)`}
                </button>
              )}
            </div>
          ) : null}

          <p className="mt-5 text-sm text-[var(--text-muted)]">{sampleReportContent.microcopy}</p>
          <a
            href="#report-form"
            className="mt-4 inline-flex items-center justify-center rounded-xl border border-[var(--accent)] bg-[var(--bg-surface-muted)] px-4 py-2 text-sm font-semibold text-[var(--text-strong)] transition-colors hover:bg-[var(--accent-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface-muted)]"
          >
            {sampleReportContent.secondaryCta}
          </a>
        </div>

        <div className="rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[0_26px_56px_-36px_rgba(6,10,22,0.95)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[var(--text-strong)]">
              Featured Sample Viewer {activePage ? `• ${activePage.page}` : ""}
            </p>
            <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--accent-muted)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
              {activeSample?.available ? "Real output" : "Premium in progress"}
            </span>
          </div>

          {activeSample?.available && activePage ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-[0.33fr_1fr]">
              <div className="space-y-2">
                {activeSample.pages.map((page) => {
                  const isSelected = page.id === activePage.id;

                  return (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => setActivePageId(page.id)}
                      className={`w-full rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)] ${
                        isSelected
                          ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                          : "border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text-strong)]"
                      }`}
                    >
                      <p>{page.label}</p>
                      <p className="mt-1 text-[11px] font-medium opacity-80">{page.page}</p>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[#060d1d] p-4">
                <div className="mx-auto max-w-[460px] rounded-md border border-slate-600 bg-white p-2 shadow-[0_24px_34px_-22px_rgba(0,0,0,0.85)]">
                  <Image
                    src={activePage.image}
                    alt={activePage.alt}
                    width={1275}
                    height={1650}
                    className="h-auto w-full rounded-sm"
                    priority={activePage.id === activeSample.pages[0]?.id}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-5">
              <p className="text-sm text-[var(--text-muted)]">{activeSample?.statusNote}</p>

              {activeSample?.decisionBriefPreview ? (
                <div className="mt-4 rounded-xl border border-[var(--accent)]/40 bg-[var(--accent-muted)]/45 p-4">
                  <p className="text-sm font-semibold text-[var(--text-strong)]">
                    {activeSample.decisionBriefPreview.heading}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-[var(--text-muted)]">
                    {activeSample.decisionBriefPreview.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
