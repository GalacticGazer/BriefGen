import { beforeEach, describe, expect, it, vi } from "vitest";
import { readJson } from "../helpers/http";
import { createSupabaseAdminMock } from "../helpers/supabase-mock";

const supabaseModule = {
  supabaseAdmin: {} as unknown,
};

const generateReportMock = vi.fn();
const generatePDFMock = vi.fn();
const sendEmailMock = vi.fn();

vi.mock("@/lib/supabase-admin", () => supabaseModule);
vi.mock("@/lib/openai", () => ({
  generateReport: generateReportMock,
}));
vi.mock("@/lib/pdf", () => ({
  generatePDF: generatePDFMock,
}));
vi.mock("@/lib/email", () => ({
  sendEmail: sendEmailMock,
}));

describe("POST /api/generate-report", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.INTERNAL_API_SECRET = "internal-secret";
    generateReportMock.mockReset();
    generatePDFMock.mockReset();
    sendEmailMock.mockReset();
  });

  it("rejects unauthorized calls", async () => {
    const supabase = createSupabaseAdminMock();
    supabaseModule.supabaseAdmin = supabase.supabaseAdmin;

    const { POST } = await import("@/app/api/generate-report/route");
    const response = await POST(
      new Request("http://localhost/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer wrong-secret",
        },
        body: JSON.stringify({ reportId: "report-1" }),
      }),
    );

    expect(response.status).toBe(401);
    expect(supabase.supabaseAdmin.from).not.toHaveBeenCalled();
  });

  it("blocks when a fresh generation lock exists", async () => {
    const now = new Date().toISOString();

    const supabase = createSupabaseAdminMock({
      results: [
        {
          data: {
            id: "report-1",
            customer_email: "owner@example.com",
            category: "ai_tech",
            question: "Question",
            payment_status: "paid",
            report_status: "generating",
            report_type: "standard",
            operator_notes: `generation_started_at:${now}`,
            created_at: now,
          },
          error: null,
        },
      ],
    });
    supabaseModule.supabaseAdmin = supabase.supabaseAdmin;

    const { POST } = await import("@/app/api/generate-report/route");
    const response = await POST(
      new Request("http://localhost/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer internal-secret",
        },
        body: JSON.stringify({ reportId: "report-1" }),
      }),
    );
    const payload = await readJson<{ error: string }>(response);

    expect(response.status).toBe(409);
    expect(payload.error).toBe("Report is already generating");
    expect(generateReportMock).not.toHaveBeenCalled();
  });

  it("recovers stale locks and marks report failed when generation crashes", async () => {
    const staleStartedAt = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const supabase = createSupabaseAdminMock({
      results: [
        {
          data: {
            id: "report-1",
            customer_email: "owner@example.com",
            category: "ai_tech",
            question: "Question",
            payment_status: "paid",
            report_status: "generating",
            report_type: "standard",
            operator_notes: `generation_started_at:${staleStartedAt}`,
            created_at: staleStartedAt,
          },
          error: null,
        },
        {
          data: [{ id: "report-1" }],
          error: null,
        },
        {
          data: [{ id: "report-1" }],
          error: null,
        },
      ],
    });
    supabaseModule.supabaseAdmin = supabase.supabaseAdmin;

    generateReportMock.mockRejectedValue(new Error("AI boom"));

    const { POST } = await import("@/app/api/generate-report/route");
    const response = await POST(
      new Request("http://localhost/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer internal-secret",
        },
        body: JSON.stringify({ reportId: "report-1" }),
      }),
    );
    const payload = await readJson<{ error: string; details: string }>(response);

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Report generation failed");
    expect(payload.details).toContain("AI boom");

    const failedUpdates = supabase.operations.filter((operation) => {
      const values = operation.values as { report_status?: string; operator_notes?: string } | undefined;
      return operation.action === "update" && values?.report_status === "failed";
    });

    expect(failedUpdates.length).toBeGreaterThan(0);
    const finalFailure = failedUpdates.at(-1);
    const finalValues = finalFailure?.values as { operator_notes?: string } | undefined;
    expect(finalValues?.operator_notes).toContain("Error: AI boom");
  });

  it("completes generation for a paid standard report", async () => {
    const createdAt = new Date().toISOString();

    const supabase = createSupabaseAdminMock({
      results: [
        {
          data: {
            id: "report-1",
            customer_email: "owner@example.com",
            category: "ai_tech",
            question: "Question",
            payment_status: "paid",
            report_status: "pending",
            report_type: "standard",
            operator_notes: null,
            created_at: createdAt,
          },
          error: null,
        },
        {
          data: [{ id: "report-1" }],
          error: null,
        },
        {
          data: { id: "report-1" },
          error: null,
        },
      ],
    });
    supabaseModule.supabaseAdmin = supabase.supabaseAdmin;

    generateReportMock.mockResolvedValue({
      content: "x".repeat(240),
      usage: {
        inputTokens: 200,
        outputTokens: 300,
        estimatedCost: 0.12,
      },
    });
    generatePDFMock.mockResolvedValue(Buffer.from("pdf"));
    sendEmailMock.mockResolvedValue({ id: "email-1" });

    const { POST } = await import("@/app/api/generate-report/route");
    const response = await POST(
      new Request("http://localhost/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer internal-secret",
        },
        body: JSON.stringify({ reportId: "report-1" }),
      }),
    );
    const payload = await readJson<{ success: boolean; pdfUrl: string }>(response);

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.pdfUrl).toBe("https://cdn.example.test/reports/report-1.pdf");
    expect(generateReportMock).toHaveBeenCalledWith("ai_tech", "Question");
    expect(generatePDFMock).toHaveBeenCalled();
    expect(sendEmailMock).toHaveBeenCalled();
  });
});
