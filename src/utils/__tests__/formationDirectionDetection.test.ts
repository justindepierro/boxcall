/**
 * Tests for Formation Direction Detection
 */

import { describe, it, expect } from "vitest";
import { detectDirectionInFormationName } from "../formationDirectionDetection";

describe("detectDirectionInFormationName", () => {
  describe("Multi-word formations WITH direction keywords (should trigger)", () => {
    it("detects 'Trips Right'", () => {
      const result = detectDirectionInFormationName("Trips Right");
      expect(result.hasDirection).toBe(true);
      expect(result.detectedDirection).toBe("R");
      expect(result.suggestedFormationName).toBe("Trips");
      expect(result.directionKeyword).toBe("Right");
    });

    it("detects 'Twins Lt'", () => {
      const result = detectDirectionInFormationName("Twins Lt");
      expect(result.hasDirection).toBe(true);
      expect(result.detectedDirection).toBe("L");
      expect(result.suggestedFormationName).toBe("Twins");
      expect(result.directionKeyword).toBe("Lt");
    });

    it("detects 'I Form R'", () => {
      const result = detectDirectionInFormationName("I Form R");
      expect(result.hasDirection).toBe(true);
      expect(result.detectedDirection).toBe("R");
      expect(result.suggestedFormationName).toBe("I Form");
      expect(result.directionKeyword).toBe("R");
    });

    it("detects 'Bunch Left'", () => {
      const result = detectDirectionInFormationName("Bunch Left");
      expect(result.hasDirection).toBe(true);
      expect(result.detectedDirection).toBe("L");
      expect(result.suggestedFormationName).toBe("Bunch");
      expect(result.directionKeyword).toBe("Left");
    });

    it("detects 'Right Slot' (direction at start)", () => {
      const result = detectDirectionInFormationName("Right Slot");
      expect(result.hasDirection).toBe(true);
      expect(result.detectedDirection).toBe("R");
      expect(result.suggestedFormationName).toBe("Slot");
      expect(result.directionKeyword).toBe("Right");
    });

    it("detects 'Left Wing' (direction at start)", () => {
      const result = detectDirectionInFormationName("Left Wing");
      expect(result.hasDirection).toBe(true);
      expect(result.detectedDirection).toBe("L");
      expect(result.suggestedFormationName).toBe("Wing");
      expect(result.directionKeyword).toBe("Left");
    });
  });

  describe("Single-word formations (should NOT trigger)", () => {
    it("allows 'Right' as formation name", () => {
      const result = detectDirectionInFormationName("Right");
      expect(result.hasDirection).toBe(false);
      expect(result.detectedDirection).toBe(null);
      expect(result.suggestedFormationName).toBe("Right");
    });

    it("allows 'Left' as formation name", () => {
      const result = detectDirectionInFormationName("Left");
      expect(result.hasDirection).toBe(false);
      expect(result.detectedDirection).toBe(null);
      expect(result.suggestedFormationName).toBe("Left");
    });

    it("allows 'Rip' as formation name", () => {
      const result = detectDirectionInFormationName("Rip");
      expect(result.hasDirection).toBe(false);
      expect(result.detectedDirection).toBe(null);
    });

    it("allows 'Liz' as formation name", () => {
      const result = detectDirectionInFormationName("Liz");
      expect(result.hasDirection).toBe(false);
      expect(result.detectedDirection).toBe(null);
    });

    it("allows 'East' as formation name", () => {
      const result = detectDirectionInFormationName("East");
      expect(result.hasDirection).toBe(false);
      expect(result.detectedDirection).toBe(null);
    });

    it("allows 'West' as formation name", () => {
      const result = detectDirectionInFormationName("West");
      expect(result.hasDirection).toBe(false);
      expect(result.detectedDirection).toBe(null);
    });
  });

  describe("Formations without direction keywords (should NOT trigger)", () => {
    it("allows 'Shotgun'", () => {
      const result = detectDirectionInFormationName("Shotgun");
      expect(result.hasDirection).toBe(false);
    });

    it("allows 'I Formation'", () => {
      const result = detectDirectionInFormationName("I Formation");
      expect(result.hasDirection).toBe(false);
    });

    it("allows 'Empty Set'", () => {
      const result = detectDirectionInFormationName("Empty Set");
      expect(result.hasDirection).toBe(false);
    });

    it("allows 'Ace'", () => {
      const result = detectDirectionInFormationName("Ace");
      expect(result.hasDirection).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("handles empty string", () => {
      const result = detectDirectionInFormationName("");
      expect(result.hasDirection).toBe(false);
      expect(result.suggestedFormationName).toBe("");
    });

    it("handles whitespace-only string", () => {
      const result = detectDirectionInFormationName("   ");
      expect(result.hasDirection).toBe(false);
    });

    it("handles case-insensitive detection", () => {
      const result = detectDirectionInFormationName("trips RIGHT");
      expect(result.hasDirection).toBe(true);
      expect(result.detectedDirection).toBe("R");
      expect(result.suggestedFormationName).toBe("trips");
    });
  });
});
