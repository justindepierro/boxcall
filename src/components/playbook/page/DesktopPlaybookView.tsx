import { Icon } from "../../ui/Icon/Icon";
import { Button } from "../../ui/Button/Button";
import { Typography } from "../../design-system/Typography";
import { ErrorBoundary } from "../../ui/ErrorBoundary";
import { PlayGrid } from "../PlayGrid";
import { SelectionModeToggle } from "../SelectionModeToggle";
import { FormationSyncPanel } from "../../formations/FormationSyncPanel";
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
  handleOpenAssignments: (play: Play) => void;
  handlePostToTeamBulletin: (play: Play) => void;
  handleAddToPracticeScript: (play: Play) => void;
  handleAddToGamePlan: (play: Play) => void;
  handlePlayCountChange: (change: number) => void;
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
  handleOpenAssignments,
  handlePostToTeamBulletin,
  handleAddToPracticeScript,
  handleAddToGamePlan,
  handlePlayCountChange,
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
    <div className="min-h-screen bg-jade-50/30">
      {/* Quick Action Buttons */}
      <div className="px-8 py-5 border-b border-jade-200/50 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleOpenBuilder}
              variant="primary"
              size="md"
              className="shadow-sm"
            >
              <Icon name="plus-circle" className="h-4 w-4 mr-2" />
              New Play
            </Button>
            
            <Button
              onClick={handleQuickNewPracticeScript}
              variant="secondary"
              size="md"
              className="shadow-sm"
            >
              <Icon name="clipboard-list" className="h-4 w-4 mr-2" />
              Practice
            </Button>
            
            <Button
              onClick={handleQuickNewGamePlan}
              variant="secondary"
              size="md"
              className="shadow-sm"
            >
              <Icon name="target" className="h-4 w-4 mr-2" />
              Game Plan
            </Button>
            
            <Button
              onClick={() => navigate("/playbook/formation-mapper")}
              variant="ghost"
              size="md"
            >
              <Icon name="link" className="h-4 w-4 mr-2" />
              Formation Mapper
              {formationAuditSummary.needsMapping > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                  {formationAuditSummary.needsMapping}
                </span>
              )}
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Typography variant="body-sm" className="text-muted">
              {state.playsCreated} plays total
            </Typography>
          </div>
        </div>
      </div>

      {formationAudit.plays.length > 0 && (
        <div className="px-8 pt-6 mb-6">
          <FormationSyncPanel
            plays={formationAudit.plays}
            loading={formationAudit.loading}
            error={formationAudit.error}
            onRefresh={() => dispatch({ type: "REFRESH" })}
            onResolve={handleEditPlay}
            onOpenMapper={() => navigate("/playbook/formation-mapper")}
          />
        </div>
      )}

      {/* Main Content - Optimized Desktop Layout (20%/80% split) */}
      <div className="max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-spacing-lg px-8 py-6 overflow-visible">
        {/* Left Sidebar - Controls (20% width on desktop) */}
        <div className="lg:col-span-1 space-y-spacing-md overflow-visible">
          {/* Selection Mode Toggle - NEW! */}
          <Card variant="default" interactive className="border-jade-200/60 hover:border-jade-400">
            <SelectionModeToggle
              isActive={state.enableBulkOperations}
              onToggle={() => dispatch({ type: "TOGGLE_BULK" })}
              selectedCount={state.selectedPlayIds?.size || 0}
              label="Select Plays"
            />
          </Card>

          {/* Filters - Moved to top */}
          <Card variant="default" className="border-jade-200/60">
            <AdvancedFilters
              activeFilters={state.advancedFilters}
              onFiltersChange={handleFiltersChange}
            />
          </Card>

          {/* Stats Dashboard */}
          <Card variant="elevated" className="border-jade-200/60">
            <PlaybookStatsDashboard stats={playbookStats} />
          </Card>

          {/* Recent Activity */}
          <Card variant="default" className="border-jade-200/60">
            <RecentActivityFeed activities={playbookStats.recentActivity} />
          </Card>

          {/* Bulk Actions - Only show when items are selected */}
          {(state.selectedPlayIds?.size || 0) > 0 && (
            <Card variant="elevated" className="border-jade-500">
              <BulkActionsToolbar
                selectedCount={state.selectedPlayIds?.size || 0}
                onClearSelection={handleClearSelection}
                onBulkAction={handleBulkAction}
              />
            </Card>
          )}
        </div>

        {/* Main Content Area (80% width on desktop) */}
        <div className="lg:col-span-4 overflow-visible">
          <Card variant="elevated" size="md" className="border-jade-200/60">
            {state.currentView === "playbook" && (
              <ErrorBoundary
                fallback={
                  <div className="p-spacing-lg text-center">
                    <Typography variant="body-md" className="text-secondary">
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
                    onSave: async (playId: string, updates: Partial<Play>) => {
                      // Adapter: PlayGrid expects (playId, updates), but handleSavePlay expects full play
                      const fullPlay = optimisticPlays.find(p => p.id === playId);
                      if (fullPlay) {
                        await handleSavePlay({ ...fullPlay, ...updates });
                      }
                    },
                    onDuplicate: handleDuplicatePlay,
                    onOpenBuilder: handleOpenBuilder,
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
                  <Typography variant="headline-md" className="text-primary">
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
                  <Typography variant="headline-md" className="text-primary">
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
                  <Typography variant="body-sm" className="text-muted mb-6">
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
