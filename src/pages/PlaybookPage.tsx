import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { PlaybookViewTabs } from "../components/playbook/page/PlaybookViewTabs";
import { PlayGrid } from "../components/playbook/PlayGrid";
import { AdvancedFilters } from "../components/playbook/AdvancedFilters";
import { BulkActionsToolbar } from "../components/playbook/BulkActionsToolbar";
import { Button } from "../components/ui/Button/Button";
import { Icon } from "../components/ui/Icon";
import { Typography } from "../components/design-system/Typography";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { usePlaybook } from "../contexts/PlaybookContext";
import type { CoachingView, PlaybookState } from "../contexts/PlaybookContext";
import {
  PlaysService,
  ActivityService,
  PracticeScriptService,
  GamePlanService,
} from "@services";
import type { PlayActivityItem } from "@services";
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
import { AppIconTile } from "../components/ui/AppIconTile";
import { Card } from "../components/ui/Card";
import { Aurora } from "../components/ui/Aurora";
import { supabase } from "../lib/supabase";
import { info, error as logError, warn, debug } from "../utils/logger";

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
  const [diagramPlay, setDiagramPlay] = useState<Play | null>(null);
  const [showPracticeScriptBuilder, setShowPracticeScriptBuilder] =
    useState(false);
  const [editingScript, setEditingScript] = useState<any>(null); // TODO: Use proper PracticeScript type
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

  // Calculate playbook stats
  const calculatePlaybookStats = () => {
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
  };

  const playbookStats = calculatePlaybookStats();
  const [_selectedPlayForWorkflow, _setSelectedPlayForWorkflow] =
    useState<Play | null>(null);

  // New modals
  const [showAddNewPlayModal, setShowAddNewPlayModal] = useState(false);
  const [showPlaybookSettingsModal, setShowPlaybookSettingsModal] =
    useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [editingPlay, setEditingPlay] = useState<Play | null>(null);

  // Example handlers (replace with real logic as needed)
  const handleViewChange = (view: CoachingView) =>
    dispatch({ type: "SET_VIEW", view });
  const handleTeamTypeChange = (
    teamType: "offense" | "defense" | "special-teams"
  ) => dispatch({ type: "SET_TEAM_TYPE", teamType });
  const handleFiltersChange = (filters: PlaybookState["advancedFilters"]) =>
    dispatch({ type: "SET_ADVANCED_FILTERS", filters });
  const handleClearSelection = () => dispatch({ type: "CLEAR_SELECTION" });
  const handleBulkAction = (_action: string) => {};

  // Modal handlers
  const handleOpenBuilder = () => {
    setShowAddNewPlayModal(true);
  };

  const handleOpenSettings = () => {
    setShowPlaybookSettingsModal(true);
  };

  const handleEditPlay = (play: Play) => {
    setEditingPlay(play);
    setShowAddNewPlayModal(true);
  };

  const handleSavePlay = async (playId: string, updates: Partial<Play>) => {
    try {
      await PlaysService.updatePlay(playId, updates);
      // Trigger a refresh of the playbook data
      dispatch({ type: "INCREMENT_REFRESH" });
      return Promise.resolve();
    } catch (error) {
      logError("Failed to save play:", error);
      throw error; // Re-throw so the UI can show the error
    }
  };

  const handleSaveDiagram = useCallback(
    async ({
      doc,
      metadata,
    }: {
      doc: DiagramDocument;
      metadata: DiagramMetadata;
    }) => {
      if (!diagramPlay) return;
      const updates: Partial<Play> = {
        play_name: metadata.play_name,
        formation: metadata.formation,
        diagram_url: JSON.stringify(doc),
      };
      if (metadata.p_type) updates.p_type = metadata.p_type;
      if (metadata.personnel !== undefined)
        updates.personnel = metadata.personnel;
      if (metadata.pref_front !== undefined)
        updates.pref_front = metadata.pref_front;

      try {
        await PlaysService.updatePlay(diagramPlay.id, updates);
        dispatch({ type: "INCREMENT_REFRESH" });
        setDiagramPlay((prev) =>
          prev
            ? {
                ...prev,
                ...updates,
                diagram_url: updates.diagram_url,
                updated_at: new Date(),
              }
            : prev
        );
        toast.success("Diagram saved", metadata.play_name);
      } catch (error) {
        logError("Failed to save diagram:", error);
        toast.error("Failed to save diagram", "Please try again");
        throw error;
      }
    },
    [diagramPlay, dispatch, toast]
  );

  const handleDuplicatePlay = (play: Play) => {
    // Create a copy of the play with a modified name
    const duplicatedPlay: Play = {
      ...play,
      id: "", // Will be set by the database
      play_name: `Copy of ${play.play_name}`,
      created_at: new Date(),
      updated_at: new Date(),
      times_called: 0,
      times_successful: 0,
    };

    setEditingPlay(duplicatedPlay);
    setShowAddNewPlayModal(true);
  };

  // Workflow handlers
  const handleAddToPracticeScript = async (play: Play) => {
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
      toast.error("Failed to add play to practice script", "Please try again");
    }
  };

  const handleAddToGamePlan = async (play: Play) => {
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
  };

  // Practice Script Builder handlers
  const handleOpenPracticeScriptBuilder = () => {
    setEditingScript(null);
    setShowPracticeScriptBuilder(true);
  };

  const handleSavePracticeScript = (script: any) => {
    debug("Practice script saved:", script);
    setShowPracticeScriptBuilder(false);
    setEditingScript(null);
    // TODO: Refresh practice scripts list
  };

  const handleQuickNewPracticeScript = useCallback(() => {
    navigate("/practice-plans");
  }, [navigate]);

  const handleQuickNewGamePlan = useCallback(() => {
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

        {/* Unified Header with Navigation */}
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
        />

        {/* Aurora Hero Tiles - iPhone App Style - Tight spacing */}
        <div className="px-4 sm:px-6 lg:px-8 -mt-4 mb-6 overflow-visible">
          <div className="flex items-center justify-center gap-6 flex-wrap overflow-visible">
            <AppIconTile
              title="New Play"
              subtitle={`${state.playsCreated} plays`}
              icon="plus"
              gradient="from-jade-500 to-emerald-500"
              onOpen={handleOpenBuilder}
            />

            <AppIconTile
              title="Practice"
              subtitle="Quick start"
              icon="clock"
              gradient="from-purple-500 to-violet-500"
              onOpen={handleQuickNewPracticeScript}
            />

            <AppIconTile
              title="Game Plan"
              subtitle="Plan ahead"
              icon="target"
              gradient="from-amber-500 to-orange-500"
              onOpen={handleQuickNewGamePlan}
            />

            <AppIconTile
              title="Diagrams"
              subtitle={`${Math.floor(state.playsCreated * (state.diagramCoverage / 100))} done`}
              icon="image"
              gradient="from-blue-500 to-cyan-500"
              badge={state.diagramCoverage}
              onOpen={() => {}}
            />
          </div>
        </div>

        {/* Main Content - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-4 sm:px-6 lg:px-8 overflow-visible">
          {/* Left Sidebar - Controls */}
          <div className="lg:col-span-1 space-y-6 overflow-visible">
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
              <RecentActivityFeed activities={playbookStats.recentActivity} />
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
                <PlayGrid
                  searchQuery={state.searchQuery}
                  filters={state.selectedFilters}
                  onAddToPracticeScript={handleAddToPracticeScript}
                  onAddToGamePlan={handleAddToGamePlan}
                  onEdit={handleEditPlay}
                  onSave={handleSavePlay}
                  onDuplicate={handleDuplicatePlay}
                  onOpenBuilder={handleOpenBuilder}
                  onCreateDiagram={handleCreateDiagram}
                  refreshTrigger={state.refreshTrigger}
                  formationSuggestions={suggestions.formations}
                  playNameSuggestions={suggestions.playNames}
                />
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
                    <Button onClick={handleQuickNewGamePlan} variant="primary">
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
                    <Button onClick={handleQuickNewGamePlan} variant="primary">
                      <Icon name="plus" className="h-4 w-4 mr-2" />
                      Create New Plan
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Sticky Workflow Status Bar */}
        <WorkflowStatusBar />

        {/* New Modals - Lazy loaded with Suspense for code splitting */}
        {showAddNewPlayModal && (
          <Suspense fallback={null}>
            <AddNewPlayModal
              isOpen={showAddNewPlayModal}
              onClose={() => {
                setShowAddNewPlayModal(false);
                setEditingPlay(null);
              }}
              existingPlay={editingPlay}
              onCreatePlay={async (playData) => {
                try {
                  debug("Processing play:", playData);

                  let resultPlay: Play;

                  if (editingPlay) {
                    // Update existing play
                    resultPlay = await PlaysService.updatePlay(
                      editingPlay.id,
                      playData
                    );
                    toast.success(
                      `Play "${resultPlay.play_name}" updated successfully!`
                    );
                  } else {
                    // Create new play
                    resultPlay = await PlaysService.createPlay(playData);
                    toast.success(
                      `Play "${resultPlay.play_name}" created successfully!`
                    );
                  }

                  // Refresh the playbook data
                  dispatch({ type: "INCREMENT_REFRESH" });

                  setShowAddNewPlayModal(false);
                  setEditingPlay(null);
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
            <Suspense fallback={null}>
              <PlayDiagramBuilder
                play={diagramPlay}
                onClose={() => setDiagramPlay(null)}
                onSave={handleSaveDiagram}
              />
            </Suspense>
          </Modal>
        )}

        {/* Practice Script Builder Modal */}
        <Suspense fallback={null}>
          <PracticeScriptBuilder
            script={editingScript}
            teamId={activeTeamId || ""}
            onSave={handleSavePracticeScript}
            onCancel={() => {
              setShowPracticeScriptBuilder(false);
              setEditingScript(null);
            }}
            isOpen={showPracticeScriptBuilder}
          />
        </Suspense>
      </PageLayout>
    </Aurora>
  );
}
