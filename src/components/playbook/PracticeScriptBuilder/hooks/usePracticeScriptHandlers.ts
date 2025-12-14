import { useCallback } from "react";
import type { DropResult } from "@hello-pangea/dnd";
import { PracticeScriptService, type PracticeScript } from "@services";
import type { Play } from "../../../types/play";
import { useToast } from "../../../hooks/useToast";
import { PDFExportService } from "../../../services/pdfExportService";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import { debug, error as logError } from "../../../utils/logger";

interface UsePracticeScriptHandlersProps {
  currentScript: PracticeScript | null;
  setCurrentScript: (script: PracticeScript | null) => void;
  scriptName: string;
  scriptDescription: string;
  setIsSaving: (saving: boolean) => void;
  setIsEditing: (editing: boolean) => void;
  setShowPlaySelector: (show: boolean) => void;
  teamId: string;
  onSave?: (script: PracticeScript) => void;
  onCancel?: () => void;
}

export function usePracticeScriptHandlers({
  currentScript,
  setCurrentScript,
  scriptName,
  scriptDescription,
  setIsSaving,
  setIsEditing,
  setShowPlaySelector,
  teamId,
  onSave,
  onCancel,
}: UsePracticeScriptHandlersProps) {
  const toast = useToast();

  const handleSave = useCallback(async () => {
    debug("🚨 [PracticeScriptBuilder] SAVE BUTTON CLICKED!");

    if (!scriptName.trim()) {
      toast.error("Script name is required");
      return;
    }

    if (!currentScript?.plays || currentScript.plays.length === 0) {
      toast.error("Please add at least one play to the script");
      return;
    }

    toast.success("Saving practice script...");
    setIsSaving(true);

    try {
      let savedScript: PracticeScript;

      if (currentScript.id && currentScript.id !== "") {
        // Update existing script
        try {
          savedScript = await PracticeScriptService.updatePracticeScript(
            currentScript.id,
            {
              name: scriptName.trim(),
              description: scriptDescription.trim(),
              tags: currentScript.tags,
            }
          );
        } catch (error) {
          logError("[PracticeScriptBuilder] ERROR updating script:", error);
          throw error;
        }

        // Batch update plays
        const batchUpdates = (currentScript.plays || [])
          .filter(
            (scriptPlay) => scriptPlay.id && !scriptPlay.id.startsWith("temp-")
          )
          .map((scriptPlay) => ({
            scriptPlayId: scriptPlay.id!,
            data: {
              repetitions: scriptPlay.repetitions,
              notes: scriptPlay.notes,
              hash: scriptPlay.hash,
              downDistance: scriptPlay.downDistance,
              fieldPosition: scriptPlay.fieldPosition,
              defensiveFront: scriptPlay.defensiveFront,
              coverage: scriptPlay.coverage,
              blitz: scriptPlay.blitz,
            },
          }));

        if (batchUpdates.length > 0) {
          await PracticeScriptService.batchUpdateScriptPlays(batchUpdates);
        }

        const reloadedScript = await PracticeScriptService.getPracticeScript(
          currentScript.id
        );
        if (reloadedScript) {
          savedScript = reloadedScript;
        }

        setCurrentScript(savedScript);
      } else {
        // Create new script
        savedScript = await PracticeScriptService.createPracticeScript({
          name: scriptName.trim(),
          description: scriptDescription.trim(),
          teamId,
        });

        // Add all plays to the script
        for (const scriptPlay of currentScript.plays) {
          await PracticeScriptService.addPlayToScript(
            {
              scriptId: savedScript.id,
              playId: scriptPlay.playId,
              orderIndex: scriptPlay.order,
              notes: scriptPlay.notes,
              repetitions: scriptPlay.repetitions,
              hash: scriptPlay.hash,
              downDistance: scriptPlay.downDistance,
              fieldPosition: scriptPlay.fieldPosition,
              defensiveFront: scriptPlay.defensiveFront,
              coverage: scriptPlay.coverage,
              blitz: scriptPlay.blitz,
            },
            scriptPlay.play
          );
        }

        setCurrentScript(savedScript);
      }

      setIsEditing(false);
      onSave?.(savedScript);
      onCancel?.();
      toast.success(
        `Practice script "${savedScript.name || savedScript.title}" saved successfully`
      );
    } catch (error) {
      logError("Failed to save practice script:", error);
      toast.error("Failed to save practice script", "Please try again");
    } finally {
      setIsSaving(false);
    }
  }, [
    scriptName,
    scriptDescription,
    currentScript,
    teamId,
    onSave,
    onCancel,
    toast,
    setIsSaving,
    setIsEditing,
    setCurrentScript,
  ]);

  const handleAddPlay = useCallback(
    async (play: Play) => {
      if (!currentScript) return;

      try {
        const updatedScript = await PracticeScriptService.addPlayToScript(
          {
            scriptId: currentScript.id,
            playId: play.id,
            repetitions: 5,
            hash: "middle",
            downDistance: "1st & 10",
            fieldPosition: "plus_territory",
            defensiveFront: "base",
            coverage: "cover_2",
            blitz: "none",
          },
          play
        );

        setCurrentScript(updatedScript);
        setShowPlaySelector(false);
        toast.success(`Added "${play.play_name}" to script`);
      } catch (error) {
        logError("Failed to add play to script:", error);
        toast.error("Failed to add play", "Please try again");
      }
    },
    [currentScript, toast, setCurrentScript, setShowPlaySelector]
  );

  const handleRemovePlay = useCallback(
    (playId: string) => {
      if (!currentScript) return;

      const updatedPlays =
        currentScript.plays?.filter((p) => p.id !== playId) || [];
      const updatedScript = {
        ...currentScript,
        plays: updatedPlays,
        updatedAt: new Date(),
      };

      setCurrentScript(updatedScript);
      toast.success("Play removed from script");
    },
    [currentScript, toast, setCurrentScript]
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!currentScript || !result.destination) return;

      const { source, destination } = result;
      if (source.index === destination.index) return;

      triggerHapticFeedback("medium");

      const reorderedPlays = Array.from(currentScript.plays || []);
      const [removed] = reorderedPlays.splice(source.index, 1);
      reorderedPlays.splice(destination.index, 0, removed);

      const updatedPlays = reorderedPlays.map((play, index) => ({
        ...play,
        order: index + 1,
      }));

      setCurrentScript({
        ...currentScript,
        plays: updatedPlays,
        updatedAt: new Date(),
      });
    },
    [currentScript, setCurrentScript]
  );

  const handleUpdatePlayNotes = useCallback(
    (playId: string, notes: string) => {
      if (!currentScript) return;

      const updatedPlays =
        currentScript.plays?.map((play) =>
          play.id === playId ? { ...play, notes } : play
        ) || [];

      setCurrentScript({
        ...currentScript,
        plays: updatedPlays,
        updatedAt: new Date(),
      });
    },
    [currentScript, setCurrentScript]
  );

  const handleUpdatePlayRepetitions = useCallback(
    (playId: string, repetitions: number) => {
      if (!currentScript) return;

      const updatedPlays =
        currentScript.plays?.map((play) =>
          play.id === playId ? { ...play, repetitions } : play
        ) || [];

      setCurrentScript({
        ...currentScript,
        plays: updatedPlays,
        updatedAt: new Date(),
      });
    },
    [currentScript, setCurrentScript]
  );

  const handleUpdatePlayScenario = useCallback(
    (
      playId: string,
      scenario: {
        hash?: "left" | "middle" | "right";
        downDistance?: string;
        fieldPosition?:
          | "plus_territory"
          | "red_zone"
          | "backed_up"
          | "midfield";
        defensiveFront?:
          | "base"
          | "4-3"
          | "3-4"
          | "nickel"
          | "dime"
          | "bear"
          | "tite";
        coverage?:
          | "cover_0"
          | "cover_1"
          | "cover_2"
          | "cover_3"
          | "cover_4"
          | "cover_6"
          | "quarters"
          | "man";
        blitz?:
          | "none"
          | "edge"
          | "a_gap"
          | "b_gap"
          | "sim_pressure"
          | "zone_blitz"
          | "all_out";
      }
    ) => {
      if (!currentScript) return;

      const updatedPlays =
        currentScript.plays?.map((play) =>
          play.id === playId ? { ...play, ...scenario } : play
        ) || [];

      setCurrentScript({
        ...currentScript,
        plays: updatedPlays,
        updatedAt: new Date(),
      });
    },
    [currentScript, setCurrentScript]
  );

  const handleExportPDF = useCallback(async () => {
    if (!currentScript) return;

    try {
      await PDFExportService.exportPracticeScript(currentScript);
      toast.success("PDF exported successfully");
    } catch (error) {
      logError("Failed to export PDF:", error);
      toast.error("Failed to export PDF", "Please try again");
    }
  }, [currentScript, toast]);

  return {
    handleSave,
    handleAddPlay,
    handleRemovePlay,
    handleDragEnd,
    handleUpdatePlayNotes,
    handleUpdatePlayRepetitions,
    handleUpdatePlayScenario,
    handleExportPDF,
  };
}
