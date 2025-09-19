// PlaybookPage - Modern, organized, and feature-rich
import { useRef, useState } from "react";
import { PlaybookHeader } from "../components/playbook/page/PlaybookHeader";
import { PlaybookActionsBar } from "../components/playbook/page/PlaybookActionsBar";
import { PlaybookViewTabs } from "../components/playbook/page/PlaybookViewTabs";
import { PlayGrid } from "../components/playbook/PlayGrid";
import { AdvancedFilters } from "../components/playbook/AdvancedFilters";
import { BulkActionsToolbar } from "../components/playbook/BulkActionsToolbar";
import { Modal } from "../components/ui/Modal";
import { VisualPlayBuilder } from "../components/playbook/diagram/VisualPlayBuilder";
import { QuickPlayForm } from "../components/playbook/QuickPlayForm";
import { PlaybookSettingsModal } from "../components/playbook/PlaybookSettings";
import { PersonnelSettingsService } from "@services";
import { usePlaybook } from "../contexts/PlaybookContext";
import type { CoachingView, PlaybookState } from "../contexts/PlaybookContext";
import type { Play } from "../types/play";
import { CSVService, DataSyncService, PlaysService } from "@services";
import { useTeamsData } from "../hooks/useTeamsData";
import { useRoles } from "../hooks/useRoles";

// Convert database play data to full Play type (minimal for search)
const mapDatabasePlayToFullPlay = (dbPlay: {
  id: string;
  playbook_id: string;
  formation: string;
  play_name: string;
  p_type: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}): Play => ({
  id: dbPlay.id,
  playbook_id: dbPlay.playbook_id,
  formation: dbPlay.formation,
  play_name: dbPlay.play_name,
  p_type: dbPlay.p_type as Play["p_type"],
  notes: dbPlay.notes || "",
  one_word_play: "",
  personnel: "",
  confidence_base: 70,
  times_called: 0,
  times_successful: 0,
  created_by: "",
  created_at: new Date(dbPlay.created_at),
  updated_at: new Date(dbPlay.updated_at),
});

// TODO: Add hooks and context imports as needed

export default function PlaybookPage() {
  const { state, dispatch } = usePlaybook();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [showQuickPlayForm, setShowQuickPlayForm] = useState(false);
  const [creatingPlay, setCreatingPlay] = useState(false);

  // Get current user's team for universal search
  const { roleContext } = useRoles();
  const currentTeamId =
    roleContext?.teamMemberships?.[0]?.teamId || "demo-team";

  // Get plays data for universal search
  const { plays: allPlays } = useTeamsData();
  const plays = (allPlays || []).map(mapDatabasePlayToFullPlay);

  // Example handlers (replace with real logic as needed)
  const handleSearchChange = (q: string) =>
    dispatch({ type: "SET_SEARCH", query: q });
  const handleViewChange = (view: CoachingView) =>
    dispatch({ type: "SET_VIEW", view });
  const handleFiltersChange = (filters: PlaybookState["advancedFilters"]) =>
    dispatch({ type: "SET_ADVANCED_FILTERS", filters });
  const handleClearSelection = () => dispatch({ type: "CLEAR_SELECTION" });
  const handleBulkAction = (_action: string) => {
    // TODO: Implement bulk actions
    console.info("Bulk action:", _action);
  };

  // Navigation and creation handlers
  const handleQuickNewPracticeScript = () => {
    window.location.href = "/practice-planner";
  };
  const handleQuickNewInstall = () => {
    window.location.href = "/game-plan";
  };
  const handleOpenQuickPlayForm = () => {
    setShowQuickPlayForm(true);
  };
  const handleCloseQuickPlayForm = () => {
    setShowQuickPlayForm(false);
  };
  const handleOpenBuilder = () => {
    dispatch({ type: "SET_SHOW_BUILDER", value: true });
  };
  const handleCloseBuilder = () => {
    dispatch({ type: "SET_SHOW_BUILDER", value: false });
  };

  // Handle quick play creation
  const handleQuickPlaySubmit = async (playData: Partial<Play>) => {
    try {
      setCreatingPlay(true);
      await PlaysService.createPlay(playData);
      dispatch({ type: "INCREMENT_REFRESH" });
      // Clear search query in case it was used to trigger the modal
      dispatch({ type: "SET_SEARCH", query: "" });
      setShowQuickPlayForm(false);
    } catch (error) {
      console.error("Failed to create play:", error);
      alert("Failed to create play. Please try again.");
    } finally {
      setCreatingPlay(false);
    }
  };

  // Handle creating play from search
  const handleCreatePlayFromSearch = async (playName: string) => {
    try {
      setCreatingPlay(true);
      await PlaysService.createPlay({
        play_name: playName,
        p_type: "Pass", // Default type
        formation: "", // Will be set later
      });
      dispatch({ type: "INCREMENT_REFRESH" });
      // Clear the search query after successful creation
      dispatch({ type: "SET_SEARCH", query: "" });
      // Show success feedback
      alert(`Play "${playName}" created successfully!`);
    } catch (error) {
      console.error("Failed to create play from search:", error);
      alert(
        `Failed to create play: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setCreatingPlay(false);
    }
  };

  // Preset management handlers
  const handleApplyPreset = (presetId: string) => {
    // Check if it's a server preset or local preset
    const serverPreset = state.serverPresets.find((p) => p.id === presetId);
    if (serverPreset) {
      dispatch({ type: "SET_ACTIVE_SERVER_PRESET", id: presetId });
      dispatch({ type: "ADD_RECENT_VIEW", id: presetId, scope: "server" });
    } else {
      dispatch({ type: "SET_ACTIVE_PRESET", id: presetId });
      dispatch({ type: "ADD_RECENT_VIEW", id: presetId, scope: "local" });
    }
  };
  const handleRenamePreset = (presetId: string) => {
    const newName = prompt("Enter new preset name:");
    if (newName && newName.trim()) {
      // TODO: Implement preset renaming API call
      console.info("Rename preset:", presetId, "to:", newName);
    }
  };
  const handleDeletePreset = (presetId: string) => {
    if (confirm("Are you sure you want to delete this preset?")) {
      // TODO: Implement preset deletion API call
      console.info("Delete preset:", presetId);
    }
  };
  const handleSavePreset = () => {
    const name = prompt("Enter preset name:");
    if (name && name.trim()) {
      // TODO: Implement preset saving API call
      console.info("Save preset with name:", name);
    }
  };
  const handleToggleBulk = () => {
    dispatch({ type: "TOGGLE_BULK" });
  };

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
    } catch (_e) {
      // console.error("CSV export failed", _e);
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
    } catch (_err) {
      // console.error("CSV import failed", _err);
      alert("CSV import failed. See console for details.");
    } finally {
      setBusy(false);
    }
  };

  // Personnel settings handlers
  const handleOpenPersonnelSettings = () => {
    dispatch({ type: "SHOW_PERSONNEL_SETTINGS" });
  };

  const handleClosePersonnelSettings = () => {
    dispatch({ type: "HIDE_PERSONNEL_SETTINGS" });
  };

  const handleSavePersonnelSettings = async (
    settings: typeof state.personnelSettings
  ) => {
    try {
      // Save to server first
      const success = await PersonnelSettingsService.saveSettings(settings);
      if (success) {
        // Update local state
        dispatch({ type: "SET_PERSONNEL_SETTINGS", settings });
      } else {
        alert("Failed to save personnel settings. Please try again.");
        return;
      }
    } catch (error) {
      console.error("Error saving personnel settings:", error);
      alert("Failed to save personnel settings. Please try again.");
      return;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <PlaybookHeader
        playsCreated={state.playsCreated}
        diagramCoverage={state.diagramCoverage}
        streakDays={state.streakDays}
        searchQuery={state.searchQuery}
        onSearchChange={handleSearchChange}
        onCreatePlay={handleCreatePlayFromSearch}
        teamId={currentTeamId}
        plays={plays}
      />

      {/* View Tabs - Moved above actions bar */}
      <PlaybookViewTabs
        currentView={state.currentView}
        onViewChange={handleViewChange}
        onSettingsClick={handleOpenPersonnelSettings}
      />

      {/* Actions Bar */}
      <PlaybookActionsBar
        onQuickNewPracticeScript={handleQuickNewPracticeScript}
        onQuickNewInstall={handleQuickNewInstall}
        serverPresets={state.serverPresets}
        filterPresets={state.filterPresets}
        serverPresetsLoading={state.serverPresetsLoading}
        activeServerPresetId={state.activeServerPresetId}
        activePresetId={state.activePresetId}
        onApplyPreset={handleApplyPreset}
        onRenamePreset={handleRenamePreset}
        onDeletePreset={handleDeletePreset}
        onSavePreset={handleSavePreset}
        enableBulkOperations={state.enableBulkOperations}
        onToggleBulk={handleToggleBulk}
        onExportCSV={handleExportAll}
        onExportScope={handleExportScope}
        onOpenImport={handleOpenImport}
        playsCreated={state.playsCreated}
        onOpenBuilder={handleOpenBuilder}
        onOpenQuickPlayForm={handleOpenQuickPlayForm}
        selectedCount={state.selectedPlayIds?.size || 0}
        onClearSelection={handleClearSelection}
        recentViews={state.recentViews}
      />

      {/* Filters and Bulk Actions */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PlayGrid
          searchQuery={state.searchQuery}
          filters={state.selectedFilters}
          onOpenQuickPlayForm={handleOpenQuickPlayForm}
          refreshTrigger={state.refreshTrigger}
        />
      </div>

      {/* Hidden file input for CSV import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileSelected}
        style={{ display: "none" }}
      />

      {/* Busy indicator */}
      {busy && (
        <div className="fixed bottom-4 right-4 surface-card text-slate-900 text-xs py-2 px-3 rounded-lg shadow-lg z-50 border border-slate-200">
          Working…
        </div>
      )}

      {/* Play Builder Modal */}
      <Modal
        isOpen={state.showBuilder}
        onClose={handleCloseBuilder}
        title="Create New Play"
        size="xl 2xl:3xl"
        closeOnBackdropClick={false}
        className="h-[90vh]"
      >
        <div className="h-full">
          <VisualPlayBuilder
            onClose={handleCloseBuilder}
            onDocumentChange={(doc) => {
              console.info("Play document changed:", doc);
            }}
          />
        </div>
      </Modal>

      {/* Quick Play Form Modal */}
      <Modal
        isOpen={showQuickPlayForm}
        onClose={handleCloseQuickPlayForm}
        title="Quick Add Play"
        size="md"
      >
        <QuickPlayForm
          onSubmit={handleQuickPlaySubmit}
          onCancel={handleCloseQuickPlayForm}
          isLoading={creatingPlay}
        />
      </Modal>

      {/* Playbook Settings Modal */}
      <PlaybookSettingsModal
        isOpen={state.showPersonnelSettings}
        onClose={handleClosePersonnelSettings}
        settings={state.personnelSettings}
        onSave={handleSavePersonnelSettings}
      />
    </div>
  );
}
