import { beforeEach, describe, expect, it, vi } from "vitest";

const runRetentionCleanupIfDue = vi.fn();

vi.mock("@/lib/retention", () => ({
  runRetentionCleanupIfDue,
}));

describe("GET /api/retention-cleanup", () => {
  beforeEach(() => {
    vi.resetModules();
    runRetentionCleanupIfDue.mockReset();
    delete process.env.CRON_SECRET;
    delete process.env.INTERNAL_API_SECRET;
  });

  it("returns 500 when no cleanup secret is configured", async () => {
    const { GET } = await import("@/app/api/retention-cleanup/route");
    const response = await GET(new Request("http://localhost/api/retention-cleanup"));
    const payload = (await response.json()) as { error: string };

    expect(response.status).toBe(500);
    expect(payload.error).toContain("CRON_SECRET");
    expect(runRetentionCleanupIfDue).not.toHaveBeenCalled();
  });

  it("rejects unauthorized requests", async () => {
    process.env.CRON_SECRET = "cron-secret";

    const { GET } = await import("@/app/api/retention-cleanup/route");
    const response = await GET(
      new Request("http://localhost/api/retention-cleanup", {
        headers: { Authorization: "Bearer wrong-secret" },
      }),
    );
    const payload = (await response.json()) as { error: string };

    expect(response.status).toBe(401);
    expect(payload.error).toBe("Unauthorized");
    expect(runRetentionCleanupIfDue).not.toHaveBeenCalled();
  });

  it("accepts the cron secret and runs cleanup", async () => {
    process.env.CRON_SECRET = "cron-secret";

    const { GET } = await import("@/app/api/retention-cleanup/route");
    const response = await GET(
      new Request("http://localhost/api/retention-cleanup", {
        headers: { Authorization: "Bearer cron-secret" },
      }),
    );

    expect(response.status).toBe(200);
    expect(runRetentionCleanupIfDue).toHaveBeenCalledTimes(1);
  });

  it("accepts INTERNAL_API_SECRET for manual/internal calls", async () => {
    process.env.INTERNAL_API_SECRET = "internal-secret";

    const { GET } = await import("@/app/api/retention-cleanup/route");
    const response = await GET(
      new Request("http://localhost/api/retention-cleanup", {
        headers: { Authorization: "Bearer internal-secret" },
      }),
    );

    expect(response.status).toBe(200);
    expect(runRetentionCleanupIfDue).toHaveBeenCalledTimes(1);
  });

  it("returns non-2xx when cleanup fails", async () => {
    process.env.CRON_SECRET = "cron-secret";
    runRetentionCleanupIfDue.mockRejectedValueOnce(new Error("supabase unavailable"));

    const { GET } = await import("@/app/api/retention-cleanup/route");
    const response = await GET(
      new Request("http://localhost/api/retention-cleanup", {
        headers: { Authorization: "Bearer cron-secret" },
      }),
    );
    const payload = (await response.json()) as { error: string };

    expect(response.status).toBe(503);
    expect(payload.error).toBe("Retention cleanup failed");
    expect(runRetentionCleanupIfDue).toHaveBeenCalledTimes(1);
  });
});
