import { useState, useEffect } from "react";
import type { PracticeScript } from "@services";
import type { Play } from "../../../../types/play";
import { supabase } from "../../../../lib/supabase";
import { useToast } from "../../../../hooks/useToast";
import { debug, error as logError } from "../../../../utils/logger";

interface UsePracticeScriptStateProps {
  script?: PracticeScript;
  isOpen: boolean;
  selectedPlayIds: string[];
  teamId: string;
}

export function usePracticeScriptState({
  script,
  isOpen,
  selectedPlayIds,
  teamId,
}: UsePracticeScriptStateProps) {
  const toast = useToast();

  const [currentScript, setCurrentScript] = useState<PracticeScript | null>(
    script || null
  );
  const [isEditing, setIsEditing] = useState(!script);
  const [scriptName, setScriptName] = useState(script?.name || "");
  const [scriptDescription, setScriptDescription] = useState(
    script?.description || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showPlaySelector, setShowPlaySelector] = useState(false);
  const [isLoadingPlays, setIsLoadingPlays] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateAction, setTemplateAction] = useState<"save" | "load">("save");

  // Initialize script if creating new or load selected plays
  useEffect(() => {
    debug("🔄 [PracticeScriptBuilder] useEffect triggered:", {
      hasScript: !!script,
      isOpen,
      scriptId: script?.id,
      scriptName: script?.name,
      scriptTitle: script?.title,
      selectedPlayIds: selectedPlayIds.length,
    });

    if (!script && isOpen) {
      debug("📝 [PracticeScriptBuilder] Creating new script");
      setCurrentScript(null);
      setIsEditing(true);
      setScriptName("");
      setScriptDescription("");

      // If we have selectedPlayIds, fetch and initialize with those plays
      if (selectedPlayIds.length > 0) {
        debug(
          "[PracticeScriptBuilder] Initializing with selected plays:",
          selectedPlayIds
        );
        setIsLoadingPlays(true);

        // Fetch plays from Supabase
        supabase
          .from("plays")
          .select("*")
          .in("id", selectedPlayIds)
          .then(({ data, error }) => {
            if (error) {
              logError("Failed to fetch plays:", error);
              toast.error("Failed to load selected plays");
              setIsLoadingPlays(false);
              return;
            }

            if (data && data.length > 0) {
              // Create initial script structure with selected plays
              const plays = data as unknown as Play[];
              const initialScript: Partial<PracticeScript> = {
                id: "",
                name: "",
                description: "",
                teamId,
                plays: plays.map((play, index) => ({
                  id: `temp-${play.id}-${index}`,
                  playId: play.id,
                  play,
                  order: index,
                  repetitions: 5,
                  hash: "middle" as const,
                  downDistance: "1st & 10",
                  fieldPosition: "plus_territory" as const,
                  defensiveFront: "base" as const,
                  coverage: "cover_2" as const,
                  blitz: "none" as const,
                  addedAt: new Date(),
                })),
                duration: data.length * 5,
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              debug(
                "[PracticeScriptBuilder] Initialized script with plays:",
                initialScript
              );
              setCurrentScript(initialScript as PracticeScript);
            }
            setIsLoadingPlays(false);
          });
      }
    } else if (script) {
      debug("✏️ [PracticeScriptBuilder] Loading existing script:", {
        id: script.id,
        name: script.name,
        title: script.title,
        playsCount: script.plays?.length,
      });

      setCurrentScript(script);
      setIsEditing(true);

      const displayName = script.name || script.title || "";
      debug("✏️ [PracticeScriptBuilder] Setting script name to:", displayName);
      setScriptName(displayName);
      setScriptDescription(script.description || "");
    }
  }, [script, isOpen, selectedPlayIds, teamId, toast]);

  const totalPlays = currentScript?.plays?.length || 0;

  return {
    // State
    currentScript,
    setCurrentScript,
    isEditing,
    setIsEditing,
    scriptName,
    setScriptName,
    scriptDescription,
    setScriptDescription,
    isSaving,
    setIsSaving,
    showPlaySelector,
    setShowPlaySelector,
    isLoadingPlays,
    showTemplateModal,
    setShowTemplateModal,
    templateAction,
    setTemplateAction,
    totalPlays,
  };
}
