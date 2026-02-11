import { NextResponse } from "next/server";
import { AI_CONFIG } from "@/lib/config";
import { sendEmail } from "@/lib/email";
import { reportDeliveryEmail } from "@/lib/email-templates";
import { generateReport } from "@/lib/openai";
import { generatePDF } from "@/lib/pdf";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const maxDuration = 60;
const GENERATING_STALE_MS = 5 * 60 * 1000;

export async function POST(request: Request) {
  let reportId: string | null = null;

  try {
    const authHeader = request.headers.get("Authorization");
    const internalApiSecret = process.env.INTERNAL_API_SECRET;

    if (!internalApiSecret) {
      return NextResponse.json(
        { error: "Server misconfiguration: INTERNAL_API_SECRET is missing" },
        { status: 500 },
      );
    }

    if (authHeader !== `Bearer ${internalApiSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { reportId?: string };
    reportId = body.reportId ?? null;

    if (!reportId) {
      return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
    }

    const { data: report, error: fetchError } = await supabaseAdmin
      .from("reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (fetchError || !report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.payment_status !== "paid") {
      return NextResponse.json({ error: "Report not paid" }, { status: 400 });
    }

    if (report.report_status === "completed") {
      return NextResponse.json({ error: "Report already generated" }, { status: 400 });
    }

    if (report.report_status === "generating") {
      const generationStartedAt = getGenerationStartedAt(report.operator_notes, report.created_at);
      const isStale = Date.now() - generationStartedAt.getTime() > GENERATING_STALE_MS;

      if (!isStale) {
        return NextResponse.json({ error: "Report is already generating" }, { status: 409 });
      }

      const { data: recoveredRows, error: recoverError } = await supabaseAdmin
        .from("reports")
        .update({
          report_status: "failed",
          operator_notes: `Recovered stale generation lock at ${new Date().toISOString()}`,
        })
        .eq("id", reportId)
        .eq("report_status", "generating")
        .select("id");

      if (recoverError) {
        throw new Error(`Failed to recover stale generation lock: ${recoverError.message}`);
      }

      if (!recoveredRows || recoveredRows.length === 0) {
        return NextResponse.json(
          { error: "Report generation state changed; retry request" },
          { status: 409 },
        );
      }
    }

    if (report.report_type !== "standard") {
      return NextResponse.json(
        { error: "Only standard reports are auto-generated" },
        { status: 400 },
      );
    }

    const { data: lockRows, error: lockError } = await supabaseAdmin
      .from("reports")
      .update({
        report_status: "generating",
        operator_notes: `generation_started_at:${new Date().toISOString()}`,
      })
      .eq("id", reportId)
      .in("report_status", ["pending", "failed"])
      .select("id");

    if (lockError) {
      throw new Error(`Failed to acquire generation lock: ${lockError.message}`);
    }

    if (!lockRows || lockRows.length === 0) {
      return NextResponse.json(
        { error: "Report generation already in progress or unavailable" },
        { status: 409 },
      );
    }

    const { content, usage } = await generateReport(report.category, report.question);

    if (!content || content.length < 100) {
      throw new Error("AI returned insufficient content");
    }

    const pdfBuffer = await generatePDF(content, report.question, report.category);

    const pdfFileName = `${reportId}.pdf`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("reports")
      .upload(pdfFileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`PDF upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabaseAdmin.storage.from("reports").getPublicUrl(pdfFileName);

    const pdfUrl = urlData.publicUrl;

    const { data: completionUpdate, error: completionUpdateError } = await supabaseAdmin
      .from("reports")
      .update({
        report_status: "completed",
        report_content: content,
        report_pdf_url: pdfUrl,
        delivered_at: new Date().toISOString(),
        operator_notes: `Model: ${AI_CONFIG.model} | Tokens: ${usage.inputTokens}in/${usage.outputTokens}out | Cost: $${usage.estimatedCost}`,
      })
      .eq("id", reportId)
      .select("id")
      .maybeSingle();

    if (completionUpdateError || !completionUpdate) {
      throw new Error("Failed to persist completed report state");
    }

    // Delivery email failures should not fail report generation.
    try {
      const emailContent = reportDeliveryEmail(report.question, pdfUrl);
      await sendEmail({
        to: report.customer_email,
        subject: emailContent.subject,
        html: emailContent.html,
      });

      await supabaseAdmin.from("reports").update({ email_sent: true }).eq("id", reportId);
    } catch (emailError) {
      console.error("Email delivery failed:", emailError);
    }

    return NextResponse.json({
      success: true,
      pdfUrl,
      usage,
    });
  } catch (error) {
    console.error("Report generation failed:", error);

    if (reportId) {
      const message = error instanceof Error ? error.message : "Unknown error";

      await supabaseAdmin
        .from("reports")
        .update({
          report_status: "failed",
          operator_notes: `Error: ${message}`,
        })
        .eq("id", reportId);
    }

    const details = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Report generation failed", details },
      { status: 500 },
    );
  }
}

function getGenerationStartedAt(operatorNotes: unknown, createdAt: unknown): Date {
  if (typeof operatorNotes === "string") {
    const match = operatorNotes.match(/generation_started_at:([^\s]+)/);
    if (match?.[1]) {
      const parsed = new Date(match[1]);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }

  if (typeof createdAt === "string") {
    const created = new Date(createdAt);
    if (!Number.isNaN(created.getTime())) {
      return created;
    }
  }

  return new Date(0);
}
