/**
 * useGameSession Hook Tests
 * Tests game session tracking, situational filtering, and auto-advance logic
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useGameSession } from "../useGameSession";
import type { GameSituation } from "../../types/session";

// Mock dependencies
vi.mock("../../services/gamePlanService");
vi.mock("../../services/executionTrackingService");
vi.mock("../useSession");

describe("useGameSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Situational Filtering", () => {
    it("should filter plays by down", () => {
      const { result } = renderHook(() => useGameSession());
      
      // Mock some plays
      const mockPlays = [
        { id: "1", name: "Quick Slant", down: 1 },
        { id: "2", name: "Draw Play", down: 2 },
        { id: "3", name: "Screen Pass", down: 3 },
      ];

      act(() => {
        // Set situation to 3rd down
        result.current.updateSituation({ down: 3 });
      });

      // Should only show 3rd down plays
      expect(result.current.filteredPlays).toHaveLength(1);
      expect(result.current.filteredPlays[0].name).toBe("Screen Pass");
    });

    it("should filter by distance category (short/medium/long)", () => {
      const { result } = renderHook(() => useGameSession());

      act(() => {
        // Short distance (1-3 yards)
        result.current.updateSituation({ distance: 2 });
      });

      // Should show short-yardage plays
      expect(result.current.filteredPlays.some((p) => 
        p.tags?.includes("short-yardage")
      )).toBe(true);
    });

    it("should filter by field zone", () => {
      const { result } = renderHook(() => useGameSession());

      act(() => {
        // Red zone situation (yard line 85)
        result.current.updateSituation({ yardLine: 85 });
      });

      // Should show red zone plays
      expect(result.current.filteredPlays.some((p) => 
        p.tags?.includes("red-zone")
      )).toBe(true);
    });

    it("should combine multiple filters (Billick situations)", () => {
      const { result } = renderHook(() => useGameSession());

      act(() => {
        // 3rd & 8 at opponent 35 (medium distance, midfield)
        result.current.updateSituation({
          down: 3,
          distance: 8,
          yardLine: 65,
        });
      });

      // Should only show plays matching all criteria
      const filtered = result.current.filteredPlays;
      expect(filtered.every((p) => p.down === 3)).toBe(true);
    });
  });

  describe("Auto-Advance Logic", () => {
    it("should reset to 1st & 10 on first down", async () => {
      const { result } = renderHook(() => useGameSession());

      act(() => {
        result.current.updateSituation({
          down: 3,
          distance: 5,
          yardLine: 50,
        });
      });

      // Log a play that gains 6 yards (first down)
      await act(async () => {
        await result.current.logPlay({
          playId: "test-play",
          result: "success",
          yardsGained: 6,
        });
      });

      // Should auto-advance to 1st & 10
      expect(result.current.situation.down).toBe(1);
      expect(result.current.situation.distance).toBe(10);
      expect(result.current.situation.yardLine).toBe(56); // Moved 6 yards
    });

    it("should advance down on incomplete pass", async () => {
      const { result } = renderHook(() => useGameSession());

      act(() => {
        result.current.updateSituation({ down: 1, distance: 10 });
      });

      // Log incomplete pass (0 yards)
      await act(async () => {
        await result.current.logPlay({
          playId: "test-play",
          result: "failure",
          yardsGained: 0,
        });
      });

      // Should advance to 2nd & 10
      expect(result.current.situation.down).toBe(2);
      expect(result.current.situation.distance).toBe(10);
    });

    it("should handle touchdown and reset drive", async () => {
      const { result } = renderHook(() => useGameSession());

      act(() => {
        result.current.updateSituation({ yardLine: 95 });
      });

      // Log touchdown play
      await act(async () => {
        await result.current.logPlay({
          playId: "test-play",
          result: "success",
          yardsGained: 5,
          wasTouchdown: true,
        });
      });

      // Should reset to own 25 yard line (kickoff return position)
      expect(result.current.situation.yardLine).toBe(25);
      expect(result.current.situation.down).toBe(1);
      expect(result.current.situation.distance).toBe(10);
      
      // Should increment touchdown count
      expect(result.current.currentDrive.touchdowns).toBe(1);
    });

    it("should handle turnover and reset drive", async () => {
      const { result } = renderHook(() => useGameSession());

      const initialPlays = result.current.currentDrive.plays;

      // Log turnover (interception)
      await act(async () => {
        await result.current.logPlay({
          playId: "test-play",
          result: "failure",
          yardsGained: 0,
          wasTurnover: true,
        });
      });

      // Should reset drive stats
      expect(result.current.currentDrive.plays).toBe(0);
      expect(result.current.currentDrive.yards).toBe(0);
      expect(result.current.currentDrive.turnovers).toBe(1);
    });

    it("should handle 4th down turnover on downs", async () => {
      const { result } = renderHook(() => useGameSession());

      act(() => {
        result.current.updateSituation({ down: 4, distance: 2 });
      });

      // Fail to convert on 4th down
      await act(async () => {
        await result.current.logPlay({
          playId: "test-play",
          result: "failure",
          yardsGained: 1, // Short of first down
        });
      });

      // Should treat as turnover on downs
      expect(result.current.currentDrive.turnovers).toBe(1);
    });

    it("should handle penalties correctly", async () => {
      const { result } = renderHook(() => useGameSession());

      act(() => {
        result.current.updateSituation({
          down: 1,
          distance: 10,
          yardLine: 50,
        });
      });

      // Log play with 5-yard penalty
      await act(async () => {
        await result.current.logPlay({
          playId: "test-play",
          result: "neutral",
          yardsGained: 5,
          wasPenalty: true,
          penaltyYards: -5,
        });
      });

      // Net 0 yards (5 gained - 5 penalty), repeat down
      expect(result.current.situation.yardLine).toBe(50);
      expect(result.current.situation.down).toBe(1);
      expect(result.current.situation.distance).toBe(10);
    });
  });

  describe("Drive Tracking", () => {
    it("should track drive statistics", async () => {
      const { result } = renderHook(() => useGameSession());

      // Log multiple plays in a drive
      await act(async () => {
        await result.current.logPlay({
          playId: "play1",
          result: "success",
          yardsGained: 8,
        });
      });

      await act(async () => {
        await result.current.logPlay({
          playId: "play2",
          result: "success",
          yardsGained: 12,
        });
      });

      // Check drive stats
      expect(result.current.currentDrive.plays).toBe(2);
      expect(result.current.currentDrive.yards).toBe(20);
    });

    it("should reset drive on new possession", async () => {
      const { result } = renderHook(() => useGameSession());

      // Build up drive stats
      await act(async () => {
        await result.current.logPlay({
          playId: "play1",
          result: "success",
          yardsGained: 10,
        });
      });

      expect(result.current.currentDrive.yards).toBe(10);

      // Turnover resets drive
      await act(async () => {
        await result.current.logPlay({
          playId: "play2",
          result: "failure",
          yardsGained: 0,
          wasTurnover: true,
        });
      });

      expect(result.current.currentDrive.yards).toBe(0);
      expect(result.current.currentDrive.plays).toBe(0);
    });
  });

  describe("Session Management", () => {
    it("should start a game session with opponent info", async () => {
      const { result } = renderHook(() => useGameSession());

      await act(async () => {
        await result.current.startSession({
          gamePlanId: "plan-123",
          opponent: "Rival High School",
          gameDate: new Date("2025-10-21"),
          isHomeGame: true,
          notes: "Homecoming game",
          weather: "Clear, 65°F",
          fieldConditions: "Good",
        });
      });

      expect(result.current.session).toBeDefined();
      expect(result.current.isActive).toBe(true);
    });

    it("should load game plan plays on session start", async () => {
      const { result } = renderHook(() => useGameSession());

      await act(async () => {
        await result.current.startSession({
          gamePlanId: "plan-123",
          opponent: "Test Opponent",
          gameDate: new Date(),
          isHomeGame: false,
        });
      });

      await waitFor(() => {
        expect(result.current.allPlays.length).toBeGreaterThan(0);
      });
    });

    it("should pause and resume session", () => {
      const { result } = renderHook(() => useGameSession());

      // Assume session is active
      result.current.startSession({
        gamePlanId: "plan-123",
        opponent: "Test",
        gameDate: new Date(),
        isHomeGame: true,
      });

      act(() => {
        result.current.pauseSession();
      });

      expect(result.current.isPaused).toBe(true);

      act(() => {
        result.current.resumeSession();
      });

      expect(result.current.isPaused).toBe(false);
    });

    it("should end session and save final stats", async () => {
      const { result } = renderHook(() => useGameSession());

      await act(async () => {
        await result.current.startSession({
          gamePlanId: "plan-123",
          opponent: "Test",
          gameDate: new Date(),
          isHomeGame: true,
        });
      });

      // Log some plays
      await act(async () => {
        await result.current.logPlay({
          playId: "play1",
          result: "success",
          yardsGained: 15,
        });
      });

      // End session
      await act(async () => {
        await result.current.endSession();
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.session?.endedAt).toBeDefined();
    });
  });

  describe("Quarter Management", () => {
    it("should advance quarter", () => {
      const { result } = renderHook(() => useGameSession());

      act(() => {
        result.current.updateSituation({ quarter: 1 });
      });

      act(() => {
        result.current.nextQuarter();
      });

      expect(result.current.situation.quarter).toBe(2);
    });

    it("should not advance past 4th quarter", () => {
      const { result } = renderHook(() => useGameSession());

      act(() => {
        result.current.updateSituation({ quarter: 4 });
      });

      act(() => {
        result.current.nextQuarter();
      });

      // Should stay at 4
      expect(result.current.situation.quarter).toBe(4);
    });

    it("should reset time remaining on quarter change", () => {
      const { result } = renderHook(() => useGameSession());

      act(() => {
        result.current.updateSituation({
          quarter: 1,
          timeRemaining: "0:00",
        });
      });

      act(() => {
        result.current.nextQuarter();
      });

      // Should reset to 12:00 for 2nd quarter
      expect(result.current.situation.timeRemaining).toBe("12:00");
    });
  });
});
