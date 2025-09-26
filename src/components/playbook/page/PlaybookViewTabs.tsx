import React from "react";
import { Icon } from "../../ui/Icon/Icon";
import { Button } from "../../ui/Button/Button";
import { TeamTypeToggle, type TeamType } from "../TeamTypeToggle";

export type CoachingView = "playbook" | "practice-script" | "game-plan";

export type PlaybookViewTabsProps = {
  currentView: CoachingView;
  onViewChange: (view: CoachingView) => void;
  currentTeamType?: TeamType;
  onTeamTypeChange?: (type: TeamType) => void;
  onOpenSettings?: () => void;
  onOpenBuilder?: () => void;
};

export const PlaybookViewTabs: React.FC<PlaybookViewTabsProps> = ({
  currentView,
  onViewChange,
  currentTeamType,
  onTeamTypeChange,
  onOpenSettings,
  onOpenBuilder,
}) => {
  return (
    <div className="flex items-center justify-between w-full">
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
  );
};
