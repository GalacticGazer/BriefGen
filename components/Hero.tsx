const trustChips = ["No account needed", "PDF + email delivery", "Cited sources", "2-5 min typical"];

export default function Hero() {
  return (
    <section className="border-b border-gray-200 bg-gradient-to-b from-brand-50/50 to-white px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.03fr_0.97fr] lg:items-center">
        <div>
          <p className="inline-flex rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold tracking-wide text-brand-700">
            Analyst-grade output
          </p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight text-gray-950 sm:text-[3.45rem] sm:leading-[1.06]">
            Analyst-grade reports on demand.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            Generate a structured 2,000-4,000 word report with executive summary,
            deep analysis, opportunities and risks, and cited sources. Delivered as
            a clean PDF to your inbox.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#report-form"
              className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Generate Report
            </a>
            <a
              href="#sample-report"
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-base font-semibold text-gray-700 transition-colors hover:border-brand-500 hover:text-brand-500"
            >
              View Sample
            </a>
          </div>

          <p className="mt-5 text-sm text-gray-500">$4.99 Standard (minutes) • $14.99 Premium (24 hours)</p>

          <ul className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-gray-700">
            {trustChips.map((chip) => (
              <li key={chip} className="rounded-full border border-gray-200 bg-white px-3 py-1.5">
                {chip}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-5 rounded-[1.5rem] bg-gradient-to-br from-brand-100/50 to-white" />
          <div className="relative rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Research report preview</p>
              <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                Generated example
              </span>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
              <div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-[0.45fr_1fr]">
                <aside className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-500">
                  <p className="font-semibold uppercase tracking-wide text-gray-700">Contents</p>
                  <ul className="mt-2 space-y-2 leading-5">
                    <li>Executive Summary</li>
                    <li>Background</li>
                    <li>Analysis</li>
                    <li>Opportunities & Risks</li>
                    <li>Key Takeaways</li>
                    <li>Sources</li>
                  </ul>
                </aside>

                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Executive Summary
                  </p>
                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    <strong>Bottom line:</strong> Teams evaluating enterprise AI tooling should
                    prioritize workflow integration and measured time savings before model breadth.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Organizations that scope pilots to one business process and one stakeholder team
                    tend to validate ROI faster and avoid rollout friction.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
