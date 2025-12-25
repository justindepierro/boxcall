import { vi } from "vitest";

type ChainStep = {
  method: string;
  args?: unknown[];
};

type MockedFn = ReturnType<typeof vi.fn>;

type FromMockResult = {
  fromReturn: Record<string, unknown>;
  fns: Record<string, MockedFn>;
};

/**
 * Minimal helper for contract tests.
 *
 * Builds a nested Supabase query chain and wires it to `supabase.from(table)`.
 *
 * Example:
 * mockFromChain(supabase, "team_players",
 *   [
 *     { method: "select", args: ["*"] },
 *     { method: "eq", args: ["team_id", teamId] },
 *     { method: "order", args: ["jersey_number", { ascending: true }] },
 *   ],
 *   { data: [...], error: null }
 * )
 */
export function mockFromChain(
  supabaseMock: { from: MockedFn },
  table: string,
  chain: ChainStep[],
  resolvedValue: unknown
): FromMockResult {
  if (chain.length === 0) {
    throw new Error("mockFromChain requires at least one chain step");
  }

  const fns: Record<string, MockedFn> = {};

  const last = chain[chain.length - 1];
  const lastFn = vi.fn().mockResolvedValue(resolvedValue);
  fns[last.method] = lastFn;

  let cursor: Record<string, unknown> = {
    [last.method]: lastFn,
  };

  for (let i = chain.length - 2; i >= 0; i -= 1) {
    const step = chain[i];

    const nextCursor = cursor;
    const stepFn = vi.fn(() => nextCursor);
    fns[step.method] = stepFn;

    cursor = {
      [step.method]: stepFn,
    };
  }

  supabaseMock.from.mockImplementationOnce((requestedTable: string) => {
    if (requestedTable !== table) {
      throw new Error(
        `Unexpected supabase.from("${requestedTable}"); expected "${table}"`
      );
    }
    return cursor as any;
  });

  // Provide a way for tests to directly access the object returned by from().
  return { fromReturn: cursor, fns };
}

export function createSupabaseMock(): { from: MockedFn } {
  return {
    from: vi.fn(),
  };
}
