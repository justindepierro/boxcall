import { useCallback } from "react";
import { table } from "../../../data/supabase/db";
import { PracticeService, type PracticeScript } from "@services";
import { useToast } from "../../../hooks/useToast";
import { error as logError, debug } from "../../../utils/logger";
import {
  modalPlayToServicePlay,
  validateModalPlay,
} from "../../../components/practice/PracticeScriptModal/adapters";
import type { PracticeScriptPlay as ModalPlay } from "../../../components/practice/PracticeScriptModal/types";

interface UsePracticeScriptHandlersProps {
  activeTeamId: string | null;
  setShowPracticeScriptModal: (show: boolean) => void;
  setEditingScript: React.Dispatch<React.SetStateAction<PracticeScript | null>>;
}

export function usePracticeScriptHandlers({
  activeTeamId,
  setShowPracticeScriptModal,
  setEditingScript,
}: UsePracticeScriptHandlersProps) {
  const toast = useToast();

  const handleSavePracticeScript = useCallback(
    async (script: Partial<PracticeScript> & { plays?: ModalPlay[] }) => {
      try {
        debug("💾 Saving practice script:", {
          script,
          playCount: script.plays?.length || 0,
        });

        let savedScriptId: string;

        if (script.id) {
          // Update existing script metadata
          await PracticeService.updatePracticeScript(script.id, {
            name: script.title || script.name || "Untitled Script",
            description: script.description,
            tags: script.tags,
          });
          savedScriptId = script.id;
          debug("✅ Updated script metadata:", savedScriptId);
        } else {
          // Create new script
          const newScript = await PracticeService.createPracticeScript({
            name: script.title || script.name || "Untitled Script",
            description: script.description,
            teamId: activeTeamId!,
            tags: script.tags,
          });
          savedScriptId = newScript.id;
          debug("✅ Created new script:", savedScriptId);
        }

        // Save plays if any were provided
        if (script.plays && script.plays.length > 0) {
          debug("📝 Saving", script.plays.length, "plays to script");

          // Clear existing plays if updating
          if (script.id) {
            const { error: deleteError } = await table("practice_script_plays")
              .delete()
              .eq("practice_script_id", savedScriptId);

            if (deleteError) {
              logError("Error clearing existing plays:", deleteError);
            }
          }

          // Add each play to the script
          for (let i = 0; i < script.plays.length; i++) {
            const play = script.plays[i];

            if (!play.playId) {
              debug("Skipping play without playId:", play);
              continue;
            }

            const validationErrors = validateModalPlay(play);
            if (validationErrors.length > 0) {
              logError("Invalid play data:", play.playName, validationErrors);
              toast.error(
                `Skipped play "${play.playName}": ${validationErrors.join(", ")}`
              );
              continue;
            }

            try {
              const servicePlay = modalPlayToServicePlay(play, i + 1);
              servicePlay.scriptId = savedScriptId;

              const playForActivity = {
                id: play.playId,
                play_name: play.playName,
                team_id: activeTeamId,
              } as any;

              await PracticeService.addPlayToScript(
                servicePlay,
                playForActivity
              );
              debug("✅ Added play", i + 1, ":", play.playName);
            } catch (playError) {
              logError("Failed to add play:", play.playName, playError);
              toast.error(`Failed to add play "${play.playName}"`);
            }
          }

          toast.success(
            `Practice script ${script.id ? "updated" : "created"} with ${script.plays.length} play${script.plays.length !== 1 ? "s" : ""}`
          );
        } else {
          toast.success(`Practice script ${script.id ? "updated" : "created"}`);
        }

        setShowPracticeScriptModal(false);
        setEditingScript(null);
      } catch (error) {
        logError("Failed to save practice script:", error);
        toast.error("Failed to save practice script");
      }
    },
    [activeTeamId, toast, setShowPracticeScriptModal, setEditingScript]
  );

  return {
    handleSavePracticeScript,
  };
}
