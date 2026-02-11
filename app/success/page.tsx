"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

type ReportStatus = "pending" | "generating" | "completed" | "awaiting_manual" | "failed";
type ReportType = "standard" | "premium";

const TERMINAL_STATUSES: ReportStatus[] = ["completed", "failed", "awaiting_manual"];

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 p-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Loading payment status...
            </h1>
          </div>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("report_id");

  const [status, setStatus] = useState<ReportStatus>("pending");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [reportType, setReportType] = useState<ReportType>("standard");
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!reportId) {
      return;
    }

    let cancelled = false;

    const checkStatus = async () => {
      const response = await fetch(`/api/report-status?id=${encodeURIComponent(reportId)}`);
      const data = (await response.json()) as {
        error?: string;
        status?: ReportStatus;
        pdfUrl?: string | null;
        reportType?: ReportType;
      };

      if (cancelled) {
        return;
      }

      if (!response.ok) {
        setError(data.error ?? "Unable to check report status right now. Please refresh shortly.");
        return;
      }

      if (data.status) {
        setStatus(data.status);
      }

      if (data.pdfUrl) {
        setPdfUrl(data.pdfUrl);
      }

      if (data.reportType) {
        setReportType(data.reportType);
      }

      setError(null);

      if (data.status && TERMINAL_STATUSES.includes(data.status) && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    void checkStatus();

    intervalRef.current = setInterval(() => {
      void checkStatus();
    }, 3000);

    return () => {
      cancelled = true;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [reportId]);

  if (!reportId) {
    return (
      <main className="min-h-screen bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 p-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Missing report ID</h1>
          <p className="mt-3 text-gray-600">
            We couldn&apos;t find a `report_id` in the URL. Start from the homepage and try again.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
          >
            Back to Homepage
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 p-8 text-center">
        <p className="rounded-md bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600">
          Payment confirmed. Polling report status every 3 seconds.
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {(status === "pending" || status === "generating") && (
          <section className="mt-8">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500" />
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-gray-900">
              Your report is being researched...
            </h1>
            <p className="mt-3 text-gray-600">
              Status: <span className="font-medium capitalize">{status}</span>
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Report ID: <span className="font-medium">{reportId}</span>
            </p>
          </section>
        )}

        {status === "completed" && (
          <section className="mt-8">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-brand-500">
              ✓
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-gray-900">
              Your report is ready!
            </h1>
            <p className="mt-3 text-gray-600">A copy was also sent to your email.</p>
            <a
              href={pdfUrl ?? `/report/${reportId}`}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Download Report
            </a>
          </section>
        )}

        {status === "awaiting_manual" && (
          <section className="mt-8">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-brand-500">
              ⏱
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-gray-900">
              Your premium report is being prepared
            </h1>
            <p className="mt-3 text-gray-600">
              Our team has received your request and will deliver within 24 hours.
            </p>
            <p className="mt-2 text-sm text-gray-500">Report type: {reportType}</p>
          </section>
        )}

        {status === "failed" && (
          <section className="mt-8">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-brand-500">
              !
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-gray-900">
              Something went wrong
            </h1>
            <p className="mt-3 text-gray-600">
              Please contact us at {process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@briefgen.ai"}.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
