export default function Hero() {
  return (
    <section className="border-b border-gray-200 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium text-brand-500">Briefs without the busywork</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
          Turn raw notes into clear, client-ready briefs.
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-gray-600">
          BriefGen.ai helps teams create focused summaries for sales, legal, product,
          and operations workflows in a consistent format.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="#report-form"
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
          >
            Generate a Brief
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-brand-500 hover:text-brand-500"
          >
            See How It Works
          </a>
        </div>
      </div>
    </section>
  );
}
