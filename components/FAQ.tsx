const faqs = [
  {
    question: "Is this live in production yet?",
    answer:
      "Not yet. This chunk includes the UI and route scaffolding only, with placeholder behaviors for submit and polling.",
  },
  {
    question: "Which categories are available now?",
    answer: "Sales, Legal, Product, and Operations are available in the current selector.",
  },
  {
    question: "Will reports be downloadable?",
    answer:
      "Yes. The report route already includes a placeholder download link, and real generation will be wired in later chunks.",
  },
];

export default function FAQ() {
  return (
    <section className="border-t border-gray-200 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-gray-900">FAQ</h2>
        <div className="mt-8 max-w-3xl space-y-4">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-lg border border-gray-200 p-5">
              <h3 className="text-base font-semibold text-gray-900">{faq.question}</h3>
              <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
