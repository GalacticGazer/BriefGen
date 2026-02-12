import { beforeEach, describe, expect, it, vi } from "vitest";

type SelectResult = {
  data: Array<{ id: string }> | null;
  error: unknown;
};

function createRetentionSupabaseMock(selectResults: SelectResult[], deleteError: unknown = null) {
  let selectIndex = 0;

  const limitMock = vi.fn(async () => {
    const next = selectResults[Math.min(selectIndex, selectResults.length - 1)] ?? {
      data: [],
      error: null,
    };
    selectIndex += 1;
    return next;
  });

  const ltMock = vi.fn(() => ({ limit: limitMock }));
  const selectMock = vi.fn(() => ({ lt: ltMock }));
  const inMock = vi.fn(async () => ({ error: deleteError }));
  const deleteMock = vi.fn(() => ({ in: inMock }));
  const removeMock = vi.fn(async () => ({ error: null }));
  const storageFromMock = vi.fn(() => ({ remove: removeMock }));

  const fromMock = vi.fn(() => ({
    select: selectMock,
    delete: deleteMock,
  }));

  return {
    supabaseAdmin: {
      from: fromMock,
      storage: {
        from: storageFromMock,
      },
    },
    spies: {
      selectMock,
      deleteMock,
      inMock,
      removeMock,
    },
  };
}

describe("runRetentionCleanupIfDue", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("does not set cooldown when select fails", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1700000000000);

    const mocked = createRetentionSupabaseMock([
      { data: null, error: { message: "temporary failure" } },
      { data: [], error: null },
    ]);

    vi.doMock("@/lib/supabase-admin", () => ({ supabaseAdmin: mocked.supabaseAdmin }));
    const { runRetentionCleanupIfDue } = await import("@/lib/retention");

    await runRetentionCleanupIfDue();
    await runRetentionCleanupIfDue();

    expect(mocked.spies.selectMock).toHaveBeenCalledTimes(2);
  });

  it("sets cooldown after a successful select with no expired reports", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1700000000000);

    const mocked = createRetentionSupabaseMock([{ data: [], error: null }]);

    vi.doMock("@/lib/supabase-admin", () => ({ supabaseAdmin: mocked.supabaseAdmin }));
    const { runRetentionCleanupIfDue } = await import("@/lib/retention");

    await runRetentionCleanupIfDue();
    await runRetentionCleanupIfDue();

    expect(mocked.spies.selectMock).toHaveBeenCalledTimes(1);
  });

  it("does not set cooldown when delete fails", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1700000000000);

    const mocked = createRetentionSupabaseMock(
      [
        { data: [{ id: "report-1" }], error: null },
        { data: [{ id: "report-1" }], error: null },
      ],
      { message: "delete failed" },
    );

    vi.doMock("@/lib/supabase-admin", () => ({ supabaseAdmin: mocked.supabaseAdmin }));
    const { runRetentionCleanupIfDue } = await import("@/lib/retention");

    await runRetentionCleanupIfDue();
    await runRetentionCleanupIfDue();

    expect(mocked.spies.selectMock).toHaveBeenCalledTimes(2);
    expect(mocked.spies.deleteMock).toHaveBeenCalledTimes(2);
  });
});
