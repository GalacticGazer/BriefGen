import type { ReactNode } from "react";
import { trustItems, whatYouGetContent } from "@/lib/landing-content";

type IconId = (typeof trustItems)[number]["icon"];

function TrustIcon({ id }: { id: IconId }) {
  const common = "h-5 w-5";

  const iconMap: Record<IconId, ReactNode> = {
    structure: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={common}>
        <path d="M6 5h12" />
        <path d="M6 10h12" />
        <path d="M6 15h8" />
        <path d="M6 20h10" />
      </svg>
    ),
    sources: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={common}>
        <path d="M8 6h11" />
        <path d="M8 12h11" />
        <path d="M8 18h11" />
        <path d="M4 6h.01" />
        <path d="M4 12h.01" />
        <path d="M4 18h.01" />
      </svg>
    ),
    stripe: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={common}>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M3 10h18" />
      </svg>
    ),
    delivery: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={common}>
        <path d="M4 7h16v10H4z" />
        <path d="M4 8l8 6 8-6" />
      </svg>
    ),
  };

  return iconMap[id];
}

export default function WhatYouGet() {
  return (
    <section className="border-y border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-[var(--text-strong)]">
          {whatYouGetContent.title}
        </h2>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--text-muted)]">
          {whatYouGetContent.description}
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {trustItems.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[0_18px_34px_-30px_rgba(15,23,42,0.8)]"
            >
              <div className="inline-flex rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-2 text-[var(--accent)]">
                <TrustIcon id={item.icon} />
              </div>
              <h3 className="mt-3 text-base font-semibold text-[var(--text-strong)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
