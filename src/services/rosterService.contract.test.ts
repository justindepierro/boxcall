import { describe, it, expect, vi, beforeEach } from "vitest";

import { mockFromChain } from "../test/mocks/supabaseMock";

// IMPORTANT: mock must be declared before importing the service module.
// Avoid referencing top-level variables inside the factory (Vitest hoists vi.mock).
vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from "../lib/supabase";
import { RosterService } from "./rosterService";

describe("RosterService contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listByTeam queries team_players with expected filters/order", async () => {
    const teamId = "team-123";

    const row = {
      id: "player-1",
      team_id: teamId,
      first_name: "Pat",
      last_name: "Smith",
      nickname: "PS",
      jersey_number: 12,
      position: "QB",
      grade_level: "10",
      height_inches: 70,
      weight_lbs: 180,
      is_active: true,
      roster_status: "active",
      user_id: null,
      invitation_token: null,
      invitation_status: null,
      invitation_sent_at: null,
      invitation_accepted_at: null,
      created_at: null,
      updated_at: null,
    };

    const supabaseMock = supabase as any;

    const { fns } = mockFromChain(
      supabaseMock,
      "team_players",
      [{ method: "select" }, { method: "eq" }, { method: "order" }],
      { data: [row], error: null }
    );

    const result = await RosterService.instance.listByTeam(teamId);

    expect(supabaseMock.from).toHaveBeenCalledWith("team_players");
    expect(fns.select).toHaveBeenCalledWith("*");
    expect(fns.eq).toHaveBeenCalledWith("team_id", teamId);
    expect(fns.order).toHaveBeenCalledWith("jersey_number", {
      ascending: true,
    });

    expect(result).toEqual([
      {
        id: "player-1",
        team_id: teamId,
        first_name: "Pat",
        last_name: "Smith",
        nickname: "PS",
        jersey_number: 12,
        position: "QB",
        grade_level: "10",
        height_inches: 70,
        weight_lbs: 180,
        is_active: true,
        roster_status: "active",
        user_id: null,
        invitation_token: null,
        invitation_status: null,
        invitation_sent_at: null,
        invitation_accepted_at: null,
        created_at: null,
        updated_at: null,
      },
    ]);
  });

  it("listByTeam throws when Supabase returns error", async () => {
    const teamId = "team-123";

    const supabaseMock = supabase as any;

    mockFromChain(
      supabaseMock,
      "team_players",
      [{ method: "select" }, { method: "eq" }, { method: "order" }],
      { data: null, error: { message: "boom" } }
    );

    await expect(
      RosterService.instance.listByTeam(teamId)
    ).rejects.toMatchObject({
      message: "boom",
    });
  });
});
