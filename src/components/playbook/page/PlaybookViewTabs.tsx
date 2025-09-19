import React from "react";
import { Icon } from "../../ui/Icon";
import { Button } from "../../ui/Button/Button";
import { Badge } from "../../ui/Badge";

export type CoachingView = "playbook" | "practice-script" | "game-plan";

export type PlaybookViewTabsProps = {
  currentView: CoachingView;
  onViewChange: (view: CoachingView) => void;
  onSettingsClick?: () => void;
};

const viewConfig = {
  playbook: {
    icon: "file" as const,
    label: "Playbook",
    description: "Design and organize plays",
    badge: null,
  },
  "practice-script": {
    icon: "clock" as const,
    label: "Practice Script",
    description: "Plan practice sessions",
    badge: "New",
  },
  "game-plan": {
    icon: "users" as const,
    label: "Game Plan",
    description: "Execute game strategies",
    badge: null,
  },
};

export const PlaybookViewTabs: React.FC<PlaybookViewTabsProps> = ({
  currentView,
  onViewChange,
  onSettingsClick,
}) => {
  return (
    <div className="bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <div
            role="tablist"
            aria-label="Views"
            className="flex items-center gap-1"
          >
            {(Object.keys(viewConfig) as CoachingView[]).map((view) => {
              const config = viewConfig[view];
              const isActive = currentView === view;

              return (
                <Button
                  key={view}
                  id={`tab-${view}`}
                  role="tab"
                  aria-controls={`panel-${view}`}
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => onViewChange(view)}
                  variant={isActive ? "primary" : "ghost"}
                  size="sm"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-white shadow-sm border border-slate-200"
                      : "hover:bg-white hover:shadow-sm"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Icon name={config.icon} className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium ${
                          isActive ? "text-slate-900" : "text-slate-700"
                        }`}
                      >
                        {config.label}
                      </span>
                      {config.badge && (
                        <Badge variant="info" size="sm" className="text-xs">
                          {config.badge}
                        </Badge>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-0.5 ${
                        isActive ? "text-slate-600" : "text-slate-500"
                      }`}
                    >
                      {config.description}
                    </p>
                  </div>
                </Button>
              );
            })}

            {/* Playbook Settings Button */}
            {onSettingsClick && (
              <Button
                onClick={onSettingsClick}
                variant="ghost"
                size="sm"
                className="ml-4 px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm"
                aria-label="Customize Your Playbook"
              >
                <Icon name="settings" className="h-4 w-4 text-slate-600 mr-2" />
                Customize Your Playbook
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
