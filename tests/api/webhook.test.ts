import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { readJson } from "../helpers/http";
import { createSupabaseAdminMock } from "../helpers/supabase-mock";

const pendingAfterCallbacks: Promise<unknown>[] = [];
const afterMock = vi.fn((callback: () => unknown) => {
  const value = callback();
  if (value && typeof (value as Promise<unknown>).then === "function") {
    pendingAfterCallbacks.push(value as Promise<unknown>);
  }
});

const supabaseModule = {
  supabaseAdmin: {} as unknown,
};

const constructEventMock = vi.fn();
const stripeModule = {
  stripe: {
    webhooks: {
      constructEvent: constructEventMock,
    },
  },
};

const sendEmailMock = vi.fn();

vi.mock("next/server", async () => {
  const actual = await vi.importActual<typeof import("next/server")>("next/server");
  return {
    ...actual,
    after: afterMock,
  };
});

vi.mock("@/lib/supabase-admin", () => supabaseModule);
vi.mock("@/lib/stripe", () => stripeModule);
vi.mock("@/lib/email", () => ({
  sendEmail: sendEmailMock,
}));

async function flushAfterCallbacks() {
  const callbacks = pendingAfterCallbacks.splice(0, pendingAfterCallbacks.length);
  await Promise.all(callbacks);
}

function buildCheckoutCompletedEvent(
  session: Partial<Stripe.Checkout.Session>,
): Stripe.Event {
  return {
    id: "evt_test",
    object: "event",
    api_version: null,
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: "cs_test_1",
        payment_status: "paid",
        metadata: {
          report_id: "report-1",
          report_type: "standard",
        },
        payment_intent: "pi_123",
        ...session,
      },
    },
    livemode: false,
    pending_webhooks: 0,
    request: {
      id: null,
      idempotency_key: null,
    },
    type: "checkout.session.completed",
  } as Stripe.Event;
}

describe("POST /api/webhook", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    process.env.INTERNAL_API_SECRET = "internal-secret";
    constructEventMock.mockReset();
    sendEmailMock.mockReset();
    afterMock.mockClear();
    pendingAfterCallbacks.splice(0, pendingAfterCallbacks.length);
    vi.stubGlobal("fetch", vi.fn());
  });

  it("rejects requests without a Stripe signature", async () => {
    const supabase = createSupabaseAdminMock();
    supabaseModule.supabaseAdmin = supabase.supabaseAdmin;

    const { POST } = await import("@/app/api/webhook/route");
    const response = await POST(
      new Request("http://localhost/api/webhook", {
        method: "POST",
        body: "{}",
      }),
    );
    const payload = await readJson<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(payload.error).toBe("No signature");
    expect(constructEventMock).not.toHaveBeenCalled();
  });

  it("validates Stripe session ownership before marking paid", async () => {
    const supabase = createSupabaseAdminMock({
      results: [
        {
          data: {
            id: "report-1",
            report_status: "pending",
            report_type: "standard",
            stripe_session_id: "cs_expected",
          },
          error: null,
        },
      ],
    });
    supabaseModule.supabaseAdmin = supabase.supabaseAdmin;

    constructEventMock.mockReturnValue(
      buildCheckoutCompletedEvent({
        id: "cs_received",
        metadata: {
          report_id: "report-1",
          report_type: "standard",
        },
      }),
    );

    const { POST } = await import("@/app/api/webhook/route");
    const response = await POST(
      new Request("http://localhost/api/webhook", {
        method: "POST",
        headers: {
          "stripe-signature": "sig",
        },
        body: "{}",
      }),
    );
    const payload = await readJson<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Stripe session mismatch");
  });

  it("ignores unpaid checkout sessions", async () => {
    const supabase = createSupabaseAdminMock();
    supabaseModule.supabaseAdmin = supabase.supabaseAdmin;

    constructEventMock.mockReturnValue(
      buildCheckoutCompletedEvent({
        payment_status: "unpaid",
      }),
    );

    const { POST } = await import("@/app/api/webhook/route");
    const response = await POST(
      new Request("http://localhost/api/webhook", {
        method: "POST",
        headers: {
          "stripe-signature": "sig",
        },
        body: "{}",
      }),
    );
    const payload = await readJson<{ received: boolean }>(response);

    expect(response.status).toBe(200);
    expect(payload.received).toBe(true);
    expect(supabase.supabaseAdmin.from).not.toHaveBeenCalled();
  });

  it("is idempotent for premium notifications when operator was already notified", async () => {
    const supabase = createSupabaseAdminMock({
      results: [
        {
          data: {
            id: "report-1",
            report_status: "pending",
            report_type: "premium",
            stripe_session_id: "cs_test_1",
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
            operator_notified: true,
            operator_notes: null,
            amount_cents: 1499,
            customer_email: "owner@example.com",
            question: "Question",
          },
          error: null,
        },
      ],
    });
    supabaseModule.supabaseAdmin = supabase.supabaseAdmin;

    constructEventMock.mockReturnValue(
      buildCheckoutCompletedEvent({
        id: "cs_test_1",
        metadata: {
          report_id: "report-1",
          report_type: "premium",
        },
      }),
    );

    const { POST } = await import("@/app/api/webhook/route");
    const response = await POST(
      new Request("http://localhost/api/webhook", {
        method: "POST",
        headers: {
          "stripe-signature": "sig",
        },
        body: "{}",
      }),
    );
    await flushAfterCallbacks();

    expect(response.status).toBe(200);
    expect(sendEmailMock).not.toHaveBeenCalled();

    const operatorNotifiedUpdates = supabase.operations.filter((operation) => {
      const values = operation.values as { operator_notified?: boolean } | undefined;
      return operation.action === "update" && values?.operator_notified === true;
    });

    expect(operatorNotifiedUpdates).toHaveLength(0);
  });

  it("does not mark report failed when standard trigger returns 409", async () => {
    const supabase = createSupabaseAdminMock({
      results: [
        {
          data: {
            id: "report-1",
            report_status: "pending",
            report_type: "standard",
            stripe_session_id: "cs_test_1",
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

    constructEventMock.mockReturnValue(
      buildCheckoutCompletedEvent({
        id: "cs_test_1",
      }),
    );

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "already running" }), {
        status: 409,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { POST } = await import("@/app/api/webhook/route");
    const response = await POST(
      new Request("http://localhost/api/webhook", {
        method: "POST",
        headers: {
          "stripe-signature": "sig",
        },
        body: "{}",
      }),
    );
    await flushAfterCallbacks();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const failedStatusWrites = supabase.operations.filter((operation) => {
      const values = operation.values as { report_status?: string } | undefined;
      return operation.action === "update" && values?.report_status === "failed";
    });

    expect(failedStatusWrites).toHaveLength(0);
  });
});
