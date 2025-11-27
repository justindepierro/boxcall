import { describe, it, expect, vi, beforeEach } from "vitest";
import { ensureValidFormation } from "../formationGuard";

// Mock supabase
vi.mock("../../lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from "../../lib/supabase";

const mockSupabase = supabase as any;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ensureValidFormation", () => {
  it("returns formation when formationId is valid", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: "formation-1",
              name: "Trips Right",
              playbook_id: "playbook-1",
            },
            error: null,
          }),
        }),
      }),
    });

    const result = await ensureValidFormation({
      playbookId: "playbook-1",
      formationId: "formation-1",
    });

    expect(result).toEqual({
      formationId: "formation-1",
      formationName: "Trips Right",
    });
  });

  it("throws when formationId belongs to different playbook", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: "formation-1",
              name: "Trips Right",
              playbook_id: "other-playbook",
            },
            error: null,
          }),
        }),
      }),
    });

    await expect(
      ensureValidFormation({
        playbookId: "playbook-1",
        formationId: "formation-1",
      })
    ).rejects.toThrow("Selected formation belongs to a different playbook.");
  });

  it("finds formation by name when custom not allowed", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [{ id: "formation-2", name: "Trips Right" }],
          error: null,
        }),
      }),
    });

    const result = await ensureValidFormation({
      playbookId: "playbook-1",
      formationName: "Trips Right",
      allowCustom: false,
    });

    expect(result).toEqual({
      formationId: "formation-2",
      formationName: "Trips Right",
    });
  });

  it("throws when custom not allowed and formation missing", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [{ id: "formation-2", name: "Trips Right" }],
          error: null,
        }),
      }),
    });

    await expect(
      ensureValidFormation({
        playbookId: "playbook-1",
        formationName: "Unknown Formation",
        allowCustom: false,
      })
    ).rejects.toThrow(
      'Formation "Unknown Formation" is not in your catalogue. Select an existing formation or create one in the Formation Builder.'
    );
  });

  it("returns trimmed formation when custom allowed", async () => {
    const result = await ensureValidFormation({
      playbookId: "playbook-1",
      formationName: "  Custom Formation  ",
      allowCustom: true,
    });

    expect(result).toEqual({
      formationName: "Custom Formation",
    });
  });

  it("validates personnel", async () => {
    await expect(
      ensureValidFormation({
        playbookId: "playbook-1",
        formationName: "Trips Right",
        allowCustom: true,
        personnel: "Trips",
      })
    ).rejects.toThrow();
  });
});
