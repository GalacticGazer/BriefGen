import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const reportStatus = (
    searchParams.get("report_status") ??
    searchParams.get("status") ??
    ""
  ).trim();
  const parsedLimit = Number.parseInt(searchParams.get("limit") || "50", 10);
  const limit = Number.isNaN(parsedLimit) ? 50 : Math.min(Math.max(parsedLimit, 1), 200);
  const parsedOffset = Number.parseInt(searchParams.get("offset") || "0", 10);
  const offset = Number.isNaN(parsedOffset) ? 0 : Math.max(parsedOffset, 0);
  const rangeEnd = offset + limit - 1;

  let query = supabaseAdmin
    .from("reports")
    .select("*")
    .eq("payment_status", "paid")
    .order("created_at", { ascending: false })
    .range(offset, rangeEnd);

  if (reportStatus) {
    query = query.eq("report_status", reportStatus);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let reports = data ?? [];

  if (reportStatus && reports.length === 0) {
    const { data: fallbackData, error: fallbackError } = await supabaseAdmin
      .from("reports")
      .select("*")
      .eq("payment_status", "paid")
      .order("created_at", { ascending: false })
      .range(offset, rangeEnd);

    if (!fallbackError && fallbackData) {
      const normalized = reportStatus.toLowerCase();
      reports = fallbackData.filter(
        (report) =>
          typeof report.report_status === "string" &&
          report.report_status.trim().toLowerCase() === normalized,
      );
    }
  }

  return NextResponse.json({ reports });
}
