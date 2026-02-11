import { createHmac, timingSafeEqual } from "node:crypto";

const REPORT_ACCESS_SECRET_ERROR =
  "Server misconfiguration: INTERNAL_API_SECRET is missing for report access checks.";

function getReportAccessSecret(): string {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) {
    throw new Error(REPORT_ACCESS_SECRET_ERROR);
  }

  return secret;
}

export function createReportAccessToken(reportId: string, customerEmail: string): string {
  const secret = getReportAccessSecret();
  const normalizedEmail = customerEmail.trim().toLowerCase();
  return createHmac("sha256", secret).update(`${reportId}:${normalizedEmail}`).digest("hex");
}

export function verifyReportAccessToken(
  token: string,
  reportId: string,
  customerEmail: string,
): boolean {
  const expectedToken = createReportAccessToken(reportId, customerEmail);
  const providedBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expectedToken);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}

export function getReportAccessSecretError(): string {
  return REPORT_ACCESS_SECRET_ERROR;
}
