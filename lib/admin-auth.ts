import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";

const ADMIN_SESSION_NAMESPACE = "briefgen_admin_session_v1";

export function buildAdminSessionValue(adminPassword: string): string {
  return createHash("sha256")
    .update(`${ADMIN_SESSION_NAMESPACE}:${adminPassword}`)
    .digest("hex");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
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

  const expectedSessionValue = buildAdminSessionValue(process.env.ADMIN_PASSWORD);
  return safeEqual(session.value, expectedSessionValue);
}
