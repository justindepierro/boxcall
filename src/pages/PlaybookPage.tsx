import { useRef, useState, useEffect } from "react";
import { PlaybookHeader } from "../components/playbook/page/PlaybookHeader";
import { PlaybookActionsBar } from "../components/playbook/page/PlaybookActionsBar";
import { PlaybookViewTabs } from "../components/playbook/page/PlaybookViewTabs";
import { PlayGrid } from "../components/playbook/PlayGrid";
import { AdvancedFilters } from "../components/playbook/AdvancedFilters";
import { BulkActionsToolbar } from "../components/playbook/BulkActionsToolbar";
import { Button } from "../components/ui/Button/Button";
import { Icon } from "../components/ui/Icon";
import { usePlaybook } from "../contexts/PlaybookContext";
import type { CoachingView, PlaybookState } from "../contexts/PlaybookContext";
import { CSVService, DataSyncService, PlaysService } from "@services";
import { PracticeScriptService, GamePlanService } from "../services";
import { PracticePlannerModal } from "../components/practice/PracticePlannerModal";
import { AddNewPlayModal } from "../components/playbook/AddNewPlayModal";
import { PlaybookSettingsModal } from "../components/playbook/PlaybookSettingsModal";
import { useToast } from "../hooks/useToast";
import type { Play } from "../types/play";

export default function PlaybookPage() {
  const { state, dispatch } = usePlaybook();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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

  // Workflow modal states
  const [showPracticePlanner, setShowPracticePlanner] = useState(false);
  const [showGamePlanModal, setShowGamePlanModal] = useState(false);
  const [_selectedPlayForWorkflow, _setSelectedPlayForWorkflow] =
    useState<Play | null>(null);

  // New modals
  const [showAddNewPlayModal, setShowAddNewPlayModal] = useState(false);
  const [showPlaybookSettingsModal, setShowPlaybookSettingsModal] =
    useState(false);
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

  const handleQuickNewPracticeScript = () => {
    setShowPracticePlanner(true);
  };

  const handleQuickNewGamePlan = () => {
    setShowGamePlanModal(true);
  };

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
  }, []);

  async function getDefaultPlaybookId(): Promise<string> {
    return PlaysService.ensureUserHasPlaybook();
  }

  const handleExportScope = async (scope: "selected" | "current" | "all") => {
    try {
      setBusy(true);
      const playbookId = await getDefaultPlaybookId();
      const plays = await DataSyncService.getPlays(playbookId, true);
      const now = new Date();
      const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
        now.getDate()
      ).padStart(2, "0")}`;

      let exportPlays = plays;
      if (scope === "selected" && state.selectedPlayIds?.size) {
        exportPlays = plays.filter((p) => state.selectedPlayIds!.has(p.id));
      }
      const csv = CSVService.exportPlaysToCSV(exportPlays, {
        includePrivateNotes: true,
        formatForCoach: true,
      });
      CSVService.downloadCSV(csv, `boxcall-plays-${scope}-${date}.csv`);
    } catch (e) {
      console.error("CSV export failed", e);
      toast.error("CSV export failed", "Please try again");
    } finally {
      setBusy(false);
    }
  };

  const handleExportAll = () => handleExportScope("all");

  const handleOpenImport = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  };

  const handleFileSelected: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setBusy(true);
      const text = await file.text();
      const playbookId = await getDefaultPlaybookId();
      const result = await DataSyncService.importFromCSV(playbookId, text);
      if (result.success) {
        toast.success(
          `Imported ${result.importedPlays} plays`,
          `Processed ${result.totalRows} rows`
        );
      } else {
        toast.warning(
          `Import completed with issues`,
          `Imported ${result.importedPlays} of ${result.totalRows} plays`
        );
      }
      dispatch({ type: "INCREMENT_REFRESH" });
    } catch (err) {
      console.error("CSV import failed", err);
      toast.error("CSV import failed", "Please check your file and try again");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="py-8">
      {/* Header */}
      <PlaybookHeader
        playsCreated={state.playsCreated}
        diagramCoverage={state.diagramCoverage}
        streakDays={state.streakDays}
      />

      {/* Actions Bar */}
      <PlaybookActionsBar
        searchQuery={state.searchQuery}
        onSearchChange={handleSearchChange}
        onQuickNewPracticeScript={handleQuickNewPracticeScript}
        onQuickNewInstall={handleQuickNewGamePlan}
        serverPresets={state.serverPresets}
        filterPresets={state.filterPresets}
        serverPresetsLoading={state.serverPresetsLoading}
        activeServerPresetId={state.activeServerPresetId}
        activePresetId={state.activePresetId}
        onApplyPreset={() => {}}
        onRenamePreset={() => {}}
        onDeletePreset={() => {}}
        onSavePreset={() => {}}
        enableBulkOperations={state.enableBulkOperations}
        onToggleBulk={() => {}}
        onExportCSV={handleExportAll}
        onExportScope={handleExportScope}
        onOpenImport={handleOpenImport}
        playsCreated={state.playsCreated}
        onOpenBuilder={handleOpenBuilder}
        onOpenSettings={handleOpenSettings}
        selectedCount={state.selectedPlayIds?.size || 0}
        onClearSelection={handleClearSelection}
        recentViews={state.recentViews}
      />

      {/* View Tabs */}
      <PlaybookViewTabs
        currentView={state.currentView}
        onViewChange={handleViewChange}
      />

      {/* Workflow Status Indicators */}
      <div className="my-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          📋 Workflow Status
        </h3>
        <div className="flex gap-4 text-sm">
          <span className="text-blue-600">
            Practice Scripts: <span className="font-medium">Ready</span>
          </span>
          <span className="text-green-600">
            Game Plans: <span className="font-medium">Ready</span>
          </span>
          <span className="text-purple-600">
            PDF Export: <span className="font-medium">Available</span>
          </span>
        </div>
        <div className="mt-2 text-xs text-blue-600">
          ⌨️ <strong>Keyboard shortcuts:</strong> Ctrl+P (Practice Script) •
          Ctrl+G (Game Plan)
        </div>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="my-6">
        <AdvancedFilters
          activeFilters={state.advancedFilters}
          onFiltersChange={handleFiltersChange}
        />
        <BulkActionsToolbar
          selectedCount={state.selectedPlayIds?.size || 0}
          onClearSelection={handleClearSelection}
          onBulkAction={handleBulkAction}
        />
      </div>

      {/* Main Play Grid */}
      <PlayGrid
        searchQuery={state.searchQuery}
        filters={state.selectedFilters}
        onAddToPracticeScript={handleAddToPracticeScript}
        onAddToGamePlan={handleAddToGamePlan}
        onEdit={handleEditPlay}
        onDuplicate={handleDuplicatePlay}
      />

      {/* Example: Add a button for new play */}
      <div className="mt-8 flex justify-end">
        <Button variant="primary" size="md">
          <Icon name="plus" className="mr-2" />
          New Play
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileSelected}
        style={{ display: "none" }}
      />
      {busy && (
        <div className="fixed bottom-4 right-4 text-xs py-1 px-2 rounded bg-black/70 text-text-inverse">
          Working…
        </div>
      )}

      {/* Workflow Modals */}
      {showPracticePlanner && (
        <PracticePlannerModal
          event={{
            id: "new-practice",
            title: "New Practice Session",
            start: new Date().toISOString(),
            end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
            type: "practice",
            location: "Practice Field",
            description: "",
          }}
          onClose={() => setShowPracticePlanner(false)}
        />
      )}

      {/* Game Plan Modal */}
      {showGamePlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Icon name="users" className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Create Game Plan</h2>
                    <p className="text-sm text-gray-600">
                      Build your situational game plan
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGamePlanModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Icon name="close" className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opponent *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Riverdale High"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    id="gameplan-opponent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Week Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    defaultValue="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    id="gameplan-week"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Game Date
                  </label>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    id="gameplan-date"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">
                    📋 Game Plan Structure
                  </h3>
                  <p className="text-xs text-blue-600 mb-2">
                    Based on Brian Billick's 12-situation methodology:
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Base Run (1st & 10, 2nd & short)</li>
                    <li>• Base Pass (1st & 10, 2nd & medium)</li>
                    <li>• Second & Long situations</li>
                    <li>• Third Down conversions</li>
                    <li>• Red Zone scoring</li>
                    <li>• And more situational plays...</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button
                  variant="secondary"
                  onClick={() => setShowGamePlanModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={async () => {
                    try {
                      const opponent = (
                        document.getElementById(
                          "gameplan-opponent"
                        ) as HTMLInputElement
                      )?.value?.trim();
                      // TODO: Use week and date in GamePlanService.createGamePlan when extended
                      parseInt(
                        (
                          document.getElementById(
                            "gameplan-week"
                          ) as HTMLInputElement
                        )?.value || "1"
                      );
                      (
                        document.getElementById(
                          "gameplan-date"
                        ) as HTMLInputElement
                      )?.value;

                      if (!opponent) {
                        toast.error(
                          "Opponent required",
                          "Please enter an opponent name"
                        );
                        return;
                      }

                      const teamId = "current-team"; // TODO: Get from context/auth
                      const gamePlan =
                        await GamePlanService.createQuickGamePlan(
                          opponent,
                          teamId
                        );

                      console.log("✅ Game Plan created:", gamePlan);
                      toast.success(
                        `Game Plan "${gamePlan.name}" created successfully!`
                      );

                      setShowGamePlanModal(false);
                    } catch (error) {
                      console.error("Failed to create game plan:", error);
                      toast.error(
                        "Failed to create game plan",
                        "Please try again"
                      );
                    }
                  }}
                >
                  <Icon name="plus" className="h-4 w-4 mr-2" />
                  Create Game Plan
                </Button>
              </div>
            </div>
          </div>
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
    </div>
  );
}
