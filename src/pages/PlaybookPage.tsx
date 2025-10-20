import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PlaybookViewTabs } from "../components/playbook/page/PlaybookViewTabs";
import { PlayGrid } from "../components/playbook/PlayGrid";
import { AdvancedFilters } from "../components/playbook/AdvancedFilters";
import { BulkActionsToolbar } from "../components/playbook/BulkActionsToolbar";
import { SelectionModeToggle } from "../components/playbook/SelectionModeToggle";
import { Button } from "../components/ui/Button/Button";
import { Icon } from "../components/ui/Icon";
import { Typography } from "../components/design-system/Typography";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { usePlaybook } from "../contexts/PlaybookContext";
import type { CoachingView, PlaybookState } from "../contexts/PlaybookContext";
import {
  PlaysService,
  ActivityService,
  PracticeScriptService,
  GamePlanService,
} from "@services";
import { PersonnelService } from "../services/personnelService";
import { exportPlays } from "../services/exportService";
import type { PlayActivityItem } from "@services";
import { SecurePlaysService } from "../services/securePlaysService";
import { WorkflowStatusBar } from "../components/playbook/WorkflowStatusBar";
import { PlaybookStatsDashboard } from "../components/playbook/PlaybookStatsDashboard";
import { RecentActivityFeed } from "../components/playbook/RecentActivityFeed";
import { useToast } from "../hooks/useToast";
import type { Play } from "../types/play";
import { PageLayout } from "../components/layout/PageLayout";
import { Modal } from "../components/ui/Modal";
import type { DiagramMetadata } from "../components/playbook/diagram-editor/DiagramEditor";
import type { DiagramDocument } from "../components/playbook/diagram-editor/types/types";
import { useActiveTeamStore } from "../state/activeTeamStore";
import { useTeamsData } from "../hooks/useTeamsData";
import { AppIconTile } from "../components/ui/AppIconTile";
import { Card } from "../components/ui/Card";
import { Aurora } from "../components/ui/Aurora";
import {
  getOppositeFormationVariant,
  flipDiagramPositions,
  flipPlayName,
  flipFormationDirection,
} from "../utils/formationFlipHelpers";
import { supabase } from "../lib/supabase";
import { info, error as logError, warn, debug } from "../utils/logger";
import {
  createWhiteboardPlay,
  getDiagramMode,
  getDiagramActionText,
  DiagramMode,
} from "../utils/diagramHelpers";
import { saveDiagram } from "../services/diagramService";
import { useIsMobile } from "../hooks/useBreakpoint";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useMobileButtonProps } from "../hooks/useMobileButtonProps";
import {
  MobileCTACard,
  MobileSection,
  MobileQuickActions,
} from "../components/mobile";
import { BottomSheet } from "../components/BottomSheet";
import { FloatingActionButton } from "../components/FloatingActionButton";
import { FABPresets } from "../components/FABPresets";
import { PullToRefresh } from "../components/PullToRefresh";
import { triggerHapticFeedback } from "../lib/hapticFeedback";
import { PlaybookBottomNav } from "../components/playbook/page/PlaybookBottomNav";
import { MobilePlaybookHeader } from "../components/playbook/page/MobilePlaybookHeader";
import { MobileStatsBottomSheet } from "../components/playbook/page/MobileStatsBottomSheet";

// Lazy load modal components for code splitting (~120KB savings)
const AddNewPlayModal = lazy(() =>
  import("../components/playbook/AddNewPlayModal").then((module) => ({
    default: module.AddNewPlayModal,
  }))
);
const PlaybookSettingsModal = lazy(() =>
  import("../components/playbook/PlaybookSettingsModal").then((module) => ({
    default: module.PlaybookSettingsModal,
  }))
);
const PersonnelConfigurationModal = lazy(() =>
  import("../components/playbook/PersonnelConfigurationModal").then(
    (module) => ({
      default: module.PersonnelConfigurationModal,
    })
  )
);
const FormationBuilderModal = lazy(() =>
  import("../components/playbook/FormationBuilderModal").then((module) => ({
    default: module.FormationBuilderModal,
  }))
);
const KeyboardShortcutsGuide = lazy(() =>
  import("../components/playbook/KeyboardShortcutsGuide").then((module) => ({
    default: module.KeyboardShortcutsGuide,
  }))
);
const PlayDiagramBuilder = lazy(() =>
  import("../components/playbook/diagram-editor/DiagramEditor").then(
    (module) => ({
      default: module.DiagramEditor,
    })
  )
);
const PracticeScriptBuilder = lazy(() =>
  import("../components/playbook/PracticeScriptBuilder").then((module) => ({
    default: module.PracticeScriptBuilder,
  }))
);

// Lazy load PracticeScriptList to avoid eager PDF dependency
const PracticeScriptList = lazy(() =>
  import("../components/playbook/PracticeScriptList").then((module) => ({
    default: module.PracticeScriptList,
  }))
);

export default function PlaybookPage() {
  const { state, dispatch } = usePlaybook();
  const toast = useToast();
  const navigate = useNavigate();
  const { activeTeamId } = useActiveTeamStore();
  const isMobile = useIsMobile();
  
  // Mobile-optimized button sizes (44px+ touch targets)
  const mobileButtonSize = useMobileButtonProps("md", true).size;
  const mobileSecondaryButtonSize = useMobileButtonProps("md", false).size;

  // Get playbooks for this team
  const { playbooks, refreshData } = useTeamsData();

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

  // 🚀 PERFORMANCE: Debounce search query to avoid excessive filtering on every keystroke
  // Shows instant "Searching..." feedback while debouncing actual search
  const debouncedSearchQuery = useDebouncedValue(state.searchQuery, 300);
  const isSearchPending = state.searchQuery !== debouncedSearchQuery;

  const [diagramPlay, setDiagramPlay] = useState<Play | null>(null);
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

  // Handle creating a diagram for a play
  const handleCreateDiagram = useCallback((play: Play) => {
    setDiagramPlay(play);
    // TODO: Open diagram builder modal or navigate to diagram route
    debug("Creating diagram for play:", play);
  }, []);

  // Load settings from localStorage or use defaults
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem("boxcall_playbook_settings");
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        // Merge with defaults to ensure all properties exist
        return {
          personnelGrouping: "traditional",
          personnelNaming: "numbers",
          defaultPersonnel: "11",
          defaultFormation: "Shotgun",
          enableAutoTagging: true,
          showComplexity: true,
          theme: "auto",
          gridDensity: "compact",
          // Position names for all 11 players
          positionNames: {
            QB: "QB",
            RB1: "RB1",
            RB2: "RB2",
            WR1: "WR1",
            WR2: "WR2",
            WR3: "WR3",
            TE1: "TE1",
            TE2: "TE2",
            OL1: "LT",
            OL2: "LG",
            OL3: "C",
            OL4: "RG",
            OL5: "RT",
            ...parsedSettings.positionNames,
          },
          // Bulk operations settings
          bulkOperations: {
            enableBulkFormationAdd: false,
            enableBulkPlayAdd: false,
            defaultBulkFormationCount: 5,
            defaultBulkPlayCount: 10,
            ...parsedSettings.bulkOperations,
          },
          ...parsedSettings,
        };
      }
    } catch (error) {
      warn("Failed to load playbook settings from localStorage:", error);
    }

    // Return defaults if no saved settings or error
    return {
      personnelGrouping: "traditional",
      personnelNaming: "numbers",
      defaultPersonnel: "11",
      defaultFormation: "Shotgun",
      enableAutoTagging: true,
      showComplexity: true,
      theme: "auto",
      gridDensity: "compact",
      personnelConfigurations: [],
      // Position names for all 11 players
      positionNames: {
        QB: "QB",
        RB1: "RB1",
        RB2: "RB2",
        WR1: "WR1",
        WR2: "WR2",
        WR3: "WR3",
        TE1: "TE1",
        TE2: "TE2",
        OL1: "LT",
        OL2: "LG",
        OL3: "C",
        OL4: "RG",
        OL5: "RT",
      },
      // Bulk operations settings
      bulkOperations: {
        enableBulkFormationAdd: false,
        enableBulkPlayAdd: false,
        defaultBulkFormationCount: 5,
        defaultBulkPlayCount: 10,
      },
    };
  };

  const [playbookSettings, setPlaybookSettings] = useState(loadSettings);
  const [recentActivities, setRecentActivities] = useState<PlayActivityItem[]>(
    []
  );

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

  // 🚀 PERFORMANCE: Memoize playbook stats calculation to avoid recomputing on every render
  const playbookStats = useMemo(() => {
    return {
      totalPlays: state.playsCreated || 0,
      playsWithDiagrams: Math.floor(
        (state.playsCreated || 0) * (state.diagramCoverage / 100)
      ),
      formationsCount: Math.max(1, Math.floor((state.playsCreated || 0) / 3)), // Rough estimate
      passPlays: Math.floor((state.playsCreated || 0) * 0.4),
      runPlays: Math.floor((state.playsCreated || 0) * 0.4),
      rpoPlays: Math.floor((state.playsCreated || 0) * 0.15),
      playActionPlays: Math.floor((state.playsCreated || 0) * 0.05),
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
  }, [state.playsCreated, state.diagramCoverage, recentActivities]);

  const [_selectedPlayForWorkflow, _setSelectedPlayForWorkflow] =
    useState<Play | null>(null);

  // New modals
  const [showAddNewPlayModal, setShowAddNewPlayModal] = useState(false);
  const [showPlaybookSettingsModal, setShowPlaybookSettingsModal] =
    useState(false);
  const [showPersonnelModal, setShowPersonnelModal] = useState(false);
  const [showFormationBuilderModal, setShowFormationBuilderModal] =
    useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showStatsSheet, setShowStatsSheet] = useState(false);
  const [editingPlay, setEditingPlay] = useState<Play | null>(null);

  // 🚀 PERFORMANCE: Optimistic updates for instant UI feedback
  // Shows plays immediately while database operations happen in background
  const [optimisticPlays, setOptimisticPlays] = useState<Play[]>([]);

  // 🚀 PERFORMANCE: Memoize handlers to prevent unnecessary re-renders of child components
  const handleViewChange = useCallback(
    (view: CoachingView) => dispatch({ type: "SET_VIEW", view }),
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
                  // Fetch plays by IDs
                  const playsData = await Promise.all(
                    selectedPlayIds.map((id) =>
                      supabase.from("plays").select("*").eq("id", id).single()
                    )
                  );

                  const selectedPlays = playsData
                    .filter((result) => result.data)
                    .map((result) => result.data!);

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
          // TODO: Confirm and delete
          toast.warning(`Deleting ${selectedCount} plays (coming soon)`);
          break;

        default:
          break;
      }
    },
    [state.selectedPlayIds, toast]
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
  }, []);

  // NEW: Handler to open diagram editor after play creation
  const handlePlayCreated = useCallback((play: Play) => {
    // Auto-open diagram editor with the newly created play
    setDiagramPlay(play);
  }, []);

  const handleOpenSettings = useCallback(() => {
    triggerHapticFeedback("light");
    setShowPlaybookSettingsModal(true);
  }, []);

  const handleOpenWhiteboard = useCallback(() => {
    // Open diagram builder in whiteboard mode
    const whiteboardPlay = createWhiteboardPlay(activeTeamId || "");
    setDiagramPlay(whiteboardPlay);
  }, [activeTeamId]);

  const handleEditPlay = useCallback((play: Play) => {
    setEditingPlay(play);
    setShowAddNewPlayModal(true);
  }, []);

  const handleSavePlay = useCallback(
    async (playId: string, updates: Partial<Play>) => {
      try {
        // 🚀 OPTIMISTIC UPDATE: Show changes immediately
        setOptimisticPlays((prev) => {
          const existingPlay = prev.find((p) => p.id === playId);
          if (existingPlay) {
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

        // Background: Update in database
        await SecurePlaysService.updatePlay(playId, updates);

        // Remove from optimistic state after a brief delay (now reflected in database)
        setTimeout(() => {
          setOptimisticPlays((prev) => prev.filter((p) => p.id !== playId));
        }, 100);

        // ✅ NO MORE FULL REFRESH - optimistic updates handle UI
        // Old: dispatch({ type: "INCREMENT_REFRESH" }); // 500ms full reload

        return Promise.resolve();
      } catch (error) {
        // Revert optimistic update on error
        setOptimisticPlays((prev) => prev.filter((p) => p.id !== playId));
        logError("Failed to save play:", error);
        throw error; // Re-throw so the UI can show the error
      }
    },
    [activePlaybookId]
  );

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

  // Note: handleSaveDiagram is kept for future diagram saving functionality
  // @ts-expect-error - Keeping for future use
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
              duplicatedPlay.formation_direction = oppositeFormation.direction;
            }
          }

          // Flip play name if it contains Left/Right
          duplicatedPlay.play_name = flipPlayName(play.play_name);

          // Flip formation direction (f_dir field)
          duplicatedPlay.f_dir = flipFormationDirection(play.f_dir);

          // Flip play direction (p_dir field)
          duplicatedPlay.p_dir = flipFormationDirection(play.p_dir);

          // Flip diagram positions
          if (play.diagram_data) {
            const flippedDiagram = flipDiagramPositions(play.diagram_data);
            if (flippedDiagram) {
              duplicatedPlay.diagram_data = flippedDiagram as DiagramDocument;
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

      setEditingPlay(duplicatedPlay);
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
        // TODO: Replace with toast notification
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
    [toast]
  );

  const handleAddToGamePlan = useCallback(
    async (play: Play) => {
      try {
        const teamId = "current-team"; // TODO: Get from context/auth
        const gamePlan = await GamePlanService.createQuickGamePlan(
          "Quick Game Plan",
          teamId
        );
        // Add the play to the most appropriate situation (base run/pass for now)
        const situationId = play.p_type === "Pass" ? "base_pass" : "base_run";
        await GamePlanService.addPlayToGamePlan(
          {
            gamePlanId: gamePlan.id,
            situationId,
            playId: play.id,
            priority: 3,
            notes: "Added from playbook workflow",
          },
          play
        );
        info(`Added "${play.play_name}" to game plan: "${gamePlan.name}"`);
        // TODO: Replace with toast notification
        toast.success(`Added "${play.play_name}" to game plan`, gamePlan.name);
      } catch (error) {
        logError("Failed to add play to game plan:", error);
        toast.error("Failed to add play to game plan", "Please try again");
      }
    },
    [toast]
  );

  // Practice Script Builder handlers
  const handleOpenPracticeScriptBuilder = useCallback(() => {
    setEditingScript(null);
    setShowPracticeScriptBuilder(true);
  }, []);

  const handleSavePracticeScript = useCallback(
    (script: any) => {
      debug("Practice script saved:", script);
      setShowPracticeScriptBuilder(false);
      setEditingScript(null);
      setSelectedPlaysForPractice([]);

      // Clear selection mode and selected plays
      dispatch({ type: "TOGGLE_BULK" }); // Turn off selection mode
      dispatch({ type: "CLEAR_SELECTION" }); // Clear selected plays

      // TODO: Refresh practice scripts list
    },
    [dispatch]
  );

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
      // "?" for keyboard shortcuts guide
      if (event.key === "?" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        setShowKeyboardShortcuts(true);
        return;
      }

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
      <PageLayout variant="dashboard">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            {
              id: "dashboard",
              label: "Dashboard",
              onClick: () => navigate("/dashboard"),
            },
            { id: "playbook", label: "Playbook", current: true },
          ]}
          className="mb-4"
        />

        {/* Unified Header with Navigation (includes PlaybookSelector) */}
        <PlaybookViewTabs
          currentView={state.currentView}
          onViewChange={handleViewChange}
          currentTeamType={state.currentTeamType}
          onTeamTypeChange={handleTeamTypeChange}
          onOpenSettings={handleOpenSettings}
          onOpenBuilder={handleOpenBuilder}
          title="Playbook"
          playsCreated={state.playsCreated}
          diagramCoverage={state.diagramCoverage}
          streakDays={state.streakDays}
          playbooks={teamPlaybooks}
          activePlaybookId={activePlaybookId}
          onPlaybookChange={handlePlaybookChange}
          onPlaybookUpdated={refreshData}
          teamId={activeTeamId || ""}
        />

        {/* Mobile-First Layout */}
        {isMobile ? (
          // Mobile View - Progressive Disclosure
          <>
            {/* Mobile Header */}
            <MobilePlaybookHeader
              title="Playbook"
              playCount={state.playsCreated}
              filterCount={Object.keys(state.advancedFilters).length}
              onSearchClick={() => {
                // Focus search input
                const searchInput = document.querySelector(
                  'input[type="search"]'
                ) as HTMLInputElement;
                searchInput?.focus();
                searchInput?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              onFilterClick={() => {
                triggerHapticFeedback("light");
                setShowFiltersSheet(true);
              }}
              onStatsClick={() => {
                triggerHapticFeedback("light");
                setShowStatsSheet(true);
              }}
            />

            <div className="px-4 py-6 space-y-6 pb-24">
            {/* Empty State - Hero CTA */}
            {state.playsCreated === 0 && (
              <MobileSection spacing="comfortable">
                <MobileCTACard
                  icon="plus"
                  title="Create Your First Play"
                  description="Build offensive and defensive plays with our diagram editor"
                  action="Get Started"
                  variant="primary"
                  onTap={handleOpenBuilder}
                />
              </MobileSection>
            )}

            {/* Quick Actions - 3 Max for Mobile */}
            <MobileSection title="Quick Actions" spacing="tight">
              <MobileQuickActions
                actions={[
                  {
                    id: "new-play",
                    icon: "plus",
                    label: "New Play",
                    onTap: handleOpenBuilder,
                  },
                  {
                    id: "practice",
                    icon: "clock",
                    label: "Practice",
                    onTap: handleQuickNewPracticeScript,
                  },
                  {
                    id: "game-plan",
                    icon: "target",
                    label: "Game Plan",
                    onTap: handleQuickNewGamePlan,
                  },
                ]}
              />
            </MobileSection>

            {/* Selection Mode Toggle - Mobile */}
            <MobileSection spacing="tight">
              <SelectionModeToggle
                isActive={state.enableBulkOperations}
                onToggle={() => {
                  triggerHapticFeedback("light");
                  dispatch({ type: "TOGGLE_BULK" });
                }}
                selectedCount={state.selectedPlayIds?.size || 0}
                variant="compact"
                className="w-full"
              />
            </MobileSection>

            {/* Filters - Collapsed by Default */}
            {state.playsCreated > 0 && (
              <MobileSection spacing="tight">
                <Button
                  onClick={() => {
                    triggerHapticFeedback("light");
                    setShowFiltersSheet(true);
                  }}
                  variant="secondary"
                  className="w-full h-12"
                >
                  <Icon name="filter" className="h-4 w-4 mr-2" />
                  Filters & Search
                  {Object.keys(state.advancedFilters).length > 0 && (
                    <span className="ml-2 bg-brand-jade text-white text-xs rounded-full px-2 py-0.5">
                      {Object.keys(state.advancedFilters).length}
                    </span>
                  )}
                </Button>
              </MobileSection>
            )}

            {/* Search Bar - Sticky on Mobile with Backdrop Blur */}
            {state.playsCreated > 0 && (
              <div className="sticky top-0 z-30 bg-surface-primary/80 backdrop-blur-md border-b border-border-subtle/50 -mx-4 px-4 py-3 shadow-sm">
                <div className="relative">
                  <Icon
                    name="search"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted pointer-events-none"
                  />
                  <input
                    type="search"
                    placeholder="Search plays..."
                    value={state.searchQuery}
                    onChange={(e) =>
                      dispatch({ type: "SET_SEARCH", query: e.target.value })
                    }
                    className="w-full h-12 pl-10 pr-10 bg-surface-secondary border border-border-subtle rounded-lg text-base text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-jade focus:border-transparent transition-all"
                  />
                  {/* 🚀 PERFORMANCE: Instant search feedback - shows while debouncing */}
                  {isSearchPending && state.searchQuery && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute right-12 top-1/2 transform -translate-y-1/2 flex items-center gap-2 bg-brand-jade/10 text-brand-jade px-3 py-1 rounded-full text-xs font-medium"
                    >
                      <Icon
                        name="refresh-cw"
                        className="h-3 w-3 animate-spin"
                      />
                      Searching...
                    </motion.div>
                  )}
                  {state.searchQuery && (
                    <motion.button
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      }}
                      onClick={() => {
                        triggerHapticFeedback("light");
                        dispatch({ type: "SET_SEARCH", query: "" });
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center hover:bg-surface-tertiary rounded-full transition-colors"
                      aria-label="Clear search"
                    >
                      <Icon
                        name="close"
                        className="h-4 w-4 text-text-secondary hover:text-text-primary"
                      />
                    </motion.button>
                  )}
                </div>
              </div>
            )}

            {/* Main Content - Plays Grid */}
            <MobileSection
              title="Your Plays"
              action={state.playsCreated > 3 ? "See All" : undefined}
              spacing="comfortable"
            >
              <PullToRefresh onRefresh={handlePullRefresh}>
                <ErrorBoundary
                  fallback={
                    <div className="p-spacing-lg text-center">
                      <Typography
                        variant="body-md"
                        className="text-text-secondary"
                      >
                        Failed to load plays. Please refresh the page.
                      </Typography>
                    </div>
                  }
                >
                  <PlayGrid
                    searchQuery={debouncedSearchQuery}
                    filters={state.selectedFilters}
                    optimisticPlays={optimisticPlays}
                    onAddToPracticeScript={handleAddToPracticeScript}
                    onAddToGamePlan={handleAddToGamePlan}
                    onEdit={handleEditPlay}
                    onSave={handleSavePlay}
                    onDuplicate={handleDuplicatePlay}
                    onOpenBuilder={handleOpenBuilder}
                    onCreateDiagram={handleCreateDiagram}
                    refreshTrigger={state.refreshTrigger}
                    onPlayCountChange={handlePlayCountChange}
                    formationSuggestions={suggestions.formations}
                    playNameSuggestions={suggestions.playNames}
                    enableBulkOperations={state.enableBulkOperations}
                    selectedPlayIds={state.selectedPlayIds}
                    onPlaySelectionChange={(selection) =>
                      dispatch({ type: "SET_SELECTION", selection })
                    }
                  />
                </ErrorBoundary>
              </PullToRefresh>
            </MobileSection>

            {/* Floating Action Button for Quick Actions */}
            <FloatingActionButton
              actions={FABPresets.playbook({
                onNewPlay: handleOpenBuilder,
                onWhiteboard: handleOpenWhiteboard,
                onPractice: handleQuickNewPracticeScript,
                onGamePlan: handleQuickNewGamePlan,
              })}
              icon="plus"
            />
            </div>

            {/* Mobile Bottom Navigation */}
            <PlaybookBottomNav />

            {/* Stats Bottom Sheet */}
            <MobileStatsBottomSheet
              isOpen={showStatsSheet}
              onClose={() => setShowStatsSheet(false)}
              stats={{
                totalPlays: state.playsCreated || 0,
                playsWithDiagrams: Math.floor(
                  (state.playsCreated || 0) * (state.diagramCoverage / 100)
                ),
                formationsCount: Math.max(
                  1,
                  Math.floor((state.playsCreated || 0) / 3)
                ),
                passPlays: Math.floor((state.playsCreated || 0) * 0.4),
                runPlays: Math.floor((state.playsCreated || 0) * 0.4),
                rpoPlays: Math.floor((state.playsCreated || 0) * 0.15),
                playActionPlays: Math.floor((state.playsCreated || 0) * 0.05),
              }}
            />
          </>
        ) : (
          // Desktop View - Keep Existing Layout
          <>
            {/* Aurora Hero Tiles - Football-Specific Actions */}
            <div className="px-4 sm:px-6 lg:px-8 -mt-4 mb-2 py-2 overflow-visible">
              <div className="flex items-center justify-center gap-3 md:gap-4 lg:gap-3 xl:gap-4 flex-wrap overflow-visible">
                <AppIconTile
                  title="New Play"
                  subtitle={`${state.playsCreated} plays`}
                  icon="plus-circle"
                  gradient="from-jade-500 to-emerald-600"
                  onOpen={handleOpenBuilder}
                />

                <AppIconTile
                  title="Whiteboard"
                  subtitle="Free draw"
                  icon="pen-tool"
                  gradient="from-purple-500 to-violet-600"
                  onOpen={handleOpenWhiteboard}
                />

                <AppIconTile
                  title="Practice"
                  subtitle="Build script"
                  icon="clipboard-list"
                  gradient="from-blue-500 to-indigo-600"
                  onOpen={handleQuickNewPracticeScript}
                />

                <AppIconTile
                  title="Game Plan"
                  subtitle="Strategy"
                  icon="target"
                  gradient="from-orange-500 to-red-500"
                  onOpen={handleQuickNewGamePlan}
                />

                <AppIconTile
                  title="Personnel"
                  subtitle="Configure"
                  icon="users"
                  gradient="from-pink-500 to-rose-600"
                  onOpen={() => setShowPersonnelModal(true)}
                />

                <AppIconTile
                  title="Formation Builder"
                  subtitle="Visual tool"
                  icon="wrench"
                  gradient="from-indigo-500 to-purple-600"
                  onOpen={() => setShowFormationBuilderModal(true)}
                />

                <AppIconTile
                  title="Bulk Actions"
                  subtitle={
                    state.enableBulkOperations ? "Selection ON" : "Mass edit"
                  }
                  icon={state.enableBulkOperations ? "check-circle" : "list"}
                  gradient={
                    state.enableBulkOperations
                      ? "from-green-500 to-emerald-600"
                      : "from-teal-500 to-cyan-600"
                  }
                  onOpen={() => {
                    dispatch({ type: "TOGGLE_BULK" });
                  }}
                />

                <AppIconTile
                  title="Diagrams"
                  subtitle={`${Math.floor(state.playsCreated * (state.diagramCoverage / 100))} done`}
                  icon="grid"
                  gradient="from-cyan-500 to-blue-500"
                  badge={state.diagramCoverage}
                  onOpen={() => {}}
                />
              </div>
            </div>

            {/* Main Content - 2 Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-4 sm:px-6 lg:px-8 overflow-visible">
              {/* Left Sidebar - Controls */}
              <div className="lg:col-span-1 space-y-6 overflow-visible">
                {/* Selection Mode Toggle - NEW! */}
                <SelectionModeToggle
                  isActive={state.enableBulkOperations}
                  onToggle={() => dispatch({ type: "TOGGLE_BULK" })}
                  selectedCount={state.selectedPlayIds?.size || 0}
                  label="Select Plays"
                />

                {/* Filters - Moved to top */}
                <Card variant="glass">
                  <AdvancedFilters
                    activeFilters={state.advancedFilters}
                    onFiltersChange={handleFiltersChange}
                  />
                </Card>

                {/* Stats Dashboard */}
                <Card variant="glass">
                  <PlaybookStatsDashboard stats={playbookStats} />
                </Card>

                {/* Recent Activity */}
                <Card variant="glass">
                  <RecentActivityFeed
                    activities={playbookStats.recentActivity}
                  />
                </Card>

                {/* Bulk Actions - Only show when items are selected */}
                {(state.selectedPlayIds?.size || 0) > 0 && (
                  <Card variant="glass">
                    <BulkActionsToolbar
                      selectedCount={state.selectedPlayIds?.size || 0}
                      onClearSelection={handleClearSelection}
                      onBulkAction={handleBulkAction}
                    />
                  </Card>
                )}
              </div>

              {/* Right Side - Main Content Area */}
              <div className="lg:col-span-3 overflow-visible">
                <Card variant="glass" size="lg">
                  {state.currentView === "playbook" && (
                    <ErrorBoundary
                      fallback={
                        <div className="p-spacing-lg text-center">
                          <Typography
                            variant="body-md"
                            className="text-text-secondary"
                          >
                            Failed to load plays. Please refresh the page.
                          </Typography>
                        </div>
                      }
                    >
                      <PlayGrid
                        searchQuery={debouncedSearchQuery}
                        filters={state.selectedFilters}
                        optimisticPlays={optimisticPlays}
                        onAddToPracticeScript={handleAddToPracticeScript}
                        onAddToGamePlan={handleAddToGamePlan}
                        onEdit={handleEditPlay}
                        onSave={handleSavePlay}
                        onDuplicate={handleDuplicatePlay}
                        onOpenBuilder={handleOpenBuilder}
                        onCreateDiagram={handleCreateDiagram}
                        refreshTrigger={state.refreshTrigger}
                        onPlayCountChange={handlePlayCountChange}
                        formationSuggestions={suggestions.formations}
                        playNameSuggestions={suggestions.playNames}
                        enableBulkOperations={state.enableBulkOperations}
                        selectedPlayIds={state.selectedPlayIds}
                        onPlaySelectionChange={(selection) =>
                          dispatch({ type: "SET_SELECTION", selection })
                        }
                      />
                    </ErrorBoundary>
                  )}

                  {state.currentView === "practice-script" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <Typography
                          variant="headline-md"
                          className="text-text-primary"
                        >
                          Practice Scripts
                        </Typography>
                        <Button
                          onClick={handleOpenPracticeScriptBuilder}
                          variant="primary"
                          size={mobileButtonSize}
                        >
                          <Icon name="plus" className="h-4 w-4 mr-2" />
                          New Script
                        </Button>
                      </div>

                      {/* Practice Scripts List */}
                      {activeTeamId ? (
                        <PracticeScriptList
                          teamId={activeTeamId}
                          onEditScript={(script) => {
                            setEditingScript(script);
                            setShowPracticeScriptBuilder(true);
                          }}
                          onCreateNew={handleOpenPracticeScriptBuilder}
                        />
                      ) : (
                        <div className="text-center py-8">
                          <Typography
                            variant="body"
                            className="text-muted-foreground"
                          >
                            Please select a team to view practice scripts.
                          </Typography>
                        </div>
                      )}
                    </div>
                  )}

                  {state.currentView === "game-plan" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <Typography
                          variant="headline-md"
                          className="text-text-primary"
                        >
                          Game Plans
                        </Typography>
                        <Button
                          onClick={handleQuickNewGamePlan}
                          variant="primary"
                          size={mobileButtonSize}
                        >
                          <Icon name="plus" className="h-4 w-4 mr-2" />
                          New Plan
                        </Button>
                      </div>

                      {/* Placeholder for game plans list */}
                      <div className="text-center py-12">
                        <Icon
                          name="target"
                          className="h-16 w-16 text-text-muted mx-auto mb-4"
                        />
                        <Typography
                          variant="headline-sm"
                          className="text-text-secondary mb-2"
                        >
                          No Game Plans Yet
                        </Typography>
                        <Typography
                          variant="body-sm"
                          className="text-text-muted mb-6"
                        >
                          Create your first game plan to strategize plays for
                          upcoming matches.
                        </Typography>
                        <Button
                          onClick={handleQuickNewGamePlan}
                          variant="primary"
                          size={mobileButtonSize}
                        >
                          <Icon name="plus" className="h-4 w-4 mr-2" />
                          Create New Plan
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </>
        )}

        {/* Sticky Workflow Status Bar */}
        <WorkflowStatusBar />

        {/* New Modals - Lazy loaded with Suspense for code splitting */}
        {showAddNewPlayModal && (
          <ErrorBoundary
            fallback={
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                <div className="bg-surface-primary rounded-lg p-spacing-lg max-w-md">
                  <Typography variant="headline-md" className="mb-spacing-md">
                    Error Loading Modal
                  </Typography>
                  <Typography
                    variant="body-md"
                    className="text-text-secondary mb-spacing-lg"
                  >
                    Failed to load the play editor. Please try again.
                  </Typography>
                  <Button
                    onClick={() => {
                      setShowAddNewPlayModal(false);
                      setEditingPlay(null);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                  <div className="bg-surface-primary rounded-lg p-8 flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-surface-tertiary border-t-brand-jade"></div>
                    <Typography variant="body-md" className="text-text-secondary">
                      Loading play editor...
                    </Typography>
                  </div>
                </div>
              }
            >
              <AddNewPlayModal
                isOpen={showAddNewPlayModal}
                onClose={() => {
                  setShowAddNewPlayModal(false);
                  setEditingPlay(null);
                }}
                existingPlay={editingPlay}
                playbookId={activePlaybookId}
                onPlayCreated={handlePlayCreated}
                onCreatePlay={async (playData) => {
                  try {
                    debug("Processing play:", playData);

                    let resultPlay: Play;

                    if (editingPlay) {
                      // 🚀 OPTIMISTIC UPDATE: Show changes immediately
                      const optimisticUpdate = { ...editingPlay, ...playData };
                      setOptimisticPlays((prev) => [
                        optimisticUpdate,
                        ...prev.filter((p) => p.id !== editingPlay.id),
                      ]);

                      // Background: Update in database
                      resultPlay = await SecurePlaysService.updatePlay(
                        editingPlay.id,
                        playData
                      );
                      toast.success(
                        `Play "${resultPlay.play_name}" updated successfully!`
                      );

                      // Replace optimistic update with real database result
                      setOptimisticPlays((prev) =>
                        prev.map((p) =>
                          p.id === editingPlay.id ? resultPlay : p
                        )
                      );

                      // Trigger a database refresh to ensure consistency
                      dispatch({ type: "INCREMENT_REFRESH" });
                    } else {
                      // 🚀 OPTIMISTIC CREATE: Show new play immediately with temporary ID
                      const tempId = `temp-${Date.now()}`;
                      const optimisticPlay: Play = {
                        playbook_id: activePlaybookId,
                        formation: "",
                        play_name: "",
                        p_type: "",
                        confidence_base: 70,
                        times_called: 0,
                        times_successful: 0,
                        created_by: "",
                        ...playData,
                        id: tempId,
                        created_at: new Date(),
                        updated_at: new Date(),
                      };

                      // Add to UI instantly (perceived <50ms response)
                      setOptimisticPlays((prev) => [optimisticPlay, ...prev]);

                      // Background: Create in database
                      // ⚠️ CRITICAL: Add playbook_id before validation
                      // 🔧 CRITICAL: Clean up empty strings and null to undefined for optional fields
                      const cleanedPlayData = Object.fromEntries(
                        Object.entries(playData)
                          .map(([key, value]) => [
                            key,
                            value === "" || value === null ? undefined : value,
                          ])
                          .filter(([_, value]) => value !== undefined) // Remove undefined fields entirely
                      );
                      const completePlayData = {
                        ...cleanedPlayData,
                        playbook_id: activePlaybookId,
                      };

                      resultPlay =
                        await SecurePlaysService.createPlay(completePlayData);
                      toast.success(
                        `Play "${resultPlay.play_name}" created successfully!`
                      );

                      // Replace optimistic play with real database play
                      setOptimisticPlays((prev) =>
                        prev.map((p) => (p.id === tempId ? resultPlay : p))
                      );

                      // Trigger a database refresh to get the play in the main list
                      // The optimistic play will be automatically deduplicated
                      dispatch({ type: "INCREMENT_REFRESH" });
                    }

                    // ✅ NO MORE FULL REFRESH - optimistic updates handle UI
                    // Old: dispatch({ type: "INCREMENT_REFRESH" }); // 500ms full reload

                    setShowAddNewPlayModal(false);
                    setEditingPlay(null);

                    // NEW: Return the created/updated play so modal can call onPlayCreated
                    return resultPlay;
                  } catch (error) {
                    logError("Failed to process play:", error);

                    // Handle specific error types
                    if (error instanceof Error) {
                      if (error.message.includes("Duplicate play")) {
                        toast.error(
                          "Duplicate play detected",
                          "A play with this name and formation already exists"
                        );
                      } else if (
                        error.message.includes("User not authenticated")
                      ) {
                        toast.error(
                          "Authentication required",
                          "You must be logged in to modify plays"
                        );
                      } else {
                        toast.error("Failed to process play", error.message);
                      }
                    } else if (typeof error === "object" && error !== null) {
                      // Check for PostgREST schema cache errors
                      const err = error as { code?: string; message?: string };
                      if (
                        err.code === "PGRST204" ||
                        err.message?.includes("schema cache")
                      ) {
                        toast.error(
                          "Database schema cache error",
                          "Please reload the page. If the issue persists, contact support."
                        );
                        logError(
                          "💡 Schema cache needs reload. See docs/ops/SCHEMA_CACHE_ISSUES.md"
                        );
                      } else {
                        toast.error(
                          "Failed to process play",
                          err.message || "Please try again"
                        );
                      }
                    } else {
                      toast.error("Failed to process play", "Please try again");
                    }
                  }
                }}
              />
            </Suspense>
          </ErrorBoundary>
        )}

        {showPlaybookSettingsModal && (
          <Suspense fallback={null}>
            <PlaybookSettingsModal
              isOpen={showPlaybookSettingsModal}
              onClose={() => setShowPlaybookSettingsModal(false)}
              settings={playbookSettings}
              onSave={(settings) => {
                try {
                  debug("Saving playbook settings:", settings);

                  // Update local state
                  setPlaybookSettings(settings);

                  // Persist settings to localStorage
                  localStorage.setItem(
                    "boxcall_playbook_settings",
                    JSON.stringify(settings)
                  );

                  // Show success message (replace with toast when available)
                  toast.success("Playbook settings saved successfully!");

                  setShowPlaybookSettingsModal(false);
                } catch (error) {
                  logError("Failed to save playbook settings:", error);
                  toast.error("Failed to save settings", "Please try again");
                }
              }}
            />
          </Suspense>
        )}

        {showPersonnelModal && (
          <Suspense fallback={null}>
            <PersonnelConfigurationModal
              isOpen={showPersonnelModal}
              onClose={() => setShowPersonnelModal(false)}
              configurations={playbookSettings.personnelConfigurations || []}
              onSave={async (configurations) => {
                try {
                  debug("Saving personnel configurations:", configurations);

                  if (!activePlaybookId) {
                    toast.error(
                      "No playbook selected",
                      "Please select a playbook first"
                    );
                    return;
                  }

                  // Load existing configurations from database to compare
                  const existingConfigs =
                    await PersonnelService.getPersonnelConfigurations(
                      activePlaybookId
                    );
                  const existingByName = new Map(
                    existingConfigs.map((c) => [c.name, c])
                  );

                  // Detect deletions: find configs that exist in database but not in modal
                  const currentIds = new Set(configurations.map((c) => c.id));
                  for (const existing of existingConfigs) {
                    if (!currentIds.has(existing.id)) {
                      debug(
                        `[PlaybookPage] Deleting personnel config: ${existing.name} (id: ${existing.id})`
                      );
                      await PersonnelService.deletePersonnelConfiguration(
                        existing.id
                      );
                    }
                  }

                  // Only save new or modified configurations
                  for (const config of configurations) {
                    // Convert modal format to database format
                    const players = config.players.map((p, index) => ({
                      player_position: p.position,
                      label: p.label,
                      sort_order: index,
                      is_wildcat_qb: p.isWildcatQB || false,
                    }));

                    // Check if this config already exists in database by name
                    const existing = existingByName.get(config.name);

                    // Check if this is a new config (non-UUID ID) or existing UUID
                    const isUUID =
                      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                        config.id
                      );

                    if (existing) {
                      // Config exists in database - check if modified
                      const isModified =
                        existing.name !== config.name ||
                        existing.players?.length !== config.players.length ||
                        JSON.stringify(existing.badgeCustomization) !==
                          JSON.stringify(config.badgeCustomization);

                      if (isModified) {
                        debug(
                          `[PlaybookPage] Updating modified personnel config: ${config.name}`
                        );
                        await PersonnelService.updatePersonnelConfiguration(
                          existing.id,
                          {
                            name: config.name,
                            description: `${config.players.length} skill players`,
                            players,
                            badgeCustomization: config.badgeCustomization,
                          }
                        );
                      } else {
                        debug(
                          `[PlaybookPage] Skipping unchanged personnel config: ${config.name}`
                        );
                      }
                    } else if (!isUUID) {
                      // New config with temporary ID - create it
                      debug(
                        `[PlaybookPage] Creating new personnel config: ${config.name} (id: ${config.id})`
                      );
                      await PersonnelService.createPersonnelConfiguration({
                        playbook_id: activePlaybookId,
                        name: config.name,
                        description: `${config.players.length} skill players`,
                        players,
                        badgeCustomization: config.badgeCustomization,
                      });
                    }
                  }

                  // Reload personnel configurations from database to get real UUIDs
                  const savedConfigs =
                    await PersonnelService.getPersonnelConfigurations(
                      activePlaybookId
                    );

                  // Convert database format back to modal format
                  const modalConfigs = savedConfigs.map((config) => ({
                    id: config.id, // Real UUID from database
                    name: config.name,
                    badgeCustomization: config.badgeCustomization,
                    players:
                      config.players?.map((p) => ({
                        id: `p-${p.id}`,
                        label: p.label,
                        position: p.player_position,
                        isWildcatQB: p.is_wildcat_qb,
                      })) || [],
                    line: [], // Not used in current implementation
                    isDefault: config.name === "11 Personnel",
                  }));

                  // Update local state with real UUIDs
                  const updatedSettings = {
                    ...playbookSettings,
                    personnelConfigurations: modalConfigs,
                  };
                  setPlaybookSettings(updatedSettings);

                  // Persist settings to localStorage
                  localStorage.setItem(
                    "boxcall_playbook_settings",
                    JSON.stringify(updatedSettings)
                  );

                  // Show success message
                  toast.success("Personnel configurations saved successfully!");

                  setShowPersonnelModal(false);
                } catch (error) {
                  logError("Failed to save personnel configurations:", error);
                  toast.error("Failed to save personnel", "Please try again");
                }
              }}
            />
          </Suspense>
        )}

        {showFormationBuilderModal && (
          <Suspense fallback={null}>
            <FormationBuilderModal
              isOpen={showFormationBuilderModal}
              onClose={() => setShowFormationBuilderModal(false)}
              playbookId={activePlaybookId}
              onSaved={() => {
                toast.success("Formation linked successfully!");
                // Don't auto-close - let user continue working
                // TODO: Refresh formations list when we have it
              }}
            />
          </Suspense>
        )}

        {/* Keyboard Shortcuts Guide */}
        <Suspense fallback={null}>
          <KeyboardShortcutsGuide
            isOpen={showKeyboardShortcuts}
            onClose={() => setShowKeyboardShortcuts(false)}
          />
        </Suspense>

        {/* Diagram Builder Modal */}
        {diagramPlay && (
          <Modal
            isOpen={!!diagramPlay}
            onClose={() => setDiagramPlay(null)}
            title={`${diagramPlay.play_name} Diagram`}
            size="fullscreen"
            type="default"
            closeOnBackdropClick={false}
            closeOnEscape={true}
          >
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full min-h-96">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-surface-tertiary border-t-brand-jade"></div>
                    <Typography variant="body-md" className="text-text-secondary">
                      Loading diagram editor...
                    </Typography>
                  </div>
                </div>
              }
            >
              <PlayDiagramBuilder
                onClose={() => setDiagramPlay(null)}
                play={diagramPlay}
              />
            </Suspense>
          </Modal>
        )}

        {/* Practice Script Builder Modal */}
        <Suspense fallback={null}>
          <PracticeScriptBuilder
            script={editingScript}
            teamId={activeTeamId || ""}
            selectedPlayIds={selectedPlaysForPractice}
            onSave={handleSavePracticeScript}
            onCancel={() => {
              setShowPracticeScriptBuilder(false);
              setEditingScript(null);
              setSelectedPlaysForPractice([]);
            }}
            isOpen={showPracticeScriptBuilder}
          />
        </Suspense>

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
              <div className="flex items-center justify-between p-6 pb-4 border-b border-border-subtle">
                <Typography variant="headline-md" className="text-text-primary">
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
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface-primary border-t border-border-subtle shadow-lg">
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
                  <p className="text-center text-xs text-text-secondary mt-2">
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
      </PageLayout>
    </Aurora>
  );
}
