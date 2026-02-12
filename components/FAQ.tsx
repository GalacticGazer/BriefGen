const faqs = [
  {
    question: "How long does delivery take?",
    answer:
      "Standard reports are typically delivered in 2-5 minutes. Premium reports are delivered within 24 hours after payment.",
  },
  {
    question: "What does 'cited sources' mean in each report?",
    answer:
      "Each report includes a Sources & Further Reading section with relevant organizations and research libraries to support deeper follow-up analysis.",
  },
  {
    question: "What if the report misses the mark?",
    answer:
      "If the output is not useful for your use case, contact support and we will work with you to make it right.",
  },
  {
    question: "How is my data handled?",
    answer:
      "We store report inputs and generated outputs only to generate, deliver, and provide download access. Payments are processed securely through Stripe.",
  },
  {
    question: "What should I include for best results?",
    answer:
      "Include your target market, timeframe, geography, key competitors, and any constraints such as budget, compliance, or technical requirements.",
  },
];

export default function FAQ() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-gray-900">FAQ</h2>
        <div className="mt-8 max-w-4xl space-y-4">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-xl border border-gray-200 p-5">
              <h3 className="text-base font-semibold text-gray-900">{faq.question}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{faq.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
