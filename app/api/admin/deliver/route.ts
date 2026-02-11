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

    const trimmedMarkdown = markdownContent?.trim() ?? "";

    if (!reportId || !trimmedMarkdown) {
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

    // If the email was already sent, avoid re-sending; just ensure the report is marked completed.
    if (report.email_sent && report.report_pdf_url) {
      const { data: completionUpdate, error: completionUpdateError } = await supabaseAdmin
        .from("reports")
        .update({
          report_status: "completed",
          delivered_at: report.delivered_at ?? new Date().toISOString(),
        })
        .eq("id", reportId)
        .select("id")
        .maybeSingle();

      if (completionUpdateError || !completionUpdate) {
        return NextResponse.json(
          { error: "Email already sent, but failed to mark report completed" },
          { status: 500 },
        );
      }

      return NextResponse.json({ success: true, pdfUrl: report.report_pdf_url });
    }

    const pdfBuffer = await generatePDF(trimmedMarkdown, report.question, report.category);

    const pdfFileName = `${reportId}.pdf`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("reports")
      .upload(pdfFileName, pdfBuffer, { contentType: "application/pdf", upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from("reports").getPublicUrl(pdfFileName);
    const pdfUrl = urlData.publicUrl;

    // Persist the output, but do not mark completed until the delivery email succeeds.
    const { data: contentUpdate, error: contentUpdateError } = await supabaseAdmin
      .from("reports")
      .update({
        report_content: trimmedMarkdown,
        report_pdf_url: pdfUrl,
      })
      .eq("id", reportId)
      .select("id")
      .maybeSingle();

    if (contentUpdateError || !contentUpdate) {
      return NextResponse.json(
        { error: "Failed to persist report content" },
        { status: 500 },
      );
    }

    try {
      const emailContent = reportDeliveryEmail(report.question, pdfUrl);
      await sendEmail({
        to: report.customer_email,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      await supabaseAdmin
        .from("reports")
        .update({ operator_notes: `Manual delivery email failed: ${message}` })
        .eq("id", reportId);

      return NextResponse.json({ error: "Email delivery failed" }, { status: 500 });
    }

    const { data: completionUpdate, error: completionUpdateError } = await supabaseAdmin
      .from("reports")
      .update({
        report_status: "completed",
        delivered_at: new Date().toISOString(),
        email_sent: true,
      })
      .eq("id", reportId)
      .select("id")
      .maybeSingle();

    if (completionUpdateError || !completionUpdate) {
      await supabaseAdmin
        .from("reports")
        .update({ email_sent: true })
        .eq("id", reportId);

      return NextResponse.json(
        { error: "Email sent, but failed to mark report completed" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, pdfUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
