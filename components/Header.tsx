"use client";

import { useEffect, useMemo, useState } from "react";
import { headerContent, navLinks } from "@/lib/landing-content";

export default function Header() {
  const [activeSection, setActiveSection] = useState<string>("");

  const trackableLinks = useMemo(() => navLinks.filter((link) => link.trackActive), []);

  useEffect(() => {
    const sections = trackableLinks
      .map((link) => document.getElementById(link.sectionId))
      .filter((el): el is HTMLElement => el instanceof HTMLElement);

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries[0]) {
          setActiveSection(visibleEntries[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-108px 0px -46% 0px",
        threshold: [0.25, 0.45, 0.6],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [trackableLinks]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[color-mix(in_oklab,var(--bg-surface)_82%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href="#"
          className="text-sm font-bold tracking-tight text-[var(--text-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)]"
        >
          {headerContent.brand}
        </a>

        <nav className="hidden items-center gap-6 text-sm sm:flex" aria-label="Primary">
          {navLinks.map((link) => {
            const isActive = link.trackActive && activeSection === link.sectionId;

            return (
              <a
                key={`${link.label}-${link.href}`}
                href={link.href}
                className={`relative pb-1 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)] ${
                  isActive
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-strong)]"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
                <span
                  className={`absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-[var(--accent)] transition-opacity ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                />
              </a>
            );
          })}
        </nav>

        <a
          href="#report-form"
          className="inline-flex items-center justify-center rounded-xl border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_26px_-12px_rgba(26,86,219,0.7)] transition-all hover:-translate-y-0.5 hover:bg-[color-mix(in_oklab,var(--accent)_92%,black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)]"
        >
          {headerContent.primaryCta}
        </a>
      </div>
    </header>
  );
}
