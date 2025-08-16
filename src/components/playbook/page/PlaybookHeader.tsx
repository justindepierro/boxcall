import React from "react";

import { Typography } from "../../design-system/Typography";
import { Badge, ProgressBadge, ComplexityBadge } from "../../ui/Badge";
import { Icon } from "../../ui/Icon/Icon";

export type PlaybookHeaderProps = {
  title?: string;
  playsCreated: number;
  diagramCoverage: number;
  streakDays: number;
};

export const PlaybookHeader: React.FC<PlaybookHeaderProps> = ({
  title = "Playbook",
  playsCreated,
  diagramCoverage,
  streakDays,
}) => {
  return (
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
          <div />
        </div>
        <div className="mt-2 surface-card decorative-gradient bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-subtle">
          <div className="flex items-center justify-between">
            <div>
              <Typography
                variant="label-lg"
                as="h3"
                className="text-purple-900 flex items-center gap-2"
              >
                Week 3 Feature: Complexity Challenge System
                <Badge variant="premium" size="sm">
                  NEW
                </Badge>
              </Typography>
              <p className="text-sm text-purple-700 mt-1">
                Your plays are analyzed for complexity and rewarded with badges.
              </p>
            </div>
            <div className="flex gap-2">
              <ComplexityBadge
                metrics={{
                  routeCount: 12,
                  formationComplexity: 10,
                  personnelVariety: 15,
                  conceptDifficulty: 8,
                  totalScore: 45,
                  badge: "intermediate",
                }}
                size="sm"
              />
              <ComplexityBadge
                metrics={{
                  routeCount: 25,
                  formationComplexity: 20,
                  personnelVariety: 20,
                  conceptDifficulty: 15,
                  totalScore: 80,
                  badge: "expert",
                }}
                size="sm"
              />
              <ComplexityBadge
                metrics={{
                  routeCount: 30,
                  formationComplexity: 20,
                  personnelVariety: 25,
                  conceptDifficulty: 20,
                  totalScore: 95,
                  badge: "innovative",
                }}
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
