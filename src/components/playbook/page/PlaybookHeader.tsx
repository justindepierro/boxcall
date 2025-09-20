import React from "react";
import { Icon } from "../../ui/Icon";
import { Badge } from "../../ui/Badge";
import { Typography } from "../../design-system/Typography";
import { UniversalSearchBar } from "../../playbook/UniversalSearchBar";
import {
  WorkflowIndicators,
  type WorkflowSection,
} from "../../ui/WorkflowIndicators";
import { DataFlowSummary } from "../../ui/DataFlowSummary";
import { supabase } from "../../../lib/supabase";
import type { Play } from "../../../types/play";

export type PlaybookHeaderProps = {
  title?: string;
  playsCreated: number;
  diagramCoverage: number;
  streakDays: number;
  // Search functionality
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreatePlay?: (playName: string) => void;
  teamId: string;
  plays?: Play[]; // For universal search
};

export const PlaybookHeader: React.FC<PlaybookHeaderProps> = ({
  title = "Playbook",
  playsCreated,
  diagramCoverage,
  streakDays,
  searchQuery,
  onSearchChange,
  onCreatePlay,
  teamId,
  plays = [],
}) => {
  const [workflowSections, setWorkflowSections] = React.useState<
    WorkflowSection[]
  >([
    {
      id: "playbook",
      name: "Playbook",
      icon: "file",
      status: "in-progress",
      description: "Database creation and play design",
    },
    {
      id: "practice",
      name: "Practice",
      icon: "clipboard-list",
      status: "not-started",
      description: "Weekly practice planning and scripts",
    },
    {
      id: "game-plan",
      name: "Game Plan",
      icon: "target",
      status: "not-started",
      description: "Situational strategy and execution",
    },
    {
      id: "boxcall",
      name: "BoxCall",
      icon: "activity",
      status: "not-started",
      description: "Live execution and analytics",
    },
  ]);

  // Fetch real workflow progress data
  React.useEffect(() => {
    const fetchWorkflowProgress = async () => {
      if (!teamId) return;

      try {
        const { data, error } = await supabase
          .from("workflow_progress")
          .select("*")
          .eq("team_id", teamId);

        if (error) {
          console.error("Error fetching workflow progress:", error);
          return;
        }

        if (data && data.length > 0) {
          // Update workflow sections with real data
          setWorkflowSections((prevSections) =>
            prevSections.map((section) => {
              const progressData = data.find((p) => p.section === section.id);
              if (progressData) {
                return {
                  ...section,
                  status: progressData.status as WorkflowSection["status"],
                };
              }
              return section;
            })
          );
        }
      } catch (error) {
        console.error("Error fetching workflow progress:", error);
      }
    };

    fetchWorkflowProgress();
  }, [teamId]);

  return (
    <header className="surface-subtle border-b border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          {/* Left side - Title, search, and branding */}
          <div className="flex items-center space-x-6 flex-1">
            <div className="flex items-center space-x-4">
              <div className="surface-card flex items-center justify-center w-12 h-12 rounded-lg shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600 opacity-10" />
                <Icon
                  name="file"
                  className="h-6 w-6 text-blue-600 relative z-10"
                />
              </div>
              <div>
                <Typography
                  variant="headline-lg"
                  as="h1"
                  className="text-slate-900 font-semibold"
                >
                  {title}
                </Typography>
                <p className="text-sm text-slate-600 mt-0.5">
                  Design, organize, and execute your offensive plays
                </p>
              </div>
            </div>

            {/* Search Bar - positioned next to title */}
            <div className="flex-1 max-w-md">
              <UniversalSearchBar
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                onCreatePlay={onCreatePlay}
                teamId={teamId}
                plays={plays}
                placeholder="Search across all pages..."
                className="w-full"
              />
            </div>
          </div>

          {/* Center - Workflow Indicators */}
          <div className="hidden lg:flex items-center justify-center px-8">
            <WorkflowIndicators
              currentSection="playbook"
              sections={workflowSections}
            />
          </div>

          {/* Right side - Data flow and key metrics */}
          <div className="flex items-center space-x-8">
            {/* Data Flow Summary */}
            <DataFlowSummary />

            {/* Key metrics */}
            <div className="flex items-center space-x-6">
              {/* Plays Progress */}
              <div className="text-center">
                <Typography
                  variant="headline-md"
                  as="div"
                  className="text-slate-900 font-semibold"
                >
                  {playsCreated}
                </Typography>
                <div className="text-xs text-slate-500 uppercase tracking-wide">
                  Plays Created
                </div>
                <div className="mt-1 w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((playsCreated / 100) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Diagram Coverage */}
              <div className="text-center">
                <Typography
                  variant="headline-md"
                  as="div"
                  className="text-slate-900 font-semibold"
                >
                  {diagramCoverage}%
                </Typography>
                <div className="text-xs text-slate-500 uppercase tracking-wide">
                  Diagram Coverage
                </div>
                <div className="mt-1 w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 rounded-full transition-all duration-500"
                    style={{ width: `${diagramCoverage}%` }}
                  />
                </div>
              </div>

              {/* Streak */}
              {streakDays > 0 && (
                <div className="text-center">
                  <Typography
                    variant="headline-md"
                    as="div"
                    className="text-slate-900 font-semibold"
                  >
                    {streakDays}
                  </Typography>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">
                    Day Streak
                  </div>
                  <div className="mt-1 flex justify-center">
                    <Badge variant="success" size="sm" className="text-xs">
                      <Icon name="zap" className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
