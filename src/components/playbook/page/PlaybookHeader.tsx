import React, { useState } from "react";
import { Icon } from "../../ui/Icon/Icon";
import { Badge, ProgressBadge } from "../../ui/Badge";
import { Typography } from "../../design-system/Typography";
import { WeeklyChallengePopover } from "../WeeklyChallengePopover";
import { UniversalSearch } from "../../ui/UniversalSearch";
import { SortDropdown } from "./SortDropdown";
import type { PlaySortOption } from "../../../types/filters";

type WeeklyChallenge = {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: string;
  difficulty: "easy" | "medium" | "hard";
  completed: boolean;
};

export type PlaybookHeaderProps = {
  title?: string;
  playsCreated: number;
  diagramCoverage: number;
  streakDays: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy?: PlaySortOption;
  onSortChange?: (value: PlaySortOption) => void;
  onOpenSettings?: () => void;
  onOpenHealth?: () => void;
};

export const PlaybookHeader: React.FC<PlaybookHeaderProps> = ({
  title = "Playbook",
  playsCreated,
  diagramCoverage,
  streakDays,
  searchQuery,
  onSearchChange,
  sortBy = "name_asc",
  onSortChange,
  onOpenSettings,
  onOpenHealth,
}) => {
  const [showChallenges, setShowChallenges] = useState(false);

  // TODO: Replace with real challenge data from API
  const weeklyChallenges: WeeklyChallenge[] = [
    // This will be replaced with real data from the backend
    // For now, showing empty state
  ];

  return (
    <>
      <header className="bg-subtle shadow-sm">
        <div className="container-page container-padding">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Icon name="file" className="h-8 w-8 text-success mr-3" />
              <div className="flex flex-col">
                <Typography
                  variant="headline-md"
                  as="h1"
                  className="text-primary"
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

            {/* Universal Search + Sort */}
            <div className="flex-1 max-w-lg mx-8 flex items-center gap-3">
              <div className="flex-1">
                <UniversalSearch
                  searchQuery={searchQuery}
                  onSearchChange={onSearchChange}
                  placeholder="Search plays, formations, tags..."
                />
              </div>
              {onSortChange && (
                <SortDropdown value={sortBy} onChange={onSortChange} />
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Playbook Health Button */}
              {onOpenHealth && (
                <button
                  onClick={onOpenHealth}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-50 hover:bg-accent-100 transition-colors group"
                  title="Playbook Health & Data Quality"
                >
                  <Icon
                    name="activity"
                    className="h-5 w-5 text-accent-600 group-hover:text-accent-700"
                  />
                </button>
              )}

              {/* Settings Button */}
              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-border transition-colors group"
                  title="Playbook Settings"
                >
                  <Icon
                    name="settings"
                    className="h-5 w-5 text-secondary group-hover:text-secondary"
                  />
                </button>
              )}

              {/* Weekly Challenges Trophy Icon */}
              <button
                onClick={() => setShowChallenges(true)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary hover:bg-tertiary transition-colors group"
                title="Weekly Challenges"
              >
                <Icon
                  name="trophy"
                  className="h-5 w-5 text-secondary group-hover:text-primary"
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Weekly Challenge Popover */}
      <WeeklyChallengePopover
        isOpen={showChallenges}
        onClose={() => setShowChallenges(false)}
        challenges={weeklyChallenges}
      />
    </>
  );
};
