const steps = [
  {
    title: "Choose a category",
    description:
      "Pick the workflow type so the prompt and structure match your use case.",
  },
  {
    title: "Add context",
    description: "Paste notes, key facts, and constraints to shape the report.",
  },
  {
    title: "Get a polished brief",
    description:
      "Receive a concise summary designed for sharing with clients or internal teams.",
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
          The flow is intentionally simple so anyone on your team can generate useful
          briefs in under two minutes.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-xl border border-gray-200 p-6">
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
