/**
 * Progress tracking utilities for team creation wizard
 */

const PROGRESS_STORAGE_KEY = "team_creation_progress";

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

      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
      console.log("💾 Progress saved:", {
        currentStep,
        completedSteps: completedSteps.length,
      });
    } catch (error) {
      console.warn("⚠️ Failed to save progress:", error);
    }
  }

  /**
   * Load saved progress from localStorage
   */
  static loadProgress(): TeamCreationProgress | null {
    try {
      const savedData = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (!savedData) return null;

      const progress: TeamCreationProgress = JSON.parse(savedData);

      // Check if progress is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      if (Date.now() - progress.timestamp > maxAge) {
        console.log("⏰ Saved progress is too old, clearing...");
        this.clearProgress();
        return null;
      }

      console.log("📋 Found saved team creation progress!");
      return progress;
    } catch (error) {
      console.warn("⚠️ Failed to load progress:", error);
      return null;
    }
  }

  /**
   * Clear saved progress
   */
  static clearProgress(): void {
    try {
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
      console.log("🗑️ Progress cleared");
    } catch (error) {
      console.warn("⚠️ Failed to clear progress:", error);
    }
  }

  /**
   * Check if there is saved progress available
   */
  static hasProgress(): boolean {
    return this.loadProgress() !== null;
  }
}
