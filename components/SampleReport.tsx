const sampleSections = [
  "Executive summary",
  "Background and context",
  "Deep analysis sections",
  "Opportunities and risks",
  "Key takeaways",
  "Sources and further reading",
];

const samplePages = [
  {
    title: "Executive Summary",
    body: "Bottom line: Teams evaluating enterprise AI tooling should prioritize workflow integration and measurable time savings before model breadth. Leaders who anchor pilot scope to one business process usually reach ROI clarity in under one quarter.",
  },
  {
    title: "Detailed Analysis",
    body: "Vendor fit diverges most on deployment friction, governance controls, and unit economics. A pragmatic shortlist compares implementation timeline, data residency requirements, and expected utilization by role.",
  },
  {
    title: "Opportunities & Risks",
    body: "Primary upside comes from reduced cycle time and improved decision quality. Main risks are weak adoption design, unclear ownership, and underestimating integration work across systems.",
  },
];

export default function SampleReport() {
  return (
    <section
      id="sample-report"
      className="border-y border-gray-200 bg-gray-50 px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900">Sample Report</h2>
          <p className="mt-4 max-w-xl text-lg leading-8 text-gray-600">
            Review the structure before you pay. Every report follows a clear consulting-style
            format that is easy to skim and easy to share.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-gray-700">
            {sampleSections.map((section) => (
              <li key={section} className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                {section}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-gray-500">
            Preview is representative of format and tone. Final report content is generated from
            your exact question and context.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
              Scrollable preview
            </p>
            <div className="mt-3 h-96 space-y-3 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4">
              {samplePages.map((page) => (
                <article key={page.title} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <h3 className="text-base font-semibold text-gray-900">{page.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-700">{page.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
