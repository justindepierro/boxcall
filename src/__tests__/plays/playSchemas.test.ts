/**
 * Play Schemas Tests
 *
 * Tests for Zod validation schemas
 */

import { describe, it, expect } from "vitest";
import {
  PlayCreateSchema,
  PlayUpdateSchema,
  validatePlayCreate,
  validatePlayUpdate,
  safeValidatePlayCreate,
} from "../../validation-services/playSchemas";

describe("PlayCreateSchema", () => {
  const validPlayData = {
    playbook_id: "123e4567-e89b-12d3-a456-426614174000",
    play_name: "Counter",
    formation: "I-Form",
  };

  it("should accept valid play data", () => {
    const result = PlayCreateSchema.safeParse(validPlayData);
    expect(result.success).toBe(true);
  });

  it("should require playbook_id", () => {
    const result = PlayCreateSchema.safeParse({
      play_name: "Counter",
      formation: "I-Form",
    });
    expect(result.success).toBe(false);
  });

  it("should require play_name", () => {
    const result = PlayCreateSchema.safeParse({
      playbook_id: validPlayData.playbook_id,
      formation: "I-Form",
    });
    expect(result.success).toBe(false);
  });

  it("should require formation", () => {
    const result = PlayCreateSchema.safeParse({
      playbook_id: validPlayData.playbook_id,
      play_name: "Counter",
    });
    expect(result.success).toBe(false);
  });

  describe("play_name validation", () => {
    it("should accept names up to 200 characters", () => {
      const longName = "A".repeat(200);
      const result = PlayCreateSchema.safeParse({
        ...validPlayData,
        play_name: longName,
      });
      expect(result.success).toBe(true);
    });

    it("should reject names over 200 characters", () => {
      const tooLongName = "A".repeat(201);
      const result = PlayCreateSchema.safeParse({
        ...validPlayData,
        play_name: tooLongName,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("200");
      }
    });

    it("should accept valid characters in names", () => {
      const result = PlayCreateSchema.safeParse({
        ...validPlayData,
        play_name: "Counter-Left O'Neil's Special 3.0",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid characters", () => {
      const result = PlayCreateSchema.safeParse({
        ...validPlayData,
        play_name: "Counter <script>alert(1)</script>",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("formation validation", () => {
    it("should accept names up to 50 characters", () => {
      const result = PlayCreateSchema.safeParse({
        ...validPlayData,
        formation: "A".repeat(50),
      });
      expect(result.success).toBe(true);
    });

    it("should reject names over 50 characters", () => {
      const result = PlayCreateSchema.safeParse({
        ...validPlayData,
        formation: "A".repeat(51),
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid formation names", () => {
      const validFormations = [
        "I-Form",
        "Shotgun 2x2",
        "Ace Right",
        "Split-Pro",
      ];

      for (const formation of validFormations) {
        const result = PlayCreateSchema.safeParse({
          ...validPlayData,
          formation,
        });
        expect(result.success).toBe(true);
      }
    });
  });

  describe("formation_direction validation", () => {
    it("should accept valid direction tokens", () => {
      const validDirections = ["base", "left", "right"];

      for (const direction of validDirections) {
        const result = PlayCreateSchema.safeParse({
          ...validPlayData,
          formation_direction: direction,
        });
        expect(result.success).toBe(true);
      }
    });

    it("should convert empty string to undefined", () => {
      const result = PlayCreateSchema.safeParse({
        ...validPlayData,
        formation_direction: "",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.formation_direction).toBeUndefined();
      }
    });

    it("should reject invalid directions", () => {
      const result = PlayCreateSchema.safeParse({
        ...validPlayData,
        formation_direction: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("optional field validation", () => {
    it("should accept all optional fields", () => {
      const fullPlayData = {
        ...validPlayData,
        p_type: "Run",
        personnel: "12",
        f_type: "Shotgun",
        f_dir: "Left",
        back_align: "Deep",
        back_left_of_qb: true,
        back_right_of_qb: false,
        shift: "Strong",
        motion: "Jet",
        ftag1: "tag1",
        ftag2: "tag2",
        r_str: "Strong",
        p_str: "Weak",
        p_dir: "L",
        protection: "60",
        check_into: "Alert",
        p_tag1: "ptag1",
        p_tag2: "ptag2",
        one_word_play: "Wham",
        wristband_number: "123",
        pref_down: "1st",
        pref_dis: "Medium",
        pref_hash: "Left",
        pref_cov: "Cover 3",
        pref_front: "4-3",
        pref_field_pos: "Red Zone",
        pref_situation: "Goal Line",
        notes: "Test notes",
        tags: ["tag1", "tag2"],
        key_players: ["WR1"],
        key_positions: ["WR"],
        flags: ["favorite"],
        confidence_base: 85,
      };

      const result = PlayCreateSchema.safeParse(fullPlayData);
      expect(result.success).toBe(true);
    });

    it("should strip HTML from notes", () => {
      const result = PlayCreateSchema.safeParse({
        ...validPlayData,
        notes: "<script>alert(1)</script>Regular text",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.notes).toBe("alert(1)Regular text");
      }
    });
  });

  describe("array field validation", () => {
    it("should limit tags to 20", () => {
      const result = PlayCreateSchema.safeParse({
        ...validPlayData,
        tags: Array(21).fill("tag"),
      });
      expect(result.success).toBe(false);
    });

    it("should limit key_players to 22", () => {
      const result = PlayCreateSchema.safeParse({
        ...validPlayData,
        key_players: Array(23).fill("player"),
      });
      expect(result.success).toBe(false);
    });

    it("should limit flags to 10", () => {
      const result = PlayCreateSchema.safeParse({
        ...validPlayData,
        flags: Array(11).fill("flag"),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("confidence validation", () => {
    it("should accept values 0-100", () => {
      for (const value of [0, 50, 100]) {
        const result = PlayCreateSchema.safeParse({
          ...validPlayData,
          confidence_base: value,
        });
        expect(result.success).toBe(true);
      }
    });

    it("should reject values outside 0-100", () => {
      const result = PlayCreateSchema.safeParse({
        ...validPlayData,
        confidence_base: 101,
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("PlayUpdateSchema", () => {
  const validUpdateData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
  };

  it("should require id", () => {
    const result = PlayUpdateSchema.safeParse({
      play_name: "Updated",
    });
    expect(result.success).toBe(false);
  });

  it("should accept just id", () => {
    const result = PlayUpdateSchema.safeParse(validUpdateData);
    expect(result.success).toBe(true);
  });

  it("should accept partial updates", () => {
    const result = PlayUpdateSchema.safeParse({
      ...validUpdateData,
      play_name: "Updated Name",
    });
    expect(result.success).toBe(true);
  });

  it("should validate play_name when provided", () => {
    const result = PlayUpdateSchema.safeParse({
      ...validUpdateData,
      play_name: "A".repeat(201), // Too long
    });
    expect(result.success).toBe(false);
  });
});

describe("validatePlayCreate", () => {
  it("should return parsed data for valid input", () => {
    const data = {
      playbook_id: "123e4567-e89b-12d3-a456-426614174000",
      play_name: "Counter",
      formation: "I-Form",
    };

    const result = validatePlayCreate(data);
    expect(result.play_name).toBe("Counter");
  });

  it("should throw for invalid input", () => {
    expect(() => validatePlayCreate({})).toThrow();
  });
});

describe("safeValidatePlayCreate", () => {
  it("should return success: true for valid data", () => {
    const data = {
      playbook_id: "123e4567-e89b-12d3-a456-426614174000",
      play_name: "Counter",
      formation: "I-Form",
    };

    const result = safeValidatePlayCreate(data);
    expect(result.success).toBe(true);
  });

  it("should return success: false for invalid data", () => {
    const result = safeValidatePlayCreate({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });
});
