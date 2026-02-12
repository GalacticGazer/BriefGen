const trustItems = [
  {
    title: "Designed for real operators",
    description: "Built for founders, consultants, students, and teams that need sharp analysis quickly.",
  },
  {
    title: "Citations included",
    description: "Each report includes a curated sources section to support deeper independent research.",
  },
  {
    title: "Secure payments via Stripe",
    description: "Checkout is handled through Stripe with modern payment security controls.",
  },
  {
    title: "Delivered by email + PDF",
    description: "You get a downloadable PDF immediately plus email delivery for convenient access.",
  },
];

export default function WhatYouGet() {
  return (
    <section className="border-y border-gray-200 bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-gray-900">
          Built for Credible Decisions
        </h2>
        <p className="mt-4 max-w-3xl text-gray-600">
          BriefGen keeps the workflow simple while maintaining professional output quality and clear
          delivery expectations.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {trustItems.map((item) => (
            <article key={item.title} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
