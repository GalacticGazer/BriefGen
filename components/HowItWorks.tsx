import { howItWorksContent } from "@/lib/landing-content";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-[var(--text-strong)]">
          {howItWorksContent.title}
        </h2>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--text-muted)]">{howItWorksContent.description}</p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {howItWorksContent.steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.55)]"
            >
              <p className="text-sm font-semibold text-[var(--accent)]">Step {index + 1}</p>
              <h3 className="mt-3 text-lg font-semibold text-[var(--text-strong)]">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
