import { footerContent } from "@/lib/landing-content";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 text-sm text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {footerContent.legal}</p>
        <p>{footerContent.trustLine}</p>
      </div>
    </footer>
  );
}
