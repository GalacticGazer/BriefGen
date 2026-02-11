import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sendEmail } from "@/lib/email";
import {
  operatorNotificationEmail,
  premiumReportReceivedEmail,
} from "@/lib/email-templates";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Server misconfiguration: STRIPE_WEBHOOK_SECRET is missing" },
      { status: 500 },
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const reportId = session.metadata?.report_id;
    const reportType = session.metadata?.report_type;

    if (!reportId) {
      console.error("No report_id in session metadata");
      return NextResponse.json({ error: "Missing report_id" }, { status: 400 });
    }

    const reportStatusUpdate =
      reportType === "premium" ? { report_status: "awaiting_manual" } : {};

    const { data: updatedReport, error: updateError } = await supabaseAdmin
      .from("reports")
      .update({
        payment_status: "paid",
        stripe_payment_intent: String(session.payment_intent ?? ""),
        ...reportStatusUpdate,
      })
      .eq("id", reportId)
      .select("id")
      .maybeSingle();

    if (updateError || !updatedReport) {
      console.error("Failed to persist webhook payment update:", updateError);
      return NextResponse.json(
        { error: "Failed to persist payment update" },
        { status: 500 },
      );
    }

    if (reportType === "standard") {
      try {
        const requestUrl = new URL(request.url);
        const urlBase = process.env.NEXT_PUBLIC_URL || requestUrl.origin;

        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (process.env.INTERNAL_API_SECRET) {
          headers.Authorization = `Bearer ${process.env.INTERNAL_API_SECRET}`;
        }

        // Acknowledge Stripe quickly; trigger generation asynchronously.
        void triggerStandardReportGeneration(urlBase, headers, reportId);
      } catch (e) {
        console.error("Error triggering generation:", e);
      }
    } else if (reportType === "premium") {
      await notifyOperatorForPremiumReport(reportId);
    }
  }

  return NextResponse.json({ received: true });
}

async function notifyOperatorForPremiumReport(reportId: string) {
  const { data: report } = await supabaseAdmin
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .single();

  if (!report) {
    return;
  }

  if (report.operator_notified) {
    return;
  }

  const amount = `$${(report.amount_cents / 100).toFixed(2)}`;
  let operatorNotificationSent = false;

  // 1) Customer confirmation
  try {
    const customerEmail = premiumReportReceivedEmail(report.question);
    await sendEmail({
      to: report.customer_email,
      subject: customerEmail.subject,
      html: customerEmail.html,
    });
  } catch (err) {
    console.error("Customer confirmation email failed:", err);
  }

  // 2) Operator notification
  if (!process.env.OPERATOR_EMAIL) {
    console.error("OPERATOR_EMAIL is missing; skipping operator email notification.");
  } else {
    try {
      const opEmail = operatorNotificationEmail(
        reportId,
        report.customer_email,
        report.question,
        amount,
      );
      await sendEmail({
        to: process.env.OPERATOR_EMAIL,
        subject: opEmail.subject,
        html: opEmail.html,
      });
      operatorNotificationSent = true;
    } catch (err) {
      console.error("Operator email notification failed:", err);
    }
  }

  // 3) Telegram (optional)
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    try {
      await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: `🔔 PREMIUM REPORT REQUEST\n\nCustomer: ${report.customer_email}\nQuestion: ${report.question}\nAmount: ${amount}\nID: ${reportId}`,
          }),
        },
      );
      operatorNotificationSent = true;
    } catch (err) {
      console.error("Telegram notification failed:", err);
    }
  }

  if (operatorNotificationSent) {
    await supabaseAdmin
      .from("reports")
      .update({ operator_notified: true })
      .eq("id", reportId);
  } else {
    console.error("No operator alert channel succeeded; operator_notified remains false.");
  }
}

async function triggerStandardReportGeneration(
  urlBase: string,
  headers: HeadersInit,
  reportId: string,
) {
  try {
    const triggerResponse = await fetch(`${urlBase}/api/generate-report`, {
      method: "POST",
      headers,
      body: JSON.stringify({ reportId }),
      keepalive: true,
    });

    if (!triggerResponse.ok) {
      const payload = (await triggerResponse
        .json()
        .catch(() => ({ error: null }))) as { error?: string | null };
      console.error(
        "Failed to trigger report generation:",
        triggerResponse.status,
        payload.error ?? "",
      );
    }
  } catch (error) {
    console.error("Failed to trigger report generation:", error);
  }
}
