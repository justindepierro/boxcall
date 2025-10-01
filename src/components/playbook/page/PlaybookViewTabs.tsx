import React from "react";
import { Icon } from "../../ui/Icon/Icon";
import { Button } from "../../ui/Button/Button";
import { Badge, ProgressBadge } from "../../ui/Badge";
import { Typography } from "../../design-system/Typography";
import { TeamTypeToggle, type TeamType } from "../TeamTypeToggle";

export type CoachingView = "playbook" | "practice-script" | "game-plan";

export type PlaybookViewTabsProps = {
  currentView: CoachingView;
  onViewChange: (view: CoachingView) => void;
  currentTeamType?: TeamType;
  onTeamTypeChange?: (type: TeamType) => void;
  onOpenSettings?: () => void;
  onOpenBuilder?: () => void;
  // Header content props
  title?: string;
  playsCreated: number;
  diagramCoverage: number;
  streakDays: number;
};

export const PlaybookViewTabs: React.FC<PlaybookViewTabsProps> = ({
  currentView,
  onViewChange,
  currentTeamType,
  onTeamTypeChange,
  onOpenSettings,
  onOpenBuilder,
  title = "Playbook",
  playsCreated,
  diagramCoverage,
  streakDays,
}) => {
  return (
    <div className="border-b border-white/20 bg-gradient-to-b from-white/95 to-white/80 dark:from-slate-900/95 dark:to-slate-900/80 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top row: Title, stats, team type selector, and search */}
        <div className="flex items-center justify-between py-5">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-jade-600 shadow-lg shadow-emerald-500/25">
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
              <div className="flex items-center space-x-2 mt-1.5">
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
            {/* Team Type Toggle - moved inline with title */}
            {currentTeamType && onTeamTypeChange && (
              <div className="ml-6">
                <TeamTypeToggle
                  currentType={currentTeamType}
                  onTypeChange={onTeamTypeChange}
                />
              </div>
            )}
          </div>

          {/* Universal Search */}
          <div className="flex-1 max-w-md mx-8">
            {/* Search now handled by GlobalSearch in AppHeader */}
          </div>

          {/* Empty space for balance */}
          <div className="w-24"></div>
        </div>

        {/* Bottom row: Navigation tabs and actions */}
        <div className="flex items-center justify-between pb-4">
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
              className={`px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                currentView === "playbook"
                  ? "bg-gradient-to-r from-emerald-600 to-jade-600 hover:from-emerald-700 hover:to-jade-700 text-white border-emerald-600 shadow-lg shadow-emerald-500/25"
                  : "bg-white/60 hover:bg-white/80 dark:bg-slate-800/60 dark:hover:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50 text-emerald-700 dark:text-emerald-400 backdrop-blur-sm"
              }`}
              icon={
                <Icon
                  name="file"
                  className={
                    currentView === "playbook" ? "text-white" : "text-emerald-600 dark:text-emerald-400"
                  }
                />
              }
              iconPosition="left"
            >
              Playbook
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
              className={`px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                currentView === "practice-script"
                  ? "bg-gradient-to-r from-emerald-600 to-jade-600 hover:from-emerald-700 hover:to-jade-700 text-white border-emerald-600 shadow-lg shadow-emerald-500/25"
                  : "bg-white/60 hover:bg-white/80 dark:bg-slate-800/60 dark:hover:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50 text-emerald-700 dark:text-emerald-400 backdrop-blur-sm"
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
              Practice Scripts
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
              className={`px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                currentView === "game-plan"
                  ? "bg-gradient-to-r from-emerald-600 to-jade-600 hover:from-emerald-700 hover:to-jade-700 text-white border-emerald-600 shadow-lg shadow-emerald-500/25"
                  : "bg-white/60 hover:bg-white/80 dark:bg-slate-800/60 dark:hover:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50 text-emerald-700 dark:text-emerald-400 backdrop-blur-sm"
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
              Game Plans
            </Button>
          </div>

          {/* Action Buttons - Right side */}
          <div className="flex items-center gap-2">
            {/* Weekly Challenges - moved here */}
            <Button
              onClick={() => {}}
              variant="ghost"
              size="sm"
              className="p-2.5 bg-amber-50/80 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 border border-amber-200/50 dark:border-amber-700/50 text-amber-700 dark:text-amber-400 rounded-xl backdrop-blur-sm transition-all duration-200"
              title="Weekly Challenges"
            >
              <Icon name="trophy" className="h-5 w-5" />
            </Button>

            {/* Settings */}
            {onOpenSettings && (
              <Button
                onClick={onOpenSettings}
                variant="ghost"
                size="sm"
                className="px-3 py-2.5 bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border border-blue-200/50 dark:border-blue-700/50 text-blue-700 dark:text-blue-400 rounded-xl backdrop-blur-sm transition-all duration-200"
                icon={<Icon name="settings" />}
                title="Customize your playbook"
              >
                Customize
              </Button>
            )}

            {/* New Play */}
            {onOpenBuilder && (
              <Button
                onClick={onOpenBuilder}
                variant="primary"
                size="sm"
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-jade-600 hover:from-emerald-700 hover:to-jade-700 text-white border border-emerald-600 rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200"
                icon={<Icon name="plus" />}
                title="New Play"
              >
                New Play
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
