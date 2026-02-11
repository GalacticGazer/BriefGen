import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get("id");

  if (!reportId) {
    return NextResponse.json({ error: "Missing report ID" }, { status: 400 });
  }

  const { data: report, error } = await supabaseAdmin
    .from("reports")
    .select("report_status, report_pdf_url, report_type")
    .eq("id", reportId)
    .single();

  if (error || !report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: report.report_status,
    pdfUrl: report.report_pdf_url,
    reportType: report.report_type,
  });
}
