import { NextResponse } from "next/server";
import {
  createReportAccessToken,
  getReportAccessSecretError,
  REPORT_ACCESS_MAX_AGE_SECONDS,
} from "@/lib/report-access";
import { runRetentionCleanupIfDue } from "@/lib/retention";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const runtime = "nodejs";

type RequestBody = {
  category?: string;
  question?: string;
  email?: string;
  reportType?: "standard" | "premium";
};

export async function POST(request: Request) {
  try {
    await runRetentionCleanupIfDue();

    const { category, question, email, reportType } = (await request.json()) as RequestBody;
    const trimmedQuestion = question?.trim() ?? "";

    if (!category || !email || !reportType || !trimmedQuestion) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (trimmedQuestion.length > 2000) {
      return NextResponse.json(
        { error: "Question too long (max 2000 characters)" },
        { status: 400 },
      );
    }

    if (reportType !== "standard" && reportType !== "premium") {
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_URL) {
      return NextResponse.json(
        { error: "Server misconfiguration: NEXT_PUBLIC_URL is missing" },
        { status: 500 },
      );
    }

    if (!process.env.INTERNAL_API_SECRET) {
      return NextResponse.json(
        { error: getReportAccessSecretError() },
        { status: 500 },
      );
    }

    const isStandard = reportType === "standard";
    const amountCents = isStandard ? 499 : 1499;
    const productName = isStandard
      ? "BriefGen Research Report"
      : "BriefGen Premium Research Report";

    const { data: report, error: dbError } = await supabaseAdmin
      .from("reports")
      .insert({
        customer_email: email.trim(),
        category,
        question: trimmedQuestion,
        report_type: reportType,
        amount_cents: amountCents,
        payment_status: "pending",
        report_status: "pending",
      })
      .select()
      .single();

    if (dbError || !report) {
      console.error("Database error:", dbError);
      return NextResponse.json({ error: "Failed to create report record" }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email.trim(),
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
              description:
                trimmedQuestion.substring(0, 200) +
                (trimmedQuestion.length > 200 ? "..." : ""),
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?report_id=${report.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/?cancelled=true`,
      metadata: {
        report_id: report.id,
        report_type: reportType,
      },
    });

    const { error: updateError } = await supabaseAdmin
      .from("reports")
      .update({ stripe_session_id: session.id })
      .eq("id", report.id);

    if (updateError) {
      console.error("Failed to persist stripe_session_id:", updateError);
      return NextResponse.json(
        { error: "Failed to persist checkout session details" },
        { status: 500 },
      );
    }

    const reportAccessToken = createReportAccessToken(report.id, email.trim());
    const response = NextResponse.json({ url: session.url });
    response.cookies.set(`briefgen_report_access_${report.id}`, reportAccessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: REPORT_ACCESS_MAX_AGE_SECONDS,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
