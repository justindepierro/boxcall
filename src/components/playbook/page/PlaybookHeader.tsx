import React, { useState } from "react";
import { Icon } from "../../ui/Icon/Icon";
import { Badge, ProgressBadge } from "../../ui/Badge";
import { Typography } from "../../design-system/Typography";
import { WeeklyChallengePopover } from "../WeeklyChallengePopover";
import { UniversalSearch } from "../../ui/UniversalSearch";

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
  onOpenSettings?: () => void;
};

export const PlaybookHeader: React.FC<PlaybookHeaderProps> = ({
  title = "Playbook",
  playsCreated,
  diagramCoverage,
  streakDays,
  searchQuery,
  onSearchChange,
  onOpenSettings,
}) => {
  const [showChallenges, setShowChallenges] = useState(false);

  // TODO: Replace with real challenge data from API
  const weeklyChallenges: WeeklyChallenge[] = [
    // This will be replaced with real data from the backend
    // For now, showing empty state
  ];

  return (
    <>
      <header className="surface-subtle shadow-sm border-b border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Icon name="file" className="h-8 w-8 text-jade-600 mr-3" />
              <div className="flex flex-col">
                <Typography
                  variant="headline-md"
                  as="h1"
                  className="text-slate-900"
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

            <div className="flex items-center space-x-4">
              {/* Settings Button */}
              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group"
                  title="Playbook Settings"
                >
                  <Icon
                    name="settings"
                    className="h-5 w-5 text-gray-600 group-hover:text-gray-700"
                  />
                </button>
              )}

              {/* Weekly Challenges Trophy Icon */}
              <button
                onClick={() => setShowChallenges(true)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors group"
                title="Weekly Challenges"
              >
                <Icon
                  name="trophy"
                  className="h-5 w-5 text-purple-600 group-hover:text-purple-700"
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
