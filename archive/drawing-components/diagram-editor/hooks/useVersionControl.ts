/**
 * Version Control Hook for Diagram Editor
 *
 * Provides React hooks for diagram version control functionality.
 * Integrates with the version control store and diagram editor.
 */

import { useEffect, useCallback } from "react";
import { useVersionControlStore } from "../stores/versionControlStore";
import { triggerHapticFeedback } from "@lib/hapticFeedback";
import { toast } from "sonner";

export interface UseVersionControlOptions {
  playId?: string;
  autoLoad?: boolean;
}

export function useVersionControl(options: UseVersionControlOptions = {}) {
  const { playId, autoLoad = true } = options;

  const versionStore = useVersionControlStore();

  // Load versions when playId changes
  useEffect(() => {
    if (playId && autoLoad) {
      versionStore.loadVersions(playId);
    }
  }, [playId, autoLoad, versionStore]);

  // Create a new version with current diagram state
  const saveVersion = useCallback(async (description?: string) => {
    try {
      const newVersion = await versionStore.createVersion(description);
      if (newVersion) {
        triggerHapticFeedback("success");
        toast.success(`Version ${newVersion.versionNumber} saved`, {
          description: description || "Diagram version created successfully",
        });
        return newVersion;
      }
    } catch (error) {
      toast.error("Failed to save version", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
    return null;
  }, [versionStore]);

  // Rollback to a specific version
  const rollbackToVersion = useCallback(async (versionNumber: number) => {
    try {
      const success = await versionStore.rollbackToVersion(versionNumber);
      if (success) {
        triggerHapticFeedback("success");
        toast.success(`Rolled back to version ${versionNumber}`, {
          description: "Diagram has been restored to the selected version",
        });

        // Reload the diagram data to reflect the rollback
        // This would need to be implemented based on how diagrams are loaded
        // For now, we'll assume the diagram store needs to be updated
        return true;
      }
    } catch (error) {
      toast.error("Failed to rollback version", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
    return false;
  }, [versionStore]);

  // Get version diff information
  const compareVersions = useCallback((versionId1: string, versionId2: string) => {
    return versionStore.compareVersions(versionId1, versionId2);
  }, [versionStore]);

  // Auto-save functionality (creates version on significant changes)
  const autoSave = useCallback(async (description: string = "Auto-saved") => {
    // Only auto-save if there are unsaved changes
    // This could be enhanced with change detection logic
    return await saveVersion(description);
  }, [saveVersion]);

  return {
    // State
    versions: versionStore.versions,
    currentVersion: versionStore.currentVersion,
    isLoading: versionStore.isLoading,
    error: versionStore.error,
    showVersionHistory: versionStore.showVersionHistory,
    selectedVersionId: versionStore.selectedVersionId,

    // Actions
    saveVersion,
    rollbackToVersion,
    compareVersions,
    autoSave,
    loadVersions: versionStore.loadVersions,
    clearError: versionStore.clearError,

    // UI actions
    setShowVersionHistory: versionStore.setShowVersionHistory,
    setSelectedVersionId: versionStore.setSelectedVersionId,
  };
}

/**
 * Hook for version history panel functionality
 */
export function useVersionHistory() {
  const versionStore = useVersionControlStore();

  const selectVersion = useCallback((versionId: string | null) => {
    versionStore.setSelectedVersionId(versionId);
  }, [versionStore]);

  const toggleHistoryPanel = useCallback(() => {
    versionStore.setShowVersionHistory(!versionStore.showVersionHistory);
  }, [versionStore]);

  return {
    isOpen: versionStore.showVersionHistory,
    versions: versionStore.versions,
    selectedVersionId: versionStore.selectedVersionId,
    isLoading: versionStore.isLoading,
    error: versionStore.error,

    selectVersion,
    toggleHistoryPanel,
    clearError: versionStore.clearError,
  };
}

/**
 * Hook for version comparison functionality
 */
export function useVersionComparison() {
  const versionStore = useVersionControlStore();

  const compareVersions = useCallback((versionId1: string, versionId2: string) => {
    return versionStore.compareVersions(versionId1, versionId2);
  }, [versionStore]);

  return {
    compareVersions,
    versions: versionStore.versions,
  };
}