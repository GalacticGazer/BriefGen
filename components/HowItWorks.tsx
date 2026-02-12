const steps = [
  {
    title: "Choose a category",
    description:
      "Select the analysis track that matches your decision: technology, market, competition, or strategy.",
  },
  {
    title: "Submit your research question",
    description:
      "Add your main question and optional context such as geography, timeframe, constraints, or competitors.",
  },
  {
    title: "Pay securely via Stripe",
    description:
      "You are redirected to secure checkout. Standard reports are usually delivered in 2-5 minutes.",
  },
  {
    title: "Receive PDF + email delivery",
    description:
      "Download instantly from the success page and keep the email copy for future access.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-gray-900">
          How It Works
        </h2>
        <p className="mt-4 max-w-3xl text-gray-600">
          Designed for founders, consultants, students, and operators who need a credible
          report fast without building a full research stack.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-brand-500">Step {index + 1}</p>
              <h3 className="mt-3 text-lg font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
