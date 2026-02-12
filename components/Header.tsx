export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#" className="text-sm font-semibold tracking-tight text-gray-900">
          BriefGen.ai
        </a>
        <nav className="hidden items-center gap-6 text-sm sm:flex">
          <a
            href="#how-it-works"
            className="text-gray-600 transition-colors hover:text-brand-500"
          >
            How It Works
          </a>
          <a
            href="#sample-report"
            className="text-gray-600 transition-colors hover:text-brand-500"
          >
            Sample Report
          </a>
          <a
            href="#report-form"
            className="text-gray-600 transition-colors hover:text-brand-500"
          >
            Pricing
          </a>
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
