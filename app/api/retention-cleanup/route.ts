import { NextResponse } from "next/server";
import { runRetentionCleanupIfDue } from "@/lib/retention";

export const runtime = "nodejs";

function getAuthorizedSecrets() {
  return [process.env.CRON_SECRET, process.env.INTERNAL_API_SECRET].filter(
    (secret): secret is string => typeof secret === "string" && secret.length > 0,
  );
}

export async function GET(request: Request) {
  const authorizedSecrets = getAuthorizedSecrets();
  if (authorizedSecrets.length === 0) {
    return NextResponse.json(
      { error: "Server misconfiguration: set CRON_SECRET or INTERNAL_API_SECRET" },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!authorizedSecrets.includes(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await runRetentionCleanupIfDue();
  return NextResponse.json({ ok: true });
}
