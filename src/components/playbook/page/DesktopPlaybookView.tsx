import type { FC } from "react";
import { Icon } from "../../ui/Icon/Icon";
import type { IconName } from "../../ui/Icon/Icon";
import { Button } from "../../ui/Button/Button";
import { Typography } from "../../design-system/Typography";
import { ErrorBoundary } from "../../ui/ErrorBoundary";
import { PlayGrid } from "../PlayGrid";
import { SelectionModeToggle } from "../SelectionModeToggle";
import { FormationSyncPanel } from "../../formations/FormationSyncPanel";
import { Card } from "../../ui/Card";
import { AdvancedFilters } from "../AdvancedFilters";
import { PlaybookStatsDashboard } from "../PlaybookStatsDashboard";
import { BulkActionsToolbar } from "../BulkActionsToolbar";
import { PracticeScriptList } from "../PracticeScriptList";
import type { Play } from "../../../types/play";
import type { PlaybookState } from "../../../contexts/PlaybookContext";
import type { PracticeScript } from "../../../services/practiceService";

const TEAM_SETUP_CHECKLIST = [
  "Unlock practice templates tied to your personnel groups.",
  "Auto-track durations across your 8-box layout.",
  "Give assistants access that matches their role.",
  "Surface most-used plays for each install period.",
] as const;

const GAME_PLAN_STEPS: ReadonlyArray<{
  icon: IconName;
  title: string;
  description: string;
}> = [
  {
    icon: "map",
    title: "Situational Buckets",
    description:
      "Group calls by down & distance so coaches can react instantly.",
  },
  {
    icon: "users",
    title: "Personnel Focus",
    description: "Pair 11/12/21 groupings with their best constraint plays.",
  },
  {
    icon: "activity",
    title: "Live Tracking",
    description:
      "Capture execution notes during games for next week's install.",
  },
] as const;

const createPlayGridOnSave =
  (optimisticPlays: Play[], handleSavePlay: (play: Play) => Promise<void>) =>
  async (playId: string, updates: Partial<Play>) => {
    const fullPlay = optimisticPlays.find((p) => p.id === playId);
    if (fullPlay) {
      await handleSavePlay({ ...fullPlay, ...updates });
    }
  };

interface PlaybookGridSectionProps {
  debouncedSearchQuery: string;
  state: PlaybookState;
  optimisticPlays: Play[];
  suggestions: DesktopPlaybookViewProps["suggestions"];
  handleEditPlay: DesktopPlaybookViewProps["handleEditPlay"];
  handleSavePlay: DesktopPlaybookViewProps["handleSavePlay"];
  handleDuplicatePlay: DesktopPlaybookViewProps["handleDuplicatePlay"];
  handleOpenBuilder: DesktopPlaybookViewProps["handleOpenBuilder"];
  handleOpenAssignments: DesktopPlaybookViewProps["handleOpenAssignments"];
  handlePostToTeamBulletin: DesktopPlaybookViewProps["handlePostToTeamBulletin"];
  handleAddToPracticeScript: DesktopPlaybookViewProps["handleAddToPracticeScript"];
  handleAddToGamePlan: DesktopPlaybookViewProps["handleAddToGamePlan"];
  handlePlayCountChange: DesktopPlaybookViewProps["handlePlayCountChange"];
  handleEnterFullscreen: DesktopPlaybookViewProps["handleEnterFullscreen"];
  dispatch: DesktopPlaybookViewProps["dispatch"];
}

const PlaybookGridSection: FC<PlaybookGridSectionProps> = ({
  debouncedSearchQuery,
  state,
  optimisticPlays,
  suggestions,
  handleEditPlay,
  handleSavePlay,
  handleDuplicatePlay,
  handleOpenBuilder,
  handleOpenAssignments,
  handlePostToTeamBulletin,
  handleAddToPracticeScript,
  handleAddToGamePlan,
  handlePlayCountChange,
  handleEnterFullscreen,
  dispatch,
}) => {
  const onSave = createPlayGridOnSave(optimisticPlays, handleSavePlay);

  return (
    <ErrorBoundary
      fallback={
        <div className="p-lg text-center">
          <Typography variant="body-md" className="text-secondary">
            Failed to load plays. Please refresh the page.
          </Typography>
        </div>
      }
    >
      <PlayGrid
        searchQuery={debouncedSearchQuery}
        filters={state.selectedFilters}
        optimisticPlays={optimisticPlays}
        onAddToPracticeScript={handleAddToPracticeScript}
        onAddToGamePlan={handleAddToGamePlan}
        onEdit={handleEditPlay}
        onSave={onSave}
        onDuplicate={handleDuplicatePlay}
        onOpenBuilder={handleOpenBuilder}
        onOpenAssignments={handleOpenAssignments}
        onPostToTeamBulletin={handlePostToTeamBulletin}
        onEnterFullscreen={handleEnterFullscreen}
        refreshTrigger={state.refreshTrigger}
        onPlayCountChange={handlePlayCountChange}
        formationSuggestions={suggestions.formations}
        playNameSuggestions={suggestions.playNames}
        enableBulkOperations={state.enableBulkOperations}
        selectedPlayIds={state.selectedPlayIds}
        onPlaySelectionChange={(selection: Set<string>) =>
          dispatch({ type: "SET_SELECTION", selection })
        }
      />
    </ErrorBoundary>
  );
};

interface PracticeScriptsSectionProps {
  activeTeamId: string | null;
  handleOpenPracticeScriptBuilder: DesktopPlaybookViewProps["handleOpenPracticeScriptBuilder"];
  mobileButtonSize: DesktopPlaybookViewProps["mobileButtonSize"];
  navigate: DesktopPlaybookViewProps["navigate"];
}

const PracticeScriptsSection: FC<PracticeScriptsSectionProps> = ({
  activeTeamId,
  handleOpenPracticeScriptBuilder,
  mobileButtonSize,
  navigate,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Typography variant="headline-md" className="text-primary">
          Practice Scripts
        </Typography>
        <Button
          onClick={() => handleOpenPracticeScriptBuilder()}
          variant="primary"
          size={mobileButtonSize}
        >
          <Icon name="plus" className="h-4 w-4 mr-2" />
          New Script
        </Button>
      </div>

      {activeTeamId ? (
        <PracticeScriptList
          teamId={activeTeamId}
          onEditScript={handleOpenPracticeScriptBuilder}
          onCreateNew={handleOpenPracticeScriptBuilder}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-surface-secondary/60 px-10 py-12 text-center">
          <Icon name="users" className="mx-auto mb-4 h-14 w-14 text-muted" />
          <Typography variant="headline-sm" className="text-primary mb-2">
            Connect a Team to Continue
          </Typography>
          <Typography
            variant="body-sm"
            className="text-secondary mx-auto max-w-2xl"
          >
            Choose a roster from the top navigation to unlock shared practice
            templates, personnel-aware durations, and assistant access controls.
          </Typography>
          <div className="mt-6 grid gap-3 text-left text-sm text-secondary md:grid-cols-2">
            {TEAM_SETUP_CHECKLIST.map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 rounded-xl bg-surface-primary/80 p-4"
              >
                <Icon name="check" className="mt-0.5 h-4 w-4 text-brand-jade" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <Button
            onClick={() => navigate("/teams")}
            variant="primary"
            size={mobileButtonSize}
            className="mt-8"
          >
            <Icon name="arrow-right" className="mr-2 h-4 w-4" />
            Go to Team Manager
          </Button>
        </div>
      )}
    </div>
  );
};

interface GamePlansSectionProps {
  handleQuickNewGamePlan: DesktopPlaybookViewProps["handleQuickNewGamePlan"];
  mobileButtonSize: DesktopPlaybookViewProps["mobileButtonSize"];
  navigate: DesktopPlaybookViewProps["navigate"];
}

const GamePlansSection: FC<GamePlansSectionProps> = ({
  handleQuickNewGamePlan,
  mobileButtonSize,
  navigate,
}) => {
  return (
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

      <div className="rounded-2xl border border-dashed border-border bg-surface-secondary/60 px-8 py-12 text-center">
        <Icon
          name="target"
          className="h-16 w-16 text-brand-jade mx-auto mb-4"
        />
        <Typography variant="headline-sm" className="text-primary mb-2">
          Build Your First Game Plan
        </Typography>
        <Typography
          variant="body-sm"
          className="text-secondary mx-auto max-w-2xl"
        >
          Use Brian Billick's situational framework to script answers for every
          down, distance, and personnel grouping before you hit the field on
          Friday night.
        </Typography>
        <div className="mt-8 grid gap-4 text-left md:grid-cols-3">
          {GAME_PLAN_STEPS.map((step) => (
            <div
              key={step.title}
              className="rounded-xl bg-surface-primary/80 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon name={step.icon} className="h-5 w-5 text-brand-jade" />
                <Typography variant="label-md" className="text-primary">
                  {step.title}
                </Typography>
              </div>
              <Typography variant="body-sm" className="text-secondary">
                {step.description}
              </Typography>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button
            onClick={handleQuickNewGamePlan}
            variant="primary"
            size={mobileButtonSize}
          >
            <Icon name="plus" className="h-4 w-4 mr-2" />
            Create Game Plan
          </Button>
          <Button
            onClick={() => navigate("/playbook/formations")}
            variant="secondary"
            size={mobileButtonSize}
          >
            <Icon name="grid" className="h-4 w-4 mr-2" />
            Review Formations
          </Button>
        </div>
      </div>
    </div>
  );
};

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
  activeTeamId: string | null;

  // Handlers
  handleEditPlay: (play: Play) => void;
  handleSavePlay: (play: Play) => Promise<void>;
  handleDuplicatePlay: (play: Play) => Promise<void>;
  handleOpenBuilder: () => void;
  handleQuickNewGamePlan: () => void;
  handleOpenAssignments: (play: Play) => void;
  handlePostToTeamBulletin: (play: Play) => void;
  handleAddToPracticeScript: (play: Play) => void;
  handleAddToGamePlan: (play: Play) => void;
  handlePlayCountChange: (change: number) => void;
  handleOpenPracticeScriptBuilder: (script?: PracticeScript) => void;
  handleFiltersChange: (filters: any) => void;
  handleClearSelection: () => void;
  handleBulkAction: (action: string) => void;
  handleEnterFullscreen: (plays: Play[], playIndex: number) => void;
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
  activeTeamId,
  handleEditPlay,
  handleSavePlay,
  handleDuplicatePlay,
  handleOpenBuilder,
  handleQuickNewGamePlan,
  handleOpenAssignments,
  handlePostToTeamBulletin,
  handleAddToPracticeScript,
  handleAddToGamePlan,
  handlePlayCountChange,
  handleOpenPracticeScriptBuilder,
  handleFiltersChange,
  handleClearSelection,
  handleBulkAction,
  handleEnterFullscreen,
  dispatch,
  navigate,
  suggestions,
  mobileButtonSize,
}: DesktopPlaybookViewProps) {
  return (
    <div className="min-h-screen bg-subtle">
      {formationAudit.plays.length > 0 && (
        <div className="px-8 pt-6 mb-6">
          <FormationSyncPanel
            plays={formationAudit.plays}
            loading={formationAudit.loading}
            error={formationAudit.error}
            onRefresh={() => dispatch({ type: "REFRESH" })}
            onResolve={handleEditPlay}
          />
        </div>
      )}

      {/* Main Content - Optimized Desktop Layout (20%/80% split) */}
      <div className="max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-lg px-8 py-6 overflow-visible">
          {/* Left Sidebar - Controls (20% width on desktop) */}
          <div className="lg:col-span-1">
            <div
              className="space-y-md overflow-visible lg:sticky lg:self-start lg:overflow-y-auto lg:pr-2"
              style={{
                top: "var(--playbook-sticky-offset, 96px)",
                maxHeight: "calc(100vh - var(--playbook-sticky-offset, 96px))",
              }}
            >
              {/* Selection Mode Toggle - NEW! */}
              <Card
                variant="default"
                interactive
                className="border-muted hover:border-accent"
              >
                <SelectionModeToggle
                  isActive={state.enableBulkOperations}
                  onToggle={() => dispatch({ type: "TOGGLE_BULK" })}
                  selectedCount={state.selectedPlayIds?.size || 0}
                  label="Select Plays"
                />
              </Card>

              {/* Filters - Moved to top */}
              <Card variant="default" className="border-muted">
                <AdvancedFilters
                  activeFilters={state.advancedFilters}
                  onFiltersChange={handleFiltersChange}
                />
              </Card>

              {/* Stats Dashboard */}
              <Card variant="elevated" className="border-muted">
                <PlaybookStatsDashboard stats={playbookStats} />
              </Card>

              {/* Recent Activity - Disabled: activities table not yet created in DB */}
              {/* <Card variant="default" className="border-muted">
                <RecentActivityFeed activities={playbookStats.recentActivity} />
              </Card> */}

              {/* Bulk Actions - Only show when items are selected */}
              {(state.selectedPlayIds?.size || 0) > 0 && (
                <Card variant="elevated" className="border-accent">
                  <BulkActionsToolbar
                    selectedCount={state.selectedPlayIds?.size || 0}
                    onClearSelection={handleClearSelection}
                    onBulkAction={handleBulkAction}
                  />
                </Card>
              )}
            </div>
          </div>

          {/* Main Content Area (80% width on desktop) */}
          <div className="lg:col-span-4 overflow-visible">
            <Card variant="elevated" size="md" className="border-muted">
              {state.currentView === "playbook" && (
                <PlaybookGridSection
                  debouncedSearchQuery={debouncedSearchQuery}
                  state={state}
                  optimisticPlays={optimisticPlays}
                  suggestions={suggestions}
                  handleEditPlay={handleEditPlay}
                  handleSavePlay={handleSavePlay}
                  handleDuplicatePlay={handleDuplicatePlay}
                  handleOpenBuilder={handleOpenBuilder}
                  handleOpenAssignments={handleOpenAssignments}
                  handlePostToTeamBulletin={handlePostToTeamBulletin}
                  handleAddToPracticeScript={handleAddToPracticeScript}
                  handleAddToGamePlan={handleAddToGamePlan}
                  handlePlayCountChange={handlePlayCountChange}
                  handleEnterFullscreen={handleEnterFullscreen}
                  dispatch={dispatch}
                />
              )}

              {state.currentView === "practice-script" && (
                <PracticeScriptsSection
                  activeTeamId={activeTeamId}
                  handleOpenPracticeScriptBuilder={
                    handleOpenPracticeScriptBuilder
                  }
                  mobileButtonSize={mobileButtonSize}
                  navigate={navigate}
                />
              )}

              {state.currentView === "game-plan" && (
                <GamePlansSection
                  handleQuickNewGamePlan={handleQuickNewGamePlan}
                  mobileButtonSize={mobileButtonSize}
                  navigate={navigate}
                />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
