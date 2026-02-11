import { beforeEach, describe, expect, it, vi } from "vitest";
import { createReportAccessToken, verifyReportAccessToken } from "@/lib/report-access";

describe("report access tokens", () => {
  beforeEach(() => {
    process.env.INTERNAL_API_SECRET = "test-internal-secret";
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T12:00:00.000Z"));
  });

  it("creates and verifies a token for the correct report and email", () => {
    const token = createReportAccessToken("report-1", " Customer@Example.com ");

    expect(verifyReportAccessToken(token, "report-1", "customer@example.com")).toBe(true);
  });

  it("rejects expired tokens", () => {
    const expiredTimestamp = Math.floor(Date.now() / 1000) - 1;
    const token = createReportAccessToken("report-1", "customer@example.com", expiredTimestamp);

    expect(verifyReportAccessToken(token, "report-1", "customer@example.com")).toBe(false);
  });

  it("rejects tokens for a different report or customer", () => {
    const token = createReportAccessToken("report-1", "customer@example.com");

    expect(verifyReportAccessToken(token, "report-2", "customer@example.com")).toBe(false);
    expect(verifyReportAccessToken(token, "report-1", "other@example.com")).toBe(false);
  });

  it("throws when INTERNAL_API_SECRET is missing", () => {
    delete process.env.INTERNAL_API_SECRET;

    expect(() => createReportAccessToken("report-1", "customer@example.com")).toThrow(
      "Server misconfiguration",
    );
  });
});
