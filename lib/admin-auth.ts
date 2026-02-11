import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";

const ADMIN_SESSION_NAMESPACE = "briefgen_admin_session_v1";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function buildAdminPasswordHash(adminPassword: string): string {
  return createHash("sha256")
    .update(`${ADMIN_SESSION_NAMESPACE}:${adminPassword}`)
    .digest("hex");
}

function buildAdminSessionSignature(adminPassword: string, expiresAtSeconds: number): string {
  return createHash("sha256")
    .update(`${ADMIN_SESSION_NAMESPACE}:${adminPassword}:${expiresAtSeconds}`)
    .digest("hex");
}

export function buildAdminSessionValue(
  adminPassword: string,
  expiresAtSeconds: number = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE_SECONDS,
): string {
  const signature = buildAdminSessionSignature(adminPassword, expiresAtSeconds);
  return `${expiresAtSeconds}.${signature}`;
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function isValidAdminPassword(candidatePassword: string): boolean {
  if (!process.env.ADMIN_PASSWORD) {
    return false;
  }

  const candidateValue = buildAdminPasswordHash(candidatePassword);
  const expectedValue = buildAdminPasswordHash(process.env.ADMIN_PASSWORD);
  return safeEqual(candidateValue, expectedValue);
}

export function verifyAdminSessionValue(sessionValue: string, adminPassword: string): boolean {
  const [expiresAtRaw, providedSignature] = sessionValue.split(".", 2);
  const expiresAtSeconds = Number.parseInt(expiresAtRaw || "", 10);

  if (!providedSignature || Number.isNaN(expiresAtSeconds)) {
    return false;
  }

  if (expiresAtSeconds <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expectedSignature = buildAdminSessionSignature(adminPassword, expiresAtSeconds);
  return safeEqual(providedSignature, expectedSignature);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  if (!process.env.ADMIN_PASSWORD) {
    return false;
  }

  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session?.value) {
    return false;
  }

  return verifyAdminSessionValue(session.value, process.env.ADMIN_PASSWORD);
}
