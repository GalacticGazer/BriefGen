import { beforeEach, describe, expect, it, vi } from "vitest";
import { readJson } from "../helpers/http";
import { createSupabaseAdminMock } from "../helpers/supabase-mock";

const supabaseModule = {
  supabaseAdmin: {} as unknown,
};

const isAdminAuthenticatedMock = vi.fn();
const generatePDFMock = vi.fn();
const sendEmailMock = vi.fn();

vi.mock("@/lib/supabase-admin", () => supabaseModule);
vi.mock("@/lib/admin-auth", () => ({
  isAdminAuthenticated: isAdminAuthenticatedMock,
}));
vi.mock("@/lib/pdf", () => ({
  generatePDF: generatePDFMock,
}));
vi.mock("@/lib/email", () => ({
  sendEmail: sendEmailMock,
}));

describe("POST /api/admin/deliver", () => {
  beforeEach(() => {
    vi.resetModules();
    isAdminAuthenticatedMock.mockReset();
    generatePDFMock.mockReset();
    sendEmailMock.mockReset();
  });

  it("requires admin authentication", async () => {
    isAdminAuthenticatedMock.mockResolvedValue(false);

    const supabase = createSupabaseAdminMock();
    supabaseModule.supabaseAdmin = supabase.supabaseAdmin;

    const { POST } = await import("@/app/api/admin/deliver/route");
    const response = await POST(
      new Request("http://localhost/api/admin/deliver", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId: "report-1",
          markdownContent: "# content",
        }),
      }),
    );

    expect(response.status).toBe(401);
    expect(supabase.supabaseAdmin.from).not.toHaveBeenCalled();
  });

  it("returns existing pdf when delivery already happened", async () => {
    isAdminAuthenticatedMock.mockResolvedValue(true);

    const supabase = createSupabaseAdminMock({
      results: [
        {
          data: {
            id: "report-1",
            question: "Q",
            category: "ai_tech",
            customer_email: "owner@example.com",
            email_sent: true,
            report_pdf_url: "https://cdn.example.test/reports/report-1.pdf",
            delivered_at: null,
            operator_notes: null,
          },
          error: null,
        },
        {
          data: {
            id: "report-1",
          },
          error: null,
        },
      ],
    });
    supabaseModule.supabaseAdmin = supabase.supabaseAdmin;

    const { POST } = await import("@/app/api/admin/deliver/route");
    const response = await POST(
      new Request("http://localhost/api/admin/deliver", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId: "report-1",
          markdownContent: "# content",
        }),
      }),
    );
    const payload = await readJson<{ success: boolean; pdfUrl: string }>(response);

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      success: true,
      pdfUrl: "https://cdn.example.test/reports/report-1.pdf",
    });
    expect(generatePDFMock).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("enforces manual delivery claim locks", async () => {
    isAdminAuthenticatedMock.mockResolvedValue(true);

    const freshClaimTime = new Date().toISOString();

    const supabase = createSupabaseAdminMock({
      results: [
        {
          data: {
            id: "report-1",
            question: "Q",
            category: "ai_tech",
            customer_email: "owner@example.com",
            email_sent: false,
            report_pdf_url: null,
            delivered_at: null,
            operator_notes: `manual_email_claim:${freshClaimTime}`,
          },
          error: null,
        },
      ],
    });
    supabaseModule.supabaseAdmin = supabase.supabaseAdmin;

    const { POST } = await import("@/app/api/admin/deliver/route");
    const response = await POST(
      new Request("http://localhost/api/admin/deliver", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId: "report-1",
          markdownContent: "# content",
        }),
      }),
    );
    const payload = await readJson<{ error: string }>(response);

    expect(response.status).toBe(409);
    expect(payload.error).toBe("Delivery already in progress");
    expect(generatePDFMock).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("is idempotent when another worker finishes delivery first", async () => {
    isAdminAuthenticatedMock.mockResolvedValue(true);

    const supabase = createSupabaseAdminMock({
      results: [
        {
          data: {
            id: "report-1",
            question: "Q",
            category: "ai_tech",
            customer_email: "owner@example.com",
            email_sent: false,
            report_pdf_url: null,
            delivered_at: null,
            operator_notes: "some previous note",
          },
          error: null,
        },
        {
          data: null,
          error: null,
        },
        {
          data: {
            email_sent: true,
            report_pdf_url: "https://cdn.example.test/reports/report-1.pdf",
          },
          error: null,
        },
      ],
    });
    supabaseModule.supabaseAdmin = supabase.supabaseAdmin;

    const { POST } = await import("@/app/api/admin/deliver/route");
    const response = await POST(
      new Request("http://localhost/api/admin/deliver", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId: "report-1",
          markdownContent: "# content",
        }),
      }),
    );
    const payload = await readJson<{ success: boolean; pdfUrl: string }>(response);

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      success: true,
      pdfUrl: "https://cdn.example.test/reports/report-1.pdf",
    });
    expect(sendEmailMock).not.toHaveBeenCalled();
  });
});
