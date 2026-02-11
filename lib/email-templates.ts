function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncateQuestion(question: string): string {
  return question.length > 80 ? `${question.substring(0, 80)}...` : question;
}

export function reportDeliveryEmail(
  question: string,
  pdfUrl: string,
): { subject: string; html: string } {
  const truncatedQuestion = escapeHtml(truncateQuestion(question));
  const escapedPdfUrl = escapeHtml(pdfUrl);

  return {
    subject: "Your BriefGen Report is Ready",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background:#f7f7f7; font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7; padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">

          <tr>
            <td style="background:#1a56db; padding:24px 32px;">
              <span style="color:#ffffff; font-size:18px; font-weight:700; letter-spacing:0.5px;">BriefGen.ai</span>
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <h1 style="font-size:22px; color:#111; margin:0 0 16px 0; font-weight:700;">
                Your research report is ready
              </h1>

              <p style="font-size:15px; color:#444; line-height:1.6; margin:0 0 8px 0;">
                Your report on:
              </p>
              <p style="font-size:15px; color:#111; line-height:1.6; margin:0 0 24px 0; font-weight:500; font-style:italic;">
                "${truncatedQuestion}"
              </p>

              <a href="${escapedPdfUrl}"
                 style="display:inline-block; background:#1a56db; color:#ffffff;
                        padding:14px 32px; border-radius:6px; text-decoration:none;
                        font-weight:600; font-size:15px;">
                Download Report (PDF)
              </a>

              <p style="font-size:13px; color:#888; line-height:1.5; margin:24px 0 0 0;">
                This link will remain active. You can download your report at any time.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 32px 32px;">
              <div style="border-top:1px solid #eee; padding-top:20px;">
                <p style="font-size:14px; color:#666; margin:0;">
                  Need another report?
                  <a href="https://briefgen.ai" style="color:#1a56db; text-decoration:none; font-weight:500;">
                    Visit BriefGen.ai
                  </a>
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:#f9f9f9; padding:20px 32px;">
              <p style="font-size:11px; color:#aaa; margin:0; line-height:1.5;">
                &copy; ${new Date().getFullYear()} BriefGen.ai. Reports are AI-generated and for informational purposes only.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}

export function premiumReportReceivedEmail(question: string): { subject: string; html: string } {
  const truncatedQuestion = escapeHtml(truncateQuestion(question));

  return {
    subject: "Your Premium Report Request Has Been Received",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background:#f7f7f7; font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7; padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">

          <tr>
            <td style="background:#1a56db; padding:24px 32px;">
              <span style="color:#ffffff; font-size:18px; font-weight:700; letter-spacing:0.5px;">BriefGen.ai</span>
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <h1 style="font-size:22px; color:#111; margin:0 0 16px 0; font-weight:700;">
                Your premium report is being prepared
              </h1>

              <p style="font-size:15px; color:#444; line-height:1.6; margin:0 0 8px 0;">
                We've received your request for a deep-research report on:
              </p>
              <p style="font-size:15px; color:#111; line-height:1.6; margin:0 0 24px 0; font-weight:500; font-style:italic;">
                "${truncatedQuestion}"
              </p>

              <div style="background:#EEF2FF; border-radius:6px; padding:16px 20px; margin:0 0 24px 0;">
                <p style="font-size:14px; color:#1a56db; margin:0; font-weight:500;">
                  ⏱ Estimated delivery: within 24 hours
                </p>
                <p style="font-size:13px; color:#666; margin:8px 0 0 0;">
                  Your report is being personally researched using our advanced deep-analysis AI systems.
                  You'll receive an email with your PDF as soon as it's ready.
                </p>
              </div>

              <p style="font-size:13px; color:#888; margin:0;">
                Questions? Reply to this email and we'll get back to you promptly.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#f9f9f9; padding:20px 32px;">
              <p style="font-size:11px; color:#aaa; margin:0; line-height:1.5;">
                &copy; ${new Date().getFullYear()} BriefGen.ai
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}

export function operatorNotificationEmail(
  reportId: string,
  customerEmail: string,
  question: string,
  amount: string,
): { subject: string; html: string } {
  return {
    subject: `🔔 New Premium Report Request - ${escapeHtml(amount)}`,
    html: `
<div style="font-family:-apple-system,sans-serif; max-width:600px; padding:20px;">
  <h2 style="color:#1a56db;">New Premium Report Request</h2>
  <table style="width:100%; border-collapse:collapse; margin:16px 0;">
    <tr><td style="padding:8px 0; font-weight:600; width:120px;">Customer:</td><td>${escapeHtml(customerEmail)}</td></tr>
    <tr><td style="padding:8px 0; font-weight:600;">Amount:</td><td>${escapeHtml(amount)}</td></tr>
    <tr><td style="padding:8px 0; font-weight:600;">Report ID:</td><td style="font-family:monospace; font-size:13px;">${escapeHtml(reportId)}</td></tr>
  </table>
  <div style="background:#f5f5f5; padding:16px; border-radius:6px; margin:16px 0;">
    <p style="font-weight:600; margin:0 0 8px 0;">Research Question:</p>
    <p style="margin:0; line-height:1.6;">${escapeHtml(question)}</p>
  </div>
  <div style="background:#FFF3CD; padding:12px 16px; border-radius:6px; margin:16px 0;">
    <p style="margin:0; font-size:14px;"><strong>Action required:</strong> Run this through ChatGPT Pro deep research mode, generate the PDF via the admin page, and deliver.</p>
  </div>
</div>`,
  };
}
