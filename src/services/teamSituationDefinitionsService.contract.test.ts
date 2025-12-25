import { describe, it, expect, vi, beforeEach } from "vitest";

import { mockFromChain } from "../test/mocks/supabaseMock";

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from "../lib/supabase";
import { TeamSituationDefinitionsService } from "./teamSituationDefinitionsService";

describe("TeamSituationDefinitionsService contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TeamSituationDefinitionsService.clearCache();
  });

  it("get selects teams.settings by id", async () => {
    const teamId = "team-123";

    const supabaseMock = supabase as any;

    const { fns } = mockFromChain(
      supabaseMock,
      "teams",
      [{ method: "select" }, { method: "eq" }, { method: "single" }],
      {
        data: {
          settings: {
            situation_definitions: {
              field_zones: { red_zone_min: 75 },
            },
          },
        },
        error: null,
      }
    );

    const defs = await TeamSituationDefinitionsService.get(teamId);

    expect(supabaseMock.from).toHaveBeenCalledWith("teams");
    expect(fns.select).toHaveBeenCalledWith("settings");
    expect(fns.eq).toHaveBeenCalledWith("id", teamId);
    expect(fns.single).toHaveBeenCalled();

    expect(defs.field_zones.red_zone_min).toBe(75);
    expect(defs.down_distance.short_max).toBe(3);
  });

  it("get returns custom_situations when present", async () => {
    const teamId = "team-123";

    const supabaseMock = supabase as any;

    mockFromChain(
      supabaseMock,
      "teams",
      [{ method: "select" }, { method: "eq" }, { method: "single" }],
      {
        data: {
          settings: {
            situation_definitions: {
              custom_situations: [
                { id: "two_minute", label: "2-Minute" },
                { id: "four_minute", label: "4-Minute" },
              ],
            },
          },
        },
        error: null,
      }
    );

    const defs = await TeamSituationDefinitionsService.get(teamId);

    expect(defs.custom_situations).toEqual([
      { id: "two_minute", label: "2-Minute" },
      { id: "four_minute", label: "4-Minute" },
    ]);
  });

  it("get merges distance_badges with defaults", async () => {
    const teamId = "team-123";

    const supabaseMock = supabase as any;

    mockFromChain(
      supabaseMock,
      "teams",
      [{ method: "select" }, { method: "eq" }, { method: "single" }],
      {
        data: {
          settings: {
            situation_definitions: {
              distance_badges: { short: "accent" },
            },
          },
        },
        error: null,
      }
    );

    const defs = await TeamSituationDefinitionsService.get(teamId);

    expect(defs.distance_badges?.short).toBe("accent");
    expect(defs.distance_badges?.medium).toBe("info");
    expect(defs.distance_badges?.long).toBe("warning");
    expect(defs.distance_badges?.very_long).toBe("danger");

    expect(defs.distance_badge_colors).toEqual({});
  });

  it("set merges with existing settings and writes teams.settings", async () => {
    const teamId = "team-123";

    const supabaseMock = supabase as any;

    // First call: read settings
    const read = mockFromChain(
      supabaseMock,
      "teams",
      [{ method: "select" }, { method: "eq" }, { method: "single" }],
      {
        data: {
          settings: {
            other_key: true,
            situation_definitions: {
              down_distance: { short_max: 2 },
            },
          },
        },
        error: null,
      }
    );

    // Second call: update settings
    const write = mockFromChain(
      supabaseMock,
      "teams",
      [
        { method: "update" },
        { method: "eq" },
        { method: "select" },
        { method: "single" },
      ],
      {
        data: {
          settings: {
            other_key: true,
            situation_definitions: {
              down_distance: { short_max: 2, long_max: 12 },
            },
          },
        },
        error: null,
      }
    );

    const defs = await TeamSituationDefinitionsService.set(teamId, {
      down_distance: { long_max: 12 },
    });

    expect(supabaseMock.from).toHaveBeenCalledWith("teams");
    expect(read.fns.select).toHaveBeenCalledWith("settings");
    expect(read.fns.eq).toHaveBeenCalledWith("id", teamId);

    expect(write.fns.update).toHaveBeenCalled();
    expect(write.fns.eq).toHaveBeenCalledWith("id", teamId);
    expect(write.fns.select).toHaveBeenCalledWith("settings");

    expect(defs.down_distance.short_max).toBe(2);
    expect(defs.down_distance.long_max).toBe(12);
  });
});
