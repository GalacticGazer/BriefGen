import { NextResponse } from "next/server";
import { appendNote, hasFreshClaim, withClaim, withoutClaim } from "@/lib/claim-utils";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { sendEmail } from "@/lib/email";
import { reportDeliveryEmail } from "@/lib/email-templates";
import { generatePDF } from "@/lib/pdf";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const maxDuration = 60;
const MANUAL_EMAIL_CLAIM_PREFIX = "manual_email_claim:";
const MANUAL_EMAIL_CLAIM_STALE_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let reportId: string | null = null;
  let claimNotes: string | null = null;

  try {
    const { reportId: incomingReportId, markdownContent } = (await request.json()) as {
      reportId?: string;
      markdownContent?: string;
    };
    reportId = incomingReportId ?? null;

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

    if (hasFreshClaim(report.operator_notes, MANUAL_EMAIL_CLAIM_PREFIX, MANUAL_EMAIL_CLAIM_STALE_MS)) {
      return NextResponse.json({ error: "Delivery already in progress" }, { status: 409 });
    }

    const claimTimestamp = new Date().toISOString();
    claimNotes = withClaim(
      report.operator_notes,
      MANUAL_EMAIL_CLAIM_PREFIX,
      claimTimestamp,
    );

    let claimQuery = supabaseAdmin
      .from("reports")
      .update({ operator_notes: claimNotes })
      .eq("id", reportId)
      .eq("email_sent", false);

    if (report.operator_notes === null) {
      claimQuery = claimQuery.is("operator_notes", null);
    } else {
      claimQuery = claimQuery.eq("operator_notes", report.operator_notes);
    }

    const { data: emailClaim, error: emailClaimError } = await claimQuery
      .select("id, email_sent, report_pdf_url, operator_notes")
      .maybeSingle();

    if (emailClaimError) {
      return NextResponse.json({ error: "Failed to claim delivery lock" }, { status: 500 });
    }

    if (!emailClaim) {
      const { data: latestReport } = await supabaseAdmin
        .from("reports")
        .select("email_sent, report_pdf_url")
        .eq("id", reportId)
        .maybeSingle();

      if (latestReport?.email_sent && latestReport.report_pdf_url) {
        return NextResponse.json({ success: true, pdfUrl: latestReport.report_pdf_url });
      }

      return NextResponse.json({ error: "Delivery already in progress" }, { status: 409 });
    }

    const pdfBuffer = await generatePDF(trimmedMarkdown, report.question, report.category);

    const pdfFileName = `${reportId}.pdf`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("reports")
      .upload(pdfFileName, pdfBuffer, { contentType: "application/pdf", upsert: true });

    if (uploadError) {
      await releaseManualClaim(reportId, claimNotes, `PDF upload failed: ${uploadError.message}`);
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
      .eq("operator_notes", claimNotes)
      .select("id")
      .maybeSingle();

    if (contentUpdateError || !contentUpdate) {
      await releaseManualClaim(reportId, claimNotes, "Failed to persist report content");
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
        idempotencyKey: `manual-delivery-${reportId}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const failureNotes = appendNote(
        withoutClaim(claimNotes, MANUAL_EMAIL_CLAIM_PREFIX),
        `Manual delivery email failed: ${message}`,
      );
      await supabaseAdmin
        .from("reports")
        .update({
          operator_notes: failureNotes,
        })
        .eq("id", reportId)
        .eq("operator_notes", claimNotes);

      return NextResponse.json({ error: "Email delivery failed" }, { status: 500 });
    }

    const finalNotes = withoutClaim(claimNotes, MANUAL_EMAIL_CLAIM_PREFIX);
    const { data: completionUpdate, error: completionUpdateError } = await supabaseAdmin
      .from("reports")
      .update({
        report_status: "completed",
        delivered_at: new Date().toISOString(),
        email_sent: true,
        operator_notes: finalNotes,
      })
      .eq("id", reportId)
      .eq("operator_notes", claimNotes)
      .select("id")
      .maybeSingle();

    if (completionUpdateError || !completionUpdate) {
      return NextResponse.json(
        { error: "Email sent, but failed to mark report completed" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, pdfUrl });
  } catch (error) {
    if (reportId && claimNotes) {
      const message = error instanceof Error ? error.message : "Unknown error";
      await releaseManualClaim(reportId, claimNotes, `Unexpected error: ${message}`);
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function releaseManualClaim(reportId: string, claimNotes: string, reason: string) {
  const notes = appendNote(
    withoutClaim(claimNotes, MANUAL_EMAIL_CLAIM_PREFIX),
    reason,
  );

  await supabaseAdmin
    .from("reports")
    .update({ operator_notes: notes })
    .eq("id", reportId)
    .eq("operator_notes", claimNotes);
}
