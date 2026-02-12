export default function Hero() {
  return (
    <section className="border-b border-gray-200 bg-gradient-to-b from-brand-50/60 to-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="inline-flex rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold tracking-wide text-brand-700">
            On-demand analyst reports
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Your on-demand research analyst.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-600">
            Get a 2,000-4,000 word research report with an executive summary, deep
            analysis, opportunities and risks, and actionable takeaways. Delivered as
            a clean PDF to your inbox in minutes.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#report-form"
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Generate Report
            </a>
            <a
              href="#sample-report"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-brand-500 hover:text-brand-500"
            >
              View Sample Report
            </a>
          </div>
          <p className="mt-5 text-sm font-medium text-gray-700">
            $4.99 Standard (minutes) • $14.99 Premium (24 hours)
          </p>
          <ul className="mt-6 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
            <li>No account needed</li>
            <li>PDF + email delivery</li>
            <li>Cited sources</li>
            <li>2-5 min typical</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="rounded-xl border border-brand-100 bg-brand-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
              Report Preview
            </p>
            <h2 className="mt-2 text-lg font-semibold text-gray-900">
              AI-Powered Clinical Documentation Tools
            </h2>
            <p className="mt-1 text-sm text-gray-600">Prepared for Operations Leadership</p>
          </div>
          <div className="mt-4 grid gap-3 text-sm text-gray-700 sm:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Table of Contents
              </p>
              <ul className="mt-2 space-y-2">
                <li>Executive Summary</li>
                <li>Background & Context</li>
                <li>Detailed Analysis</li>
                <li>Opportunities & Risks</li>
                <li>Key Takeaways</li>
                <li>Sources & Further Reading</li>
              </ul>
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Executive Summary
              </p>
              <p className="mt-2 leading-6 text-gray-700">
                <strong>Bottom line:</strong> Mid-size hospital systems can recover
                documentation time and reduce clinician burnout fastest by deploying
                AI-assisted ambient scribing before broader copilots.
              </p>
              <p className="mt-2 leading-6 text-gray-600">
                The strongest ROI appears in specialties with high note volume,
                measurable throughput bottlenecks, and mature EHR integration paths.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
