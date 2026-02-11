import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { sendEmail } from "@/lib/email";
import { reportDeliveryEmail } from "@/lib/email-templates";
import { generatePDF } from "@/lib/pdf";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { reportId, markdownContent } = (await request.json()) as {
      reportId?: string;
      markdownContent?: string;
    };

    if (!reportId || !markdownContent || !markdownContent.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: report, error: fetchError } = await supabaseAdmin
      .from("reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (fetchError || !report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const pdfBuffer = await generatePDF(markdownContent, report.question, report.category);

    const pdfFileName = `${reportId}.pdf`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("reports")
      .upload(pdfFileName, pdfBuffer, { contentType: "application/pdf", upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from("reports").getPublicUrl(pdfFileName);
    const pdfUrl = urlData.publicUrl;

    await supabaseAdmin
      .from("reports")
      .update({
        report_status: "completed",
        report_content: markdownContent,
        report_pdf_url: pdfUrl,
        delivered_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    const emailContent = reportDeliveryEmail(report.question, pdfUrl);
    await sendEmail({
      to: report.customer_email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    await supabaseAdmin.from("reports").update({ email_sent: true }).eq("id", reportId);

    return NextResponse.json({ success: true, pdfUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
