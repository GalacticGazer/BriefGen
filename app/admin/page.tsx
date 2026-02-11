"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type AdminAuthState = "checking" | "unauthenticated" | "authenticated";
type AdminTab = "pending" | "all";

type ReportStatus = "pending" | "generating" | "completed" | "awaiting_manual" | "failed";

type Report = {
  id: string;
  created_at: string;
  customer_email: string;
  category: string;
  question: string;
  report_type: string;
  report_status: ReportStatus;
  amount_cents: number;
  report_pdf_url: string | null;
  report_content: string | null;
};

type DashboardStats = {
  today: { count: number; revenue: number };
  week: { count: number; revenue: number };
  month: { count: number; revenue: number };
  total: { count: number; revenue: number };
  pendingPremium: number;
};

type DeliveryState = {
  loading: boolean;
  success: boolean;
  error: string | null;
};

const INITIAL_DELIVERY_STATE: DeliveryState = {
  loading: false,
  success: false,
  error: null,
};

const STATUS_STYLES: Record<ReportStatus, string> = {
  completed: "bg-green-100 text-green-700",
  generating: "bg-yellow-100 text-yellow-700",
  awaiting_manual: "bg-orange-100 text-orange-700",
  failed: "bg-red-100 text-red-700",
  pending: "bg-gray-100 text-gray-700",
};

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function truncateQuestion(question: string): string {
  return question.length > 60 ? `${question.slice(0, 60)}...` : question;
}

function toStatusLabel(status: ReportStatus): string {
  if (status === "awaiting_manual") return "Awaiting";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function AdminPage() {
  const [authState, setAuthState] = useState<AdminAuthState>("checking");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingReports, setPendingReports] = useState<Report[]>([]);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [pendingHasMore, setPendingHasMore] = useState(true);
  const [pendingIsLoadingMore, setPendingIsLoadingMore] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>("pending");
  const [allLimit, setAllLimit] = useState(50);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [deliveryStateById, setDeliveryStateById] = useState<Record<string, DeliveryState>>({});

  const fetchStats = useCallback(async (): Promise<boolean> => {
    const response = await fetch("/api/admin/stats", { cache: "no-store" });

    if (response.status === 401) {
      setAuthState("unauthenticated");
      return false;
    }

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({ error: null }))) as { error?: string };
      setDashboardError(payload.error ?? "Failed to load dashboard stats.");
      setAuthState("authenticated");
      return true;
    }

    const payload = (await response.json()) as DashboardStats;
    setStats(payload);
    setAuthState("authenticated");
    return true;
  }, []);

  const fetchReports = useCallback(
    async (options: {
      reportStatus?: string;
      limit: number;
      offset?: number;
    }): Promise<Report[] | null> => {
      const params = new URLSearchParams();
      params.set("limit", String(options.limit));
      if (options.offset !== undefined) {
        params.set("offset", String(options.offset));
      }
      if (options.reportStatus) {
        params.set("report_status", options.reportStatus);
      }

      const response = await fetch(`/api/admin/reports?${params.toString()}`, {
        cache: "no-store",
      });

      if (response.status === 401) {
        setAuthState("unauthenticated");
        return null;
      }

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({ error: null }))) as { error?: string };
        setDashboardError(payload.error ?? "Failed to load reports.");
        return null;
      }

      const json = (await response.json()) as { reports?: unknown };
      return Array.isArray(json.reports) ? (json.reports as Report[]) : [];
    },
    [],
  );

  const loadDashboard = useCallback(
    async (limitForAll: number) => {
      setIsLoadingDashboard(true);
      setDashboardError(null);

      try {
        const isAuthorized = await fetchStats();

        if (!isAuthorized) {
          return;
        }

        const [pending, all] = await Promise.all([
          fetchReports({ reportStatus: "awaiting_manual", limit: 50, offset: 0 }),
          fetchReports({ limit: limitForAll }),
        ]);

        if (pending) {
          setPendingReports(pending);
          setPendingHasMore(pending.length === 50);
        }

        if (all) {
          setAllReports(all);
        }
      } catch {
        setDashboardError("Unexpected error while loading admin data.");
      } finally {
        setIsLoadingDashboard(false);
      }
    },
    [fetchReports, fetchStats],
  );

  useEffect(() => {
    void loadDashboard(50);
  }, [loadDashboard]);

  const pendingCount = useMemo(
    () => pendingReports.filter((report) => report.report_status === "awaiting_manual").length,
    [pendingReports],
  );

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!password.trim()) {
      setLoginError("Password is required.");
      return;
    }

    setIsLoginLoading(true);
    setLoginError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json().catch(() => ({ error: null }))) as { error?: string };

      if (!response.ok) {
        setLoginError(payload.error ?? "Login failed.");
        return;
      }

      window.location.reload();
    } catch {
      setLoginError("Network error. Please try again.");
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleLoadMore = async () => {
    const nextLimit = allLimit + 50;
    setAllLimit(nextLimit);
    await loadDashboard(nextLimit);
  };

  const handleLoadMorePending = async () => {
    if (pendingIsLoadingMore || !pendingHasMore) {
      return;
    }

    setPendingIsLoadingMore(true);

    try {
      const nextPage = await fetchReports({
        reportStatus: "awaiting_manual",
        limit: 50,
        offset: pendingReports.length,
      });

      if (!nextPage) {
        return;
      }

      if (nextPage.length === 0) {
        setPendingHasMore(false);
        return;
      }

      setPendingReports((prev) => {
        const seen = new Set(prev.map((report) => report.id));
        const merged = [...prev];

        for (const report of nextPage) {
          if (!seen.has(report.id)) {
            seen.add(report.id);
            merged.push(report);
          }
        }

        return merged;
      });

      setPendingHasMore(nextPage.length === 50);
    } finally {
      setPendingIsLoadingMore(false);
    }
  };

  const toggleExpanded = (report: Report) => {
    if (expandedReportId === report.id) {
      setExpandedReportId(null);
      return;
    }

    setExpandedReportId(report.id);

    setDrafts((prev) => {
      if (prev[report.id] !== undefined) {
        return prev;
      }

      return {
        ...prev,
        [report.id]: report.report_content ?? "",
      };
    });

    setDeliveryStateById((prev) => ({
      ...prev,
      [report.id]: prev[report.id] ?? INITIAL_DELIVERY_STATE,
    }));
  };

  const handleDeliverPremium = async (reportId: string) => {
    const markdownContent = drafts[reportId]?.trim() ?? "";

    if (!markdownContent) {
      setDeliveryStateById((prev) => ({
        ...prev,
        [reportId]: {
          loading: false,
          success: false,
          error: "Please paste markdown content before delivering.",
        },
      }));
      return;
    }

    setDeliveryStateById((prev) => ({
      ...prev,
      [reportId]: {
        loading: true,
        success: false,
        error: null,
      },
    }));

    try {
      const response = await fetch("/api/admin/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, markdownContent }),
      });

      const payload = (await response.json().catch(() => ({ error: null }))) as {
        error?: string;
      };

      if (!response.ok) {
        setDeliveryStateById((prev) => ({
          ...prev,
          [reportId]: {
            loading: false,
            success: false,
            error: payload.error ?? "Delivery failed.",
          },
        }));
        return;
      }

      setDeliveryStateById((prev) => ({
        ...prev,
        [reportId]: {
          loading: false,
          success: true,
          error: null,
        },
      }));

      await loadDashboard(allLimit);
    } catch {
      setDeliveryStateById((prev) => ({
        ...prev,
        [reportId]: {
          loading: false,
          success: false,
          error: "Network error while delivering report.",
        },
      }));
    }
  };

  if (authState === "checking") {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-gray-600">Checking admin session...</p>
        </div>
      </main>
    );
  }

  if (authState === "unauthenticated") {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">BriefGen Admin</h1>
          <p className="mt-2 text-sm text-gray-600">Enter the admin password to continue.</p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                autoComplete="current-password"
                required
              />
            </div>

            {loginError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoginLoading}
              className="inline-flex w-full items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isLoginLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">BriefGen Admin</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage premium fulfillment, monitor report status, and track revenue.
          </p>
        </header>

        {dashboardError && (
          <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {dashboardError}
          </p>
        )}

        <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <StatCard label="Today" count={stats?.today.count ?? 0} revenue={stats?.today.revenue ?? 0} />
          <StatCard label="Week" count={stats?.week.count ?? 0} revenue={stats?.week.revenue ?? 0} />
          <StatCard label="Month" count={stats?.month.count ?? 0} revenue={stats?.month.revenue ?? 0} />
          <StatCard label="All Time" count={stats?.total.count ?? 0} revenue={stats?.total.revenue ?? 0} />
          <StatCard
            label="Pending Premium"
            count={stats?.pendingPremium ?? pendingCount}
            revenue={null}
            highlight={(stats?.pendingPremium ?? pendingCount) > 0}
          />
        </section>

        <section className="mt-8">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "pending"
                  ? "bg-white text-brand-500"
                  : "text-gray-600 hover:text-brand-500"
              }`}
            >
              Pending Premium
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "all" ? "bg-white text-brand-500" : "text-gray-600 hover:text-brand-500"
              }`}
            >
              All Reports
            </button>
          </div>

          <div className="rounded-b-xl rounded-tr-xl border border-gray-200 bg-white p-5 shadow-sm">
            {isLoadingDashboard && (
              <p className="mb-4 text-sm text-gray-500">Refreshing dashboard data...</p>
            )}

            {activeTab === "pending" && (
              <div className="space-y-4">
                {pendingReports.length === 0 ? (
                  <p className="text-sm text-gray-500">No pending premium reports.</p>
                ) : (
                  pendingReports.map((report) => {
                    const isExpanded = expandedReportId === report.id;
                    const deliveryState = deliveryStateById[report.id] ?? INITIAL_DELIVERY_STATE;

                    return (
                      <article key={report.id} className="rounded-lg border border-gray-200 p-4">
                        <button
                          type="button"
                          onClick={() => toggleExpanded(report)}
                          className="flex w-full flex-col items-start justify-between gap-2 text-left sm:flex-row sm:items-center"
                        >
                          <span className="text-sm text-gray-500">{formatDate(report.created_at)}</span>
                          <span className="text-sm font-medium text-gray-900">{report.customer_email}</span>
                          <span className="text-sm font-semibold text-brand-500">
                            {formatMoney(report.amount_cents / 100)}
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Question
                              </p>
                              <p className="mt-1 text-sm text-gray-700">{report.question}</p>
                            </div>

                            <div className="space-y-2">
                              <label
                                htmlFor={`markdown-${report.id}`}
                                className="text-sm font-medium text-gray-700"
                              >
                                Manual Fulfillment (Markdown)
                              </label>
                              <textarea
                                id={`markdown-${report.id}`}
                                value={drafts[report.id] ?? ""}
                                onChange={(event) =>
                                  setDrafts((prev) => ({
                                    ...prev,
                                    [report.id]: event.target.value,
                                  }))
                                }
                                placeholder="Paste your deep research output here (Markdown format)"
                                className="min-h-56 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                              />
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                              <button
                                type="button"
                                onClick={() => void handleDeliverPremium(report.id)}
                                disabled={deliveryState.loading}
                                className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                              >
                                {deliveryState.loading
                                  ? "Generating PDF & Delivering..."
                                  : "Generate PDF & Deliver"}
                              </button>

                              {deliveryState.success && (
                                <p className="text-sm font-medium text-green-700">✓ Delivered!</p>
                              )}

                              {deliveryState.error && (
                                <p className="text-sm font-medium text-red-700">{deliveryState.error}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })
                )}

                {pendingReports.length > 0 && pendingHasMore && (
                  <button
                    type="button"
                    onClick={() => void handleLoadMorePending()}
                    disabled={pendingIsLoadingMore}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-brand-500 hover:text-brand-500 disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    {pendingIsLoadingMore ? "Loading..." : "Load More"}
                  </button>
                )}
              </div>
            )}

            {activeTab === "all" && (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Category</th>
                        <th className="px-3 py-2">Question</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Amount</th>
                        <th className="px-3 py-2">PDF</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allReports.map((report) => (
                        <tr key={report.id} className="text-gray-700">
                          <td className="whitespace-nowrap px-3 py-3">{formatDate(report.created_at)}</td>
                          <td className="px-3 py-3 capitalize">{report.report_type}</td>
                          <td className="px-3 py-3 capitalize">{report.category.replace(/_/g, " ")}</td>
                          <td className="px-3 py-3">{truncateQuestion(report.question)}</td>
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${STATUS_STYLES[report.report_status]}`}
                            >
                              {toStatusLabel(report.report_status)}
                            </span>
                          </td>
                          <td className="px-3 py-3">{formatMoney(report.amount_cents / 100)}</td>
                          <td className="px-3 py-3">
                            {report.report_pdf_url ? (
                              <a
                                href={report.report_pdf_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-brand-500 transition-colors hover:text-brand-600"
                              >
                                Download
                              </a>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => void handleLoadMore()}
                    disabled={isLoadingDashboard}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-brand-500 hover:text-brand-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
                  >
                    Load More
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  count,
  revenue,
  highlight = false,
}: {
  label: string;
  count: number;
  revenue: number | null;
  highlight?: boolean;
}) {
  return (
    <article
      className={`rounded-xl border p-4 shadow-sm ${
        highlight
          ? "border-orange-200 bg-orange-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">{count}</p>
      <p className="mt-1 text-sm text-gray-600">{revenue === null ? "" : formatMoney(revenue)}</p>
    </article>
  );
}
