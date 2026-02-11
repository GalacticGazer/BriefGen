import { createHmac, timingSafeEqual } from "node:crypto";

const REPORT_ACCESS_SECRET_ERROR =
  "Server misconfiguration: INTERNAL_API_SECRET is missing for report access checks.";
export const REPORT_ACCESS_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getReportAccessSecret(): string {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) {
    throw new Error(REPORT_ACCESS_SECRET_ERROR);
  }

  return secret;
}

function buildReportAccessSignature(
  reportId: string,
  normalizedEmail: string,
  expiresAtSeconds: number,
): string {
  const secret = getReportAccessSecret();
  return createHmac("sha256", secret)
    .update(`${reportId}:${normalizedEmail}:${expiresAtSeconds}`)
    .digest("hex");
}

export function createReportAccessToken(
  reportId: string,
  customerEmail: string,
  expiresAtSeconds: number = Math.floor(Date.now() / 1000) + REPORT_ACCESS_MAX_AGE_SECONDS,
): string {
  const normalizedEmail = customerEmail.trim().toLowerCase();
  const signature = buildReportAccessSignature(reportId, normalizedEmail, expiresAtSeconds);
  return `${expiresAtSeconds}.${signature}`;
}

export function verifyReportAccessToken(
  token: string,
  reportId: string,
  customerEmail: string,
): boolean {
  const [expiresAtRaw, providedSignature] = token.split(".", 2);
  const expiresAtSeconds = Number.parseInt(expiresAtRaw || "", 10);

  if (!providedSignature || Number.isNaN(expiresAtSeconds)) {
    return false;
  }

  if (expiresAtSeconds <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const normalizedEmail = customerEmail.trim().toLowerCase();
  const expectedSignature = buildReportAccessSignature(
    reportId,
    normalizedEmail,
    expiresAtSeconds,
  );
  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}

export function getReportAccessSecretError(): string {
  return REPORT_ACCESS_SECRET_ERROR;
}
