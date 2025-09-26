import React from "react";
import { Icon } from "../../ui/Icon/Icon";
import { Button } from "../../ui/Button/Button";
import { Badge, ProgressBadge } from "../../ui/Badge";
import { Typography } from "../../design-system/Typography";
import { UniversalSearch } from "../../ui/UniversalSearch";
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
  searchQuery: string;
  onSearchChange: (query: string) => void;
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
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="surface-subtle shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top row: Title, stats, and search */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <Icon name="file" className="h-8 w-8 text-text-success mr-3" />
            <div className="flex flex-col">
              <Typography
                variant="headline-md"
                as="h1"
                className="text-text-primary"
              >
                {title}
              </Typography>
              <div className="flex items-center space-x-2 mt-1">
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
                    {streakDays} day streak!
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Universal Search */}
          <div className="flex-1 max-w-md mx-8">
            <UniversalSearch
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              placeholder="Search plays, formations, tags..."
            />
          </div>

          {/* Settings and Weekly Challenges */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => {}}
              variant="ghost"
              size="sm"
              className="p-2"
              title="Weekly Challenges"
            >
              <Icon name="trophy" className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Bottom row: Navigation tabs */}
        <div className="flex items-center justify-between pb-3">
          {/* Team Type Toggle - Left side */}
          <div className="flex items-center">
            {currentTeamType && onTeamTypeChange && (
              <TeamTypeToggle
                currentType={currentTeamType}
                onTypeChange={onTeamTypeChange}
              />
            )}
          </div>

          {/* View Tabs and Actions - Right side */}
          <div className="flex items-center space-x-2">
            {/* View Tabs */}
            <div className="flex items-center space-x-1">
              <Button
                id="tab-playbook"
                role="tab"
                aria-controls="panel-playbook"
                aria-selected={currentView === "playbook"}
                tabIndex={currentView === "playbook" ? 0 : -1}
                onClick={() => onViewChange("playbook")}
                variant={currentView === "playbook" ? "secondary" : "ghost"}
                size="sm"
                className="px-4 py-2"
                icon={<Icon name="file" />}
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
                variant={currentView === "practice-script" ? "secondary" : "ghost"}
                size="sm"
                className="px-4 py-2"
                icon={<Icon name="clock" />}
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
                variant={currentView === "game-plan" ? "secondary" : "ghost"}
                size="sm"
                className="px-4 py-2"
                icon={<Icon name="users" />}
                iconPosition="left"
              >
                Game Plans
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-4">
              {onOpenSettings && (
                <Button
                  onClick={onOpenSettings}
                  variant="ghost"
                  size="sm"
                  className="px-3 py-2"
                  icon={<Icon name="settings" />}
                  title="Playbook Settings"
                />
              )}
              {onOpenBuilder && (
                <Button
                  onClick={onOpenBuilder}
                  variant="primary"
                  size="sm"
                  className="px-3 py-2"
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
    </div>
  );
};
