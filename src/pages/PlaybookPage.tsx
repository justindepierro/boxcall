import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PlaybookHeader } from "../components/playbook/page/PlaybookHeader";
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

export default function PlaybookPage() {
  const { state, dispatch } = usePlaybook();
  const toast = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

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
          gridDensity: "comfortable",
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
      gridDensity: "comfortable",
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
  const handleSearchChange = (q: string) =>
    dispatch({ type: "SET_SEARCH", query: q });
  const handleViewChange = (view: CoachingView) =>
    dispatch({ type: "SET_VIEW", view });
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
      setBusy(true);
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
    } finally {
      setBusy(false);
    }
  };

  const handleAddToGamePlan = async (play: Play) => {
    try {
      setBusy(true);
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
    } finally {
      setBusy(false);
    }
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

  return (
    <PageLayout
      title="Playbook"
      subtitle="Create, manage, and organize your football plays"
      variant="dashboard"
      actions={
        <div className="flex items-center gap-3">
          <Button
            onClick={handleOpenSettings}
            variant="secondary"
            size="sm"
          >
            <Icon name="settings" className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            onClick={handleOpenBuilder}
            variant="primary"
            size="sm"
          >
            <Icon name="plus" className="h-4 w-4 mr-2" />
            New Play
          </Button>
        </div>
      }
    >
      {/* Header Stats */}
      <PlaybookHeader
        playsCreated={state.playsCreated}
        diagramCoverage={state.diagramCoverage}
        streakDays={state.streakDays}
        searchQuery={state.searchQuery}
        onSearchChange={handleSearchChange}
        onOpenSettings={handleOpenSettings}
      />

      {/* Full-width View Tabs */}
      <div className="bg-surface-primary border-b border-border -mx-6 mb-6">
        <div className="px-6 py-4">
          <PlaybookViewTabs
            currentView={state.currentView}
            onViewChange={handleViewChange}
          />
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stats Dashboard */}
          <PlaybookStatsDashboard stats={playbookStats} />

          {/* Recent Activity */}
          <RecentActivityFeed activities={playbookStats.recentActivity} />

          {/* Filters */}
          <div className="surface-card rounded-lg border border-border p-4">
            <AdvancedFilters
              activeFilters={state.advancedFilters}
              onFiltersChange={handleFiltersChange}
            />
          </div>

          {/* Bulk Actions - Only show when items are selected */}
          {(state.selectedPlayIds?.size || 0) > 0 && (
            <div className="surface-card rounded-lg border border-border p-4">
              <BulkActionsToolbar
                selectedCount={state.selectedPlayIds?.size || 0}
                onClearSelection={handleClearSelection}
                onBulkAction={handleBulkAction}
              />
            </div>
          )}

          {/* Action Buttons - Cleaned up */}
          <div className="surface-card rounded-lg border border-border p-4">
            <div className="space-y-3">
              <Button
                onClick={handleQuickNewPracticeScript}
                variant="secondary"
                size="sm"
                className="w-full justify-start"
              >
                <Icon name="plus" className="h-4 w-4 mr-2" />
                New Practice Script
              </Button>

              <Button
                onClick={handleQuickNewGamePlan}
                variant="secondary"
                size="sm"
                className="w-full justify-start"
              >
                <Icon name="plus" className="h-4 w-4 mr-2" />
                New Game Plan
              </Button>

              <Button
                onClick={handleOpenBuilder}
                variant="primary"
                size="sm"
                className="w-full justify-start"
              >
                <Icon name="plus" className="h-4 w-4 mr-2" />
                New Play
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - Main Content Area */}
        <div className="lg:col-span-3">
          <div className="surface-card rounded-lg border border-border p-6">
            {state.currentView === "playbook" && (
              <PlayGrid
                searchQuery={state.searchQuery}
                filters={state.selectedFilters}
                onAddToPracticeScript={handleAddToPracticeScript}
                onAddToGamePlan={handleAddToGamePlan}
                onEdit={handleEditPlay}
                onDuplicate={handleDuplicatePlay}
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
                    onClick={handleQuickNewPracticeScript}
                    variant="primary"
                  >
                    <Icon name="plus" className="h-4 w-4 mr-2" />
                    New Script
                  </Button>
                </div>

                {/* Placeholder for practice scripts list */}
                <div className="text-center py-12">
                  <Icon
                    name="file"
                    className="h-16 w-16 text-text-muted mx-auto mb-4"
                  />
                  <Typography
                    variant="headline-sm"
                    className="text-text-secondary mb-2"
                  >
                    No Practice Scripts Yet
                  </Typography>
                  <Typography
                    variant="body-sm"
                    className="text-text-muted mb-6"
                  >
                    Create your first practice script to organize plays for
                    training sessions.
                  </Typography>
                  <Button
                    onClick={handleQuickNewPracticeScript}
                    variant="primary"
                  >
                    <Icon name="plus" className="h-4 w-4 mr-2" />
                    Create New Script
                  </Button>
                </div>
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

      {busy && (
        <div className="fixed bottom-4 right-4 text-xs py-1 px-2 rounded bg-text-primary/70 text-text-inverse z-50">
          Working…
        </div>
      )}

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
    </PageLayout>
  );
}
