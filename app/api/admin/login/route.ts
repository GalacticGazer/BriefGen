import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_MAX_AGE_SECONDS,
  buildAdminSessionValue,
  isValidAdminPassword,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { password } = (await request.json()) as { password?: string };

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Server misconfiguration: ADMIN_PASSWORD is missing" },
        { status: 500 },
      );
    }

    if (!password || !isValidAdminPassword(password)) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set("admin_session", buildAdminSessionValue(process.env.ADMIN_PASSWORD), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
