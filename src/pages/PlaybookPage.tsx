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
import type { Play } from "../types/play";

export default function PlaybookPage() {
  const { state, dispatch } = usePlaybook();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  // Workflow modal states
  const [showPracticePlanner, setShowPracticePlanner] = useState(false);
  const [showGamePlanModal, setShowGamePlanModal] = useState(false);
  const [_selectedPlayForWorkflow, _setSelectedPlayForWorkflow] =
    useState<Play | null>(null);

  // New modals
  const [showAddNewPlayModal, setShowAddNewPlayModal] = useState(false);
  const [showPlaybookSettingsModal, setShowPlaybookSettingsModal] =
    useState(false);

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
      alert(
        `✅ Added "${play.play_name}" to practice script: "${script.name}"`
      );
    } catch (error) {
      console.error("Failed to add play to practice script:", error);
      alert("Failed to add play to practice script. See console for details.");
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
      alert(`✅ Added "${play.play_name}" to game plan: "${gamePlan.name}"`);
    } catch (error) {
      console.error("Failed to add play to game plan:", error);
      alert("Failed to add play to game plan. See console for details.");
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
      alert("CSV export failed. See console for details.");
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
      alert(
        result.success
          ? `Imported ${result.importedPlays} plays (rows: ${result.totalRows})`
          : `Import completed with errors. Imported ${result.importedPlays} / ${result.totalRows}.`
      );
      dispatch({ type: "INCREMENT_REFRESH" });
    } catch (err) {
      console.error("CSV import failed", err);
      alert("CSV import failed. See console for details.");
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

      {/* Game Plan Modal Placeholder */}
      {showGamePlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Game Plan Creator</h2>
            <p className="text-gray-600 mb-4">
              Game plan creation modal coming soon! This will include Brian
              Billick's 12-situation methodology.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowGamePlanModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  console.log("🎯 Game Plan creation would start here");
                  setShowGamePlanModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Game Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Modals */}
      {showAddNewPlayModal && (
        <AddNewPlayModal
          isOpen={showAddNewPlayModal}
          onClose={() => setShowAddNewPlayModal(false)}
          onCreatePlay={async (playData) => {
            try {
              console.log("Creating new play:", playData);
              // TODO: Implement play creation logic
              alert("Play creation logic will be implemented here");
              setShowAddNewPlayModal(false);
            } catch (error) {
              console.error("Failed to create play:", error);
              alert("Failed to create play. See console for details.");
            }
          }}
        />
      )}

      {showPlaybookSettingsModal && (
        <PlaybookSettingsModal
          isOpen={showPlaybookSettingsModal}
          onClose={() => setShowPlaybookSettingsModal(false)}
          settings={{
            personnelGrouping: "traditional",
            personnelNaming: "numbers",
            defaultPersonnel: "11",
            defaultFormation: "Shotgun",
            enableAutoTagging: true,
            showComplexity: true,
            theme: "auto",
            gridDensity: "comfortable",
          }}
          onSave={(settings) => {
            console.log("Saving playbook settings:", settings);
            // TODO: Implement settings save logic
            alert("Settings save logic will be implemented here");
            setShowPlaybookSettingsModal(false);
          }}
        />
      )}
    </div>
  );
}
