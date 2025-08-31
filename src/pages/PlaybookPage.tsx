// PlaybookPage - Modern, organized, and feature-rich
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

// TODO: Add hooks and context imports as needed

export default function PlaybookPage() {
  const { state, dispatch } = usePlaybook();

  // Example handlers (replace with real logic as needed)
  const handleSearchChange = (q: string) =>
    dispatch({ type: "SET_SEARCH", query: q });
  const handleViewChange = (view: CoachingView) =>
    dispatch({ type: "SET_VIEW", view });
  const handleFiltersChange = (filters: PlaybookState["advancedFilters"]) =>
    dispatch({ type: "SET_ADVANCED_FILTERS", filters });
  const handleClearSelection = () => dispatch({ type: "CLEAR_SELECTION" });
  const handleBulkAction = (_action: string) => {};

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
        onExportCSV={() => {}}
        onExportScope={() => {}}
        onOpenImport={() => {}}
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
    </div>
  );
}
