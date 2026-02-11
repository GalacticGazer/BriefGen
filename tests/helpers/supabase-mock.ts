import { vi } from "vitest";

export type MockQueryResult = {
  data: unknown;
  error: unknown;
};

type QueryAction = "select" | "update" | "insert";
type FilterOperator = "eq" | "in" | "is";

export type RecordedFilter = {
  operator: FilterOperator;
  column: string;
  value: unknown;
};

export type RecordedOperation = {
  table: string;
  action: QueryAction;
  values?: unknown;
  selectColumns?: string;
  filters: RecordedFilter[];
};

type SupabaseMockOptions = {
  results?: MockQueryResult[];
  publicUrlBase?: string;
  uploadError?: { message: string } | null;
};

export function createSupabaseAdminMock(options: SupabaseMockOptions = {}) {
  const results = [...(options.results ?? [])];
  const operations: RecordedOperation[] = [];
  const publicUrlBase = options.publicUrlBase ?? "https://cdn.example.test/reports";

  const takeResult = (): MockQueryResult => {
    const result = results.shift();
    if (result) {
      return result;
    }

    return { data: null, error: null };
  };

  const createBuilder = (table: string) => {
    const operation: RecordedOperation = {
      table,
      action: "select",
      filters: [],
    };
    operations.push(operation);

    const builder: {
      select: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      insert: ReturnType<typeof vi.fn>;
      eq: ReturnType<typeof vi.fn>;
      in: ReturnType<typeof vi.fn>;
      is: ReturnType<typeof vi.fn>;
      single: ReturnType<typeof vi.fn>;
      maybeSingle: ReturnType<typeof vi.fn>;
      then: Promise<MockQueryResult>["then"];
    } = {
      select: vi.fn((columns?: string) => {
        operation.selectColumns = columns;
        return builder;
      }),
      update: vi.fn((values: unknown) => {
        operation.action = "update";
        operation.values = values;
        return builder;
      }),
      insert: vi.fn((values: unknown) => {
        operation.action = "insert";
        operation.values = values;
        return builder;
      }),
      eq: vi.fn((column: string, value: unknown) => {
        operation.filters.push({ operator: "eq", column, value });
        return builder;
      }),
      in: vi.fn((column: string, value: unknown) => {
        operation.filters.push({ operator: "in", column, value });
        return builder;
      }),
      is: vi.fn((column: string, value: unknown) => {
        operation.filters.push({ operator: "is", column, value });
        return builder;
      }),
      single: vi.fn(async () => takeResult()),
      maybeSingle: vi.fn(async () => takeResult()),
      then: (onfulfilled, onrejected) =>
        Promise.resolve(takeResult()).then(onfulfilled, onrejected),
    };

    return builder;
  };

  const upload = vi.fn(async () => ({ error: options.uploadError ?? null }));
  const getPublicUrl = vi.fn((fileName: string) => ({
    data: {
      publicUrl: `${publicUrlBase}/${fileName}`,
    },
  }));

  const supabaseAdmin = {
    from: vi.fn((table: string) => createBuilder(table)),
    storage: {
      from: vi.fn(() => ({
        upload,
        getPublicUrl,
      })),
    },
  };

  return {
    supabaseAdmin,
    operations,
    upload,
    getPublicUrl,
  };
}
