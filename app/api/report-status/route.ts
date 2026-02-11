import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getReportAccessSecretError, verifyReportAccessToken } from "@/lib/report-access";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: getReportAccessSecretError() }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get("id");

  if (!reportId) {
    return NextResponse.json({ error: "Missing report ID" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(`briefgen_report_access_${reportId}`)?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { data: report, error } = await supabaseAdmin
    .from("reports")
    .select("report_status, report_pdf_url, report_type, customer_email")
    .eq("id", reportId)
    .single();

  if (error || !report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const hasAccess = verifyReportAccessToken(token, reportId, report.customer_email);
  if (!hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return NextResponse.json({
    status: report.report_status,
    pdfUrl: report.report_pdf_url,
    reportType: report.report_type,
  });
}
