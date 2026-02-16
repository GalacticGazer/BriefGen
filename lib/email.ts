interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  idempotencyKey?: string;
}

type ResendErrorPayload = {
  message?: string;
  name?: string;
  statusCode?: number;
};

export async function sendEmail({ to, subject, html, text, idempotencyKey }: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY in environment variables.");
  }

  // For local/testing environments, Resend supports onboarding@resend.dev without custom domain setup.
  const from = process.env.RESEND_FROM_EMAIL || "BriefGen.ai <onboarding@resend.dev>";
  if (!process.env.RESEND_FROM_EMAIL && process.env.NODE_ENV === "production") {
    console.warn(
      "RESEND_FROM_EMAIL is not set; using onboarding@resend.dev which may reduce deliverability.",
    );
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    "Content-Type": "application/json",
  };

  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers,
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      text: text ?? htmlToPlainText(html),
    }),
  });

  if (!response.ok) {
    const rawError = await response.text();
    let parsed: ResendErrorPayload | null = null;

    try {
      parsed = JSON.parse(rawError) as ResendErrorPayload;
    } catch {
      parsed = null;
    }

    const errorMessage =
      parsed?.message || (typeof rawError === "string" && rawError.trim() ? rawError.trim() : "");

    if (errorMessage.includes("domain is not verified")) {
      throw new Error(
        `Email send failed (to=${to}, from=${from}, status=${response.status}): ${errorMessage}. Set RESEND_FROM_EMAIL to a verified sender (or use onboarding@resend.dev for testing).`,
      );
    }

    throw new Error(
      `Email send failed (to=${to}, from=${from}, status=${response.status}): ${errorMessage || "Unknown error"}`,
    );
  }

  return response.json();
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(
      /<a\b[^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi,
      (_match, hrefDoubleQuoted, hrefSingleQuoted, hrefUnquoted, linkLabelHtml) => {
        const href = (hrefDoubleQuoted || hrefSingleQuoted || hrefUnquoted || "").trim();
        const label = String(linkLabelHtml || "")
          .replace(/<[^>]+>/g, " ")
          .replace(/[ \t]{2,}/g, " ")
          .trim();

        if (!href) {
          return label;
        }

        return label ? `${label} (${href})` : href;
      },
    )
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|blockquote|tr|table|section|article)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
