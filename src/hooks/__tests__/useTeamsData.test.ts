import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useTeamsData } from "../useTeamsData";
import { useActiveTeamStore } from "../../stores/activeTeamStore";

// Operation log shared with supabase mock
interface OperationLog {
  table: string;
  operations: Array<{ type: string; args: any[] }>;
}

const queryLog: OperationLog[] = [];
let mockResponses: Record<string, any> = {};

vi.mock("../../app/auth-store", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("../../lib/supabase", () => {
  class MockQueryBuilder {
    private tableName: string;
    private variant: "default" | "head" | "more" = "default";
    public operations: Array<{ type: string; args: any[] }> = [];

    constructor(table: string) {
      this.tableName = table;
    }

    select(fields: string, options?: { head?: boolean }) {
      this.operations.push({ type: "select", args: [fields, options] });
      if (options?.head) {
        this.variant = "head";
      }
      return this;
    }

    eq(...args: any[]) {
      this.operations.push({ type: "eq", args });
      return this;
    }

    in(...args: any[]) {
      this.operations.push({ type: "in", args });
      return this;
    }

    order(...args: any[]) {
      this.operations.push({ type: "order", args });
      return this;
    }

    range(from: number, to: number) {
      this.operations.push({ type: "range", args: [from, to] });
      if (from > 0) {
        this.variant = "more";
      }
      return this;
    }

    abortSignal(signal: AbortSignal) {
      this.operations.push({ type: "abortSignal", args: [signal] });
      return this;
    }

    then<TResult1 = any, TResult2 = never>(
      onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ) {
      return Promise.resolve(this.getResponse()).then(onfulfilled, onrejected);
    }

    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
    ) {
      return Promise.resolve(this.getResponse()).catch(onrejected);
    }

    finally(onfinally?: (() => void) | null) {
      return Promise.resolve(this.getResponse()).finally(onfinally);
    }

    private getResponse() {
      if (this.tableName === "plays") {
        if (this.variant === "head") {
          return mockResponses["plays-count"];
        }
        if (this.variant === "more") {
          return mockResponses["plays-more"];
        }
        return mockResponses["plays"];
      }
      return mockResponses[this.tableName];
    }
  }

  return {
    supabase: {
      from: (table: string) => {
        const builder = new MockQueryBuilder(table);
        queryLog.push({ table, operations: builder.operations });
        return builder;
      },
    },
  };
});

const buildPlay = (id: string) => ({
  id,
  playbook_id: "pb-1",
  formation: "Trips",
  play_name: `Play ${id}`,
  one_word_play: null,
  p_type: "Pass",
  personnel: null,
  f_type: null,
  f_dir: null,
  protection: null,
  p_dir: null,
  r_str: null,
  p_str: null,
  pref_down: null,
  pref_dis: null,
  pref_hash: null,
  pref_cov: null,
  pref_front: null,
  ftag1: null,
  ftag2: null,
  p_tag1: null,
  p_tag2: null,
  back_align: null,
  shift: null,
  motion: null,
  key_player1: null,
  key_player2: null,
  check_into: null,
  notes: null,
  confidence_base: 70,
  times_called: 0,
  times_successful: 0,
  diagram_url: null,
  diagram_image_url: null,
  diagram_data: null,
  wristband_number: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const bootstrapResponses = () => {
  const initialPlays = Array.from({ length: 50 }, (_, idx) =>
    buildPlay(`play-${idx + 1}`)
  );
  mockResponses = {
    teams: {
      data: [{ id: "team-123", name: "Alpha", created_at: "", updated_at: "" }],
      error: null,
    },
    playbooks: {
      data: [
        {
          id: "pb-1",
          team_id: "team-123",
          name: "Main",
          is_active: true,
          created_at: "",
          updated_at: "",
          plays: [{ count: initialPlays.length }],
        },
      ],
      error: null,
    },
    formations: { data: [{ id: "form-1", playbook_id: "pb-1" }], error: null },
    "plays-count": { count: initialPlays.length, error: null },
    plays: { data: initialPlays, error: null },
    "plays-more": {
      data: Array.from({ length: 10 }, (_, idx) =>
        buildPlay(`extra-${idx + 1}`)
      ),
      error: null,
    },
  };
};

const findOperations = (table: string, type: string) =>
  queryLog
    .filter((entry) => entry.table === table)
    .flatMap((entry) => entry.operations.filter((op) => op.type === type));

describe("useTeamsData team scoping", () => {
  beforeEach(() => {
    queryLog.length = 0;
    bootstrapResponses();
    useActiveTeamStore.setState({ activeTeamId: "team-123" });
  });

  it("adds team filters to initial Supabase queries", async () => {
    const { result } = renderHook(() => useTeamsData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const playbookFilters = findOperations("playbooks", "eq");
    expect(
      playbookFilters.some(
        (op) => op.args[0] === "team_id" && op.args[1] === "team-123"
      )
    ).toBe(true);

    const formationFilters = findOperations("formations", "in");
    expect(
      formationFilters.some(
        (op) => op.args[0] === "playbook_id" && op.args[1].includes("pb-1")
      )
    ).toBe(true);

    const playsFilters = findOperations("plays", "in");
    expect(
      playsFilters.some(
        (op) => op.args[0] === "playbook_id" && op.args[1].includes("pb-1")
      )
    ).toBe(true);
  });

  it("keeps team scoping when loading more plays", async () => {
    const { result } = renderHook(() => useTeamsData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.loadMorePlays();
    });

    const playsEntries = queryLog.filter((entry) => entry.table === "plays");
    const lastEntry = playsEntries[playsEntries.length - 1];
    const inFilter = lastEntry.operations.find((op) => op.type === "in");

    expect(inFilter).toBeTruthy();
    expect(inFilter?.args[0]).toBe("playbook_id");
    expect(inFilter?.args[1]).toContain("pb-1");
  });
});
