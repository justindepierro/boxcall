import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Play } from "../../../types/play";
import type { PracticeScript } from "../../../services/practiceService";
import type {
  PlaybookState,
  CoachingView,
} from "../../../contexts/PlaybookContext";
import type { PlaybookFilters, PlaySortOption } from "../../../types/filters";
import { PlaysService, PracticeService } from "@services";
import { exportPlays } from "../../../services/exportService";
import { useToast } from "../../../hooks/useToast";
import { error as logError, info, debug } from "../../../utils/logger";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import { smartPreloader } from "../../../services/smartPreloader";
import {
  getOppositeFormationVariant,
  flipDiagramPositions,
  flipPlayName,
  flipFormationDirection,
} from "../../../utils/formationFlipHelpers";
import type { ModalOptions, ModalType } from "../../../hooks/useModalManager";

interface UsePlaybookHandlersProps {
  activeTeamId: string | null;
  state: PlaybookState;
  dispatch: React.Dispatch<any>;
  openModal: (type: Exclude<ModalType, null>, options?: ModalOptions) => void;
  closeAllModals: () => void;
  setDiagramPlay: (play: Play | null) => void;
  setDiagramMode: (mode: "edit" | "quick-play") => void;
  setEditingScript: React.Dispatch<React.SetStateAction<PracticeScript | null>>;
  setShowPracticeScriptModal: (show: boolean) => void;
  setShowBulkDeleteConfirm: (show: boolean) => void;
  setPlayToPost: (play: Play | null) => void;
  refreshActivities: () => Promise<void>;
}

function usePlaybookViewHandlers(params: { dispatch: React.Dispatch<any> }) {
  const { dispatch } = params;

  const handleViewChange = useCallback(
    (view: CoachingView) => {
      dispatch({ type: "SET_VIEW", view });
      smartPreloader.recordAction("change_view", `view_${view}`);
    },
    [dispatch]
  );

  const handleTeamTypeChange = useCallback(
    (teamType: "offense" | "defense" | "special-teams") => {
      dispatch({ type: "SET_TEAM_TYPE", teamType });
    },
    [dispatch]
  );

  /**
   * UNIFIED FILTERS: Dispatch SET_FILTERS with PlaybookFilters object
   * This replaces the legacy SET_ADVANCED_FILTERS + SET_CATEGORY pattern
   */
  const handleFiltersChange = useCallback(
    (filters: PlaybookFilters) => {
      triggerHapticFeedback("selection");
      dispatch({ type: "SET_FILTERS", filters });
    },
    [dispatch]
  );

  /**
   * Update sort order while preserving other filters
   */
  const handleSortChange = useCallback(
    (sortBy: PlaySortOption, currentFilters: PlaybookFilters) => {
      triggerHapticFeedback("selection");
      dispatch({ type: "SET_FILTERS", filters: { ...currentFilters, sortBy } });
    },
    [dispatch]
  );

  const handleClearSelection = useCallback(() => {
    dispatch({ type: "CLEAR_SELECTION" });
  }, [dispatch]);

  return {
    handleViewChange,
    handleTeamTypeChange,
    handleFiltersChange,
    handleSortChange,
    handleClearSelection,
  };
}

function usePlaybookModalHandlers(params: {
  openModal: (type: Exclude<ModalType, null>, options?: ModalOptions) => void;
  setDiagramPlay: (play: Play | null) => void;
  setDiagramMode: (mode: "edit" | "quick-play") => void;
  setPlayToPost: (play: Play | null) => void;
}) {
  const { openModal, setDiagramMode, setDiagramPlay, setPlayToPost } = params;

  const handleOpenBuilder = useCallback(() => {
    triggerHapticFeedback("light");
    openModal("addNewPlay");
    smartPreloader.recordAction("open_modal", "formation_builder");
  }, [openModal]);

  const handleOpenBulkQuickAdd = useCallback(() => {
    triggerHapticFeedback("light");
    openModal("bulkQuickAddPlays");
    smartPreloader.recordAction("open_modal", "bulk_quick_add");
  }, [openModal]);

  const handleOpenQuickCreate = useCallback(() => {
    triggerHapticFeedback("light");
    openModal("addNewPlay");
    setDiagramMode("quick-play");
    setDiagramPlay(null);
    smartPreloader.recordAction("open_modal", "quick_create");
  }, [openModal, setDiagramMode, setDiagramPlay]);

  const handleOpenSettings = useCallback(() => {
    triggerHapticFeedback("light");
    openModal("playbookSettings");
  }, [openModal]);

  const handleOpenPersonnel = useCallback(() => {
    triggerHapticFeedback("light");
    openModal("personnel");
    smartPreloader.recordAction("open_modal", "personnel_builder");
  }, [openModal]);

  const handleEditPlay = useCallback(
    (play: Play) => {
      triggerHapticFeedback("light");
      setDiagramPlay(play);
      setDiagramMode("edit");
      openModal("addNewPlay");
    },
    [openModal, setDiagramPlay, setDiagramMode]
  );

  const handleOpenKeyboardShortcuts = useCallback(() => {
    triggerHapticFeedback("light");
    openModal("keyboardShortcuts");
  }, [openModal]);

  const handleOpenAssignments = useCallback((play: Play) => {
    debug("Opening assignments for play:", play);
  }, []);

  const handlePostToTeamBulletin = useCallback(
    (play: Play) => {
      setPlayToPost(play);
      openModal("postToBulletin");
      debug("Posting play to team bulletin:", play);
    },
    [openModal, setPlayToPost]
  );

  return {
    handleOpenBuilder,
    handleOpenBulkQuickAdd,
    handleOpenQuickCreate,
    handleOpenSettings,
    handleOpenPersonnel,
    handleEditPlay,
    handleOpenKeyboardShortcuts,
    handleOpenAssignments,
    handlePostToTeamBulletin,
  };
}

function usePlaybookBulkHandlers(params: {
  state: PlaybookState;
  dispatch: React.Dispatch<any>;
  openModal: (type: Exclude<ModalType, null>, options?: ModalOptions) => void;
  setShowBulkDeleteConfirm: (show: boolean) => void;
  refreshActivities: () => Promise<void>;
  toast: ReturnType<typeof useToast>;
}) {
  const {
    state,
    dispatch,
    openModal,
    setShowBulkDeleteConfirm,
    refreshActivities,
    toast,
  } = params;

  const handleBulkAction = useCallback(
    (action: string) => {
      const selectedCount = state.selectedPlayIds?.size || 0;

      if (selectedCount === 0) {
        toast.warning("No plays selected");
        return;
      }

      switch (action) {
        case "add-tags":
          toast.info(`Bulk tagging ${selectedCount} plays (coming soon)`);
          break;

        case "duplicate":
          toast.info(`Duplicating ${selectedCount} plays (coming soon)`);
          break;

        case "add-to-practice":
          {
            const selectedPlayIds = Array.from(state.selectedPlayIds || []);
            if (selectedPlayIds.length > 0) {
              debug(
                "[PlaybookPage] Opening Practice Script Builder with plays:",
                selectedPlayIds
              );
              openModal("practiceScriptBuilder");
            }
          }
          break;

        case "batch-edit":
          toast.info(`Batch editing ${selectedCount} plays (coming soon)`);
          break;

        case "export":
          {
            const selectedPlayIds = Array.from(state.selectedPlayIds || []);

            if (selectedPlayIds.length > 0) {
              (async () => {
                try {
                  const selectedPlays =
                    await PlaysService.getPlaysByIds(selectedPlayIds);

                  if (selectedPlays.length > 0) {
                    exportPlays(selectedPlays, {
                      format: "json",
                      prettyPrint: true,
                      includeMetadata: true,
                    });
                    toast.success(
                      `Exported ${selectedPlays.length} ${selectedPlays.length === 1 ? "play" : "plays"} to JSON`
                    );
                  } else {
                    toast.error("Failed to fetch selected plays");
                  }
                } catch (err) {
                  logError("Export failed:", err);
                  toast.error("Failed to export plays");
                }
              })();
            }
          }
          break;

        case "delete":
          setShowBulkDeleteConfirm(true);
          break;

        default:
          break;
      }
    },
    [state.selectedPlayIds, toast, openModal, setShowBulkDeleteConfirm]
  );

  const confirmBulkDelete = useCallback(async () => {
    const selectedCount = state.selectedPlayIds?.size || 0;
    try {
      const selectedPlayIds = Array.from(state.selectedPlayIds || []);
      await PlaysService.deletePlays(selectedPlayIds);

      dispatch({ type: "CLEAR_SELECTION" });
      await refreshActivities();

      toast.success(
        `Deleted ${selectedCount} ${selectedCount === 1 ? "play" : "plays"}`
      );
    } catch (err) {
      logError("Bulk delete failed:", err);
      toast.error("Failed to delete plays");
    }
  }, [state.selectedPlayIds, dispatch, refreshActivities, toast]);

  return { handleBulkAction, confirmBulkDelete };
}

function usePlaybookPlayHandlers(params: {
  dispatch: React.Dispatch<any>;
  openModal: (type: Exclude<ModalType, null>, options?: ModalOptions) => void;
  toast: ReturnType<typeof useToast>;
}) {
  const { dispatch, openModal, toast } = params;

  const handlePlayCountChange = useCallback(
    (count: number) => {
      dispatch({ type: "SET_PLAYS_CREATED", count });
    },
    [dispatch]
  );

  const handleDuplicatePlay = useCallback(
    async (play: Play, flip: boolean = false) => {
      triggerHapticFeedback("selection");

      const duplicatedPlay: Play = {
        ...play,
        id: "",
        play_name: `Copy of ${play.play_name}`,
        created_at: new Date(),
        updated_at: new Date(),
        times_called: 0,
        times_successful: 0,
      };

      if (flip) {
        try {
          if (play.formation_id) {
            const oppositeFormation = await getOppositeFormationVariant(
              play.formation_id
            );

            if (oppositeFormation) {
              duplicatedPlay.formation_id = oppositeFormation.id;
              duplicatedPlay.formation = oppositeFormation.name;
              duplicatedPlay.formation_direction =
                oppositeFormation.direction as "base" | "left" | "right" | null;
            }
          }

          duplicatedPlay.play_name = flipPlayName(play.play_name);
          duplicatedPlay.f_dir = flipFormationDirection(play.f_dir ?? "");
          duplicatedPlay.p_dir = flipFormationDirection(play.p_dir ?? "");

          if (play.diagram_data) {
            const flippedDiagram = flipDiagramPositions(play.diagram_data);
            if (flippedDiagram) {
              duplicatedPlay.diagram_data = flippedDiagram as any;
            }
          }

          toast.success(
            "Play flipped!",
            `Created flipped version: "${duplicatedPlay.play_name}"`
          );
        } catch (error) {
          logError("[PlaybookPage] Failed to flip play:", error);
          toast.error(
            "Flip failed",
            "Could not flip formation, creating regular duplicate"
          );
        }
      }

      openModal("addNewPlay");
    },
    [toast, openModal]
  );

  return { handlePlayCountChange, handleDuplicatePlay };
}

function usePlaybookWorkflowHandlers(params: {
  activeTeamId: string | null;
  dispatch: React.Dispatch<any>;
  setEditingScript: React.Dispatch<React.SetStateAction<PracticeScript | null>>;
  setShowPracticeScriptModal: (show: boolean) => void;
  refreshActivities: () => Promise<void>;
  toast: ReturnType<typeof useToast>;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const {
    activeTeamId,
    dispatch,
    setEditingScript,
    setShowPracticeScriptModal,
    refreshActivities,
    toast,
    navigate,
  } = params;

  const handleAddToPracticeScript = useCallback(
    async (play: Play) => {
      triggerHapticFeedback("success");
      try {
        if (!activeTeamId) {
          toast.error("No active team selected");
          return;
        }
        const script = await PracticeService.createQuickScript(
          play,
          activeTeamId
        );
        info(`Added "${play.play_name}" to practice script: "${script.name}"`);

        await refreshActivities();

        toast.success(
          `Added "${play.play_name}" to practice script`,
          script.name
        );
      } catch (error) {
        logError("Failed to add play to practice script:", error);
        toast.error(
          "Failed to add play to practice script",
          "Please try again"
        );
      }
    },
    [activeTeamId, toast, refreshActivities]
  );

  const handleAddToGamePlan = useCallback(
    async (_play: Play) => {
      toast.info("Game plan integration coming soon!");
    },
    [toast]
  );

  const handleOpenPracticeScriptBuilder = useCallback(
    (script?: PracticeScript) => {
      triggerHapticFeedback("light");
      setEditingScript(script || null);
      setShowPracticeScriptModal(true);
    },
    [setEditingScript, setShowPracticeScriptModal]
  );

  const handleQuickNewPracticeScript = useCallback(() => {
    triggerHapticFeedback("light");
    setEditingScript(null);
    setShowPracticeScriptModal(true);
  }, [setEditingScript, setShowPracticeScriptModal]);

  const handleQuickNewGamePlan = useCallback(() => {
    triggerHapticFeedback("light");
    navigate("/game-plans");
  }, [navigate]);

  const handlePullRefresh = useCallback(async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch({ type: "INCREMENT_REFRESH" });
      toast.success("Plays refreshed");
    } catch (error) {
      logError("Failed to refresh plays:", error);
      toast.error("Failed to refresh plays");
    }
  }, [dispatch, toast]);

  return {
    handleAddToPracticeScript,
    handleAddToGamePlan,
    handleOpenPracticeScriptBuilder,
    handleQuickNewPracticeScript,
    handleQuickNewGamePlan,
    handlePullRefresh,
  };
}

export function usePlaybookHandlers({
  activeTeamId,
  state,
  dispatch,
  openModal,
  closeAllModals,
  setDiagramPlay,
  setDiagramMode,
  setEditingScript,
  setShowPracticeScriptModal,
  setShowBulkDeleteConfirm,
  setPlayToPost,
  refreshActivities,
}: UsePlaybookHandlersProps) {
  const toast = useToast();
  const navigate = useNavigate();

  const viewHandlers = usePlaybookViewHandlers({ dispatch });
  const modalHandlers = usePlaybookModalHandlers({
    openModal,
    setDiagramPlay,
    setDiagramMode,
    setPlayToPost,
  });
  const bulkHandlers = usePlaybookBulkHandlers({
    state,
    dispatch,
    openModal,
    setShowBulkDeleteConfirm,
    refreshActivities,
    toast,
  });
  const playHandlers = usePlaybookPlayHandlers({ dispatch, openModal, toast });
  const workflowHandlers = usePlaybookWorkflowHandlers({
    activeTeamId,
    dispatch,
    setEditingScript,
    setShowPracticeScriptModal,
    refreshActivities,
    toast,
    navigate,
  });

  return {
    ...viewHandlers,
    ...modalHandlers,
    ...bulkHandlers,
    ...playHandlers,
    ...workflowHandlers,
    closeAllModals,
  };
}
