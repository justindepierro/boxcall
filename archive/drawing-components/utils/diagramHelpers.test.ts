/**
 * Unit tests for diagram helpers
 *
 * Tests pure business logic functions for diagram operations.
 */

import { describe, it, expect } from "vitest";
import {
  isWhiteboardMode,
  getDiagramMode,
  createWhiteboardPlay,
  createPlayFromWhiteboard,
  createDiagramUpdates,
  WHITEBOARD_TEMP_ID,
} from "./diagramHelpers";
import type { DiagramDocument } from "../components/playbook/diagram-editor/types/DiagramTypes";
import type { Play } from "../types/play";

describe("diagramHelpers", () => {
  describe("isWhiteboardMode", () => {
    it("returns true for whiteboard temp ID", () => {
      const play = { id: WHITEBOARD_TEMP_ID } as Play;
      expect(isWhiteboardMode(play)).toBe(true);
    });

    it("returns false for real play ID", () => {
      const play = { id: "real-play-id-123" } as Play;
      expect(isWhiteboardMode(play)).toBe(false);
    });

    it("returns false for null play", () => {
      expect(isWhiteboardMode(null)).toBe(false);
    });
  });

  describe("getDiagramMode", () => {
    it("returns WHITEBOARD for temp ID", () => {
      const play = { id: WHITEBOARD_TEMP_ID, diagram_url: null } as Play;
      expect(getDiagramMode(play)).toBe("whiteboard");
    });

    it("returns CREATE for new play without diagram", () => {
      const play = { id: "play-123", diagram_url: null } as Play;
      expect(getDiagramMode(play)).toBe("create");
    });

    it("returns EDIT for existing play with diagram", () => {
      const play = {
        id: "play-123",
        diagram_url: JSON.stringify({ version: 2, players: [] }),
      } as Play;
      expect(getDiagramMode(play)).toBe("edit");
    });
  });

  describe("createWhiteboardPlay", () => {
    it("creates play with correct structure", () => {
      const playbookId = "playbook-123";
      const play = createWhiteboardPlay(playbookId);

      expect(play).toMatchObject({
        id: WHITEBOARD_TEMP_ID,
        playbook_id: playbookId,
        play_name: "New Whiteboard Diagram",
        p_type: "Pass",
        formation: "Whiteboard",
      });
    });

    it("creates play without diagram_url property", () => {
      const play = createWhiteboardPlay("playbook-123");
      expect(play.diagram_url).toBeUndefined();
    });
  });

  describe("createPlayFromWhiteboard", () => {
    const mockDiagramDoc: DiagramDocument = {
      version: 2,
      players: [
        {
          id: "player-1",
          x: 26.5,
          y: 17.5,
          jerseyNumber: "12",
          team: "offense",
        },
      ],
      meta: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    };

    it("creates play with correct structure", () => {
      const play = createPlayFromWhiteboard(
        "playbook-123",
        "Verticals",
        "Shotgun",
        mockDiagramDoc
      );

      expect(play).toMatchObject({
        playbook_id: "playbook-123",
        play_name: "Verticals",
        formation: "Shotgun",
        p_type: "Pass",
        confidence_base: 50,
      });
    });

    it("includes diagram URL as stringified JSON", () => {
      const play = createPlayFromWhiteboard(
        "playbook-123",
        "Verticals",
        "Shotgun",
        mockDiagramDoc
      );

      expect(play.diagram_url).toBe(JSON.stringify(mockDiagramDoc));
    });

    it("uses custom play type if provided", () => {
      const play = createPlayFromWhiteboard(
        "playbook-123",
        "Power",
        "I-Form",
        mockDiagramDoc,
        { playType: "Run" }
      );

      expect(play.p_type).toBe("Run");
    });

    it("includes personnel when provided", () => {
      const play = createPlayFromWhiteboard(
        "playbook-123",
        "Verticals",
        "Shotgun",
        mockDiagramDoc,
        { personnel: "11" }
      );

      expect(play.personnel).toBe("11");
    });
  });

  describe("createDiagramUpdates", () => {
    const mockDiagramDoc: DiagramDocument = {
      version: 2,
      players: [],
      meta: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    };

    it("creates updates with diagram URL", () => {
      const updates = createDiagramUpdates(
        "Play Name",
        "Shotgun",
        mockDiagramDoc
      );

      expect(updates).toMatchObject({
        play_name: "Play Name",
        formation: "Shotgun",
        diagram_url: JSON.stringify(mockDiagramDoc),
      });
    });

    it("includes play type when provided", () => {
      const updates = createDiagramUpdates("Power", "I-Form", mockDiagramDoc, {
        playType: "Run",
      });

      expect(updates).toMatchObject({
        play_name: "Power",
        formation: "I-Form",
        p_type: "Run",
      });
    });

    it("includes personnel when provided", () => {
      const updates = createDiagramUpdates(
        "Verticals",
        "Shotgun",
        mockDiagramDoc,
        { personnel: "11" }
      );

      expect(updates.personnel).toBe("11");
    });
  });
});
