import React from "react";
import { Icon } from "../../ui/Icon/Icon";
import { Button } from "../../ui/Button/Button";
import { Badge, ProgressBadge } from "../../ui/Badge";
import { Typography } from "../../design-system/Typography";
import { TeamTypeToggle, type TeamType } from "../TeamTypeToggle";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import { PlaybookSelector } from "../PlaybookSelector";

export type CoachingView =
  | "playbook"
  | "practice-script"
  | "game-plan"
  | "analytics";

interface Playbook {
  id: string;
  team_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  play_count: number;
  created_at: string;
  updated_at: string;
}

export type PlaybookViewTabsProps = {
  currentView: CoachingView;
  onViewChange: (view: CoachingView) => void;
  currentTeamType?: TeamType;
  onTeamTypeChange?: (type: TeamType) => void;
  onOpenSettings?: () => void;
  onOpenBuilder?: () => void;
  onOpenHealth?: () => void;
  // Header content props
  title?: string;
  playsCreated: number;
  diagramCoverage: number;
  streakDays: number;
  // Playbook selector props
  playbooks?: Playbook[];
  activePlaybookId?: string;
  onPlaybookChange?: (playbookId: string) => void;
  onPlaybookUpdated?: () => void;
  teamId?: string;
};

export const PlaybookViewTabs: React.FC<PlaybookViewTabsProps> = ({
  currentView,
  onViewChange,
  currentTeamType,
  onTeamTypeChange,
  onOpenSettings,
  onOpenBuilder,
  onOpenHealth,
  title = "Playbook",
  playsCreated,
  diagramCoverage,
  streakDays,
  playbooks,
  activePlaybookId,
  onPlaybookChange,
  onPlaybookUpdated,
  teamId,
}) => {
  return (
    <div className="divider-b bg-gradient-to-b from-white/95 to-white/80 dark:from-slate-900/95 dark:to-slate-900/80 shadow-sm">
      <div className="container-page container-padding">
        {/* Top row: Title, stats, team type selector, and search */}
        <div className="flex items-center justify-between py-3 overflow-visible">
          <div className="flex items-center space-x-4 overflow-visible">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-jade-600 shadow-lg shadow-emerald-500/25 overflow-visible">
              <Icon name="file" className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <Typography
                variant="headline-md"
                as="h1"
                className="text-text-primary font-semibold"
              >
                {title}
              </Typography>
              <div className="flex items-center flex-wrap gap-2 mt-1.5 overflow-visible">
                <ProgressBadge
                  progress={Math.round((playsCreated / 100) * 100)}
                >
                  {playsCreated}/100 plays
                </ProgressBadge>
                <Badge variant="info" size="sm">
                  Diagram {diagramCoverage}%
                </Badge>
                {streakDays > 0 && (
                  <Badge variant="success" size="sm">
                    🔥 {streakDays} day streak
                  </Badge>
                )}
              </div>
            </div>
            {/* Team Type Toggle - responsive: hidden on mobile, shows on md+ */}
            {currentTeamType && onTeamTypeChange && (
              <div className="hidden md:block md:ml-6">
                <TeamTypeToggle
                  currentType={currentTeamType}
                  onTypeChange={onTeamTypeChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom row: Navigation tabs and actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
          {/* View Tabs - Left side */}
          <div className="flex items-center gap-2">
            <Button
              id="tab-playbook"
              role="tab"
              aria-controls="panel-playbook"
              aria-selected={currentView === "playbook"}
              tabIndex={currentView === "playbook" ? 0 : -1}
              onClick={() => onViewChange("playbook")}
              variant="ghost"
              size="sm"
              className={`px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm ${
                currentView === "playbook"
                  ? "bg-gradient-to-r from-emerald-600 to-jade-600 hover:from-emerald-700 hover:to-jade-700 text-white shadow-lg shadow-emerald-500/25"
                  : "bg-white/60 hover:bg-white/90 dark:bg-slate-800/60 dark:hover:bg-slate-800/90 text-emerald-700 dark:text-emerald-400"
              }`}
              icon={
                <Icon
                  name="file"
                  className={
                    currentView === "playbook"
                      ? "text-white"
                      : "text-emerald-600 dark:text-emerald-400"
                  }
                />
              }
              iconPosition="left"
            >
              <span className="hidden md:inline">Playbook</span>
            </Button>
            <Button
              id="tab-practice-script"
              role="tab"
              aria-controls="panel-practice-script"
              aria-selected={currentView === "practice-script"}
              tabIndex={currentView === "practice-script" ? 0 : -1}
              onClick={() => onViewChange("practice-script")}
              variant="ghost"
              size="sm"
              className={`px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm ${
                currentView === "practice-script"
                  ? "bg-gradient-to-r from-emerald-600 to-jade-600 hover:from-emerald-700 hover:to-jade-700 text-white shadow-lg shadow-emerald-500/25"
                  : "bg-white/60 hover:bg-white/90 dark:bg-slate-800/60 dark:hover:bg-slate-800/90 text-emerald-700 dark:text-emerald-400"
              }`}
              icon={
                <Icon
                  name="clock"
                  className={
                    currentView === "practice-script"
                      ? "text-white"
                      : "text-emerald-600 dark:text-emerald-400"
                  }
                />
              }
              iconPosition="left"
            >
              <span className="hidden md:inline">Practice Scripts</span>
            </Button>
            <Button
              id="tab-game-plan"
              role="tab"
              aria-controls="panel-game-plan"
              aria-selected={currentView === "game-plan"}
              tabIndex={currentView === "game-plan" ? 0 : -1}
              onClick={() => onViewChange("game-plan")}
              variant="ghost"
              size="sm"
              className={`px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm ${
                currentView === "game-plan"
                  ? "bg-gradient-to-r from-emerald-600 to-jade-600 hover:from-emerald-700 hover:to-jade-700 text-white shadow-lg shadow-emerald-500/25"
                  : "bg-white/60 hover:bg-white/90 dark:bg-slate-800/60 dark:hover:bg-slate-800/90 text-emerald-700 dark:text-emerald-400"
              }`}
              icon={
                <Icon
                  name="users"
                  className={
                    currentView === "game-plan"
                      ? "text-white"
                      : "text-emerald-600 dark:text-emerald-400"
                  }
                />
              }
              iconPosition="left"
            >
              <span className="hidden md:inline">Game Plans</span>
            </Button>
            <Button
              id="tab-analytics"
              role="tab"
              aria-controls="panel-analytics"
              aria-selected={currentView === "analytics"}
              tabIndex={currentView === "analytics" ? 0 : -1}
              onClick={() => onViewChange("analytics")}
              variant="ghost"
              size="sm"
              className={`px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm ${
                currentView === "analytics"
                  ? "bg-gradient-to-r from-emerald-600 to-jade-600 hover:from-emerald-700 hover:to-jade-700 text-white shadow-lg shadow-emerald-500/25"
                  : "bg-white/60 hover:bg-white/90 dark:bg-slate-800/60 dark:hover:bg-slate-800/90 text-emerald-700 dark:text-emerald-400"
              }`}
              icon={
                <Icon
                  name="bar-chart"
                  className={
                    currentView === "analytics"
                      ? "text-white"
                      : "text-emerald-600 dark:text-emerald-400"
                  }
                />
              }
              iconPosition="left"
            >
              <span className="hidden md:inline">Analytics</span>
            </Button>
          </div>

          {/* Action Buttons - Right side */}
          <div className="flex items-center gap-2 overflow-visible">
            {/* Playbook Selector - Compact inline version */}
            {playbooks &&
              playbooks.length > 0 &&
              activePlaybookId &&
              onPlaybookChange &&
              teamId && (
                <PlaybookSelector
                  playbooks={playbooks}
                  activePlaybookId={activePlaybookId}
                  onPlaybookChange={onPlaybookChange}
                  onPlaybookUpdated={onPlaybookUpdated}
                  teamId={teamId}
                />
              )}

            {/* Playbook Health */}
            {onOpenHealth && (
              <Button
                onClick={() => {
                  triggerHapticFeedback("light");
                  onOpenHealth();
                }}
                variant="ghost"
                size="sm"
                className="w-11 h-11 !p-0 flex items-center justify-center bg-accent-50 hover:bg-accent-100 dark:bg-accent-900/20 dark:hover:bg-accent-900/30 text-accent-600 dark:text-accent-500 rounded-xl transition-all duration-200 overflow-visible"
                title="Playbook Health & Data Quality"
              >
                <Icon name="activity" className="h-5 w-5" />
              </Button>
            )}

            {/* Weekly Challenges - moved here */}
            <Button
              onClick={() => {
                triggerHapticFeedback("light");
              }}
              variant="ghost"
              size="sm"
              className="w-11 h-11 !p-0 flex items-center justify-center bg-warning-bg/80 hover:bg-warning-bg dark:bg-warning-900/20 dark:hover:bg-warning-900/30 text-warning-600 dark:text-warning-500 rounded-xl transition-all duration-200 overflow-visible"
              title="Weekly Challenges"
            >
              <Icon name="trophy" className="h-5 w-5" />
            </Button>

            {/* Settings */}
            {onOpenSettings && (
              <Button
                onClick={() => {
                  triggerHapticFeedback("light");
                  onOpenSettings();
                }}
                variant="ghost"
                size="sm"
                className="h-11 px-4 !py-0 flex items-center gap-2 bg-status-info-bg/80 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl transition-all duration-200"
                title="Customize your playbook"
              >
                <Icon name="settings" className="h-5 w-5" />
                <span className="hidden lg:inline">Customize</span>
              </Button>
            )}

            {/* New Play */}
            {onOpenBuilder && (
              <Button
                onClick={() => {
                  triggerHapticFeedback("light");
                  onOpenBuilder();
                }}
                variant="primary"
                size="sm"
                className="h-11 px-4 !py-0 flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-jade-600 hover:from-emerald-700 hover:to-jade-700 text-white rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200"
                title="New Play"
              >
                <Icon name="plus" className="h-5 w-5" />
                <span className="hidden lg:inline">New Play</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
