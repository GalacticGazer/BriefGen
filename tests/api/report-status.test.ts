import { beforeEach, describe, expect, it, vi } from "vitest";
import { createReportAccessToken } from "@/lib/report-access";
import { readJson } from "../helpers/http";
import { createSupabaseAdminMock } from "../helpers/supabase-mock";

const cookiesMock = vi.fn();
const supabaseModule = {
  supabaseAdmin: {} as unknown,
};

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/lib/supabase-admin", () => supabaseModule);

describe("GET /api/report-status", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.INTERNAL_API_SECRET = "test-internal-secret";
    cookiesMock.mockReset();
  });

  it("rejects requests without a report access cookie", async () => {
    const supabase = createSupabaseAdminMock();
    supabaseModule.supabaseAdmin = supabase.supabaseAdmin;

    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    });

    const { GET } = await import("@/app/api/report-status/route");
    const response = await GET(new Request("http://localhost/api/report-status?id=report-1"));
    const payload = await readJson<{ error: string }>(response);

    expect(response.status).toBe(403);
    expect(payload.error).toBe("Unauthorized");
    expect(supabase.supabaseAdmin.from).not.toHaveBeenCalled();
  });

  it("enforces token ownership by email", async () => {
    const supabase = createSupabaseAdminMock({
      results: [
        {
          data: {
            report_status: "completed",
            report_pdf_url: "https://cdn.example.test/reports/report-1.pdf",
            report_type: "standard",
            customer_email: "owner@example.com",
          },
          error: null,
        },
      ],
    });
    supabaseModule.supabaseAdmin = supabase.supabaseAdmin;

    const token = createReportAccessToken("report-1", "someone-else@example.com");

    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: token }),
    });

    const { GET } = await import("@/app/api/report-status/route");
    const response = await GET(new Request("http://localhost/api/report-status?id=report-1"));
    const payload = await readJson<{ error: string }>(response);

    expect(response.status).toBe(403);
    expect(payload.error).toBe("Unauthorized");
  });

  it("rejects expired tokens", async () => {
    const expired = Math.floor(Date.now() / 1000) - 30;
    const token = createReportAccessToken("report-1", "owner@example.com", expired);

    const supabase = createSupabaseAdminMock({
      results: [
        {
          data: {
            report_status: "completed",
            report_pdf_url: "https://cdn.example.test/reports/report-1.pdf",
            report_type: "standard",
            customer_email: "owner@example.com",
          },
          error: null,
        },
      ],
    });
    supabaseModule.supabaseAdmin = supabase.supabaseAdmin;

    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: token }),
    });

    const { GET } = await import("@/app/api/report-status/route");
    const response = await GET(new Request("http://localhost/api/report-status?id=report-1"));
    const payload = await readJson<{ error: string }>(response);

    expect(response.status).toBe(403);
    expect(payload.error).toBe("Unauthorized");
  });

  it("returns report status for a valid owner token", async () => {
    const token = createReportAccessToken("report-1", "owner@example.com");

    const supabase = createSupabaseAdminMock({
      results: [
        {
          data: {
            report_status: "completed",
            report_pdf_url: "https://cdn.example.test/reports/report-1.pdf",
            report_type: "standard",
            customer_email: "owner@example.com",
          },
          error: null,
        },
      ],
    });
    supabaseModule.supabaseAdmin = supabase.supabaseAdmin;

    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: token }),
    });

    const { GET } = await import("@/app/api/report-status/route");
    const response = await GET(new Request("http://localhost/api/report-status?id=report-1"));
    const payload = await readJson<{ status: string; pdfUrl: string | null; reportType: string }>(
      response,
    );

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      status: "completed",
      pdfUrl: "https://cdn.example.test/reports/report-1.pdf",
      reportType: "standard",
    });
  });
});
