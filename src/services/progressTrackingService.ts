/**
 * Progress tracking utilities for team creation wizard
 */

import { debug } from "../utils/logger";
import {
  readLocalJson,
  removeLocalItem,
  storageKeys,
  writeLocalJson,
} from "../utils/storage";

export interface TeamCreationProgress {
  currentStep: string;
  formData: Record<string, any>;
  completedSteps: string[];
  timestamp: number;
}

/**
 * Service for managing team creation progress persistence
 */
export class ProgressTrackingService {
  /**
   * Save current progress to localStorage
   */
  static saveProgress(
    currentStep: string,
    formData: Record<string, any>,
    completedSteps: string[]
  ): void {
    try {
      const progress: TeamCreationProgress = {
        currentStep,
        formData,
        completedSteps,
        timestamp: Date.now(),
      };

      writeLocalJson(storageKeys.teamCreationProgress, progress);
      debug("💾 Progress saved:", {
        currentStep,
        completedSteps: completedSteps.length,
      });
    } catch (error) {
      debug("⚠️ Failed to save progress:", error);
    }
  }

  /**
   * Load saved progress from localStorage
   */
  static loadProgress(): TeamCreationProgress | null {
    try {
      const progress = readLocalJson<TeamCreationProgress>(
        storageKeys.teamCreationProgress
      );
      if (!progress) return null;

      // Check if progress is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      if (Date.now() - progress.timestamp > maxAge) {
        debug("⏰ Saved progress is too old, clearing...");
        this.clearProgress();
        return null;
      }

      debug("📋 Found saved team creation progress!");
      return progress;
    } catch (error) {
      debug("⚠️ Failed to load progress:", error);
      return null;
    }
  }

  /**
   * Clear saved progress
   */
  static clearProgress(): void {
    try {
      removeLocalItem(storageKeys.teamCreationProgress);
      debug("🗑️ Progress cleared");
    } catch (error) {
      debug("⚠️ Failed to clear progress:", error);
    }
  }

  /**
   * Check if there is saved progress available
   */
  static hasProgress(): boolean {
    return this.loadProgress() !== null;
  }
}
