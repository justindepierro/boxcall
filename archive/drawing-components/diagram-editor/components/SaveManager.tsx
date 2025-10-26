/**
 * useSaveManager Hook
 *
 * Handles save operations, autosave, and save dialog management.
 * Extracted from the monolithic DiagramEditor component for better maintainability.
 */

import { useState, useCallback, useEffect } from "react";
import { useAutosave } from "../hooks/useAutosave";
import { updateDiagramData } from "@services/diagramService";
import { supabase } from "@lib/supabase";
import type { DiagramDocument } from "../types/DiagramTypes";
import type { Play } from "../../../../types/play";

interface UseSaveManagerProps {
  play?: Play | null;
  players: any[]; // From diagram store
  routes: any[]; // From diagram store
  onSaveSuccess?: () => void;
  onShowSaveDialog?: () => void;
}

export const useSaveManager = ({
  play,
  players,
  routes,
  onSaveSuccess,
  onShowSaveDialog,
}: UseSaveManagerProps) => {
  const [playName, setPlayName] = useState<string>("");
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // Track if diagram has been modified
  useEffect(() => {
    if (players.length > 0 || routes.length > 0) {
      setIsDirty(true);
    }
  }, [players, routes]);

  // Helper function to detect formation based on player positions
  const detectFormation = useCallback((playerList: any[]): string => {
    const offensivePlayers = playerList.filter((p) => p.team === "offense");

    if (offensivePlayers.length === 0) return "Unknown";

    // Simple detection - return player count
    return `${offensivePlayers.length} Players`;
  }, []);

  // Autosave callback - saves diagram data to the play
  const handleAutosave = useCallback(
    async (diagramData: DiagramDocument) => {
      if (!play?.id) {
        return;
      }

      if (!play.play_name?.trim()) {
        return;
      }

      const result = await updateDiagramData(play.id, diagramData, {
        updateFormation: true,
      });

      if (!result.success) {
        console.error("❌ Autosave failed:", result.error);
        throw new Error(result.error);
      }
    },
    [play]
  );

  // Enable autosave with debouncing (only for existing plays)
  const { status: saveStatus, lastSaved } = useAutosave(
    players,
    routes,
    play?.play_name || "",
    {
      enabled: Boolean(play?.id), // Only enable autosave for existing plays
      debounceMs: 2500, // Save after 2.5 seconds of inactivity
      onSave: handleAutosave,
      onSaveSuccess: () => {
        setIsDirty(false);
        onSaveSuccess?.();
      },
      onSaveError: (error: Error) => {
        console.error("❌ Autosave error:", error);
        // Don't show alert for autosave errors, just log them
      },
    }
  );

  // Perform save operation
  const performSave = useCallback(
    async (name: string) => {
      try {
        console.log(`💾 Saving play: "${name}"...`);

        // Build the diagram document
        const diagramData: DiagramDocument = {
          version: 2,
          players,
          routes: [], // TODO: Get routes from store when route system is implemented
          meta: {
            createdAt: play?.diagram_data?.meta?.createdAt || Date.now(),
            updatedAt: Date.now(),
          },
        };

        // If we have a play ID, use DiagramService to update
        if (play?.id) {
          const result = await updateDiagramData(play.id, diagramData, {
            updateFormation: true,
          });

          if (!result.success) {
            console.error("❌ DiagramService error:", result.error);
            throw new Error(result.error);
          }

          // Mark as saved
          setIsDirty(false);
          onShowSaveDialog?.(); // Close dialog

          console.log("✅ Success", `Play "${name}" saved successfully!`);
        } else {
          // For new plays, use direct Supabase insert (needs playbook_id context)

          const playData: Partial<Play> = {
            play_name: name,
            formation: detectFormation(players),
            p_type: (play?.p_type || "Pass") as Play["p_type"],
            diagram_data: diagramData,
            diagram_version: 2,
          };

          const { error } = await supabase
            .from("plays")
            .insert(playData as never)
            .select()
            .single();

          if (error) {
            console.error("❌ Supabase error:", error);
            throw new Error(error.message);
          }

          // Mark as saved
          setIsDirty(false);
          onShowSaveDialog?.(); // Close dialog

          console.log("✅ Success", `Play "${name}" saved successfully!`);
        }
      } catch (err) {
        console.error("❌ Error saving play:", err);
        throw err;
      }
    },
    [players, detectFormation, play, onShowSaveDialog]
  );

  const handleSave = useCallback(() => {
    if (!playName.trim()) {
      onShowSaveDialog?.();
      return;
    }
    performSave(playName);
  }, [playName, performSave, onShowSaveDialog]);

  // Expose state and handlers
  return {
    playName,
    setPlayName,
    isDirty,
    setIsDirty,
    saveStatus,
    lastSaved,
    handleSave,
    performSave,
  } as const;
};
