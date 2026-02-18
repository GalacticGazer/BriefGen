import { JWT } from "google-auth-library";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const GA_SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"];
const DEFAULT_TIMEZONE = "America/New_York";

type ReportRow = {
  created_at: string;
  amount_cents: number;
  payment_status: string;
  report_type: string;
  category: string;
};

type TypeBreakdown = {
  reportType: string;
  purchases: number;
  revenueUsd: number;
};

type CategoryBreakdown = {
  category: string;
  checkouts: number;
};

type FunnelSnapshot = {
  checkoutStarts: number;
  purchases: number;
  revenueUsd: number;
  averageOrderValueUsd: number;
  purchasesByType: TypeBreakdown[];
  checkoutsByCategory: CategoryBreakdown[];
};

type GaRunReportResponse = {
  rows?: Array<{
    dimensionValues?: Array<{ value?: string }>;
    metricValues?: Array<{ value?: string }>;
  }>;
};

type TrafficSnapshot = {
  sessions: number;
  engagedSessions: number;
  users: number;
};

function getAuthorizedSecrets() {
  return [
    process.env.MARKETING_BRIEF_SECRET,
    process.env.CRON_SECRET,
    process.env.INTERNAL_API_SECRET,
  ].filter((secret): secret is string => typeof secret === "string" && secret.length > 0);
}

function getBearerToken(request: Request): string {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return "";
  }

  return authHeader.slice(7);
}

function shiftDate(dateString: string, days: number): string {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatDateInTimezone(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

function resolveTargetDate(requestedDate: string | null, timezone: string): string | null {
  if (requestedDate) {
    if (!DATE_RE.test(requestedDate)) {
      return null;
    }

    const parsed = new Date(`${requestedDate}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== requestedDate) {
      return null;
    }

    return requestedDate;
  }

  const todayInTimezone = formatDateInTimezone(new Date(), timezone);
  return shiftDate(todayInTimezone, -1);
}

function resolveTimezone(rawTimezone: string | null): string | null {
  const candidate = rawTimezone?.trim() || process.env.MARKETING_BRIEF_TIMEZONE || DEFAULT_TIMEZONE;

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: candidate }).format(new Date());
    return candidate;
  } catch {
    return null;
  }
}

function toInt(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "0", 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundRate(value: number): number {
  return Math.round(value * 10000) / 10000;
}

function formatRate(numerator: number, denominator: number): number | null {
  if (denominator <= 0) {
    return null;
  }

  return roundRate(numerator / denominator);
}

function buildDelta(current: number, previous: number) {
  const absolute = current - previous;
  const percentChange = previous === 0 ? null : roundRate((absolute / previous) * 100);

  return {
    current,
    previous,
    absolute,
    percentChange,
  };
}

function summarizeRows(rows: ReportRow[]): FunnelSnapshot {
  const paidRows = rows.filter((row) => row.payment_status === "paid");
  const revenueUsd = roundMoney(paidRows.reduce((sum, row) => sum + row.amount_cents, 0) / 100);
  const averageOrderValueUsd = paidRows.length > 0 ? roundMoney(revenueUsd / paidRows.length) : 0;

  const purchasesByTypeMap = new Map<string, { purchases: number; revenueCents: number }>();
  for (const row of paidRows) {
    const current = purchasesByTypeMap.get(row.report_type) ?? { purchases: 0, revenueCents: 0 };
    current.purchases += 1;
    current.revenueCents += row.amount_cents;
    purchasesByTypeMap.set(row.report_type, current);
  }

  const checkoutsByCategoryMap = new Map<string, number>();
  for (const row of rows) {
    checkoutsByCategoryMap.set(row.category, (checkoutsByCategoryMap.get(row.category) ?? 0) + 1);
  }

  const purchasesByType: TypeBreakdown[] = [...purchasesByTypeMap.entries()]
    .map(([reportType, stats]) => ({
      reportType,
      purchases: stats.purchases,
      revenueUsd: roundMoney(stats.revenueCents / 100),
    }))
    .sort((a, b) => b.purchases - a.purchases);

  const checkoutsByCategory: CategoryBreakdown[] = [...checkoutsByCategoryMap.entries()]
    .map(([category, checkouts]) => ({ category, checkouts }))
    .sort((a, b) => b.checkouts - a.checkouts);

  return {
    checkoutStarts: rows.length,
    purchases: paidRows.length,
    revenueUsd,
    averageOrderValueUsd,
    purchasesByType,
    checkoutsByCategory,
  };
}

async function fetchFunnelSnapshots(
  targetDate: string,
  previousDate: string,
  timezone: string,
): Promise<{ target: FunnelSnapshot; previous: FunnelSnapshot }> {
  const lowerInclusive = shiftDate(previousDate, -1);
  const upperExclusive = shiftDate(targetDate, 2);

  const { data, error } = await supabaseAdmin
    .from("reports")
    .select("created_at, amount_cents, payment_status, report_type, category")
    .gte("created_at", `${lowerInclusive}T00:00:00.000Z`)
    .lt("created_at", `${upperExclusive}T00:00:00.000Z`);

  if (error) {
    throw new Error(`Failed to load report funnel metrics: ${error.message}`);
  }

  const rows = (data ?? []) as ReportRow[];
  const targetRows: ReportRow[] = [];
  const previousRows: ReportRow[] = [];

  for (const row of rows) {
    const rowDate = formatDateInTimezone(new Date(row.created_at), timezone);
    if (rowDate === targetDate) {
      targetRows.push(row);
    } else if (rowDate === previousDate) {
      previousRows.push(row);
    }
  }

  return {
    target: summarizeRows(targetRows),
    previous: summarizeRows(previousRows),
  };
}

function getGaCredentials() {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim();
  const clientEmail = process.env.GA4_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GA4_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!propertyId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    propertyId,
    clientEmail,
    privateKey,
  };
}

async function getGaAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const jwtClient = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: GA_SCOPES,
  });

  const token = await jwtClient.getAccessToken();
  if (!token || typeof token !== "string") {
    throw new Error("Unable to obtain GA4 access token");
  }

  return token;
}

async function runGaReport(
  accessToken: string,
  propertyId: string,
  requestBody: Record<string, unknown>,
): Promise<GaRunReportResponse> {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`GA4 runReport failed (${response.status}): ${details}`);
  }

  return (await response.json()) as GaRunReportResponse;
}

function readTrafficSnapshot(report: GaRunReportResponse): TrafficSnapshot {
  const row = report.rows?.[0];
  return {
    sessions: toInt(row?.metricValues?.[0]?.value),
    engagedSessions: toInt(row?.metricValues?.[1]?.value),
    users: toInt(row?.metricValues?.[2]?.value),
  };
}

async function fetchTrafficData(targetDate: string, previousDate: string) {
  const creds = getGaCredentials();
  if (!creds) {
    return {
      configured: false,
      warning:
        "GA4 is not configured. Set GA4_PROPERTY_ID, GA4_SERVICE_ACCOUNT_EMAIL, and GA4_SERVICE_ACCOUNT_PRIVATE_KEY.",
      target: { sessions: 0, engagedSessions: 0, users: 0 },
      previous: { sessions: 0, engagedSessions: 0, users: 0 },
      topSources: [] as Array<{ sourceMedium: string; sessions: number }>,
      topChannels: [] as Array<{ channel: string; sessions: number }>,
    };
  }

  const accessToken = await getGaAccessToken(creds.clientEmail, creds.privateKey);
  const [targetTotals, previousTotals, topSourcesReport, topChannelsReport] = await Promise.all([
    runGaReport(accessToken, creds.propertyId, {
      dateRanges: [{ startDate: targetDate, endDate: targetDate }],
      metrics: [{ name: "sessions" }, { name: "engagedSessions" }, { name: "totalUsers" }],
    }),
    runGaReport(accessToken, creds.propertyId, {
      dateRanges: [{ startDate: previousDate, endDate: previousDate }],
      metrics: [{ name: "sessions" }, { name: "engagedSessions" }, { name: "totalUsers" }],
    }),
    runGaReport(accessToken, creds.propertyId, {
      dateRanges: [{ startDate: targetDate, endDate: targetDate }],
      dimensions: [{ name: "sessionSourceMedium" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    }),
    runGaReport(accessToken, creds.propertyId, {
      dateRanges: [{ startDate: targetDate, endDate: targetDate }],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    }),
  ]);

  return {
    configured: true,
    warning: null,
    target: readTrafficSnapshot(targetTotals),
    previous: readTrafficSnapshot(previousTotals),
    topSources: (topSourcesReport.rows ?? []).map((row) => ({
      sourceMedium: row.dimensionValues?.[0]?.value ?? "(not set)",
      sessions: toInt(row.metricValues?.[0]?.value),
    })),
    topChannels: (topChannelsReport.rows ?? []).map((row) => ({
      channel: row.dimensionValues?.[0]?.value ?? "(not set)",
      sessions: toInt(row.metricValues?.[0]?.value),
    })),
  };
}

export async function GET(request: Request) {
  const authorizedSecrets = getAuthorizedSecrets();
  if (authorizedSecrets.length === 0) {
    return NextResponse.json(
      {
        error:
          "Server misconfiguration: set MARKETING_BRIEF_SECRET (recommended), CRON_SECRET, or INTERNAL_API_SECRET",
      },
      { status: 500 },
    );
  }

  const token = getBearerToken(request);
  if (!authorizedSecrets.includes(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const timezone = resolveTimezone(url.searchParams.get("tz"));
  if (!timezone) {
    return NextResponse.json(
      { error: "Invalid timezone. Use an IANA timezone (example: America/New_York)." },
      { status: 400 },
    );
  }

  const targetDate = resolveTargetDate(url.searchParams.get("date"), timezone);
  if (!targetDate) {
    return NextResponse.json(
      { error: "Invalid date format. Use YYYY-MM-DD." },
      { status: 400 },
    );
  }

  const previousDate = shiftDate(targetDate, -1);
  const warnings: string[] = [];

  try {
    const [funnel, traffic] = await Promise.all([
      fetchFunnelSnapshots(targetDate, previousDate, timezone),
      fetchTrafficData(targetDate, previousDate),
    ]);

    if (traffic.warning) {
      warnings.push(traffic.warning);
    }

    const visitToCheckoutRate = formatRate(funnel.target.checkoutStarts, traffic.target.sessions);
    const visitToPurchaseRate = formatRate(funnel.target.purchases, traffic.target.sessions);
    const checkoutToPurchaseRate = formatRate(funnel.target.purchases, funnel.target.checkoutStarts);

    return NextResponse.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      date: targetDate,
      previousDate,
      timezone,
      traffic: {
        provider: traffic.configured ? "ga4" : "unavailable",
        sessions: traffic.target.sessions,
        users: traffic.target.users,
        engagedSessions: traffic.target.engagedSessions,
        engagementRate: formatRate(traffic.target.engagedSessions, traffic.target.sessions),
        topSources: traffic.topSources,
        topChannels: traffic.topChannels,
      },
      funnel: {
        checkoutStarts: funnel.target.checkoutStarts,
        purchases: funnel.target.purchases,
        revenueUsd: funnel.target.revenueUsd,
        averageOrderValueUsd: funnel.target.averageOrderValueUsd,
        visitToCheckoutRate,
        visitToPurchaseRate,
        checkoutToPurchaseRate,
        purchasesByType: funnel.target.purchasesByType,
        checkoutsByCategory: funnel.target.checkoutsByCategory,
      },
      deltas: {
        sessions: buildDelta(traffic.target.sessions, traffic.previous.sessions),
        checkoutStarts: buildDelta(funnel.target.checkoutStarts, funnel.previous.checkoutStarts),
        purchases: buildDelta(funnel.target.purchases, funnel.previous.purchases),
        revenueUsd: buildDelta(funnel.target.revenueUsd, funnel.previous.revenueUsd),
      },
      attributionNotes: [
        "Checkout, purchase, and revenue metrics are derived from Supabase reports table records.",
        "Purchase/revenue counts are attributed by report record creation date.",
      ],
      warnings,
    });
  } catch (error) {
    console.error("Failed to build marketing brief:", error);
    const details = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to build marketing brief", details }, { status: 503 });
  }
}
