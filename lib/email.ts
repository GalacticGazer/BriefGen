interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY in environment variables.");
  }

  // For local/testing environments, Resend supports onboarding@resend.dev without custom domain setup.
  const from = process.env.RESEND_FROM_EMAIL || "BriefGen.ai <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();

    if (error.includes("domain is not verified")) {
      throw new Error(
        `Email send failed: ${error}. Set RESEND_FROM_EMAIL to a verified sender (or use onboarding@resend.dev for testing).`,
      );
    }

    throw new Error(`Email send failed: ${error}`);
  }

  return response.json();
}
