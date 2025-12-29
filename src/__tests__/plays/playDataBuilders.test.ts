/**
 * Play Data Builders Tests
 *
 * Tests for buildNewPlayData and buildPlayUpdateData functions
 */

import { describe, it, expect } from "vitest";
import { buildNewPlayData, buildPlayUpdateData } from "../../services/playDataBuilders";

describe("buildNewPlayData", () => {
  const baseArgs = {
    playId: "test-play-id",
    playbookId: "test-playbook-id",
    userId: "test-user-id",
  };

  it("should build play with required fields", () => {
    const playData = {
      play_name: "Counter",
      formation: "I-Form",
      p_type: "Run",
    };

    const result = buildNewPlayData(playData, baseArgs.playId, baseArgs.playbookId, baseArgs.userId);

    expect(result.id).toBe(baseArgs.playId);
    expect(result.playbook_id).toBe(baseArgs.playbookId);
    expect(result.created_by).toBe(baseArgs.userId);
    expect(result.play_name).toBe("Counter");
    // normalizeText converts "I-Form" → "I-form" (hyphen word not capitalized)
    expect(result.formation).toBe("I-form");
    expect(result.p_type).toBe("Run");
  });

  it("should use default values for missing fields", () => {
    const playData = {};

    const result = buildNewPlayData(playData, baseArgs.playId, baseArgs.playbookId, baseArgs.userId);

    expect(result.play_name).toBe("Untitled Play");
    expect(result.p_type).toBe("Pass");
    expect(result.formation).toBe("");
    expect(result.confidence_base).toBe(70);
    expect(result.is_archived).toBe(false);
  });

  it("should normalize play name and formation", () => {
    const playData = {
      play_name: "  COUNTER LEFT  ",
      formation: "  I-Form Strong  ",
    };

    const result = buildNewPlayData(playData, baseArgs.playId, baseArgs.playbookId, baseArgs.userId);

    // Should be trimmed
    expect(result.play_name).not.toContain("  ");
    expect(result.formation).not.toContain("  ");
  });

  it("should include all preference fields", () => {
    const playData = {
      play_name: "Test",
      formation: "Shotgun",
      pref_down: "1st",
      pref_dis: "Medium",
      pref_hash: "Left",
      pref_cov: "Cover 3",
      pref_front: "4-3",
      pref_field_pos: "Red Zone",
      pref_situation: "Goal Line",
    };

    const result = buildNewPlayData(playData, baseArgs.playId, baseArgs.playbookId, baseArgs.userId);

    expect(result.pref_down).toBe("1st");
    expect(result.pref_dis).toBe("Medium");
    expect(result.pref_hash).toBe("Left");
    expect(result.pref_cov).toBe("Cover 3");
    expect(result.pref_front).toBe("4-3");
    expect(result.pref_field_pos).toBe("Red Zone");
    expect(result.pref_situation).toBe("Goal Line");
  });

  it("should include formation direction fields", () => {
    const playData = {
      play_name: "Test",
      formation: "Shotgun",
      f_dir: "Left",
      formation_direction: "left",
    };

    const result = buildNewPlayData(playData, baseArgs.playId, baseArgs.playbookId, baseArgs.userId);

    expect(result.f_dir).toBe("Left");
    expect(result.formation_direction).toBe("left");
  });

  it("should include array fields", () => {
    const playData = {
      play_name: "Test",
      formation: "Shotgun",
      tags: ["red-zone", "favorite"],
      key_players: ["WR1", "RB1"],
      key_positions: ["WR", "RB"],
      flags: ["review"],
    };

    const result = buildNewPlayData(playData, baseArgs.playId, baseArgs.playbookId, baseArgs.userId);

    expect(result.tags).toEqual(["red-zone", "favorite"]);
    expect(result.key_players).toEqual(["WR1", "RB1"]);
    expect(result.key_positions).toEqual(["WR", "RB"]);
    expect(result.flags).toEqual(["review"]);
  });

  it("should include diagram fields", () => {
    const playData = {
      play_name: "Test",
      formation: "Shotgun",
      diagram_image_url: "https://example.com/diagram.png",
      diagram_data: { version: 1, players: [] },
    };

    const result = buildNewPlayData(playData, baseArgs.playId, baseArgs.playbookId, baseArgs.userId);

    expect(result.diagram_image_url).toBe("https://example.com/diagram.png");
    expect(result.diagram_data).toEqual({ version: 1, players: [] });
  });

  it("should set times_called and times_successful to 0", () => {
    const playData = {
      play_name: "Test",
      formation: "Shotgun",
      // Try to set these (should be ignored as they come from executions)
      times_called: 10,
      times_successful: 5,
    };

    const result = buildNewPlayData(playData, baseArgs.playId, baseArgs.playbookId, baseArgs.userId);

    // These should always be 0 for new plays
    expect(result.times_called).toBe(0);
    expect(result.times_successful).toBe(0);
  });
});

describe("buildPlayUpdateData", () => {
  it("should only include defined fields", () => {
    const updates = {
      play_name: "Updated Name",
    };

    const result = buildPlayUpdateData(updates);

    expect(result.play_name).toBe("Updated Name");
    expect(result.updated_at).toBeDefined();
    expect(result.formation).toBeUndefined();
    expect(result.p_type).toBeUndefined();
  });

  it("should normalize text fields", () => {
    const updates = {
      play_name: "  Updated Name  ",
      formation: "  New Formation  ",
      one_word_play: "  QUICK  ",
    };

    const result = buildPlayUpdateData(updates);

    expect(result.play_name).not.toContain("  ");
    expect(result.formation).not.toContain("  ");
    expect(result.one_word_play).not.toContain("  ");
  });

  it("should include all preference fields when provided", () => {
    const updates = {
      pref_down: "3rd",
      pref_dis: "Long",
      pref_hash: "Right",
      pref_cov: "Cover 2",
      pref_front: "3-4",
      pref_field_pos: "Plus Territory",
      pref_situation: "Two Minute",
    };

    const result = buildPlayUpdateData(updates);

    expect(result.pref_down).toBe("3rd");
    expect(result.pref_dis).toBe("Long");
    expect(result.pref_hash).toBe("Right");
    expect(result.pref_cov).toBe("Cover 2");
    expect(result.pref_front).toBe("3-4");
    expect(result.pref_field_pos).toBe("Plus Territory");
    expect(result.pref_situation).toBe("Two Minute");
  });

  it("should include direction fields", () => {
    const updates = {
      f_dir: "Right",
      formation_direction: "right",
      p_dir: "L",
    };

    const result = buildPlayUpdateData(updates);

    expect(result.f_dir).toBe("Right");
    expect(result.formation_direction).toBe("right");
    expect(result.p_dir).toBe("L");
  });

  it("should include array fields", () => {
    const updates = {
      tags: ["updated", "new-tag"],
      key_players: ["QB1"],
    };

    const result = buildPlayUpdateData(updates);

    expect(result.tags).toEqual(["updated", "new-tag"]);
    expect(result.key_players).toEqual(["QB1"]);
  });

  it("should include diagram fields", () => {
    const updates = {
      diagram_image_url: "https://new-url.com/diagram.png",
      diagram_data: { version: 2 },
      diagram_version: 2,
    };

    const result = buildPlayUpdateData(updates);

    expect(result.diagram_image_url).toBe("https://new-url.com/diagram.png");
    expect(result.diagram_data).toEqual({ version: 2 });
    expect(result.diagram_version).toBe(2);
  });

  it("should always set updated_at", () => {
    const updates = {};
    const before = new Date().toISOString();

    const result = buildPlayUpdateData(updates);

    expect(result.updated_at).toBeDefined();
    expect(new Date(result.updated_at as string).getTime()).toBeGreaterThanOrEqual(
      new Date(before).getTime() - 1000
    );
  });

  it("should include is_archived field", () => {
    const updates = {
      is_archived: true,
    };

    const result = buildPlayUpdateData(updates);

    expect(result.is_archived).toBe(true);
  });

  it("should include confidence_base field", () => {
    const updates = {
      confidence_base: 85,
    };

    const result = buildPlayUpdateData(updates);

    expect(result.confidence_base).toBe(85);
  });
});
