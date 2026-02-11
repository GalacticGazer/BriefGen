const items = [
  "Structured summary with key facts and priorities",
  "Actionable next steps tailored to your selected category",
  "Shareable format designed for internal and external stakeholders",
  "Downloadable report output (placeholder in this chunk)",
];

export default function WhatYouGet() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-gray-900">
          What You Get
        </h2>
        <p className="mt-4 max-w-3xl text-gray-600">
          Every generated brief is designed for quick review and immediate decision-making.
        </p>
        <ul className="mt-8 grid gap-3 text-gray-700 md:grid-cols-2">
          {items.map((item) => (
            <li key={item} className="rounded-lg border border-gray-200 p-4">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
