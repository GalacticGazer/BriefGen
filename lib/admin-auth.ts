import { cookies } from "next/headers";

export async function isAdminAuthenticated(): Promise<boolean> {
  if (!process.env.ADMIN_PASSWORD) {
    return false;
  }

  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  return session?.value === process.env.ADMIN_PASSWORD;
}
