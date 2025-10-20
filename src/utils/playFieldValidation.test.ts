import { describe, it, expect } from "vitest";
import {
  validateFormationName,
  validatePersonnelValue,
} from "./playFieldValidation";

describe("playFieldValidation", () => {
  describe("validateFormationName", () => {
    it("should reject personnel patterns", () => {
      // Number + Players pattern
      expect(validateFormationName("6 Players").isValid).toBe(false);
      expect(validateFormationName("11 Player").isValid).toBe(false);
      expect(validateFormationName("12 PLAYERS").isValid).toBe(false);

      // Number + Personnel pattern
      expect(validateFormationName("11 Personnel").isValid).toBe(false);
      expect(validateFormationName("12 PERSONNEL").isValid).toBe(false);

      // Color names
      expect(validateFormationName("Blue").isValid).toBe(false);
      expect(validateFormationName("Black").isValid).toBe(false);
      expect(validateFormationName("Green").isValid).toBe(false);
      expect(validateFormationName("RED").isValid).toBe(false);

      // Just numbers
      expect(validateFormationName("11").isValid).toBe(false);
      expect(validateFormationName("12").isValid).toBe(false);
      expect(validateFormationName("21").isValid).toBe(false);
    });

    it("should accept valid formation names", () => {
      expect(validateFormationName("Shotgun").isValid).toBe(true);
      expect(validateFormationName("Pistol").isValid).toBe(true);
      expect(validateFormationName("I Formation").isValid).toBe(true);
      expect(validateFormationName("Trips Right").isValid).toBe(true);
      expect(validateFormationName("Under Center").isValid).toBe(true);
      expect(validateFormationName("Ace").isValid).toBe(true);
      expect(validateFormationName("Pro").isValid).toBe(true);
    });

    it("should accept empty values", () => {
      expect(validateFormationName("").isValid).toBe(true);
      expect(validateFormationName(null).isValid).toBe(true);
      expect(validateFormationName(undefined).isValid).toBe(true);
      expect(validateFormationName("   ").isValid).toBe(true);
    });

    it("should provide helpful error messages", () => {
      const result1 = validateFormationName("6 Players");
      expect(result1.isValid).toBe(false);
      expect(result1.error).toContain("looks like a personnel package");
      expect(result1.error).toContain("Personnel field");

      const result2 = validateFormationName("Blue");
      expect(result2.isValid).toBe(false);
      expect(result2.error).toContain("looks like a personnel package");
    });
  });

  describe("validatePersonnelValue", () => {
    it("should reject formation patterns", () => {
      expect(validatePersonnelValue("Shotgun").isValid).toBe(false);
      expect(validatePersonnelValue("Pistol").isValid).toBe(false);
      expect(validatePersonnelValue("Under Center").isValid).toBe(false);
      expect(validatePersonnelValue("Trips").isValid).toBe(false);
      expect(validatePersonnelValue("Twins").isValid).toBe(false);
      expect(validatePersonnelValue("I Form").isValid).toBe(false);
      expect(validatePersonnelValue("Pro").isValid).toBe(false);
    });

    it("should accept valid personnel values", () => {
      // Numeric codes
      expect(validatePersonnelValue("11").isValid).toBe(true);
      expect(validatePersonnelValue("12").isValid).toBe(true);
      expect(validatePersonnelValue("21").isValid).toBe(true);
      expect(validatePersonnelValue("22").isValid).toBe(true);

      // Color names (these are OK for personnel)
      expect(validatePersonnelValue("Blue").isValid).toBe(true);
      expect(validatePersonnelValue("Black").isValid).toBe(true);
      expect(validatePersonnelValue("Green").isValid).toBe(true);

      // Player count patterns (OK for personnel)
      expect(validatePersonnelValue("6 Players").isValid).toBe(true);
      expect(validatePersonnelValue("11 Personnel").isValid).toBe(true);
    });

    it("should accept empty values", () => {
      expect(validatePersonnelValue("").isValid).toBe(true);
      expect(validatePersonnelValue(null).isValid).toBe(true);
      expect(validatePersonnelValue(undefined).isValid).toBe(true);
      expect(validatePersonnelValue("   ").isValid).toBe(true);
    });

    it("should provide helpful error messages", () => {
      const result = validatePersonnelValue("Shotgun");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("looks like a formation name");
      expect(result.error).toContain("Formation field");
    });
  });

  describe("edge cases", () => {
    it("should handle trimming correctly", () => {
      // Formation with extra spaces
      expect(validateFormationName("  Shotgun  ").isValid).toBe(true);
      expect(validateFormationName("  11  ").isValid).toBe(false);

      // Personnel with extra spaces
      expect(validatePersonnelValue("  11  ").isValid).toBe(true);
      expect(validatePersonnelValue("  Shotgun  ").isValid).toBe(false);
    });

    it("should be case-insensitive for patterns", () => {
      expect(validateFormationName("blue").isValid).toBe(false);
      expect(validateFormationName("BLUE").isValid).toBe(false);
      expect(validateFormationName("Blue").isValid).toBe(false);

      expect(validatePersonnelValue("shotgun").isValid).toBe(false);
      expect(validatePersonnelValue("SHOTGUN").isValid).toBe(false);
      expect(validatePersonnelValue("Shotgun").isValid).toBe(false);
    });

    it("should handle partial matches correctly", () => {
      // "Singleback" contains "Single" but should be valid
      expect(validateFormationName("Singleback").isValid).toBe(true);

      // "Deuce" contains formation pattern but should be valid
      expect(validateFormationName("Deuce").isValid).toBe(true);

      // "11" alone should be rejected for formation
      expect(validateFormationName("11").isValid).toBe(false);

      // But "11 Personnel" should also be rejected for formation
      expect(validateFormationName("11 Personnel").isValid).toBe(false);
    });
  });
});
