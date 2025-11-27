import { Icon } from "../../ui/Icon/Icon";
import { Button } from "../../ui/Button/Button";
import { Typography } from "../../design-system/Typography";
import { ErrorBoundary } from "../../ui/ErrorBoundary";
import { PlayGrid } from "../PlayGrid";
import { SelectionModeToggle } from "../SelectionModeToggle";
import { FormationSyncPanel } from "../../formations/FormationSyncPanel";
import { AppIconTile } from "../../ui/AppIconTile";
import { Card } from "../../ui/Card";
import { AdvancedFilters } from "../AdvancedFilters";
import { PlaybookStatsDashboard } from "../PlaybookStatsDashboard";
import { RecentActivityFeed } from "../RecentActivityFeed";
import { BulkActionsToolbar } from "../BulkActionsToolbar";
import type { Play } from "../../../types/play";
import type { PlaybookState } from "../../../contexts/PlaybookContext";

interface DesktopPlaybookViewProps {
  // State
  state: PlaybookState;

  // Data
  debouncedSearchQuery: string;
  optimisticPlays: Play[];
  formationAudit: {
    plays: Play[];
    loading: boolean;
    error: string | null;
  };
  playbookStats: any; // TODO: Type properly
  formationAuditSummary: any; // TODO: Type properly
  activeTeamId: string | null;

  // Handlers
  handleEditPlay: (play: Play) => void;
  handleSavePlay: (play: Play) => Promise<void>;
  handleDuplicatePlay: (play: Play) => Promise<void>;
  handleOpenBuilder: () => void;
  handleCreateDiagram: (play: Play) => void;
  handleOpenAssignments: (play: Play) => void;
  handlePostToTeamBulletin: (play: Play) => void;
  handleAddToPracticeScript: (play: Play) => void;
  handleAddToGamePlan: (play: Play) => void;
  handlePlayCountChange: (change: number) => void;
  handleOpenWhiteboard: () => void;
  handleQuickNewPracticeScript: () => void;
  handleQuickNewGamePlan: () => void;
  handleOpenPracticeScriptBuilder: () => void;
  handleFiltersChange: (filters: any) => void;
  handleClearSelection: () => void;
  handleBulkAction: (action: string) => void;
  dispatch: any; // TODO: Type properly
  navigate: (path: string) => void;

  // Suggestions
  suggestions: {
    formations: string[];
    playNames: string[];
  };

  // UI
  mobileButtonSize: any; // TODO: Type properly
}

export function DesktopPlaybookView({
  state,
  debouncedSearchQuery,
  optimisticPlays,
  formationAudit,
  playbookStats,
  formationAuditSummary,
  activeTeamId,
  handleEditPlay,
  handleSavePlay,
  handleDuplicatePlay,
  handleOpenBuilder,
  handleCreateDiagram,
  handleOpenAssignments,
  handlePostToTeamBulletin,
  handleAddToPracticeScript,
  handleAddToGamePlan,
  handlePlayCountChange,
  handleOpenWhiteboard,
  handleQuickNewPracticeScript,
  handleQuickNewGamePlan,
  handleOpenPracticeScriptBuilder,
  handleFiltersChange,
  handleClearSelection,
  handleBulkAction,
  dispatch,
  navigate,
  suggestions,
  mobileButtonSize,
}: DesktopPlaybookViewProps) {
  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Aurora Hero Tiles - Football-Specific Actions */}
      <div className="px-4 sm:px-6 lg:px-8 -mt-4 mb-6 py-4 overflow-visible">
        <div className="flex items-center justify-center gap-4 md:gap-5 lg:gap-4 xl:gap-5 flex-wrap overflow-visible">
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
            onOpen={() => {}} // TODO: Pass handler
          />

          <AppIconTile
            title="Formation Builder"
            subtitle="Visual tool"
            icon="wrench"
            gradient="from-indigo-500 to-purple-600"
            onOpen={() => {}} // TODO: Pass handler
          />

          <AppIconTile
            title="Bulk Actions"
            subtitle={state.enableBulkOperations ? "Selection ON" : "Mass edit"}
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

          <AppIconTile
            title="Formation Mapper"
            subtitle={
              formationAuditSummary.needsMapping > 0
                ? `${formationAuditSummary.needsMapping} need mapping`
                : "All formations linked"
            }
            icon="link"
            gradient="from-amber-500 to-orange-500"
            badge={formationAuditSummary.needsMapping || undefined}
            onOpen={() => navigate("/playbook/formation-mapper")}
          />
        </div>
      </div>

      {formationAudit.plays.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-8 mb-6 transition-all duration-300">
          <div className="rounded-xl shadow-md shadow-jade-500/10 hover:shadow-lg hover:shadow-jade-500/20 transition-all duration-300">
            <FormationSyncPanel
            plays={formationAudit.plays}
            loading={formationAudit.loading}
            error={formationAudit.error}
            onRefresh={() => dispatch({ type: "REFRESH" })}
            onResolve={handleEditPlay}
            onOpenMapper={() => navigate("/playbook/formation-mapper")}
          />
          </div>
        </div>
      )}

      {/* Main Content - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-4 sm:px-6 lg:px-8 overflow-visible">
        {/* Left Sidebar - Controls */}
        <div className="lg:col-span-1 space-y-6 overflow-visible">
          {/* Selection Mode Toggle - NEW! */}
          <div className="rounded-xl shadow-md shadow-jade-500/10 hover:shadow-lg hover:shadow-jade-500/20 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5">
            <SelectionModeToggle
              isActive={state.enableBulkOperations}
              onToggle={() => dispatch({ type: "TOGGLE_BULK" })}
              selectedCount={state.selectedPlayIds?.size || 0}
              label="Select Plays"
            />
          </div>

          {/* Filters - Moved to top */}
          <div className="rounded-xl shadow-md shadow-jade-500/10 hover:shadow-lg hover:shadow-jade-500/20 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5">
            <Card variant="default">
              <AdvancedFilters
                activeFilters={state.advancedFilters}
                onFiltersChange={handleFiltersChange}
              />
            </Card>
          </div>

          {/* Stats Dashboard */}
          <div className="rounded-xl shadow-md shadow-jade-500/10 hover:shadow-lg hover:shadow-jade-500/20 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5">
            <Card variant="default">
              <PlaybookStatsDashboard stats={playbookStats} />
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl shadow-md shadow-jade-500/10 hover:shadow-lg hover:shadow-jade-500/20 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5">
            <Card variant="default">
              <RecentActivityFeed activities={playbookStats.recentActivity} />
            </Card>
          </div>

          {/* Bulk Actions - Only show when items are selected */}
          {(state.selectedPlayIds?.size || 0) > 0 && (
            <div className="rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5">
              <Card variant="default">
                <BulkActionsToolbar
                  selectedCount={state.selectedPlayIds?.size || 0}
                  onClearSelection={handleClearSelection}
                  onBulkAction={handleBulkAction}
                />
              </Card>
            </div>
          )}
        </div>

        {/* Right Side - Main Content Area */}
        <div className="lg:col-span-3 overflow-visible">
          <div className="rounded-xl shadow-lg shadow-jade-500/15 hover:shadow-2xl hover:shadow-jade-500/30 transition-all duration-300 hover:scale-[1.005] hover:-translate-y-1">
            <Card variant="default" size="lg">
            {state.currentView === "playbook" && (
              <ErrorBoundary
                fallback={
                  <div className="p-spacing-lg text-center">
                    <Typography
                      variant="body-md"
                      className="text-secondary"
                    >
                      Failed to load plays. Please refresh the page.
                    </Typography>
                  </div>
                }
              >
                {/* Define common PlayGrid props once - single source of truth */}
                {(() => {
                  const commonPlayGridProps = {
                    searchQuery: debouncedSearchQuery,
                    filters: state.selectedFilters,
                    optimisticPlays: optimisticPlays,
                    onAddToPracticeScript: handleAddToPracticeScript,
                    onAddToGamePlan: handleAddToGamePlan,
                    onEdit: handleEditPlay,
                    onSave: handleSavePlay,
                    onDuplicate: handleDuplicatePlay,
                    onOpenBuilder: handleOpenBuilder,
                    onCreateDiagram: handleCreateDiagram,
                    onOpenAssignments: handleOpenAssignments,
                    onPostToTeamBulletin: handlePostToTeamBulletin,
                    refreshTrigger: state.refreshTrigger,
                    onPlayCountChange: handlePlayCountChange,
                    formationSuggestions: suggestions.formations,
                    playNameSuggestions: suggestions.playNames,
                    enableBulkOperations: state.enableBulkOperations,
                    selectedPlayIds: state.selectedPlayIds,
                    onPlaySelectionChange: (selection: Set<string>) =>
                      dispatch({ type: "SET_SELECTION", selection }),
                  };

                  return <PlayGrid {...commonPlayGridProps} />;
                })()}
              </ErrorBoundary>
            )}

            {state.currentView === "practice-script" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <Typography
                    variant="headline-md"
                    className="text-primary"
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
                  <div>Practice Scripts List Component Here</div> // TODO: Import and use PracticeScriptList
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
                    className="text-primary"
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
                    className="h-16 w-16 text-muted mx-auto mb-4"
                  />
                  <Typography
                    variant="headline-sm"
                    className="text-secondary mb-2"
                  >
                    No Game Plans Yet
                  </Typography>
                  <Typography
                    variant="body-sm"
                    className="text-muted mb-6"
                  >
                    Create your first game plan to strategize plays for upcoming
                    matches.
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
      </div>
    </div>
  );
}
