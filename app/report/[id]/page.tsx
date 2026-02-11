"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type ResolvedState = "completed" | "not-found";

type PlaceholderReport = {
  id: string;
  title: string;
  generatedAt: string;
  summary: string[];
};

export default function ReportPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [resolvedState, setResolvedState] = useState<ResolvedState | null>(null);
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const [report, setReport] = useState<PlaceholderReport | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (id === "missing" || id === "not-found") {
        setResolvedId(id);
        setResolvedState("not-found");
        setReport(null);
        return;
      }

      setReport({
        id,
        title: "Placeholder Generated Brief",
        generatedAt: new Date().toLocaleString(),
        summary: [
          "This is a mock report payload for Chunk 1.",
          "Completed, loading, and not-found states are implemented.",
          "Real data fetch and rendering will be wired in a later chunk.",
        ],
      });
      setResolvedId(id);
      setResolvedState("completed");
    }, 1200);

    return () => clearTimeout(timeout);
  }, [id]);

  const isLoading = resolvedId !== id;

  return (
    <main className="min-h-screen bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 p-8">
        <p className="rounded-md bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600">
          Placeholder: report data is mocked until API integration is available.
        </p>

        {isLoading && (
          <section className="mt-6">
            <h1 className="text-2xl font-semibold text-gray-900">Loading report...</h1>
            <p className="mt-2 text-gray-600">Fetching placeholder data for report ID: {id}</p>
          </section>
        )}

        {!isLoading && resolvedState === "not-found" && (
          <section className="mt-6">
            <h1 className="text-2xl font-semibold text-gray-900">Report not found</h1>
            <p className="mt-2 text-gray-600">
              No placeholder report exists for ID: <span className="font-medium">{id}</span>
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-brand-500 hover:text-brand-500"
            >
              Back to homepage
            </Link>
          </section>
        )}

        {!isLoading && resolvedState === "completed" && report && (
          <section className="mt-6">
            <h1 className="text-2xl font-semibold text-gray-900">{report.title}</h1>
            <p className="mt-2 text-sm text-gray-500">
              Report ID: {report.id} • Generated: {report.generatedAt}
            </p>
            <ul className="mt-6 space-y-2 text-gray-700">
              {report.summary.map((item) => (
                <li key={item} className="rounded-lg border border-gray-200 p-3">
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="/sample-report.pdf"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Download Placeholder PDF
            </a>
          </section>
        )}
      </div>
    </main>
  );
}
