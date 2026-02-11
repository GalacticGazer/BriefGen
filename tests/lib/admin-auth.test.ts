import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildAdminSessionValue,
  isAdminAuthenticated,
  isValidAdminPassword,
  verifyAdminSessionValue,
} from "@/lib/admin-auth";

const { cookiesMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

describe("admin auth helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T12:00:00.000Z"));
    process.env.ADMIN_PASSWORD = "super-secret";
    cookiesMock.mockReset();
  });

  it("validates the configured admin password", () => {
    expect(isValidAdminPassword("super-secret")).toBe(true);
    expect(isValidAdminPassword("wrong")).toBe(false);
  });

  it("verifies signed admin sessions and rejects expired sessions", () => {
    const validUntil = Math.floor(Date.now() / 1000) + 60;
    const session = buildAdminSessionValue("super-secret", validUntil);

    expect(verifyAdminSessionValue(session, "super-secret")).toBe(true);

    vi.setSystemTime(new Date("2026-01-15T12:02:00.000Z"));
    expect(verifyAdminSessionValue(session, "super-secret")).toBe(false);
  });

  it("checks admin cookie sessions", async () => {
    const session = buildAdminSessionValue("super-secret", Math.floor(Date.now() / 1000) + 120);

    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: session }),
    });

    await expect(isAdminAuthenticated()).resolves.toBe(true);

    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    });

    await expect(isAdminAuthenticated()).resolves.toBe(false);
  });

  it("fails auth when ADMIN_PASSWORD is missing", async () => {
    delete process.env.ADMIN_PASSWORD;

    await expect(isAdminAuthenticated()).resolves.toBe(false);
    expect(isValidAdminPassword("super-secret")).toBe(false);
  });
});
