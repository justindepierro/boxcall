import React from "react";
import { FileText, Clock, Users } from "lucide-react";
import { Button } from "../../ui/Button/Button";

export type CoachingView = "playbook" | "practice-script" | "game-plan";

export type PlaybookViewTabsProps = {
  currentView: CoachingView;
  onViewChange: (view: CoachingView) => void;
};

export const PlaybookViewTabs: React.FC<PlaybookViewTabsProps> = ({
  currentView,
  onViewChange,
}) => {
  return (
    <div className="mt-4">
      <div
        role="tablist"
        aria-label="Views"
        className="surface-card rounded-lg shadow-sm border-subtle p-1 grid grid-cols-3 gap-1"
      >
        <Button
          id="tab-playbook"
          role="tab"
          aria-controls="panel-playbook"
          aria-selected={currentView === "playbook"}
          tabIndex={currentView === "playbook" ? 0 : -1}
          onClick={() => onViewChange("playbook")}
          variant={currentView === "playbook" ? "primary" : "ghost"}
          size="sm"
          className="flex-1 flex items-center justify-center"
        >
          <FileText className="h-4 w-4 mr-2" /> Playbook View
        </Button>
        <Button
          id="tab-practice-script"
          role="tab"
          aria-controls="panel-practice-script"
          aria-selected={currentView === "practice-script"}
          tabIndex={currentView === "practice-script" ? 0 : -1}
          onClick={() => onViewChange("practice-script")}
          variant={currentView === "practice-script" ? "primary" : "ghost"}
          size="sm"
          className="flex-1 flex items-center justify-center"
        >
          <Clock className="h-4 w-4 mr-2" /> Practice Script View
        </Button>
        <Button
          id="tab-game-plan"
          role="tab"
          aria-controls="panel-game-plan"
          aria-selected={currentView === "game-plan"}
          tabIndex={currentView === "game-plan" ? 0 : -1}
          onClick={() => onViewChange("game-plan")}
          variant={currentView === "game-plan" ? "primary" : "ghost"}
          size="sm"
          className="flex-1 flex items-center justify-center"
        >
          <Users className="h-4 w-4 mr-2" /> Game Plan View
        </Button>
      </div>
    </div>
  );
};
