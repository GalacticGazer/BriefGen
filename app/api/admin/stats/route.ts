import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type StatReport = {
  amount_cents: number;
  created_at: string;
  report_type: string;
  report_status: string;
};

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: allReports, error } = await supabaseAdmin
    .from("reports")
    .select("amount_cents, created_at, report_type, report_status")
    .eq("payment_status", "paid");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const reports: StatReport[] = (allReports ?? []) as StatReport[];
  const sum = (arr: StatReport[]) => arr.reduce((s, r) => s + r.amount_cents, 0) / 100;

  const todayReports = reports.filter((r) => r.created_at >= todayStart);
  const weekReports = reports.filter((r) => r.created_at >= weekStart);
  const monthReports = reports.filter((r) => r.created_at >= monthStart);
  const pendingPremium = reports.filter(
    (r) => r.report_type === "premium" && r.report_status === "awaiting_manual",
  ).length;

  return NextResponse.json({
    today: { count: todayReports.length, revenue: sum(todayReports) },
    week: { count: weekReports.length, revenue: sum(weekReports) },
    month: { count: monthReports.length, revenue: sum(monthReports) },
    total: { count: reports.length, revenue: sum(reports) },
    pendingPremium,
  });
}
