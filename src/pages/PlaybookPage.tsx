import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { PlaybookViewTabs } from "../components/playbook/page/PlaybookViewTabs";

import { AdvancedFilters } from "../components/playbook/AdvancedFilters";
import { BulkActionsToolbar } from "../components/playbook/BulkActionsToolbar";

import { Button } from "../components/ui/Button/Button";
import { Icon } from "../components/ui/Icon";
import { Typography } from "../components/design-system/Typography";

import { usePlaybook } from "../contexts/PlaybookContext";
import type { CoachingView, PlaybookState } from "../contexts/PlaybookContext";
import {
  PlaysService,
  ActivityService,
  PracticeScriptService,
} from "@services";

import { exportPlays } from "../services/exportService";
import type { PlayActivityItem } from "@services";
import { SecurePlaysService } from "../services/securePlaysService";
import { useToast } from "../hooks/useToast";
import type { Play } from "../types/play";
import type { PracticeScript } from "../types/practice";

import { useActiveTeamStore } from "../stores/activeTeamStore";
import { useTeamsData } from "../hooks/useTeamsData";

import {
  getOppositeFormationVariant,
  flipDiagramPositions,
  flipPlayName,
  flipFormationDirection,
} from "../utils/formationFlipHelpers";
import { supabase } from "../lib/supabase";
import { info, error as logError, debug } from "../utils/logger";
import { useIsMobileOrTablet } from "../hooks/useBreakpoint";
import { useMobileButtonProps } from "../hooks/useMobileButtonProps";

import { BottomSheet } from "../components/BottomSheet";

import { triggerHapticFeedback } from "../lib/hapticFeedback";
import { smartPreloader } from "../services/smartPreloader";

import { useFormationAudit } from "../hooks/useFormationAudit";
import { useOptimisticPlays } from "../hooks/useOptimisticPlays";
import { usePlaybookStats } from "../hooks/usePlaybookStats";
import { MobilePlaybookView } from "../components/playbook/page/MobilePlaybookView";
import { DesktopPlaybookView } from "../components/playbook/page/DesktopPlaybookView";
import {
  modalPlayToServicePlay,
  validateModalPlay,
} from "../components/practice/PracticeScriptModal/adapters";

const PracticeScriptModal = React.lazy(() =>
  import("../components/practice/PracticeScriptModal").then((module) => ({
    default: module.PracticeScriptModal,
  }))
);
import { PlaybookModals } from "../components/playbook/page/PlaybookModals";
import { useModalManager } from "../hooks/useModalManager";
import { FullscreenDiagramViewer } from "../components/playbook/play-card/FullscreenDiagramViewer";
import { FormationLibraryModal } from "../components/playbook/modals/FormationLibraryModal";
import { PersonnelLibraryModal } from "../components/playbook/modals/PersonnelLibraryModal";

// Lazy load modal components for code splitting (~120KB savings)

const PlaybookPage = () => {
  const { state, dispatch } = usePlaybook();
  const toast = useToast();
  const navigate = useNavigate();
  const { activeTeamId } = useActiveTeamStore();
  const isMobileOrTablet = useIsMobileOrTablet(); // Tablets (< 1024px) get mobile view
  const [mobileListExpanded, setMobileListExpanded] = useState(false);

  // Mobile-optimized button sizes (44px+ touch targets)
  const mobileButtonSize = useMobileButtonProps("md", true).size;
  const mobileSecondaryButtonSize = useMobileButtonProps("md", false).size;

  // Get playbooks for this team
  const {
    playbooks,
    refreshData,
    plays: allPlaysForStats = [],
    formations: allFormations = [],
  } = useTeamsData();

  const sanitizedFormationIdsRef = useRef(new Set<string>());

  // 🚀 PERFORMANCE: Memoize filtered playbooks to avoid recalculating on every render
  // IMPORTANT: Must be defined BEFORE debug useEffect that uses it
  const teamPlaybooks = useMemo(
    () => playbooks.filter((pb) => pb.team_id === activeTeamId && pb.is_active),
    [playbooks, activeTeamId]
  );

  // State for selected playbook (with preference persistence)
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string>("");

  // Initialize play count from data
  useEffect(() => {
    if (allPlaysForStats && allPlaysForStats.length > 0) {
      dispatch({ type: "SET_PLAYS_CREATED", count: allPlaysForStats.length });
    }
  }, [allPlaysForStats, dispatch]);

  // 🐛 MOBILE DEBUG: Log data state for troubleshooting plays not loading
  useEffect(() => {
    if (isMobileOrTablet) {
      console.log("📱 [Mobile Debug - PlaybookPage]", {
        timestamp: new Date().toISOString(),
        activeTeamId,
        teamPlaybooksCount: teamPlaybooks.length,
        teamPlaybookIds: teamPlaybooks.map((pb) => pb.id),
        selectedPlaybookId,
        allPlaysCount: allPlaysForStats.length,
        playSample: allPlaysForStats.slice(0, 3).map((p) => ({
          id: p.id,
          name: p.play_name,
          formation: p.formation,
          playbook_id: p.playbook_id,
        })),
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          orientation: window.screen.orientation?.type,
        },
      });
    }
  }, [
    isMobileOrTablet,
    activeTeamId,
    teamPlaybooks,
    selectedPlaybookId,
    allPlaysForStats,
  ]);

  // Initialize selected playbook from preferences or default to first playbook with data
  useEffect(() => {
    if (teamPlaybooks.length === 0) return;

    // Try to load from preferences
    const savedPlaybookId = localStorage.getItem(
      `bc_active_playbook_${activeTeamId}`
    );

    if (
      savedPlaybookId &&
      teamPlaybooks.some((pb) => pb.id === savedPlaybookId)
    ) {
      // Use saved preference if it's valid
      setSelectedPlaybookId(savedPlaybookId);
    } else {
      // Default to first playbook with plays, or first playbook
      const playbookWithPlays = teamPlaybooks.find(
        (pb) => (pb.play_count || 0) > 0
      );
      const defaultPlaybook = playbookWithPlays || teamPlaybooks[0];
      setSelectedPlaybookId(defaultPlaybook.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTeamId, teamPlaybooks.length]);

  // Save preference when playbook changes
  const handlePlaybookChange = useCallback(
    (playbookId: string) => {
      setSelectedPlaybookId(playbookId);
      localStorage.setItem(`bc_active_playbook_${activeTeamId}`, playbookId);
      debug(`[PlaybookPage] Switched to playbook: ${playbookId}`);
    },
    [activeTeamId]
  );

  const activePlaybookId = selectedPlaybookId || activeTeamId || ""; // Fallback to team_id

  // 🚀 INSTANT SEARCH: No debounce! Array filtering is fast enough (<10ms for 200 plays)
  // With memoization, this feels Facebook-instant on every keystroke
  const debouncedSearchQuery = state.searchQuery; // Direct use, no debouncing (keeping var name for compatibility)
  const selectedFiltersKey = JSON.stringify(state.selectedFilters ?? {});

  useEffect(() => {
    if (!isMobileOrTablet) return;
    setMobileListExpanded(false);
  }, [isMobileOrTablet, debouncedSearchQuery, selectedFiltersKey]);

  const [diagramPlay, setDiagramPlay] = useState<Play | null>(null);
  const [diagramMode, setDiagramMode] = useState<"edit" | "quick-play">("edit");
  const [assignmentsPlay, setAssignmentsPlay] = useState<Play | null>(null);
  const [editingScript, setEditingScript] = useState<PracticeScript | null>(
    null
  );
  const [showPracticeScriptModal, setShowPracticeScriptModal] = useState(false);
  const [selectedPlaysForPractice, setSelectedPlaysForPractice] = useState<
    string[]
  >([]);
  const [suggestions, setSuggestions] = useState({
    formations: [] as string[],
    playNames: [] as string[],
    personnel: [] as string[],
  });

  // 🚀 PERFORMANCE: Centralized modal state management (must be before callbacks that use it)
  const { openModal, closeModal, closeAllModals, isModalOpen } =
    useModalManager();

  // Modal-specific data (kept separate since not all modals need data)
  const [playToPost, setPlayToPost] = useState<Play | null>(null);

  // 🚀 PERFORMANCE: Optimistic play updates (Facebook-fast pattern)
  const { optimisticPlays, handleCreatePlay, handleSavePlay } =
    useOptimisticPlays(activePlaybookId, () =>
      dispatch({ type: "INCREMENT_REFRESH" })
    );

  // Handle opening assignments for a play
  const handleOpenAssignments = useCallback((play: Play) => {
    setAssignmentsPlay(play);
    debug("Opening assignments for play:", play);
  }, []);

  // Handle posting play to team bulletin
  const handlePostToTeamBulletin = useCallback(
    (play: Play) => {
      setPlayToPost(play);
      openModal("postToBulletin");
      debug("Posting play to team bulletin:", play);
    },
    [openModal]
  );

  const [recentActivities, setRecentActivities] = useState<PlayActivityItem[]>(
    []
  );

  // Fullscreen diagram viewer state
  const [fullscreenPlayIndex, setFullscreenPlayIndex] = useState<number | null>(
    null
  );
  const [fullscreenPlays, setFullscreenPlays] = useState<Play[]>([]);

  // Handle entering fullscreen presentation mode
  const handleEnterFullscreen = useCallback(
    (plays: Play[], playIndex: number) => {
      console.log("[PlaybookPage] Entering fullscreen mode", {
        playCount: plays.length,
        startIndex: playIndex,
      });
      setFullscreenPlays(plays);
      setFullscreenPlayIndex(playIndex);
    },
    []
  );

  // Handle exiting fullscreen
  const handleExitFullscreen = useCallback(() => {
    console.log("[PlaybookPage] Exiting fullscreen mode");
    setFullscreenPlayIndex(null);
    setFullscreenPlays([]);
  }, []);

  // Helper to refresh recent activities
  const refreshActivities = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const activities = await ActivityService.getRecentActivities(
        activeTeamId || undefined,
        10
      );
      setRecentActivities(activities);
      debug(`Refreshed ${activities.length} recent activities`);
    } catch (err) {
      logError("Failed to refresh recent activities:", err);
    }
  }, [activeTeamId]);

  // Load recent activities on mount
  useEffect(() => {
    const loadActivities = async () => {
      try {
        // Only load activities if user is authenticated
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          debug("Skipping activities load - user not authenticated yet");
          return;
        }

        const activities = await ActivityService.getRecentActivities(
          activeTeamId || undefined,
          10
        );
        setRecentActivities(activities);
        debug(`Loaded ${activities.length} recent activities`);
      } catch (err) {
        logError("Failed to load recent activities:", err);
      }
    };

    void loadActivities();
  }, [activeTeamId]);

  // 🚀 PERFORMANCE: Consolidated stats hook with intelligent memoization
  const formationAudit = useFormationAudit(activePlaybookId || null);
  const playbookStats = usePlaybookStats(
    allPlaysForStats as unknown as Play[],
    allFormations,
    recentActivities,
    (formationAudit.plays || []) as unknown as Play[]
  );

  // Extract individual stats for backward compatibility
  const formationAuditSummary = playbookStats.formationAudit;

  const [_selectedPlayForWorkflow, _setSelectedPlayForWorkflow] =
    useState<Play | null>(null);

  // 🚀 PERFORMANCE: Memoize handlers to prevent unnecessary re-renders of child components
  const handleViewChange = useCallback(
    (view: CoachingView) => {
      dispatch({ type: "SET_VIEW", view });
      // Record user action for smart preloading
      smartPreloader.recordAction("change_view", `view_${view}`);
    },
    [dispatch]
  );

  const handleTeamTypeChange = (
    teamType: "offense" | "defense" | "special-teams"
  ) => dispatch({ type: "SET_TEAM_TYPE", teamType });

  const handleFiltersChange = useCallback(
    (filters: PlaybookState["advancedFilters"]) => {
      triggerHapticFeedback("selection");
      dispatch({ type: "SET_ADVANCED_FILTERS", filters });
    },
    [dispatch]
  );

  const handleClearSelection = () => dispatch({ type: "CLEAR_SELECTION" });

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
          // Open practice script builder with selected plays
          {
            const selectedPlayIds = Array.from(state.selectedPlayIds || []);
            if (selectedPlayIds.length > 0) {
              console.log(
                "[PlaybookPage] Opening Practice Script Builder with plays:",
                selectedPlayIds
              );
              setSelectedPlaysForPractice(selectedPlayIds);
              openModal("practiceScriptBuilder");
            }
          }
          break;

        case "batch-edit":
          toast.info(`Batch editing ${selectedCount} plays (coming soon)`);
          break;

        case "export":
          // Export selected plays to JSON
          {
            const selectedPlayIds = Array.from(state.selectedPlayIds || []);

            if (selectedPlayIds.length > 0) {
              (async () => {
                try {
                  // Fetch plays by IDs using service
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
          // Confirm and delete plays
          if (
            window.confirm(
              `Are you sure you want to delete ${selectedCount} ${selectedCount === 1 ? "play" : "plays"}?`
            )
          ) {
            (async () => {
              try {
                const selectedPlayIds = Array.from(state.selectedPlayIds || []);
                await PlaysService.deletePlays(selectedPlayIds);

                // Refresh the plays list
                dispatch({ type: "CLEAR_SELECTION" });

                // Refresh activities to show deleted plays
                await refreshActivities();

                toast.success(
                  `Deleted ${selectedCount} ${selectedCount === 1 ? "play" : "plays"}`
                );
              } catch (err) {
                logError("Bulk delete failed:", err);
                toast.error("Failed to delete plays");
              }
            })();
          }
          break;

        default:
          break;
      }
    },
    [state.selectedPlayIds, toast, dispatch, refreshActivities, openModal]
  );

  // Play count handler - updates state when PlayGrid reports actual play count
  const handlePlayCountChange = useCallback(
    (count: number) => {
      dispatch({ type: "SET_PLAYS_CREATED", count });
    },
    [dispatch]
  );

  // Modal handlers
  const handleOpenBuilder = useCallback(() => {
    triggerHapticFeedback("light");
    openModal("addNewPlay");
    // Record user action for smart preloading
    smartPreloader.recordAction("open_modal", "formation_builder");
  }, [openModal]);

  const handleOpenQuickCreate = useCallback(() => {
    triggerHapticFeedback("light");
    openModal("addNewPlay");
    setDiagramMode("quick-play");
    setDiagramPlay(null); // Clear any existing play
    // Record user action for smart preloading
    smartPreloader.recordAction("open_modal", "quick_create");
  }, [openModal]);

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
    [openModal]
  );

  const handleOpenKeyboardShortcuts = useCallback(() => {
    triggerHapticFeedback("light");
    openModal("keyboardShortcuts");
  }, [openModal]);

  useEffect(() => {
    if (!allPlaysForStats || allPlaysForStats.length === 0) return;

    const invalidPlays = allPlaysForStats.filter((play) => {
      if (!play || !play.id) return false;
      const formationValue =
        typeof play.formation === "string" ? play.formation : "";
      if (!formationValue.trim()) return false;
      // Simplified validation - just check if formation looks like personnel
      const looksLikePersonnel = /^\d{2}$/.test(formationValue);
      return (
        looksLikePersonnel && !sanitizedFormationIdsRef.current.has(play.id)
      );
    });

    if (invalidPlays.length === 0) return;

    void (async () => {
      let didUpdate = false;

      for (const play of invalidPlays) {
        sanitizedFormationIdsRef.current.add(play.id);
        try {
          await SecurePlaysService.updatePlay(play.id, {
            formation: null,
            formation_id: null,
          });
          didUpdate = true;
          toast.warning(
            `Cleared invalid formation "${play.formation}" from ${play.play_name || "a play"}.`
          );
        } catch (error) {
          sanitizedFormationIdsRef.current.delete(play.id);
          logError("Failed to sanitize formation", error);
        }
      }

      if (didUpdate) {
        dispatch({ type: "INCREMENT_REFRESH" });
      }
    })();
  }, [allPlaysForStats, dispatch, toast]);

  // 🚀 PRELOAD HEAVY MODALS: Load during idle time for instant open (Facebook pattern!)
  useEffect(() => {
    // Wait 2s after page load, then preload heavy components
    const preloadTimer = setTimeout(() => {
      debug("[PlaybookPage] Preloading heavy modals during idle time...");

      // Preload AddNewPlayModal
      import("../components/playbook/AddNewPlayModal").catch(() => {
        // Silent fail
      });

      // ✅ NEW: Preload PracticeScriptBuilder (heavy component)
      import("../components/playbook/PracticeScriptBuilder").catch(() => {
        // Silent fail
      });

      // ✅ NEW: Preload PlaybookSettingsModal
      import("../components/playbook/PlaybookSettingsModal").catch(() => {
        // Silent fail
      });

      debug("[PlaybookPage] Modal preload complete! (3 heavy components)");
    }, 2000); // 2s delay = page is loaded, user settling in

    return () => clearTimeout(preloadTimer);
  }, []); // Run once on mount

  // ✅ KEYBOARD SHORTCUTS: Power user features
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Quick search (focus search input)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector(
          "[data-search-input]"
        ) as HTMLInputElement;
        searchInput?.focus();
        return;
      }

      // Cmd/Ctrl + N: New play
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        handleOpenBuilder();
        return;
      }

      // Escape: Close all modals
      if (e.key === "Escape") {
        closeAllModals();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleOpenBuilder, dispatch, closeAllModals]);

  // Handle pull-to-refresh on mobile
  const handlePullRefresh = useCallback(async () => {
    try {
      // Simulate a small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch({ type: "INCREMENT_REFRESH" });
      toast.success("Plays refreshed");
    } catch (error) {
      logError("Failed to refresh plays:", error);
      toast.error("Failed to refresh plays");
    }
  }, [dispatch, toast]);

  // Note: handleSaveDiagram is commented out - old complex diagram functionality
  // Keeping for reference but not using with new simple approach
  /*
  const _handleSaveDiagram = useCallback(
    async ({
      doc,
      metadata,
    }: {
      doc: DiagramDocument;
      metadata: DiagramMetadata;
    }) => {
      if (!diagramPlay || !activeTeamId) return;

      // Get the diagram mode and appropriate messaging
      const mode = getDiagramMode(diagramPlay);
      const actionText = getDiagramActionText(mode);

      try {
        // Use the service to handle the save logic
        const result = await saveDiagram(
          diagramPlay,
          activeTeamId,
          doc,
          metadata
        );

        if (result.success) {
          dispatch({ type: "INCREMENT_REFRESH" });

          // Handle post-save actions based on mode
          if (mode === DiagramMode.WHITEBOARD) {
            // Close the diagram editor after creating play from whiteboard
            setDiagramPlay(null);
            toast.success(actionText.successMessage, metadata.play_name);

            if (result.play) {
              info("Created play from whiteboard:", result.play);
            }
          } else {
            // Update the current diagram play state
            setDiagramPlay((prev) =>
              prev
                ? {
                    ...prev,
                    play_name: metadata.play_name,
                    formation: metadata.formation,
                    diagram_url: JSON.stringify(doc),
                    updated_at: new Date(),
                  }
                : prev
            );
            toast.success(actionText.successMessage, metadata.play_name);
          }
        } else {
          throw new Error(result.error || actionText.errorMessage);
        }
      } catch (error) {
        const actionText = getDiagramActionText(mode);
        logError("Failed to save diagram:", error);
        toast.error(
          actionText.errorMessage,
          error instanceof Error ? error.message : "Please try again"
        );
        throw error;
      }
    },
    [diagramPlay, dispatch, toast, activeTeamId]
  );
  */

  const handleDuplicatePlay = useCallback(
    async (play: Play, flip: boolean = false) => {
      triggerHapticFeedback("selection");

      let duplicatedPlay: Play = {
        ...play,
        id: "", // Will be set by the database
        play_name: `Copy of ${play.play_name}`,
        created_at: new Date(),
        updated_at: new Date(),
        times_called: 0,
        times_successful: 0,
      };

      // If flipping, update formation and diagram
      if (flip) {
        try {
          // Get opposite formation variant
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

          // Flip play name if it contains Left/Right
          duplicatedPlay.play_name = flipPlayName(play.play_name);

          // Flip formation direction (f_dir field)
          duplicatedPlay.f_dir = flipFormationDirection(play.f_dir ?? "");

          // Flip play direction (p_dir field)
          duplicatedPlay.p_dir = flipFormationDirection(play.p_dir ?? "");

          // Flip diagram positions
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

  // Workflow handlers
  const handleAddToPracticeScript = useCallback(
    async (play: Play) => {
      triggerHapticFeedback("success");
      try {
        if (!activeTeamId) {
          toast.error("No active team selected");
          return;
        }
        const script = await PracticeScriptService.createQuickScript(
          play,
          activeTeamId
        );
        info(`Added "${play.play_name}" to practice script: "${script.name}"`);

        // Refresh activities to show the new "added_to_script" activity
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

  // Practice Script Modal handlers
  const handleOpenPracticeScriptBuilder = useCallback(
    (script?: PracticeScript) => {
      triggerHapticFeedback("light");
      setEditingScript(script || null);
      setShowPracticeScriptModal(true);
    },
    []
  );

  const handleQuickNewPracticeScript = useCallback(() => {
    triggerHapticFeedback("light");
    setEditingScript(null);
    setShowPracticeScriptModal(true);
  }, []);

  const handleSavePracticeScript = useCallback(
    async (script: Partial<PracticeScript>) => {
      try {
        console.log("💾 Saving practice script:", {
          script,
          playCount: script.plays?.length || 0,
        });

        let savedScriptId: string;

        if (script.id) {
          // Update existing script metadata
          await PracticeScriptService.updatePracticeScript(script.id, {
            name: script.title || script.name || "Untitled Script",
            description: script.description,
            tags: script.tags,
          });
          savedScriptId = script.id;
          console.log("✅ Updated script metadata:", savedScriptId);
        } else {
          // Create new script
          const newScript = await PracticeScriptService.createPracticeScript({
            name: script.title || script.name || "Untitled Script",
            description: script.description,
            teamId: activeTeamId!,
            tags: script.tags,
          });
          savedScriptId = newScript.id;
          console.log("✅ Created new script:", savedScriptId);
        }

        // Now save the plays if any were provided
        if (script.plays && script.plays.length > 0) {
          console.log("📝 Saving", script.plays.length, "plays to script");

          // First, clear existing plays if updating (to avoid duplicates)
          if (script.id) {
            const { error: deleteError } = await supabase
              .from("practice_script_plays")
              .delete()
              .eq("practice_script_id", savedScriptId);

            if (deleteError) {
              console.error("Error clearing existing plays:", deleteError);
            }
          }

          // Add each play to the script
          for (let i = 0; i < script.plays.length; i++) {
            const play = script.plays[i];

            if (!play.playId) {
              console.warn("Skipping play without playId:", play);
              continue;
            }

            // Validate play data before saving
            const validationErrors = validateModalPlay(play);
            if (validationErrors.length > 0) {
              console.error(
                "Invalid play data:",
                play.playName,
                validationErrors
              );
              toast.error(
                `Skipped play "${play.playName}": ${validationErrors.join(", ")}`
              );
              continue;
            }

            try {
              // Use type adapter to convert modal play to service format
              const servicePlay = modalPlayToServicePlay(play, i + 1);
              servicePlay.scriptId = savedScriptId;

              // Create minimal play object for activity logging
              const playForActivity = {
                id: play.playId,
                play_name: play.playName,
                team_id: activeTeamId,
              } as any;

              await PracticeScriptService.addPlayToScript(
                servicePlay,
                playForActivity
              );
              console.log("✅ Added play", i + 1, ":", play.playName);
            } catch (playError) {
              console.error("Failed to add play:", play.playName, playError);
              toast.error(`Failed to add play "${play.playName}"`);
              // Continue with other plays even if one fails
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
    [activeTeamId, toast]
  );

  const handleQuickNewGamePlan = useCallback(() => {
    triggerHapticFeedback("light");
    navigate("/game-plans");
  }, [navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + P for new practice script
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "p" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        handleQuickNewPracticeScript();
      }
      // Ctrl/Cmd + G for new game plan
      if ((event.ctrlKey || event.metaKey) && event.key === "g") {
        event.preventDefault();
        handleQuickNewGamePlan();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleQuickNewPracticeScript, handleQuickNewGamePlan]);

  // Load suggestions for inline editing
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const [formations, playNames, personnel] = await Promise.all([
          PlaysService.getUniqueFormations(),
          PlaysService.getUniquePlayNames(),
          PlaysService.getUniquePersonnel(),
        ]);

        setSuggestions({
          formations,
          playNames,
          personnel,
        });
      } catch (error) {
        logError("Failed to load suggestions:", error);
        // Continue with empty suggestions - the UI will still work
      }
    };

    loadSuggestions();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Unified Header with Navigation (includes Breadcrumb + PlaybookSelector) */}
      <PlaybookViewTabs
        currentView={state.currentView}
        onViewChange={handleViewChange}
        currentTeamType={state.currentTeamType}
        onTeamTypeChange={handleTeamTypeChange}
        onOpenSettings={handleOpenSettings}
        onOpenBuilder={handleOpenBuilder}
        onOpenPersonnel={handleOpenPersonnel}
        onOpenHealth={() => openModal("playbookHealth")}
        onNavigate={(path) => {
          if (path === "/playbook/formations") {
            openModal("formationLibrary");
          } else if (path === "/playbook/personnel") {
            openModal("personnelLibrary");
          } else {
            navigate(path);
          }
        }}
        title="Playbook"
        playsCreated={state.playsCreated}
        diagramCoverage={state.diagramCoverage}
        streakDays={state.streakDays}
        playbooks={teamPlaybooks}
        activePlaybookId={activePlaybookId}
        onPlaybookChange={handlePlaybookChange}
        onPlaybookUpdated={refreshData}
        teamId={activeTeamId || ""}
        onCSVImportComplete={() => {
          refreshData();
          dispatch({ type: "INCREMENT_REFRESH" });
        }}
      />

      {/* Mobile/Tablet-First Layout (< 1024px) */}
      {isMobileOrTablet ? (
        <MobilePlaybookView
          state={state}
          mobileListExpanded={mobileListExpanded}
          showFiltersSheet={isModalOpen("filtersSheet")}
          showStatsSheet={isModalOpen("statsSheet")}
          debouncedSearchQuery={debouncedSearchQuery}
          optimisticPlays={optimisticPlays}
          formationAudit={formationAudit}
          formationAuditSummary={formationAuditSummary}
          setMobileListExpanded={setMobileListExpanded}
          setShowFiltersSheet={(show) =>
            show ? openModal("filtersSheet") : closeModal()
          }
          setShowStatsSheet={(show) =>
            show ? openModal("statsSheet") : closeModal()
          }
          handleOpenQuickCreate={handleOpenQuickCreate}
          handleOpenPersonnel={handleOpenPersonnel}
          handleOpenSettings={handleOpenSettings}
          handleEditPlay={handleEditPlay}
          handleQuickNewPracticeScript={handleQuickNewPracticeScript}
          handleQuickNewGamePlan={handleQuickNewGamePlan}
          handleOpenKeyboardShortcuts={handleOpenKeyboardShortcuts}
          handlePullRefresh={handlePullRefresh}
          handleSavePlay={handleSavePlay}
          handleDuplicatePlay={handleDuplicatePlay}
          handleOpenBuilder={handleOpenBuilder}
          handleOpenAssignments={handleOpenAssignments}
          handlePostToTeamBulletin={handlePostToTeamBulletin}
          handleAddToPracticeScript={handleAddToPracticeScript}
          handleAddToGamePlan={handleAddToGamePlan}
          handlePlayCountChange={handlePlayCountChange}
          dispatch={dispatch}
          mobileButtonSize={mobileButtonSize}
          mobileSecondaryButtonSize={mobileSecondaryButtonSize}
          suggestions={suggestions}
        />
      ) : (
        <DesktopPlaybookView
          state={state}
          debouncedSearchQuery={debouncedSearchQuery}
          optimisticPlays={optimisticPlays}
          formationAudit={formationAudit}
          playbookStats={playbookStats}
          activeTeamId={activeTeamId}
          handleEditPlay={handleEditPlay}
          handleSavePlay={handleSavePlay}
          handleOpenBuilder={handleOpenBuilder}
          handleQuickNewGamePlan={handleQuickNewGamePlan}
          handleDuplicatePlay={handleDuplicatePlay}
          handleOpenAssignments={handleOpenAssignments}
          handlePostToTeamBulletin={handlePostToTeamBulletin}
          handleAddToPracticeScript={handleAddToPracticeScript}
          handleAddToGamePlan={handleAddToGamePlan}
          handlePlayCountChange={handlePlayCountChange}
          handleOpenPracticeScriptBuilder={handleOpenPracticeScriptBuilder}
          handleFiltersChange={handleFiltersChange}
          handleClearSelection={handleClearSelection}
          handleBulkAction={handleBulkAction}
          handleEnterFullscreen={handleEnterFullscreen}
          dispatch={dispatch}
          navigate={navigate}
          suggestions={suggestions}
          mobileButtonSize={mobileButtonSize}
        />
      )}

      {/* Modals */}
      <PlaybookModals
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        diagramPlay={diagramPlay}
        diagramMode={diagramMode}
        assignmentsPlay={assignmentsPlay}
        editingScript={editingScript}
        playToPost={playToPost}
        setDiagramPlay={setDiagramPlay}
        setAssignmentsPlay={setAssignmentsPlay}
        setEditingScript={setEditingScript}
        setPlayToPost={setPlayToPost}
        activeTeamId={activeTeamId}
        activePlaybookId={activePlaybookId}
        selectedPlaysForPractice={selectedPlaysForPractice}
        setSelectedPlaysForPractice={setSelectedPlaysForPractice}
        existingPlays={allPlaysForStats.map((play) => ({
          ...play,
          confidence_base: play.confidence_base ?? 3,
          times_called: play.times_called ?? 0,
          times_successful: play.times_successful ?? 0,
          created_by: "",
          created_at: new Date(play.created_at),
          updated_at: new Date(play.updated_at),
          diagram_data:
            typeof play.diagram_data === "string"
              ? JSON.parse(play.diagram_data)
              : play.diagram_data,
        }))}
        handleCreatePlay={handleCreatePlay}
        handleSavePlay={handleSavePlay}
        dispatch={dispatch}
      />

      {/* Mobile/Tablet Filters Bottom Sheet */}
      {isMobileOrTablet && isModalOpen("filtersSheet") && (
        <BottomSheet
          snapPoints={[0.1, 0.6, 0.9]}
          initialSnapPoint={1}
          onSnapPointChange={(snapPoint) => {
            // Close when fully minimized
            if (snapPoint < 0.15) {
              closeModal();
            }
          }}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-muted">
              <Typography variant="headline-md" className="text-primary">
                Filters & Search
              </Typography>
              <Button onClick={closeModal} variant="ghost" size="sm">
                <Icon name="close" className="h-5 w-5" />
              </Button>
            </div>

            {/* Scrollable Filters Content */}
            <div className="flex-1 overflow-y-auto p-6 pb-20">
              <AdvancedFilters
                activeFilters={state.advancedFilters}
                onFiltersChange={handleFiltersChange}
              />
            </div>

            {/* Action Footer - Fixed at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-primary border-t border-muted shadow-lg">
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    dispatch({ type: "SET_ADVANCED_FILTERS", filters: [] });
                    closeModal();
                  }}
                  variant="secondary"
                  size={mobileSecondaryButtonSize}
                  className="flex-1"
                >
                  Clear All
                </Button>
                <Button
                  onClick={closeModal}
                  variant="primary"
                  size={mobileButtonSize}
                  className="flex-1"
                >
                  <Icon name="check" className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
              {Object.keys(state.advancedFilters).length > 0 && (
                <p className="text-center text-xs text-secondary mt-2">
                  {Object.keys(state.advancedFilters).length} filter
                  {Object.keys(state.advancedFilters).length === 1
                    ? ""
                    : "s"}{" "}
                  active
                </p>
              )}
            </div>
          </div>
        </BottomSheet>
      )}

      {/* Bulk Actions Floating Toolbar */}
      <BulkActionsToolbar
        selectedCount={state.selectedPlayIds?.size || 0}
        onClearSelection={() => dispatch({ type: "CLEAR_SELECTION" })}
        onBulkAction={handleBulkAction}
      />

      {/* Fullscreen Diagram Viewer */}
      {fullscreenPlayIndex !== null && fullscreenPlays.length > 0 && (
        <FullscreenDiagramViewer
          plays={fullscreenPlays}
          initialPlayIndex={fullscreenPlayIndex}
          onClose={handleExitFullscreen}
        />
      )}

      {/* Formation Library Modal */}
      <FormationLibraryModal
        isOpen={isModalOpen("formationLibrary")}
        onClose={closeModal}
        playbookId={activePlaybookId}
      />

      {/* Personnel Library Modal */}
      <PersonnelLibraryModal
        isOpen={isModalOpen("personnelLibrary")}
        onClose={closeModal}
        playbookId={activePlaybookId}
      />

      {/* Practice Script Modal */}
      {showPracticeScriptModal && (
        <React.Suspense
          fallback={
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-modal">
              <div className="text-white">Loading...</div>
            </div>
          }
        >
          <PracticeScriptModal
            editingScript={editingScript}
            onClose={() => {
              setShowPracticeScriptModal(false);
              setEditingScript(null);
            }}
            onSave={handleSavePracticeScript}
          />
        </React.Suspense>
      )}
    </div>
  );
};

PlaybookPage.displayName = "PlaybookPage";

export default React.memo(PlaybookPage);
