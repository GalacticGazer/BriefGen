"use client";

import { useMemo, useState } from "react";
import { faqContent, faqGroups } from "@/lib/landing-content";

export default function FAQ() {
  const initialOpenId = useMemo(() => {
    const firstGroup = faqGroups[0];
    if (!firstGroup || !firstGroup.items[0]) {
      return null;
    }

    return `${firstGroup.id}-0`;
  }, []);

  const [openId, setOpenId] = useState<string | null>(initialOpenId);

  const toggleItem = (itemId: string) => {
    setOpenId((current) => (current === itemId ? null : itemId));
  };

  return (
    <section id="faq" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-[var(--text-strong)]">{faqContent.title}</h2>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--text-muted)]">
          {faqContent.description}
        </p>

        <div className="mt-10 space-y-10">
          {faqGroups.map((group) => (
            <section key={group.id} aria-labelledby={`faq-group-${group.id}`}>
              <h3 id={`faq-group-${group.id}`} className="text-xl font-semibold text-[var(--text-strong)]">
                {group.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{group.description}</p>

              <div className="mt-4 space-y-3">
                {group.items.map((faq, index) => {
                  const itemId = `${group.id}-${index}`;
                  const triggerId = `faq-trigger-${itemId}`;
                  const panelId = `faq-panel-${itemId}`;
                  const isOpen = openId === itemId;

                  return (
                    <article
                      key={faq.question}
                      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-4 shadow-[0_14px_24px_-24px_rgba(15,23,42,0.95)]"
                    >
                      <h4>
                        <button
                          id={triggerId}
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          onClick={() => toggleItem(itemId)}
                          className="flex w-full items-start justify-between gap-3 text-left text-sm font-semibold text-[var(--text-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)]"
                        >
                          <span>{faq.question}</span>
                          <span
                            className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]"
                            aria-hidden="true"
                          >
                            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5">
                              <path d="M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                              <path
                                d="M8 3v10"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                className={`transition-opacity ${isOpen ? "opacity-0" : "opacity-100"}`}
                              />
                            </svg>
                          </span>
                        </button>
                      </h4>

                      <div
                        className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${
                          isOpen ? "mt-3 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div
                          id={panelId}
                          role="region"
                          aria-labelledby={triggerId}
                          className="overflow-hidden text-sm leading-6 text-[var(--text-muted)]"
                        >
                          {faq.answer}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
