import React from "react";
import { Icon } from "../ui/Icon/Icon";
import { Button } from "../ui/Button/Button";

export type TeamType = "offense" | "defense" | "special-teams";

export type TeamTypeToggleProps = {
  currentType: TeamType;
  onTypeChange: (type: TeamType) => void;
};

const teamTypeConfig = {
  offense: {
    icon: "sword" as const,
    label: "Offense",
    comingSoon: false,
  },
  defense: {
    icon: "shield" as const,
    label: "Defense",
    comingSoon: true,
  },
  "special-teams": {
    icon: "target" as const,
    label: "Special Teams",
    comingSoon: true,
  },
} as const;

export const TeamTypeToggle: React.FC<TeamTypeToggleProps> = ({
  currentType,
  onTypeChange,
}) => {
  return (
    <div className="flex items-center space-x-1 bg-surface-secondary rounded-lg p-1">
      {(Object.keys(teamTypeConfig) as TeamType[]).map((type) => {
        const config = teamTypeConfig[type];
        const isActive = currentType === type;

        return (
          <Button
            key={type}
            id={`team-type-${type}`}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTypeChange(type)}
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            className={`px-3 py-2 relative ${
              config.comingSoon ? "opacity-60" : ""
            }`}
            disabled={config.comingSoon}
            icon={<Icon name={config.icon} />}
            iconPosition="left"
          >
            <span className="text-sm font-medium">{config.label}</span>
            {config.comingSoon && (
              <span className="ml-2 text-xs text-text-muted font-normal">
                Coming soon
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
};
