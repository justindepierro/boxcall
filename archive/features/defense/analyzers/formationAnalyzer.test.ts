/**
 * Formation Analyzer Tests
 *
 * Tests for offensive formation analysis including:
 * - 2x2 balanced formations
 * - 3x1 left/right formations
 * - Empty formations (5 WR)
 * - Tight end proximity detection
 * - Box count calculations
 * - Formation strength determination
 */

import { describe, it, expect } from "vitest";
import { analyzeFormation } from "./formationAnalyzer";
import type { Player } from "@components/playbook/diagram-editor/types/Player";

/**
 * Helper to create a player
 */
function createPlayer(
  jerseyNumber: string,
  x: number,
  y: number,
  team: "offense" | "defense" = "offense",
  position?: "center" | "regular"
): Player {
  return {
    id: `player-${jerseyNumber}-${x}-${y}`,
    jerseyNumber,
    x,
    y,
    team,
    position: position || "regular",
  };
}

/**
 * Create standard offensive line
 */
function createOffensiveLine(centerX: number, losY: number): Player[] {
  return [
    createPlayer("C", centerX, losY, "offense", "center"),
    createPlayer("LG", centerX - 1.5, losY, "offense"),
    createPlayer("RG", centerX + 1.5, losY, "offense"),
    createPlayer("LT", centerX - 3, losY, "offense"),
    createPlayer("RT", centerX + 3, losY, "offense"),
  ];
}

describe("Formation Analyzer", () => {
  const centerX = 26.666;
  const losY = 25;
  const qbY = losY + 5;

  describe("2x2 Formations", () => {
    it("should detect balanced 2x2 formation from middle hash", () => {
      const players: Player[] = [
        ...createOffensiveLine(centerX, losY),
        createPlayer("QB", centerX, qbY),
        createPlayer("RB", centerX - 2, qbY + 1),
        // 2 receivers left
        createPlayer("WR", 8, losY),
        createPlayer("WR", 15, losY),
        // 2 receivers right
        createPlayer("WR", 38, losY),
        createPlayer("WR", 45, losY),
      ];

      const analysis = analyzeFormation(players, "middle");

      expect(analysis.type).toBe("2x2");
      expect(analysis.receiversLeft).toBe(2);
      expect(analysis.receiversRight).toBe(2);
      expect(analysis.totalEligibleReceivers).toBe(5); // 4 WRs + 1 RB
      expect(analysis.strengthSide).toBe("left"); // RB is left
      expect(analysis.rbPosition).toBe("left");
    });

    it("should detect 2x2 with RB right", () => {
      const players: Player[] = [
        ...createOffensiveLine(centerX, losY),
        createPlayer("QB", centerX, qbY),
        createPlayer("RB", centerX + 2, qbY + 1),
        createPlayer("WR", 8, losY),
        createPlayer("WR", 15, losY),
        createPlayer("WR", 38, losY),
        createPlayer("WR", 45, losY),
      ];

      const analysis = analyzeFormation(players, "middle");

      expect(analysis.type).toBe("2x2");
      expect(analysis.strengthSide).toBe("right"); // RB is right
      expect(analysis.rbPosition).toBe("right");
    });

    it("should detect 2x2 with pistol RB", () => {
      const players: Player[] = [
        ...createOffensiveLine(centerX, losY),
        createPlayer("QB", centerX, qbY),
        createPlayer("RB", centerX, qbY + 4), // Directly behind QB
        createPlayer("WR", 8, losY),
        createPlayer("WR", 15, losY),
        createPlayer("WR", 38, losY),
        createPlayer("WR", 45, losY),
      ];

      const analysis = analyzeFormation(players, "middle");

      expect(analysis.type).toBe("2x2");
      expect(analysis.strengthSide).toBe("balanced");
      expect(analysis.rbPosition).toBe("pistol");
    });
  });

  describe("3x1 Formations", () => {
    it("should detect 3x1 left formation", () => {
      const players: Player[] = [
        ...createOffensiveLine(centerX, losY),
        createPlayer("QB", centerX, qbY),
        createPlayer("RB", centerX + 2, qbY + 1),
        // 3 receivers left
        createPlayer("WR", 8, losY),
        createPlayer("WR", 15, losY),
        createPlayer("WR", 20, losY),
        // 1 receiver right
        createPlayer("WR", 45, losY),
      ];

      const analysis = analyzeFormation(players, "middle");

      expect(analysis.type).toBe("3x1-left");
      expect(analysis.receiversLeft).toBe(3);
      expect(analysis.receiversRight).toBe(1);
      expect(analysis.strengthSide).toBe("left"); // 3 receivers on left
    });

    it("should detect 3x1 right formation", () => {
      const players: Player[] = [
        ...createOffensiveLine(centerX, losY),
        createPlayer("QB", centerX, qbY),
        createPlayer("RB", centerX - 2, qbY + 1),
        // 1 receiver left
        createPlayer("WR", 8, losY),
        // 3 receivers right
        createPlayer("WR", 33, losY),
        createPlayer("WR", 38, losY),
        createPlayer("WR", 45, losY),
      ];

      const analysis = analyzeFormation(players, "middle");

      expect(analysis.type).toBe("3x1-right");
      expect(analysis.receiversLeft).toBe(1);
      expect(analysis.receiversRight).toBe(3);
      expect(analysis.strengthSide).toBe("right"); // 3 receivers on right
    });
  });

  describe("Empty Formations", () => {
    it("should detect empty formation (5 WR, no RB)", () => {
      const players: Player[] = [
        ...createOffensiveLine(centerX, losY),
        createPlayer("QB", centerX, qbY),
        // 5 receivers, no RB
        createPlayer("WR", 8, losY),
        createPlayer("WR", 15, losY),
        createPlayer("WR", 20, losY),
        createPlayer("WR", 38, losY),
        createPlayer("WR", 45, losY),
      ];

      const analysis = analyzeFormation(players, "middle");

      expect(analysis.type).toBe("empty");
      expect(analysis.totalEligibleReceivers).toBe(5);
      expect(analysis.rbPosition).toBe("none");
    });
  });

  describe("Tight End Analysis", () => {
    it("should detect TE in the box (within 2 yards of tackle)", () => {
      const players: Player[] = [
        ...createOffensiveLine(centerX, losY),
        createPlayer("QB", centerX, qbY),
        createPlayer("RB", centerX - 2, qbY + 1),
        // TE tight to RT (within 2 yards)
        createPlayer("TE", centerX + 3 + 1.5, losY),
        // 2 WRs left
        createPlayer("WR", 8, losY),
        createPlayer("WR", 15, losY),
        // 1 WR right
        createPlayer("WR", 45, losY),
      ];

      const analysis = analyzeFormation(players, "middle");

      expect(analysis.tightEndPresent).toBe(true);
      expect(analysis.tightEndAnalysis).toBeDefined();
      expect(analysis.tightEndAnalysis!.count).toBe(1);
      expect(analysis.tightEndAnalysis!.boxTECount).toBe(1);
      expect(analysis.tightEndAnalysis!.splitTECount).toBe(0);

      // TE in box adds to box count
      expect(analysis.boxCount).toBe(8); // 5 OL + 1 QB + 1 TE + 1 RB
    });

    it("should detect split TE (3+ yards from tackle)", () => {
      const players: Player[] = [
        ...createOffensiveLine(centerX, losY),
        createPlayer("QB", centerX, qbY),
        createPlayer("RB", centerX - 2, qbY + 1),
        // TE split out (more than 2 yards from RT)
        createPlayer("TE", centerX + 3 + 4, losY),
        createPlayer("WR", 8, losY),
        createPlayer("WR", 15, losY),
        createPlayer("WR", 45, losY),
      ];

      const analysis = analyzeFormation(players, "middle");

      expect(analysis.tightEndPresent).toBe(true);
      expect(analysis.tightEndAnalysis!.boxTECount).toBe(0);
      expect(analysis.tightEndAnalysis!.splitTECount).toBe(1);

      // Split TE doesn't add to box count
      expect(analysis.boxCount).toBe(7); // 5 OL + 1 QB + 1 RB (no TE in box)
    });

    it("should handle multiple tight ends (2 TE set)", () => {
      const players: Player[] = [
        ...createOffensiveLine(centerX, losY),
        createPlayer("QB", centerX, qbY),
        createPlayer("RB", centerX, qbY + 4),
        // TE on left (in box)
        createPlayer("TE", centerX - 3 - 1.5, losY),
        // TE on right (in box)
        createPlayer("TE", centerX + 3 + 1.5, losY),
        // 2 WRs
        createPlayer("WR", 8, losY),
        createPlayer("WR", 45, losY),
      ];

      const analysis = analyzeFormation(players, "middle");

      expect(analysis.tightEndAnalysis!.count).toBe(2);
      expect(analysis.tightEndAnalysis!.boxTECount).toBe(2);
      expect(analysis.boxCount).toBe(9); // 5 OL + 1 QB + 2 TEs + 1 RB
    });
  });

  describe("Formation Strength", () => {
    it("should calculate strength based on receivers + box TEs + RB", () => {
      const players: Player[] = [
        ...createOffensiveLine(centerX, losY),
        createPlayer("QB", centerX, qbY),
        createPlayer("RB", centerX - 2, qbY + 1), // RB left
        // TE in box on left
        createPlayer("TE", centerX - 3 - 1.5, losY),
        // 2 WRs left
        createPlayer("WR", 8, losY),
        createPlayer("WR", 15, losY),
        // 1 WR right
        createPlayer("WR", 45, losY),
      ];

      const analysis = analyzeFormation(players, "middle");

      // Left strength: 2 WRs + 1 TE in box + 1 RB = 4
      // Right strength: 1 WR = 1
      expect(analysis.strengthSide).toBe("left");
    });
  });

  describe("Box Count", () => {
    it("should calculate box count correctly", () => {
      const players: Player[] = [
        ...createOffensiveLine(centerX, losY),
        createPlayer("QB", centerX, qbY),
        createPlayer("RB", centerX - 2, qbY + 1),
        createPlayer("WR", 8, losY),
        createPlayer("WR", 15, losY),
        createPlayer("WR", 38, losY),
        createPlayer("WR", 45, losY),
      ];

      const analysis = analyzeFormation(players, "middle");

      // Box = 5 OL + 1 QB + 0 TEs + 1 RB = 7
      expect(analysis.boxCount).toBe(7);
    });

    it("should increase box count with tight TEs", () => {
      const players: Player[] = [
        ...createOffensiveLine(centerX, losY),
        createPlayer("QB", centerX, qbY),
        createPlayer("RB", centerX, qbY + 4),
        createPlayer("TE", centerX - 3 - 1.5, losY), // Left TE in box
        createPlayer("TE", centerX + 3 + 1.5, losY), // Right TE in box
        createPlayer("WR", 8, losY),
        createPlayer("WR", 45, losY),
      ];

      const analysis = analyzeFormation(players, "middle");

      // Box = 5 OL + 1 QB + 2 TEs + 1 RB = 9
      expect(analysis.boxCount).toBe(9);
    });
  });

  describe("Hash Alignment", () => {
    it("should store hash in analysis", () => {
      const players: Player[] = [
        ...createOffensiveLine(20.5, losY), // Left hash
        createPlayer("QB", 20.5, qbY),
        createPlayer("RB", 18.5, qbY + 1),
        createPlayer("WR", 8, losY),
        createPlayer("WR", 15, losY),
        createPlayer("WR", 38, losY),
        createPlayer("WR", 45, losY),
      ];

      const analysis = analyzeFormation(players, "left");

      expect(analysis.hash).toBe("left");
    });
  });

  describe("Balanced Line Detection", () => {
    it("should detect balanced offensive line", () => {
      const players: Player[] = [
        ...createOffensiveLine(centerX, losY),
        createPlayer("QB", centerX, qbY),
        createPlayer("RB", centerX, qbY + 4),
        createPlayer("WR", 8, losY),
        createPlayer("WR", 45, losY),
      ];

      const analysis = analyzeFormation(players, "middle");

      expect(analysis.balancedLine).toBe(true);
    });

    it("should detect unbalanced line", () => {
      const players: Player[] = [
        // Only 4 O-Linemen (missing one)
        createPlayer("C", centerX, losY, "offense", "center"),
        createPlayer("LG", centerX - 1.5, losY, "offense"),
        createPlayer("RG", centerX + 1.5, losY, "offense"),
        createPlayer("LT", centerX - 3, losY, "offense"),
        createPlayer("QB", centerX, qbY),
        createPlayer("RB", centerX, qbY + 4),
      ];

      const analysis = analyzeFormation(players, "middle");

      expect(analysis.balancedLine).toBe(false);
    });
  });
});
