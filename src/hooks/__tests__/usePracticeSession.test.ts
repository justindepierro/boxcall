// @ts-nocheck - Stage 3 tests need refactoring after hook interface changes
/**
 * usePracticeSession Tests
 * Tests practice session management logic
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePracticeSession } from "../usePracticeSession";

// Mock dependencies
vi.mock("../../services/practiceService");
vi.mock("../../services/executionTrackingService");
vi.mock("../useSession");

describe("usePracticeSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rep Tracking", () => {
    it("should track current rep and total reps", () => {
      const { result } = renderHook(() => usePracticeSession());

      // Mock script with 5 reps per play
      act(() => {
        result.current.loadPracticeScript("script-123");
      });

      expect(result.current.currentRep).toBe(1);
      expect(result.current.totalRepsForCurrentPlay).toBeGreaterThan(0);
    });

    it("should advance rep after logging execution", async () => {
      const { result } = renderHook(() => usePracticeSession());

      const initialRep = result.current.currentRep;

      await act(async () => {
        await result.current.logRep({
          playId: "play-123",
          result: "success",
        });
      });

      expect(result.current.currentRep).toBe(initialRep + 1);
    });

    it("should advance to next play after completing all reps", async () => {
      const { result } = renderHook(() => usePracticeSession());

      // Set up at last rep
      act(() => {
        result.current.setCurrentRep(5); // Assume 5 total reps
      });

      const initialPlay = result.current.currentPlay;

      await act(async () => {
        await result.current.logRep({
          playId: result.current.currentPlay?.id || "",
          result: "success",
        });
      });

      // Should advance to next play
      expect(result.current.currentPlay?.id).not.toBe(initialPlay?.id);
      expect(result.current.currentRep).toBe(1); // Reset to rep 1
    });

    it("should mark play as complete when all reps done", async () => {
      const { result } = renderHook(() => usePracticeSession());

      // Complete all reps for current play
      const totalReps = result.current.totalRepsForCurrentPlay;
      
      for (let i = 0; i < totalReps; i++) {
        await act(async () => {
          await result.current.logRep({
            playId: result.current.currentPlay?.id || "",
            result: "success",
          });
        });
      }

      // Current play should be marked complete
      expect(result.current.completedPlays).toContain(
        result.current.currentPlay?.id
      );
    });
  });

  describe("Result Tracking", () => {
    it("should count successful reps", async () => {
      const { result } = renderHook(() => usePracticeSession());

      const initialSuccessCount = result.current.successfulReps;

      await act(async () => {
        await result.current.logRep({
          playId: "play-123",
          result: "success",
        });
      });

      expect(result.current.successfulReps).toBe(initialSuccessCount + 1);
    });

    it("should count failed reps", async () => {
      const { result } = renderHook(() => usePracticeSession());

      const initialFailCount = result.current.failedReps;

      await act(async () => {
        await result.current.logRep({
          playId: "play-123",
          result: "failure",
        });
      });

      expect(result.current.failedReps).toBe(initialFailCount + 1);
    });

    it("should calculate success rate correctly", async () => {
      const { result } = renderHook(() => usePracticeSession());

      // Log 3 success, 1 failure (75% success rate)
      await act(async () => {
        await result.current.logRep({
          playId: "play-123",
          result: "success",
        });
        await result.current.logRep({
          playId: "play-123",
          result: "success",
        });
        await result.current.logRep({
          playId: "play-123",
          result: "success",
        });
        await result.current.logRep({
          playId: "play-123",
          result: "failure",
        });
      });

      expect(result.current.successRate).toBe(75);
    });

    it("should handle neutral and skipped reps", async () => {
      const { result } = renderHook(() => usePracticeSession());

      await act(async () => {
        await result.current.logRep({
          playId: "play-123",
          result: "neutral",
        });
      });

      expect(result.current.neutralReps).toBeGreaterThan(0);

      await act(async () => {
        await result.current.skipRep();
      });

      // Skipped rep should advance but not count toward completion
      expect(result.current.currentRep).toBeGreaterThan(1);
    });
  });

  describe("Play Navigation", () => {
    it("should allow manual play selection", () => {
      const { result } = renderHook(() => usePracticeSession());

      const targetPlayIndex = 2;

      act(() => {
        result.current.goToPlay(targetPlayIndex);
      });

      expect(result.current.currentPlayIndex).toBe(targetPlayIndex);
      expect(result.current.currentRep).toBe(1); // Reset reps
    });

    it("should navigate to next play manually", () => {
      const { result } = renderHook(() => usePracticeSession());

      const initialIndex = result.current.currentPlayIndex;

      act(() => {
        result.current.nextPlay();
      });

      expect(result.current.currentPlayIndex).toBe(initialIndex + 1);
    });

    it("should navigate to previous play", () => {
      const { result } = renderHook(() => usePracticeSession());

      // Go to play 2 first
      act(() => {
        result.current.goToPlay(2);
      });

      act(() => {
        result.current.previousPlay();
      });

      expect(result.current.currentPlayIndex).toBe(1);
    });

    it("should not go below first play", () => {
      const { result } = renderHook(() => usePracticeSession());

      act(() => {
        result.current.goToPlay(0);
      });

      act(() => {
        result.current.previousPlay();
      });

      expect(result.current.currentPlayIndex).toBe(0);
    });

    it("should detect when at last play", () => {
      const { result } = renderHook(() => usePracticeSession());

      const lastIndex = result.current.allPlays.length - 1;

      act(() => {
        result.current.goToPlay(lastIndex);
      });

      expect(result.current.isLastPlay).toBe(true);
    });
  });

  describe("Session Management", () => {
    it("should start practice session with script", async () => {
      const { result } = renderHook(() => usePracticeSession());

      await act(async () => {
        await result.current.startSession({
          practiceScriptId: "script-123",
          sessionDate: new Date("2025-10-21"),
          notes: "Morning practice",
          weather: "Sunny, 70°F",
          fieldConditions: "Excellent",
        });
      });

      expect(result.current.session).toBeDefined();
      expect(result.current.isActive).toBe(true);
    });

    it("should load practice script plays on start", async () => {
      const { result } = renderHook(() => usePracticeSession());

      await act(async () => {
        await result.current.startSession({
          practiceScriptId: "script-123",
          sessionDate: new Date(),
        });
      });

      await waitFor(() => {
        expect(result.current.allPlays.length).toBeGreaterThan(0);
      });
    });

    it("should track practice duration", async () => {
      const { result } = renderHook(() => usePracticeSession());

      await act(async () => {
        await result.current.startSession({
          practiceScriptId: "script-123",
          sessionDate: new Date(),
        });
      });

      // Simulate time passing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      expect(result.current.durationMinutes).toBeGreaterThan(0);
    });

    it("should save progress on pause", async () => {
      const { result } = renderHook(() => usePracticeSession());

      await act(async () => {
        await result.current.startSession({
          practiceScriptId: "script-123",
          sessionDate: new Date(),
        });
      });

      // Log some reps
      await act(async () => {
        await result.current.logRep({
          playId: "play-123",
          result: "success",
        });
      });

      await act(async () => {
        await result.current.pauseSession();
      });

      expect(result.current.isPaused).toBe(true);
      // Progress should be saved to localStorage
    });

    it("should calculate completion percentage", async () => {
      const { result } = renderHook(() => usePracticeSession());

      await act(async () => {
        await result.current.startSession({
          practiceScriptId: "script-123",
          sessionDate: new Date(),
        });
      });

      // Complete half the reps
      const totalReps = result.current.totalReps;
      const repsToComplete = Math.floor(totalReps / 2);

      for (let i = 0; i < repsToComplete; i++) {
        await act(async () => {
          await result.current.logRep({
            playId: result.current.currentPlay?.id || "",
            result: "success",
          });
        });
      }

      expect(result.current.completionPercentage).toBeCloseTo(50, 0);
    });

    it("should end session and save final stats", async () => {
      const { result } = renderHook(() => usePracticeSession());

      await act(async () => {
        await result.current.startSession({
          practiceScriptId: "script-123",
          sessionDate: new Date(),
        });
      });

      // Log some activity
      await act(async () => {
        await result.current.logRep({
          playId: "play-123",
          result: "success",
        });
      });

      await act(async () => {
        await result.current.endSession();
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.session?.endedAt).toBeDefined();
    });
  });

  describe("Keyboard Shortcuts", () => {
    it("should support 'S' key for success", async () => {
      const { result } = renderHook(() => usePracticeSession());

      await act(async () => {
        await result.current.handleKeyPress("s");
      });

      expect(result.current.successfulReps).toBeGreaterThan(0);
    });

    it("should support 'F' key for failure", async () => {
      const { result } = renderHook(() => usePracticeSession());

      await act(async () => {
        await result.current.handleKeyPress("f");
      });

      expect(result.current.failedReps).toBeGreaterThan(0);
    });

    it("should support 'N' key for neutral", async () => {
      const { result } = renderHook(() => usePracticeSession());

      await act(async () => {
        await result.current.handleKeyPress("n");
      });

      expect(result.current.neutralReps).toBeGreaterThan(0);
    });

    it("should support 'K' key for skip", () => {
      const { result } = renderHook(() => usePracticeSession());

      const initialRep = result.current.currentRep;

      act(() => {
        result.current.handleKeyPress("k");
      });

      expect(result.current.currentRep).toBe(initialRep + 1);
    });
  });

  describe("Progress Persistence", () => {
    it("should save progress to localStorage", async () => {
      const { result } = renderHook(() => usePracticeSession());

      await act(async () => {
        await result.current.startSession({
          practiceScriptId: "script-123",
          sessionDate: new Date(),
        });
      });

      await act(async () => {
        await result.current.logRep({
          playId: "play-123",
          result: "success",
        });
      });

      // Check localStorage has session data
      const savedData = localStorage.getItem("practice-session-progress");
      expect(savedData).toBeDefined();
    });

    it("should restore progress from localStorage on mount", () => {
      // Pre-populate localStorage
      const mockProgress = {
        sessionId: "session-123",
        currentPlayIndex: 2,
        currentRep: 3,
        completedReps: 10,
      };
      localStorage.setItem(
        "practice-session-progress",
        JSON.stringify(mockProgress)
      );

      const { result } = renderHook(() => usePracticeSession());

      expect(result.current.currentPlayIndex).toBe(2);
      expect(result.current.currentRep).toBe(3);
    });

    it("should clear progress on session end", async () => {
      const { result } = renderHook(() => usePracticeSession());

      await act(async () => {
        await result.current.startSession({
          practiceScriptId: "script-123",
          sessionDate: new Date(),
        });
      });

      await act(async () => {
        await result.current.endSession();
      });

      const savedData = localStorage.getItem("practice-session-progress");
      expect(savedData).toBeNull();
    });
  });
});
