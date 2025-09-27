import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PlaybookViewTabs } from "../components/playbook/page/PlaybookViewTabs";
import { PlayGrid } from "../components/playbook/PlayGrid";
import { AdvancedFilters } from "../components/playbook/AdvancedFilters";
import { BulkActionsToolbar } from "../components/playbook/BulkActionsToolbar";
import { Button } from "../components/ui/Button/Button";
import { Icon } from "../components/ui/Icon";
import { Typography } from "../components/design-system/Typography";
import { usePlaybook } from "../contexts/PlaybookContext";
import type { CoachingView, PlaybookState } from "../contexts/PlaybookContext";
import { PlaysService } from "@services";
import { PracticeScriptService, GamePlanService } from "../services";
import { WorkflowStatusBar } from "../components/playbook/WorkflowStatusBar";
import { AddNewPlayModal } from "../components/playbook/AddNewPlayModal";
import { PlaybookSettingsModal } from "../components/playbook/PlaybookSettingsModal";
import { PlaybookStatsDashboard } from "../components/playbook/PlaybookStatsDashboard";
import { RecentActivityFeed } from "../components/playbook/RecentActivityFeed";
import { QuickActionsBar } from "../components/playbook/QuickActionsBar";
import { KeyboardShortcutsGuide } from "../components/playbook/KeyboardShortcutsGuide";
import { useToast } from "../hooks/useToast";
import type { Play } from "../types/play";
import { PageLayout } from "../components/layout/PageLayout";
import { Modal } from "../components/ui/Modal";
import { PlayDiagramBuilder } from "../components/playbook/diagram/PlayDiagramBuilder";
import { useDiagramEditor } from "../components/playbook/diagram/context/useDiagramEditor";
import { PracticeScriptList } from "../components/playbook/PracticeScriptList";
import { PracticeScriptBuilder } from "../components/playbook/PracticeScriptBuilder";
import { useActiveTeamStore } from "../state/activeTeamStore";

interface DiagramBuilderHeaderProps {
  play: Play;
  onClose: () => void;
}

const DiagramBuilderHeader: React.FC<DiagramBuilderHeaderProps> = ({
  play,
  onClose,
}) => {
  const { dispatch } = useDiagramEditor();
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const handleSave = useCallback(() => {
    console.log("Saving diagram...");
    alert("Save functionality will be implemented soon!");
  }, []);

  const handleLoad = useCallback(() => {
    console.log("Loading diagram...");
    alert("Load functionality will be implemented soon!");
  }, []);

  const handleExport = useCallback((format: "png" | "svg" | "pdf") => {
    console.log(`Exporting diagram as ${format.toUpperCase()}`);
    alert(
      `Export functionality for ${format.toUpperCase()} will be implemented soon!`
    );
  }, []);

  return (
    <div className="flex items-center justify-between">
      <Typography variant="headline-sm" as="h3" className="text-text-primary">
        {`${play.formation}${play.f_dir ? ` ${play.f_dir}` : ""} - ${play.play_name}${play.p_dir ? ` (${play.p_dir})` : ""}`}
      </Typography>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => dispatch({ type: "UNDO" })}
          className="p-1.5 text-content-secondary hover:text-content-primary hover:bg-surface-secondary rounded transition-colors"
          title="Undo (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          onClick={() => dispatch({ type: "REDO" })}
          className="p-1.5 text-content-secondary hover:text-content-primary hover:bg-surface-secondary rounded transition-colors"
          title="Redo (Ctrl+Y)"
        >
          ↷
        </button>
        <div className="w-px h-6 bg-border mx-1"></div>
        <button
          onClick={handleSave}
          className="px-3 py-1.5 text-sm bg-surface-secondary hover:bg-surface-tertiary text-content-primary rounded border border-border transition-colors"
        >
          Save
        </button>
        <button
          onClick={handleLoad}
          className="px-3 py-1.5 text-sm bg-surface-secondary hover:bg-surface-tertiary text-content-primary rounded border border-border transition-colors"
        >
          Load
        </button>
        <div className="relative export-dropdown">
          <button
            onClick={() => setShowExportDropdown(!showExportDropdown)}
            className="px-3 py-1.5 text-sm bg-primary hover:bg-primary-hover text-white rounded transition-colors"
          >
            Export
          </button>
          {showExportDropdown && (
            <div className="absolute top-full right-0 mt-1 bg-surface-card border border-border rounded shadow-lg min-w-32 z-50">
              <button
                onClick={() => {
                  handleExport("png");
                  setShowExportDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-content-primary hover:bg-surface-secondary first:rounded-t last:rounded-b"
              >
                Export as PNG
              </button>
              <button
                onClick={() => {
                  handleExport("svg");
                  setShowExportDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-content-primary hover:bg-surface-secondary first:rounded-t last:rounded-b"
              >
                Export as SVG
              </button>
              <button
                onClick={() => {
                  handleExport("pdf");
                  setShowExportDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-content-primary hover:bg-surface-secondary first:rounded-t last:rounded-b"
              >
                Export as PDF
              </button>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-content-secondary hover:text-content-primary hover:bg-surface-secondary rounded transition-colors ml-2"
          title="Close"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

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
    console.log("Creating diagram for play:", play);
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
      console.warn(
        "Failed to load playbook settings from localStorage:",
        error
      );
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

  // Calculate playbook stats
  const calculatePlaybookStats = () => {
    // Mock recent activity - in a real implementation, this would come from the database
    const mockActivities = [
      {
        id: "1",
        type: "created" as const,
        playName: "Slant Route",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      },
      {
        id: "2",
        type: "updated" as const,
        playName: "Power Run",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      },
      {
        id: "3",
        type: "added_to_script" as const,
        playName: "Screen Pass",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        details: "Week 1 Practice",
      },
    ];

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
      recentActivity: mockActivities,
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
      console.error("Failed to save play:", error);
      throw error; // Re-throw so the UI can show the error
    }
  };

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
      console.log(
        `✅ Added "${play.play_name}" to practice script: "${script.name}"`
      );
      // TODO: Replace with toast notification
      toast.success(
        `Added "${play.play_name}" to practice script`,
        script.name
      );
    } catch (error) {
      console.error("Failed to add play to practice script:", error);
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
      console.log(
        `✅ Added "${play.play_name}" to game plan: "${gamePlan.name}"`
      );
      // TODO: Replace with toast notification
      toast.success(`Added "${play.play_name}" to game plan`, gamePlan.name);
    } catch (error) {
      console.error("Failed to add play to game plan:", error);
      toast.error("Failed to add play to game plan", "Please try again");
    }
  };

  // Practice Script Builder handlers
  const handleOpenPracticeScriptBuilder = () => {
    setEditingScript(null);
    setShowPracticeScriptBuilder(true);
  };

  const handleSavePracticeScript = (script: any) => {
    console.log("Practice script saved:", script);
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
        console.error("Failed to load suggestions:", error);
        // Continue with empty suggestions - the UI will still work
      }
    };

    loadSuggestions();
  }, []);

  return (
    <PageLayout variant="dashboard">
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

      {/* Main Content - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Filters - Moved to top */}
          <div className="surface-card rounded-lg p-4">
            <AdvancedFilters
              activeFilters={state.advancedFilters}
              onFiltersChange={handleFiltersChange}
            />
          </div>

          {/* Stats Dashboard */}
          <PlaybookStatsDashboard stats={playbookStats} />

          {/* Recent Activity */}
          <RecentActivityFeed activities={playbookStats.recentActivity} />

          {/* Bulk Actions - Only show when items are selected */}
          {(state.selectedPlayIds?.size || 0) > 0 && (
            <div className="surface-card rounded-lg p-4">
              <BulkActionsToolbar
                selectedCount={state.selectedPlayIds?.size || 0}
                onClearSelection={handleClearSelection}
                onBulkAction={handleBulkAction}
              />
            </div>
          )}
        </div>

        {/* Right Side - Main Content Area */}
        <div className="lg:col-span-3">
          <div className="surface-card rounded-lg p-6">
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
                    Create your first game plan to strategize plays for upcoming
                    matches.
                  </Typography>
                  <Button onClick={handleQuickNewGamePlan} variant="primary">
                    <Icon name="plus" className="h-4 w-4 mr-2" />
                    Create New Plan
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Workflow Status Bar */}
      <WorkflowStatusBar />

      {/* New Modals */}
      {showAddNewPlayModal && (
        <AddNewPlayModal
          isOpen={showAddNewPlayModal}
          onClose={() => {
            setShowAddNewPlayModal(false);
            setEditingPlay(null);
          }}
          existingPlay={editingPlay}
          onCreatePlay={async (playData) => {
            try {
              console.log("Processing play:", playData);

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
              console.error("Failed to process play:", error);

              // Handle specific error types
              if (error instanceof Error) {
                if (error.message.includes("Duplicate play")) {
                  toast.error(
                    "Duplicate play detected",
                    "A play with this name and formation already exists"
                  );
                } else if (error.message.includes("User not authenticated")) {
                  toast.error(
                    "Authentication required",
                    "You must be logged in to modify plays"
                  );
                } else {
                  toast.error("Failed to process play", error.message);
                }
              } else {
                toast.error("Failed to process play", "Please try again");
              }
            }
          }}
        />
      )}

      {showPlaybookSettingsModal && (
        <PlaybookSettingsModal
          isOpen={showPlaybookSettingsModal}
          onClose={() => setShowPlaybookSettingsModal(false)}
          settings={playbookSettings}
          onSave={(settings) => {
            try {
              console.log("Saving playbook settings:", settings);

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
              console.error("Failed to save playbook settings:", error);
              toast.error("Failed to save settings", "Please try again");
            }
          }}
        />
      )}

      {/* Keyboard Shortcuts Guide */}
      <KeyboardShortcutsGuide
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />

      {/* Quick Actions Bar */}
      <QuickActionsBar
        actions={[
          {
            id: "new-play",
            label: "New Play",
            icon: "plus",
            onClick: handleOpenBuilder,
            shortcut: "Ctrl+N",
            variant: "primary",
          },
          {
            id: "practice-script",
            label: "Practice Script",
            icon: "file",
            onClick: handleQuickNewPracticeScript,
            shortcut: "Ctrl+P",
          },
          {
            id: "game-plan",
            label: "Game Plan",
            icon: "users",
            onClick: handleQuickNewGamePlan,
            shortcut: "Ctrl+G",
          },
          {
            id: "settings",
            label: "Settings",
            icon: "settings",
            onClick: handleOpenSettings,
          },
        ]}
      />

      {/* Diagram Builder Modal */}
      {diagramPlay && (
        <Modal
          isOpen={!!diagramPlay}
          onClose={() => setDiagramPlay(null)}
          headerContent={
            <DiagramBuilderHeader
              play={diagramPlay}
              onClose={() => setDiagramPlay(null)}
            />
          }
          size="xl"
          type="default"
          closeOnBackdropClick={false}
          closeOnEscape={true}
        >
          <PlayDiagramBuilder
            play={diagramPlay}
            onClose={() => setDiagramPlay(null)}
          />
        </Modal>
      )}

      {/* Practice Script Builder Modal */}
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
    </PageLayout>
  );
}
