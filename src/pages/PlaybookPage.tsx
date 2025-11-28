import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
import { WorkflowStatusBar } from "../components/playbook/WorkflowStatusBar";

// import { AnalyticsDashboard } from "../components/analytics/AnalyticsDashboard";
import { useToast } from "../hooks/useToast";
import type { Play } from "../types/play";

import { useActiveTeamStore } from "../stores/activeTeamStore";
import { useTeamsData } from "../hooks/useTeamsData";

import { Aurora } from "../components/ui/Aurora";
import {
  getOppositeFormationVariant,
  flipDiagramPositions,
  flipPlayName,
  flipFormationDirection,
} from "../utils/formationFlipHelpers";
import { supabase } from "../lib/supabase";
import { info, error as logError, debug } from "../utils/logger";
import { useIsMobile } from "../hooks/useBreakpoint";
import { useMobileButtonProps } from "../hooks/useMobileButtonProps";

import { BottomSheet } from "../components/BottomSheet";

import { triggerHapticFeedback } from "../lib/hapticFeedback";
import { smartPreloader } from "../services/smartPreloader";

import { useFormationAudit } from "../hooks/useFormationAudit";
import { MobilePlaybookView } from "../components/playbook/page/MobilePlaybookView";
import { DesktopPlaybookView } from "../components/playbook/page/DesktopPlaybookView";
import { PlaybookModals } from "../components/playbook/page/PlaybookModals";

// Lazy load modal components for code splitting (~120KB savings)

export default function PlaybookPage() {
  const { state, dispatch } = usePlaybook();
  const toast = useToast();
  const navigate = useNavigate();
  const { activeTeamId } = useActiveTeamStore();
  const isMobile = useIsMobile();
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
  const teamPlaybooks = useMemo(
    () => playbooks.filter((pb) => pb.team_id === activeTeamId && pb.is_active),
    [playbooks, activeTeamId]
  );

  // State for selected playbook (with preference persistence)
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string>("");

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
  const selectedFiltersKey = useMemo(
    () => JSON.stringify(state.selectedFilters ?? {}),
    [state.selectedFilters]
  );

  useEffect(() => {
    if (!isMobile) return;
    setMobileListExpanded(false);
  }, [isMobile, debouncedSearchQuery, selectedFiltersKey]);

  const [diagramPlay, setDiagramPlay] = useState<Play | null>(null);
  const [diagramMode, setDiagramMode] = useState<"edit" | "quick-play">("edit");
  const [assignmentsPlay, setAssignmentsPlay] = useState<Play | null>(null);
  const [showPracticeScriptBuilder, setShowPracticeScriptBuilder] =
    useState(false);
  const [editingScript, setEditingScript] = useState<any>(null); // TODO: Use proper PracticeScript type
  const [selectedPlaysForPractice, setSelectedPlaysForPractice] = useState<
    string[]
  >([]);
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);
  const [suggestions, setSuggestions] = useState({
    formations: [] as string[],
    playNames: [] as string[],
    personnel: [] as string[],
  });

  // Handle opening assignments for a play
  const handleOpenAssignments = useCallback((play: Play) => {
    setAssignmentsPlay(play);
    debug("Opening assignments for play:", play);
  }, []);

  // Handle posting play to team bulletin
  const handlePostToTeamBulletin = useCallback((play: Play) => {
    setPlayToPost(play);
    setShowPostToBulletinModal(true);
    debug("Posting play to team bulletin:", play);
  }, []);

  const [recentActivities, setRecentActivities] = useState<PlayActivityItem[]>(
    []
  );

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

  // Get real play data for stats calculation
  // 🚀 PERFORMANCE: Memoize playbook stats calculation from REAL data
  const playbookStats = useMemo(() => {
    // Calculate real stats from actual data
    const totalPlays = allPlaysForStats.length;
    const playsWithDiagrams = allPlaysForStats.filter(
      (play) => play.diagram_url || play.diagram_data
    ).length;

    // Count unique formations
    const uniqueFormations = new Set(
      allPlaysForStats.map((play) => play.formation).filter(Boolean)
    );
    const formationsCount = Math.max(
      allFormations.length,
      uniqueFormations.size
    );

    // Count play types from actual data
    const passPlays = allPlaysForStats.filter(
      (play) => play.p_type?.toLowerCase() === "pass"
    ).length;
    const runPlays = allPlaysForStats.filter(
      (play) => play.p_type?.toLowerCase() === "run"
    ).length;
    const rpoPlays = allPlaysForStats.filter(
      (play) => play.p_type?.toLowerCase() === "rpo"
    ).length;
    const playActionPlays = allPlaysForStats.filter((play) =>
      play.p_type?.toLowerCase()?.includes("play action")
    ).length;

    return {
      totalPlays,
      playsWithDiagrams,
      formationsCount,
      passPlays,
      runPlays,
      rpoPlays,
      playActionPlays,
      recentActivity: recentActivities
        .filter(
          (activity) => activity.activityType !== "deleted" // Filter out deleted activities for dashboard
        )
        .map((activity) => ({
          id: activity.id,
          type: activity.activityType as Exclude<
            typeof activity.activityType,
            "deleted"
          >,
          playName: activity.playName || "Unknown Play",
          timestamp: new Date(activity.createdAt),
          details: activity.details
            ? JSON.stringify(activity.details)
            : undefined,
        })),
    };
  }, [allPlaysForStats, allFormations, recentActivities]); // Use real data dependencies

  const formationAudit = useFormationAudit(activePlaybookId || null);

  const formationAuditSummary = useMemo(() => {
    if (!formationAudit.plays || formationAudit.plays.length === 0) {
      return { needsMapping: 0, resolved: 0, total: 0 };
    }
    const needsMapping = formationAudit.plays.length;

    return {
      needsMapping,
      resolved: 0,
      total: needsMapping,
    };
  }, [formationAudit.plays]);

  const [_selectedPlayForWorkflow, _setSelectedPlayForWorkflow] =
    useState<Play | null>(null);

  // New modals
  const [showAddNewPlayModal, setShowAddNewPlayModal] = useState(false);
  const [showPlaybookSettingsModal, setShowPlaybookSettingsModal] =
    useState(false);
  const [showPersonnelModal, setShowPersonnelModal] = useState(false);
  const [showPlaybookHealthModal, setShowPlaybookHealthModal] = useState(false);
  const [showStatsSheet, setShowStatsSheet] = useState(false);
  const [showPostToBulletinModal, setShowPostToBulletinModal] = useState(false);
  const [playToPost, setPlayToPost] = useState<Play | null>(null);
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [showKeyboardShortcutsModal, setShowKeyboardShortcutsModal] =
    useState(false);

  // 🚀 PERFORMANCE: Optimistic updates for instant UI feedback
  // Shows plays immediately while database operations happen in background
  const [optimisticPlays, setOptimisticPlays] = useState<Play[]>([]);

  // 🚀 PERFORMANCE: Memoize handlers to prevent unnecessary re-renders of child components
  const handleViewChange = useCallback(
    (view: CoachingView) => {
      dispatch({ type: "SET_VIEW", view });
      // Record user action for smart preloading
      smartPreloader.recordAction("change_view", `view_${view}`);
    },
    [dispatch]
  );

  const handleTeamTypeChange = useCallback(
    (teamType: "offense" | "defense" | "special-teams") =>
      dispatch({ type: "SET_TEAM_TYPE", teamType }),
    [dispatch]
  );

  const handleFiltersChange = useCallback(
    (filters: PlaybookState["advancedFilters"]) => {
      triggerHapticFeedback("selection");
      dispatch({ type: "SET_ADVANCED_FILTERS", filters });
    },
    [dispatch]
  );

  const handleClearSelection = useCallback(
    () => dispatch({ type: "CLEAR_SELECTION" }),
    [dispatch]
  );

  const handleBulkAction = useCallback(
    (action: string) => {
      const selectedCount = state.selectedPlayIds?.size || 0;

      if (selectedCount === 0) {
        toast.warning("No plays selected");
        return;
      }

      switch (action) {
        case "add-tags":
          // TODO: Open bulk tagging modal
          toast.info(`Bulk tagging ${selectedCount} plays (coming soon)`);
          break;

        case "duplicate":
          // TODO: Implement bulk duplicate
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
              setShowPracticeScriptBuilder(true);
            }
          }
          break;

        case "batch-edit":
          // TODO: Open batch edit modal
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
    [state.selectedPlayIds, toast, dispatch, refreshActivities]
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
    setShowAddNewPlayModal(true);
    // Record user action for smart preloading
    smartPreloader.recordAction("open_modal", "formation_builder");
  }, []);

  const handleOpenQuickCreate = useCallback(() => {
    triggerHapticFeedback("light");
    setShowAddNewPlayModal(true);
    setDiagramMode("quick-play");
    setDiagramPlay(null); // Clear any existing play
    // Record user action for smart preloading
    smartPreloader.recordAction("open_modal", "quick_create");
  }, []);

  const handleOpenSettings = useCallback(() => {
    triggerHapticFeedback("light");
    setShowPlaybookSettingsModal(true);
  }, []);

  const handleOpenPersonnel = useCallback(() => {
    triggerHapticFeedback("light");
    setShowPersonnelModal(true);
    smartPreloader.recordAction("open_modal", "personnel_builder");
  }, []);

  const handleEditPlay = useCallback((play: Play) => {
    triggerHapticFeedback("light");
    setDiagramPlay(play);
    setDiagramMode("edit");
    setShowAddNewPlayModal(true);
  }, []);

  const handleOpenKeyboardShortcuts = useCallback(() => {
    triggerHapticFeedback("light");
    setShowKeyboardShortcutsModal(true);
  }, []);

  // 🆕 CREATE NEW PLAY (not update existing)
  const handleCreatePlay = useCallback(
    async (playData: Partial<Play>): Promise<Play | void> => {
      if (!activePlaybookId) {
        toast.error("No active playbook");
        return;
      }

      try {
        // ⚡ OPTIMISTIC: Create temporary play with fake ID for instant feedback
        const tempId = `temp-${Date.now()}`;
        const optimisticPlay: Play = {
          ...playData,
          id: tempId,
          playbook_id: activePlaybookId,
          formation: playData.formation || "",
          play_name: playData.play_name || "",
          p_type: playData.p_type || "",
          confidence_base: playData.confidence_base || 70,
          times_called: 0,
          times_successful: 0,
          created_at: new Date(),
          updated_at: new Date(),
        } as Play;

        setOptimisticPlays((prev) => [optimisticPlay, ...prev]);

        // ⚡ INSTANT FEEDBACK: Show success immediately
        toast.success("Play created!");

        // Background: Create in database
        const createdPlay = await SecurePlaysService.createPlay({
          ...playData,
          playbook_id: activePlaybookId,
        });

        // Replace temp play with real play from database
        setOptimisticPlays((prev) =>
          prev.map((p) => (p.id === tempId ? createdPlay : p))
        );

        // Trigger refresh to sync with database
        dispatch({ type: "INCREMENT_REFRESH" });

        return createdPlay;
      } catch (error) {
        logError("Failed to create play:", error);
        toast.error("Failed to create play");

        // Remove optimistic play on error
        setOptimisticPlays((prev) =>
          prev.filter((p) => !p.id.startsWith("temp-"))
        );
        throw error;
      }
    },
    [activePlaybookId, toast, dispatch]
  );

  const handleUpdatePlay = useCallback(
    async (playId: string, updates: Partial<Play>) => {
      // Store previous state for rollback
      let previousPlay: Play | undefined;

      try {
        // 🚀 OPTIMISTIC UPDATE: Show changes immediately (Facebook-style!)
        setOptimisticPlays((prev) => {
          const existingPlay = prev.find((p) => p.id === playId);
          if (existingPlay) {
            previousPlay = existingPlay; // Save for rollback
            return prev.map((p) =>
              p.id === playId ? { ...p, ...updates } : p
            );
          }
          // If not in optimistic state, create an optimistic entry
          // (This handles edits from plays that came from database)
          return [
            {
              ...updates,
              id: playId,
              playbook_id: activePlaybookId,
              formation: updates.formation || "",
              play_name: updates.play_name || "",
              p_type: updates.p_type || "",
              confidence_base: updates.confidence_base || 70,
              times_called: updates.times_called || 0,
              times_successful: updates.times_successful || 0,
              created_by: updates.created_by || "",
              created_at: updates.created_at || new Date(),
              updated_at: new Date(),
            } as Play,
            ...prev,
          ];
        });

        // ⚡ INSTANT FEEDBACK: Show success immediately (user never waits!)
        toast.success("Play updated!");

        // Background: Update in database
        await SecurePlaysService.updatePlay(playId, updates);

        // Remove from optimistic state after database confirms
        setTimeout(() => {
          setOptimisticPlays((prev) => prev.filter((p) => p.id !== playId));
        }, 100);

        // ✅ NO MORE FULL REFRESH - optimistic updates handle UI
        // Old: dispatch({ type: "INCREMENT_REFRESH" }); // 500ms full reload

        return Promise.resolve();
      } catch (error) {
        // 🔄 REVERT: Restore previous state on error
        if (previousPlay) {
          setOptimisticPlays((prev) =>
            prev.map((p) => (p.id === playId ? previousPlay! : p))
          );
        } else {
          setOptimisticPlays((prev) => prev.filter((p) => p.id !== playId));
        }

        logError("Failed to save play:", error);
        toast.error("Failed to save play. Changes reverted.");
        throw error; // Re-throw so the UI can show the error
      }
    },
    [activePlaybookId, toast]
  );

  // Wrapper for components that expect (play: Play) signature
  const handleSavePlay = useCallback(
    async (play: Play) => {
      await handleUpdatePlay(play.id, play);
    },
    [handleUpdatePlay]
  );

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

      debug("[PlaybookPage] Modal preload complete!");
    }, 2000); // 2s delay = page is loaded, user settling in

    return () => clearTimeout(preloadTimer);
  }, []); // Run once on mount

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

      setShowAddNewPlayModal(true);
    },
    [toast]
  );

  // Workflow handlers
  const handleAddToPracticeScript = useCallback(
    async (play: Play) => {
      triggerHapticFeedback("success");
      try {
        const teamId = "current-team"; // TODO: Get from context/auth
        const script = await PracticeScriptService.createQuickScript(
          play,
          teamId
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
    [toast, refreshActivities]
  );

  const handleAddToGamePlan = useCallback(
    async (_play: Play) => {
      // TODO: Implement game plan integration
      toast.info("Game plan integration coming soon!");
    },
    [toast]
  );

  // Practice Script Builder handlers
  const handleOpenPracticeScriptBuilder = useCallback(() => {
    setEditingScript(null);
    setShowPracticeScriptBuilder(true);
  }, []);

  const handleQuickNewPracticeScript = useCallback(() => {
    triggerHapticFeedback("light");
    navigate("/practice-plans");
  }, [navigate]);

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
    <Aurora variant="field" fullHeight>
      <div className="min-h-screen">
        {/* Unified Header with Navigation (includes Breadcrumb + PlaybookSelector) */}
        <PlaybookViewTabs
          currentView={state.currentView}
          onViewChange={handleViewChange}
          currentTeamType={state.currentTeamType}
          onTeamTypeChange={handleTeamTypeChange}
          onOpenSettings={handleOpenSettings}
          onOpenBuilder={handleOpenBuilder}
          onOpenHealth={() => setShowPlaybookHealthModal(true)}
          onNavigate={navigate}
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

        {/* Mobile-First Layout */}
        {isMobile ? (
          <MobilePlaybookView
            state={state}
            mobileListExpanded={mobileListExpanded}
            showFiltersSheet={showFiltersSheet}
            showStatsSheet={showStatsSheet}
            debouncedSearchQuery={debouncedSearchQuery}
            optimisticPlays={optimisticPlays}
            formationAudit={formationAudit}
            formationAuditSummary={formationAuditSummary}
            setMobileListExpanded={setMobileListExpanded}
            setShowFiltersSheet={setShowFiltersSheet}
            setShowStatsSheet={setShowStatsSheet}
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
            dispatch={dispatch}
            navigate={navigate}
            suggestions={suggestions}
            mobileButtonSize={mobileButtonSize}
          />
        )}

        {/* Sticky Workflow Status Bar */}
        <WorkflowStatusBar />

        {/* Modals */}
        <PlaybookModals
          showAddNewPlayModal={showAddNewPlayModal}
          showPlaybookSettingsModal={showPlaybookSettingsModal}
          showPersonnelModal={showPersonnelModal}
          showPlaybookHealthModal={showPlaybookHealthModal}
          showAssignmentsModal={showAssignmentsModal}
          showKeyboardShortcutsModal={showKeyboardShortcutsModal}
          showPracticeScriptBuilder={showPracticeScriptBuilder}
          showPostToBulletinModal={showPostToBulletinModal}
          diagramPlay={diagramPlay}
          diagramMode={diagramMode}
          assignmentsPlay={assignmentsPlay}
          editingScript={editingScript}
          playToPost={playToPost}
          setShowAddNewPlayModal={setShowAddNewPlayModal}
          setShowPlaybookSettingsModal={setShowPlaybookSettingsModal}
          setShowPersonnelModal={setShowPersonnelModal}
          setShowPlaybookHealthModal={setShowPlaybookHealthModal}
          setShowAssignmentsModal={setShowAssignmentsModal}
          setShowKeyboardShortcutsModal={setShowKeyboardShortcutsModal}
          setShowPracticeScriptBuilder={setShowPracticeScriptBuilder}
          setShowPostToBulletinModal={setShowPostToBulletinModal}
          setDiagramPlay={setDiagramPlay}
          setAssignmentsPlay={setAssignmentsPlay}
          setEditingScript={setEditingScript}
          setPlayToPost={setPlayToPost}
          activeTeamId={activeTeamId}
          activePlaybookId={activePlaybookId}
          selectedPlaysForPractice={selectedPlaysForPractice}
          setSelectedPlaysForPractice={setSelectedPlaysForPractice}
          existingPlays={allPlaysForStats.map(play => ({ ...play, created_by: play.created_by || "" }))}
          handleCreatePlay={handleCreatePlay}
          handleSavePlay={handleSavePlay}
          dispatch={dispatch}
        />

        {/* Mobile Filters Bottom Sheet */}
        {isMobile && showFiltersSheet && (
          <BottomSheet
            snapPoints={[0.1, 0.6, 0.9]}
            initialSnapPoint={1}
            onSnapPointChange={(snapPoint) => {
              // Close when fully minimized
              if (snapPoint < 0.15) {
                setShowFiltersSheet(false);
              }
            }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-4 border-b border-muted">
                <Typography variant="headline-md" className="text-primary">
                  Filters & Search
                </Typography>
                <Button
                  onClick={() => setShowFiltersSheet(false)}
                  variant="ghost"
                  size="sm"
                >
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
                      setShowFiltersSheet(false);
                    }}
                    variant="secondary"
                    size={mobileSecondaryButtonSize}
                    className="flex-1"
                  >
                    Clear All
                  </Button>
                  <Button
                    onClick={() => setShowFiltersSheet(false)}
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
      </div>
    </Aurora>
  );
}
