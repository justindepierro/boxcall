/**
 * Tests for Formation → Diagram Template Helpers
 */

import { describe, it, expect } from "vitest";
import {
  convertFormationToDiagramPlayers,
  importFormationAsTemplate,
  mergeFormationIntoDiagram,
  diagramHasFormation,
  clearFormationFromDiagram,
  getFormationPlayerCount,
} from "../formationDiagramHelpers";
import type { Formation } from "../../types/formation";
import type { DiagramDocument } from "../../components/playbook/diagram-editor/types/DiagramTypes";
import type { Player } from "../../components/playbook/diagram-editor/types/Player";

describe("formationDiagramHelpers", () => {
  // Mock formation data
  const mockFormation: Formation = {
    id: "test-formation-id",
    playbook_id: "test-playbook-id",
    name: "Trips",
    description: "Trips formation",
    category: "spread",
    personnel_id: "test-personnel-id",
    personnel_name: "11 Personnel",
    personnel_packages: [], // Added for FormationBuilder integration
    base_formation_id: null,
    direction: "base",
    strength_player_position: null,
    strength_player_label: null,
    player_positions: [
      { position: "X", x: 10, y: 25, label: "Blue", role: "WR" },
      { position: "Y", x: 5, y: 30, label: "Black", role: "WR" },
    ],
    tags: ["trips", "spread"],
    is_custom: true,
    usage_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: "test-user-id",
  };

  const mockEmptyFormation: Formation = {
    ...mockFormation,
    id: "formation-2",
    name: "Empty Formation",
    player_positions: [],
  };

  describe("convertFormationToDiagramPlayers", () => {
    it("should convert formation positions to diagram players", () => {
      const players = convertFormationToDiagramPlayers(mockFormation);

      expect(players).toHaveLength(5);
      expect(players[0]).toMatchObject({
        x: 5,
        y: 25,
        jerseyNumber: "1",
        team: "offense",
        role: "WR",
        position: "regular",
      });
    });

    it("should identify center position as square shape", () => {
      const players = convertFormationToDiagramPlayers(mockFormation);
      const centerPlayer = players.find((p) => p.role === "C");

      expect(centerPlayer).toBeDefined();
      expect(centerPlayer?.position).toBe("center");
    });

    it("should use position code as jersey number fallback", () => {
      const formationWithoutJerseyNumbers: Formation = {
        ...mockFormation,
        player_positions: [
          { position: "X", x: 5, y: 25, label: "Blue", role: "WR" },
        ],
      };

      const players = convertFormationToDiagramPlayers(
        formationWithoutJerseyNumbers
      );
      expect(players[0].jerseyNumber).toBe("X");
    });

    it("should handle empty player_positions array", () => {
      const players = convertFormationToDiagramPlayers(mockEmptyFormation);
      expect(players).toEqual([]);
    });

    it("should generate unique IDs for each player", () => {
      const players = convertFormationToDiagramPlayers(mockFormation);
      const ids = players.map((p) => p.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(players.length);
    });
  });

  describe("importFormationAsTemplate", () => {
    it("should create complete diagram document from formation", () => {
      const diagram = importFormationAsTemplate(mockFormation);

      expect(diagram.version).toBe(2);
      expect(diagram.players).toHaveLength(5);
      expect(diagram.meta).toBeDefined();
      expect(diagram.meta?.createdAt).toBeDefined();
      expect(diagram.meta?.updatedAt).toBeDefined();
    });

    it("should create empty diagram for formation with no positions", () => {
      const diagram = importFormationAsTemplate(mockEmptyFormation);

      expect(diagram.version).toBe(2);
      expect(diagram.players).toEqual([]);
      expect(diagram.meta).toBeDefined();
    });

    it("should include all player properties in diagram", () => {
      const diagram = importFormationAsTemplate(mockFormation);
      const qbPlayer = diagram.players.find((p) => p.role === "QB");

      expect(qbPlayer).toMatchObject({
        x: 26.65,
        y: 5,
        jerseyNumber: "QB",
        team: "offense",
        role: "QB",
        position: "regular",
      });
    });
  });

  describe("mergeFormationIntoDiagram", () => {
    const existingDiagram: DiagramDocument = {
      version: 2,
      players: [
        {
          id: "d1",
          x: 30,
          y: 30,
          jerseyNumber: "50",
          team: "defense",
          position: "regular",
        },
        {
          id: "d2",
          x: 35,
          y: 30,
          jerseyNumber: "51",
          team: "defense",
          position: "regular",
        },
        {
          id: "o1",
          x: 10,
          y: 10,
          jerseyNumber: "OLD",
          team: "offense",
          position: "regular",
        },
      ],
      meta: {
        createdAt: Date.now() - 10000,
        updatedAt: Date.now() - 10000,
      },
    };

    it("should replace offense players while keeping defense", () => {
      const merged = mergeFormationIntoDiagram(existingDiagram, mockFormation);

      expect(merged.players).toHaveLength(7); // 5 formation + 2 defense

      const offensePlayers = merged.players.filter((p) => p.team === "offense");
      const defensePlayers = merged.players.filter((p) => p.team === "defense");

      expect(offensePlayers).toHaveLength(5);
      expect(defensePlayers).toHaveLength(2);
      expect(defensePlayers[0].jerseyNumber).toBe("50"); // Original defense preserved
    });

    it("should update meta.updatedAt timestamp", () => {
      const merged = mergeFormationIntoDiagram(existingDiagram, mockFormation);

      expect(merged.meta?.updatedAt).toBeGreaterThan(
        existingDiagram.meta?.updatedAt || 0
      );
    });

    it("should preserve diagram version", () => {
      const merged = mergeFormationIntoDiagram(existingDiagram, mockFormation);

      expect(merged.version).toBe(2);
    });
  });

  describe("diagramHasFormation", () => {
    it("should return true if diagram has offense players", () => {
      const diagram = importFormationAsTemplate(mockFormation);
      expect(diagramHasFormation(diagram)).toBe(true);
    });

    it("should return false if diagram has no offense players", () => {
      const diagramWithDefenseOnly: DiagramDocument = {
        version: 2,
        players: [
          {
            id: "d1",
            x: 30,
            y: 30,
            jerseyNumber: "50",
            team: "defense",
            position: "regular",
          },
        ],
      };

      expect(diagramHasFormation(diagramWithDefenseOnly)).toBe(false);
    });

    it("should return false for empty diagram", () => {
      const emptyDiagram: DiagramDocument = {
        version: 2,
        players: [],
      };

      expect(diagramHasFormation(emptyDiagram)).toBe(false);
    });
  });

  describe("clearFormationFromDiagram", () => {
    const mixedDiagram: DiagramDocument = {
      version: 2,
      players: [
        {
          id: "o1",
          x: 10,
          y: 10,
          jerseyNumber: "1",
          team: "offense",
          position: "regular",
        },
        {
          id: "o2",
          x: 15,
          y: 10,
          jerseyNumber: "2",
          team: "offense",
          position: "regular",
        },
        {
          id: "d1",
          x: 30,
          y: 30,
          jerseyNumber: "50",
          team: "defense",
          position: "regular",
        },
      ],
      meta: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    };

    it("should remove all offense players", () => {
      const cleared = clearFormationFromDiagram(mixedDiagram);

      expect(cleared.players).toHaveLength(1);
      expect(cleared.players[0].team).toBe("defense");
      expect(cleared.players[0].jerseyNumber).toBe("50");
    });

    it("should update meta.updatedAt", () => {
      const before = mixedDiagram.meta?.updatedAt || 0;
      const cleared = clearFormationFromDiagram(mixedDiagram);

      expect(cleared.meta?.updatedAt).toBeGreaterThanOrEqual(before);
    });

    it("should preserve version and other metadata", () => {
      const cleared = clearFormationFromDiagram(mixedDiagram);

      expect(cleared.version).toBe(2);
      expect(cleared.meta?.createdAt).toBe(mixedDiagram.meta?.createdAt);
    });
  });

  describe("getFormationPlayerCount", () => {
    it("should count offense players only", () => {
      const mixedDiagram: DiagramDocument = {
        version: 2,
        players: [
          {
            id: "o1",
            x: 10,
            y: 10,
            jerseyNumber: "1",
            team: "offense",
            position: "regular",
          },
          {
            id: "o2",
            x: 15,
            y: 10,
            jerseyNumber: "2",
            team: "offense",
            position: "regular",
          },
          {
            id: "o3",
            x: 20,
            y: 10,
            jerseyNumber: "3",
            team: "offense",
            position: "regular",
          },
          {
            id: "d1",
            x: 30,
            y: 30,
            jerseyNumber: "50",
            team: "defense",
            position: "regular",
          },
          {
            id: "d2",
            x: 35,
            y: 30,
            jerseyNumber: "51",
            team: "defense",
            position: "regular",
          },
        ],
      };

      expect(getFormationPlayerCount(mixedDiagram)).toBe(3);
    });

    it("should return 0 for empty diagram", () => {
      const emptyDiagram: DiagramDocument = {
        version: 2,
        players: [],
      };

      expect(getFormationPlayerCount(emptyDiagram)).toBe(0);
    });

    it("should return 0 for defense-only diagram", () => {
      const defenseOnlyDiagram: DiagramDocument = {
        version: 2,
        players: [
          {
            id: "d1",
            x: 30,
            y: 30,
            jerseyNumber: "50",
            team: "defense",
            position: "regular",
          },
        ],
      };

      expect(getFormationPlayerCount(defenseOnlyDiagram)).toBe(0);
    });
  });

  describe("Integration scenarios", () => {
    it("should support full workflow: import → add defense → clear → reimport", () => {
      // Step 1: Import formation
      const diagram1 = importFormationAsTemplate(mockFormation);
      expect(diagram1.players).toHaveLength(5);
      expect(diagramHasFormation(diagram1)).toBe(true);

      // Step 2: Add defense players manually
      const diagram2: DiagramDocument = {
        ...diagram1,
        players: [
          ...diagram1.players,
          {
            id: "d1",
            x: 30,
            y: 30,
            jerseyNumber: "50",
            team: "defense",
            position: "regular",
          },
        ],
      };
      expect(diagram2.players).toHaveLength(6);

      // Step 3: Clear formation (keep defense)
      const diagram3 = clearFormationFromDiagram(diagram2);
      expect(diagram3.players).toHaveLength(1);
      expect(diagram3.players[0].team).toBe("defense");

      // Step 4: Import different formation (keep defense)
      const newFormation: Formation = {
        ...mockFormation,
        player_positions: [
          { position: "X", x: 10, y: 20, role: "WR", jerseyNumber: "X" },
        ],
      };
      const diagram4 = mergeFormationIntoDiagram(diagram3, newFormation);
      expect(diagram4.players).toHaveLength(2); // 1 new offense + 1 defense
      expect(getFormationPlayerCount(diagram4)).toBe(1);
    });

    it("should handle formation with 11 players (full offense)", () => {
      const fullFormation: Formation = {
        ...mockFormation,
        player_positions: Array.from({ length: 11 }, (_, i) => ({
          position: `P${i}`,
          x: 5 + i * 4,
          y: 25,
          role: "OL",
          jerseyNumber: `${i + 1}`,
        })),
      };

      const diagram = importFormationAsTemplate(fullFormation);
      expect(diagram.players).toHaveLength(11);
      expect(getFormationPlayerCount(diagram)).toBe(11);
    });
  });
});
