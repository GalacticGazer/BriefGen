import { beforeEach, describe, expect, it, vi } from "vitest";
import { readJson } from "../helpers/http";
import { createSupabaseAdminMock } from "../helpers/supabase-mock";

const supabaseModule = {
  supabaseAdmin: {} as unknown,
};

const isAdminAuthenticatedMock = vi.fn();
const generatePDFMock = vi.fn();
const sendEmailMock = vi.fn();
const sanitizeUploadedPdfMock = vi.fn();

vi.mock("@/lib/supabase-admin", () => supabaseModule);
vi.mock("@/lib/admin-auth", () => ({
  isAdminAuthenticated: isAdminAuthenticatedMock,
}));
vi.mock("@/lib/pdf", () => ({
  generatePDF: generatePDFMock,
}));
vi.mock("@/lib/uploaded-pdf", () => ({
  sanitizeUploadedPdf: sanitizeUploadedPdfMock,
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
    sanitizeUploadedPdfMock.mockReset();
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

  it("delivers a prebuilt uploaded PDF without generating one", async () => {
    isAdminAuthenticatedMock.mockResolvedValue(true);
    sanitizeUploadedPdfMock.mockResolvedValue(Buffer.from("%sanitized"));

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
            operator_notes: null,
          },
          error: null,
        },
        {
          data: {
            id: "report-1",
            email_sent: false,
            report_pdf_url: null,
            operator_notes: "manual_email_claim:2026-02-13T00:00:00.000Z",
          },
          error: null,
        },
        {
          data: {
            id: "report-1",
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

    const formData = new FormData();
    formData.set("reportId", "report-1");
    formData.set(
      "pdfFile",
      new File([Buffer.from("%PDF-1.4 test")], "finished-report.pdf", {
        type: "application/pdf",
      }),
    );

    const { POST } = await import("@/app/api/admin/deliver/route");
    const response = await POST(
      new Request("http://localhost/api/admin/deliver", {
        method: "POST",
        body: formData,
      }),
    );
    const payload = await readJson<{ success: boolean; pdfUrl: string }>(response);

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      success: true,
      pdfUrl: "https://cdn.example.test/reports/report-1.pdf",
    });
    expect(generatePDFMock).not.toHaveBeenCalled();
    expect(sanitizeUploadedPdfMock).toHaveBeenCalledTimes(1);
    expect(supabase.upload).toHaveBeenCalledTimes(1);
    expect(supabase.upload).toHaveBeenCalledWith(
      "report-1.pdf",
      Buffer.from("%sanitized"),
      expect.objectContaining({
        contentType: "application/pdf",
        upsert: true,
      }),
    );
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "owner@example.com",
        idempotencyKey: "manual-delivery-report-1",
      }),
    );

    const contentUpdate = supabase.operations.find(
      (operation) =>
        operation.table === "reports" &&
        operation.action === "update" &&
        operation.values !== undefined &&
        typeof operation.values === "object" &&
        operation.values !== null &&
        "report_pdf_url" in (operation.values as Record<string, unknown>),
    );
    expect(contentUpdate?.values).toEqual({
      report_pdf_url: "https://cdn.example.test/reports/report-1.pdf",
    });
  });

  it("rejects non-pdf uploads", async () => {
    isAdminAuthenticatedMock.mockResolvedValue(true);

    const supabase = createSupabaseAdminMock();
    supabaseModule.supabaseAdmin = supabase.supabaseAdmin;

    const formData = new FormData();
    formData.set("reportId", "report-1");
    formData.set("pdfFile", new File(["not a pdf"], "notes.txt", { type: "text/plain" }));

    const { POST } = await import("@/app/api/admin/deliver/route");
    const response = await POST(
      new Request("http://localhost/api/admin/deliver", {
        method: "POST",
        body: formData,
      }),
    );
    const payload = await readJson<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Only PDF files are allowed");
    expect(supabase.supabaseAdmin.from).not.toHaveBeenCalled();
  });

  it("rejects uploaded files that are not valid PDFs", async () => {
    isAdminAuthenticatedMock.mockResolvedValue(true);
    sanitizeUploadedPdfMock.mockRejectedValue(new Error("Invalid PDF"));

    const supabase = createSupabaseAdminMock();
    supabaseModule.supabaseAdmin = supabase.supabaseAdmin;

    const formData = new FormData();
    formData.set("reportId", "report-1");
    formData.set(
      "pdfFile",
      new File([Buffer.from("fake pdf bytes")], "fake.pdf", { type: "application/pdf" }),
    );

    const { POST } = await import("@/app/api/admin/deliver/route");
    const response = await POST(
      new Request("http://localhost/api/admin/deliver", {
        method: "POST",
        body: formData,
      }),
    );
    const payload = await readJson<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Uploaded file is not a valid PDF");
    expect(sanitizeUploadedPdfMock).toHaveBeenCalledTimes(1);
    expect(supabase.supabaseAdmin.from).not.toHaveBeenCalled();
  });

  it("treats malformed multipart bodies as 400", async () => {
    isAdminAuthenticatedMock.mockResolvedValue(true);

    const supabase = createSupabaseAdminMock();
    supabaseModule.supabaseAdmin = supabase.supabaseAdmin;

    const { POST } = await import("@/app/api/admin/deliver/route");
    const response = await POST(
      {
        headers: new Headers({
          "content-type": "multipart/form-data; boundary=missing",
        }),
        formData: async () => {
          throw new Error("bad boundary");
        },
      } as unknown as Request,
    );
    const payload = await readJson<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Invalid multipart form data");
    expect(supabase.supabaseAdmin.from).not.toHaveBeenCalled();
  });
});
