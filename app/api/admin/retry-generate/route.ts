import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type RequestBody = { reportId?: string };

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.INTERNAL_API_SECRET) {
    return NextResponse.json(
      { error: "Server misconfiguration: INTERNAL_API_SECRET is missing" },
      { status: 500 },
    );
  }

  let reportId: string | null = null;

  try {
    const body = (await request.json()) as RequestBody;
    reportId = body.reportId?.trim() ?? null;
  } catch {
    reportId = null;
  }

  if (!reportId) {
    return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
  }

  const { data: report, error: reportError } = await supabaseAdmin
    .from("reports")
    .select("id, report_status, report_type, payment_status")
    .eq("id", reportId)
    .maybeSingle();

  if (reportError || !report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  if (report.payment_status !== "paid") {
    return NextResponse.json({ error: "Report is not paid" }, { status: 400 });
  }

  if (report.report_type !== "standard") {
    return NextResponse.json({ error: "Only standard reports can be retried" }, { status: 400 });
  }

  if (report.report_status !== "failed") {
    return NextResponse.json({ error: "Only failed reports can be retried" }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const triggerResponse = await fetch(`${origin}/api/generate-report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.INTERNAL_API_SECRET}`,
    },
    body: JSON.stringify({ reportId }),
    keepalive: true,
  });

  const payload = (await triggerResponse.json().catch(() => null)) as { error?: string } | null;

  if (!triggerResponse.ok) {
    return NextResponse.json(
      {
        error: `Retry failed (${triggerResponse.status})`,
        details: payload?.error ?? "",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

