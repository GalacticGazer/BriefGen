"use client";

import { useEffect, useState } from "react";

type NavLink = {
  label: string;
  href: string;
  sectionId: string;
  trackActive?: boolean;
};

const navLinks: NavLink[] = [
  { label: "How It Works", href: "#how-it-works", sectionId: "how-it-works", trackActive: true },
  { label: "Sample", href: "#sample-report", sectionId: "sample-report", trackActive: true },
  { label: "Pricing", href: "#report-form", sectionId: "report-form", trackActive: true },
  { label: "Generate", href: "#report-form", sectionId: "report-form", trackActive: false },
];

export default function Header() {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const sections = ["how-it-works", "sample-report", "report-form"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el instanceof HTMLElement);

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-120px 0px -45% 0px",
        threshold: [0.2, 0.35, 0.55],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#" className="text-sm font-semibold tracking-tight text-gray-900">
          BriefGen.ai
        </a>
        <nav className="hidden items-center gap-6 text-sm sm:flex">
          {navLinks.map((link) => {
            const isActive = Boolean(link.trackActive) && activeSection === link.sectionId;

            return (
              <a
                key={`${link.label}-${link.href}`}
                href={link.href}
                className={`relative pb-1 transition-colors ${
                  isActive ? "text-brand-600" : "text-gray-600 hover:text-brand-500"
                }`}
              >
                {link.label}
                <span
                  className={`absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-brand-500 transition-opacity ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                />
              </a>
            );
          })}
        </nav>
        <a
          href="#report-form"
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          Generate Report
        </a>
      </div>
    </header>
  );
}
