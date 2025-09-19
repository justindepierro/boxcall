// PlaybookPage - Modern, organized, and feature-rich
import { useRef, useState } from "react";
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

// TODO: Add hooks and context imports as needed

export default function PlaybookPage() {
  const { state, dispatch } = usePlaybook();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  // Example handlers (replace with real logic as needed)
  const handleSearchChange = (q: string) =>
    dispatch({ type: "SET_SEARCH", query: q });
  const handleViewChange = (view: CoachingView) =>
    dispatch({ type: "SET_VIEW", view });
  const handleFiltersChange = (filters: PlaybookState["advancedFilters"]) =>
    dispatch({ type: "SET_ADVANCED_FILTERS", filters });
  const handleClearSelection = () => dispatch({ type: "CLEAR_SELECTION" });
  const handleBulkAction = (_action: string) => {};

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
        onQuickNewPracticeScript={() => {}}
        onQuickNewInstall={() => {}}
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
        onOpenBuilder={() => {}}
        selectedCount={state.selectedPlayIds?.size || 0}
        onClearSelection={handleClearSelection}
        recentViews={state.recentViews}
      />

      {/* View Tabs */}
      <PlaybookViewTabs
        currentView={state.currentView}
        onViewChange={handleViewChange}
      />

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
    </div>
  );
}
