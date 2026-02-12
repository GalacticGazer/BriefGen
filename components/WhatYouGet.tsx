import type { ReactNode } from "react";

type TrustItem = {
  title: string;
  description: string;
  icon: ReactNode;
};

const trustItems: TrustItem[] = [
  {
    title: "Credible structure",
    description: "Reports follow an executive-summary-first format built for decision-making.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
        <path d="M6 5h12" />
        <path d="M6 10h12" />
        <path d="M6 15h8" />
        <path d="M6 20h10" />
      </svg>
    ),
  },
  {
    title: "Cited sources",
    description: "Each report includes a curated sources section for deeper follow-up research.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
        <path d="M8 6h11" />
        <path d="M8 12h11" />
        <path d="M8 18h11" />
        <path d="M4 6h.01" />
        <path d="M4 12h.01" />
        <path d="M4 18h.01" />
      </svg>
    ),
  },
  {
    title: "Stripe checkout",
    description: "Payments are processed securely through Stripe test or live mode.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
  {
    title: "PDF + email",
    description: "Reports are delivered as downloadable PDFs and sent to your inbox.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
        <path d="M4 7h16v10H4z" />
        <path d="M4 8l8 6 8-6" />
      </svg>
    ),
  },
];

export default function WhatYouGet() {
  return (
    <section className="border-y border-gray-200 bg-gray-50 px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-gray-900">Built for Real Decisions</h2>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-600">
          Product-quality experience with practical delivery standards and clear trust cues.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {trustItems.map((item) => (
            <article key={item.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-2 text-brand-600">
                {item.icon}
              </div>
              <h3 className="mt-3 text-base font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
