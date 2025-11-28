/**
 * Version Control Store for Diagram Editor
 *
 * Manages diagram versioning, history tracking, branching, and rollback capabilities.
 * Integrates with Supabase play_versions table for persistence.
 */

import { create } from "zustand";
import { supabase } from "@lib/supabase";

export interface VersionInfo {
  id: string;
  versionNumber: number;
  changeDescription?: string;
  createdBy: string;
  createdAt: Date;
  diagramData: any; // Pixi.js diagram data
}

export interface VersionControlState {
  // Current play being versioned
  currentPlayId: string | null;

  // Version history
  versions: VersionInfo[];
  currentVersion: number;
  isLoading: boolean;
  error: string | null;

  // UI state
  showVersionHistory: boolean;
  selectedVersionId: string | null;

  // Actions
  loadVersions: (playId: string) => Promise<void>;
  createVersion: (description?: string) => Promise<VersionInfo | null>;
  rollbackToVersion: (versionNumber: number) => Promise<boolean>;
  compareVersions: (versionId1: string, versionId2: string) => any;

  // UI actions
  setShowVersionHistory: (show: boolean) => void;
  setSelectedVersionId: (versionId: string | null) => void;
  clearError: () => void;
}

export const useVersionControlStore = create<VersionControlState>(
  (set, get) => ({
    // Initial state
    currentPlayId: null,
    versions: [],
    currentVersion: 1,
    isLoading: false,
    error: null,
    showVersionHistory: false,
    selectedVersionId: null,

    // Load version history for a play
    loadVersions: async (playId: string) => {
      set({ isLoading: true, error: null });

      try {
        const { data: versions, error } = await supabase
          .from("play_versions")
          .select(
            `
          id,
          version_number,
          change_description,
          created_by,
          created_at,
          diagram_data
        `
          )
          .eq("play_id", playId)
          .order("version_number", { ascending: false });

        if (error) throw error;

        const versionInfos: VersionInfo[] = (versions || []).map((v: any) => ({
          id: v.id,
          versionNumber: v.version_number,
          changeDescription: v.change_description || undefined,
          createdBy: v.created_by,
          createdAt: new Date(v.created_at),
          diagramData: v.diagram_data,
        }));

        // Also get current version from plays table
        const { data: playData, error: playError } = await supabase
          .from("plays")
          .select("current_version")
          .eq("id", playId)
          .single();

        if (playError) throw playError;

        set({
          currentPlayId: playId,
          versions: versionInfos,
          currentVersion: (playData as any).current_version || 1,
          isLoading: false,
        });
      } catch (error) {
        console.error("Failed to load versions:", error);
        set({
          error:
            error instanceof Error ? error.message : "Failed to load versions",
          isLoading: false,
        });
      }
    },

    // Create a new version
    createVersion: async (description?: string) => {
      const { currentPlayId } = get();
      if (!currentPlayId) {
        set({ error: "No play selected for versioning" });
        return null;
      }

      set({ isLoading: true, error: null });

      try {
        // Call the database function to create a version
        const { data, error } = await (supabase as any).rpc(
          "create_named_play_version",
          {
            p_play_id: currentPlayId,
            p_description: description || "Manual version save",
          }
        );

        if (error) throw error;

        // Reload versions to get the updated list
        await get().loadVersions(currentPlayId);

        // Return the newly created version info
        const newVersion = get().versions.find((v) => v.versionNumber === data);
        set({ isLoading: false });

        return newVersion || null;
      } catch (error) {
        console.error("Failed to create version:", error);
        set({
          error:
            error instanceof Error ? error.message : "Failed to create version",
          isLoading: false,
        });
        return null;
      }
    },

    // Rollback to a specific version
    rollbackToVersion: async (versionNumber: number) => {
      const { currentPlayId } = get();
      if (!currentPlayId) {
        set({ error: "No play selected for rollback" });
        return false;
      }

      set({ isLoading: true, error: null });

      try {
        const { data, error } = await (supabase as any).rpc(
          "rollback_play_to_version",
          {
            p_play_id: currentPlayId,
            p_version_number: versionNumber,
          }
        );

        if (error) throw error;

        // Reload versions to reflect the rollback
        await get().loadVersions(currentPlayId);

        set({ isLoading: false });
        return data as boolean;
      } catch (error) {
        console.error("Failed to rollback version:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to rollback version",
          isLoading: false,
        });
        return false;
      }
    },

    // Compare two versions (returns diff data)
    compareVersions: (versionId1: string, versionId2: string) => {
      const { versions } = get();
      const v1 = versions.find((v) => v.id === versionId1);
      const v2 = versions.find((v) => v.id === versionId2);

      if (!v1 || !v2) {
        return null;
      }

      // Simple diff implementation - can be enhanced
      return {
        version1: v1,
        version2: v2,
        changes: {
          playersAdded: [],
          playersRemoved: [],
          playersModified: [],
          routesAdded: [],
          routesRemoved: [],
          routesModified: [],
        },
      };
    },

    // UI actions
    setShowVersionHistory: (show: boolean) => set({ showVersionHistory: show }),
    setSelectedVersionId: (versionId: string | null) =>
      set({ selectedVersionId: versionId }),
    clearError: () => set({ error: null }),
  })
);
