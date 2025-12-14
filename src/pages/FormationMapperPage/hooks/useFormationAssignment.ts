import { useCallback } from "react";
import type { Play } from "../../../types/play";
import type { Formation } from "../../../types/formation";
import type { FormationSuggestion } from "./useFormationSuggestions";
import { SecurePlaysService } from "../../../services/securePlaysService";
import { ensureValidFormation } from "../../../utils/formationGuard";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import { useToast } from "../../../hooks/useToast";
import { logError } from "../../../utils/logger";

interface FormationGroup {
  formation: Formation;
  plays: Play[];
}

interface AssignOptions {
  successTitle?: string;
  successMessage?: string;
}

interface UseFormationAssignmentParams {
  refresh: () => Promise<void>;
}

interface UseFormationAssignmentReturn {
  assignFormations: (
    groups: FormationGroup[],
    options?: AssignOptions
  ) => Promise<boolean>;
}

export function useFormationAssignment({
  refresh,
}: UseFormationAssignmentParams): UseFormationAssignmentReturn {
  const toast = useToast();

  const assignFormations = useCallback(
    async (
      groups: FormationGroup[],
      options?: AssignOptions
    ): Promise<boolean> => {
      const validGroups = groups
        .map((group) => ({
          formation: group.formation,
          plays: group.plays.filter(Boolean),
        }))
        .filter((group) => group.formation && group.plays.length > 0);

      if (validGroups.length === 0) {
        return false;
      }

      triggerHapticFeedback("light");

      try {
        for (const group of validGroups) {
          const { formation, plays: groupPlays } = group;
          if (!formation || groupPlays.length === 0) continue;

          await ensureValidFormation({
            playbookId: groupPlays[0].playbook_id,
            formationId: formation.id,
            allowCustom: false,
          });

          const timestamp = new Date().toISOString();

          await Promise.all(
            groupPlays.map((play) =>
              SecurePlaysService.updatePlay(play.id, {
                formation_id: formation.id,
                formation: formation.name,
                formation_status: "ok",
                formation_direction: formation.direction ?? null,
                sanitized_at: timestamp,
              })
            )
          );
        }

        triggerHapticFeedback("success");

        const totalPlays = validGroups.reduce(
          (sum, group) => sum + group.plays.length,
          0
        );

        const uniqueFormationNames = [
          ...new Set(validGroups.map((group) => group.formation.name)),
        ];

        const defaultTitle =
          totalPlays === 1 ? "Formation Linked" : "Formations Linked";

        let defaultMessage: string;
        if (totalPlays === 1) {
          const playName = validGroups[0].plays[0].play_name || "play";
          defaultMessage = `Linked ${playName} to ${validGroups[0].formation.name}`;
        } else if (uniqueFormationNames.length === 1) {
          defaultMessage = `Linked ${totalPlays} plays to ${uniqueFormationNames[0]}`;
        } else {
          defaultMessage = `Linked ${totalPlays} plays across ${uniqueFormationNames.length} formations`;
        }

        toast.success(
          options?.successMessage ?? defaultMessage,
          options?.successTitle ?? defaultTitle
        );

        await refresh();
        return true;
      } catch (err) {
        logError("Formation assignment failed", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to assign formation",
          "Link Failed"
        );
        return false;
      }
    },
    [refresh, toast]
  );

  return { assignFormations };
}

export interface FormationAssignmentHandlers {
  handleSuggestionAssign: (
    play: Play,
    suggestion: FormationSuggestion
  ) => Promise<void>;
  handleAssignFormation: () => Promise<void>;
  handleBulkAssignConfirm: () => Promise<void>;
  handleBulkApplySuggestions: () => Promise<void>;
}

interface UseFormationHandlersParams {
  assignFormations: (
    groups: FormationGroup[],
    options?: AssignOptions
  ) => Promise<boolean>;
  editingPlay: Play | null;
  selectedFormation: Formation | null;
  selectedPlays: Play[];
  selectedCount: number;
  bulkAssignFormation: Formation | null;
  suggestionsByPlay: Map<string, FormationSuggestion[]>;
  setEditingPlay: (play: Play | null) => void;
  setSelectedFormation: (formation: Formation | null) => void;
  setBulkAssignOpen: (open: boolean) => void;
  setBulkAssignFormation: (formation: Formation | null) => void;
  setSelectedPlayIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export function useFormationHandlers({
  assignFormations,
  editingPlay,
  selectedFormation,
  selectedPlays,
  selectedCount,
  bulkAssignFormation,
  suggestionsByPlay,
  setEditingPlay,
  setSelectedFormation,
  setBulkAssignOpen,
  setBulkAssignFormation,
  setSelectedPlayIds,
}: UseFormationHandlersParams): FormationAssignmentHandlers {
  const toast = useToast();

  const handleSuggestionAssign = useCallback(
    async (play: Play, suggestion: FormationSuggestion) => {
      const success = await assignFormations(
        [{ formation: suggestion.formation, plays: [play] }],
        {
          successTitle: "Suggestion Applied",
          successMessage: `Linked ${play.play_name || "play"} to ${suggestion.formation.name}`,
        }
      );

      if (success) {
        setSelectedPlayIds((prev) => {
          if (!prev.has(play.id)) {
            return prev;
          }
          const next = new Set(prev);
          next.delete(play.id);
          return next;
        });
      }
    },
    [assignFormations, setSelectedPlayIds]
  );

  const handleAssignFormation = useCallback(async () => {
    if (!editingPlay || !selectedFormation) return;

    const success = await assignFormations(
      [{ formation: selectedFormation, plays: [editingPlay] }],
      {
        successMessage: `Linked ${editingPlay.play_name || "play"} to ${selectedFormation.name}`,
      }
    );

    if (success) {
      setEditingPlay(null);
      setSelectedFormation(null);
    }
  }, [
    assignFormations,
    editingPlay,
    selectedFormation,
    setEditingPlay,
    setSelectedFormation,
  ]);

  const handleBulkAssignConfirm = useCallback(async () => {
    if (!bulkAssignFormation || selectedPlays.length === 0) return;

    const success = await assignFormations(
      [{ formation: bulkAssignFormation, plays: selectedPlays }],
      {
        successTitle: "Formation Linked",
        successMessage: `Linked ${selectedPlays.length} selected play${selectedPlays.length === 1 ? "" : "s"} to ${bulkAssignFormation.name}`,
      }
    );

    if (success) {
      setBulkAssignOpen(false);
      setBulkAssignFormation(null);
      setSelectedPlayIds(new Set());
    }
  }, [
    assignFormations,
    bulkAssignFormation,
    selectedPlays,
    setBulkAssignOpen,
    setBulkAssignFormation,
    setSelectedPlayIds,
  ]);

  const handleBulkApplySuggestions = useCallback(async () => {
    if (selectedPlays.length === 0) return;

    const groupsMap = new Map<
      string,
      { formation: Formation; plays: Play[] }
    >();

    selectedPlays.forEach((play) => {
      const suggestion = suggestionsByPlay.get(play.id)?.[0];
      if (!suggestion) return;
      const key = suggestion.formation.id;
      const existing = groupsMap.get(key);
      if (existing) {
        existing.plays.push(play);
      } else {
        groupsMap.set(key, { formation: suggestion.formation, plays: [play] });
      }
    });

    const groups = Array.from(groupsMap.values());
    const appliedCount = groups.reduce(
      (sum, group) => sum + group.plays.length,
      0
    );

    if (appliedCount === 0) {
      toast.error(
        "No suggestions available for the selected plays",
        "No Suggestions"
      );
      return;
    }

    const success = await assignFormations(groups, {
      successTitle: "Suggestions Applied",
      successMessage: `Applied suggestions to ${appliedCount} play${appliedCount === 1 ? "" : "s"}`,
    });

    if (success) {
      const remainingCount = selectedCount - appliedCount;

      setSelectedPlayIds((prev) => {
        const next = new Set(prev);
        groups.forEach((group) => {
          group.plays.forEach((play) => next.delete(play.id));
        });
        return next;
      });

      if (remainingCount > 0) {
        toast.info(
          `${remainingCount} play${remainingCount === 1 ? "" : "s"} still need a manual assignment.`,
          "Remaining Plays"
        );
      }
    }
  }, [
    assignFormations,
    selectedPlays,
    selectedCount,
    suggestionsByPlay,
    setSelectedPlayIds,
    toast,
  ]);

  return {
    handleSuggestionAssign,
    handleAssignFormation,
    handleBulkAssignConfirm,
    handleBulkApplySuggestions,
  };
}
