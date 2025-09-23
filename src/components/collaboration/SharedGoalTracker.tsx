/**
 * Shared Goal Tracker Component
 * Phase 2B Sprint 6: Collaborative Planning Tools
 *
 * Features:
 * - Team and individual goal setting
 * - Real-time progress tracking
 * - Collaborative goal modification
 * - Achievement celebrations
 */

import React, { useState, useCallback } from "react";
import { CollaborativeWidget } from "./CollaborativeWidget";
import { Button, Card, Input, TextArea } from "../ui";
import { Typography } from "../design-system/Typography";
import { Icon } from "../ui/Icon/Icon";

interface Goal {
  id: string;
  title: string;
  description: string;
  type: "team" | "individual" | "season";
  targetDate: string;
  progress: number; // 0-100
  createdBy: string;
  assignedTo?: string;
  milestones: Milestone[];
  status: "active" | "completed" | "paused" | "cancelled";
  category: "performance" | "training" | "academic" | "teamwork";
}

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedDate?: string;
  targetDate: string;
}

export interface SharedGoalTrackerProps {
  /**
   * Widget ID for collaboration
   */
  widgetId: string;

  /**
   * Current user's role
   */
  userRole: "coach" | "player" | "family";

  /**
   * Current user ID
   */
  userId: string;

  /**
   * Team ID
   */
  teamId: string;

  /**
   * Initial goals data
   */
  goals?: Goal[];

  /**
   * Callback when goals are updated
   */
  onGoalsUpdate?: (goals: Goal[]) => void;

  /**
   * Mock collaboration data
   */
  mockCollaboration?: {
    participants: Array<{ id: string; name: string; avatar?: string }>;
    cursors: Array<{
      userId: string;
      userName: string;
      x: number;
      y: number;
      action: "hover" | "click" | "typing";
      color: string;
    }>;
    isConnected: boolean;
  };
}

export const SharedGoalTracker: React.FC<SharedGoalTrackerProps> = ({
  widgetId,
  userRole,
  userId,
  teamId: _teamId,
  goals = [],
  onGoalsUpdate,
  mockCollaboration,
}) => {
  const [localGoals, setLocalGoals] = useState<Goal[]>(goals);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [_selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [filter, setFilter] = useState<"all" | "my" | "team">("all");

  /**
   * Handle collaborative data changes
   */
  const handleCollaborativeDataChange = useCallback(
    (newData: Record<string, unknown>) => {
      if (newData.goals) {
        const updatedGoals = newData.goals as Goal[];
        setLocalGoals(updatedGoals);
        onGoalsUpdate?.(updatedGoals);
      }
    },
    [onGoalsUpdate]
  );

  /**
   * Create a new goal
   */
  const handleCreateGoal = useCallback(
    (goalData: Partial<Goal>) => {
      const newGoal: Goal = {
        id: `goal-${Date.now()}`,
        title: goalData.title || "",
        description: goalData.description || "",
        type: goalData.type || "individual",
        targetDate: goalData.targetDate || "",
        progress: 0,
        createdBy: userId,
        assignedTo: goalData.assignedTo,
        milestones: [],
        status: "active",
        category: goalData.category || "performance",
      };

      const updatedGoals = [...localGoals, newGoal];
      setLocalGoals(updatedGoals);
      onGoalsUpdate?.(updatedGoals);
      setIsCreatingGoal(false);
    },
    [localGoals, userId, onGoalsUpdate]
  );

  /**
   * Filter goals based on selection
   */
  const filteredGoals = localGoals.filter((goal) => {
    if (filter === "all") return true;
    if (filter === "my")
      return goal.createdBy === userId || goal.assignedTo === userId;
    if (filter === "team") return goal.type === "team";
    return true;
  });

  /**
   * Get progress color
   */
  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "text-success";
    if (progress >= 70) return "text-primary";
    if (progress >= 40) return "text-warning";
    return "text-text-secondary";
  };

  return (
    <CollaborativeWidget
      widgetId={widgetId}
      onDataChange={handleCollaborativeDataChange}
      className="shared-goal-tracker"
      mockCollaboration={mockCollaboration}
    >
      <Card variant="glass" className="h-full p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Typography variant="headline-sm" as="h3">
            Team Goals & Progress
          </Typography>
          <div className="flex items-center gap-2">
            {/* Filter Options */}
            <div className="flex bg-surface-secondary rounded-lg p-1">
              <Button
                variant={filter === "all" ? "primary" : "ghost"}
                size="xs"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "my" ? "primary" : "ghost"}
                size="xs"
                onClick={() => setFilter("my")}
              >
                Mine
              </Button>
              <Button
                variant={filter === "team" ? "primary" : "ghost"}
                size="xs"
                onClick={() => setFilter("team")}
              >
                Team
              </Button>
            </div>

            {/* Create Goal Button */}
            {(userRole === "coach" || userRole === "player") && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreatingGoal(true)}
              >
                <Icon name="plus" size="xs" />
                New Goal
              </Button>
            )}
          </div>
        </div>

        {/* Goals List */}
        <div className="space-y-3 mb-4">
          {filteredGoals.length === 0 ? (
            <div className="text-center py-8">
              <Icon
                name="target"
                size="lg"
                className="mx-auto mb-2 text-text-muted"
              />
              <Typography variant="body-sm" color="muted">
                {filter === "all"
                  ? "No goals set yet. Create your first goal!"
                  : `No ${filter} goals found.`}
              </Typography>
            </div>
          ) : (
            filteredGoals.map((goal) => (
              <Card
                key={goal.id}
                variant="glass"
                className="p-3 hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => setSelectedGoal(goal)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Typography variant="body-sm" className="font-medium">
                        {goal.title}
                      </Typography>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          goal.type === "team"
                            ? "bg-primary/10 text-primary"
                            : goal.type === "individual"
                              ? "bg-secondary/10 text-secondary"
                              : "bg-warning/10 text-warning"
                        }`}
                      >
                        {goal.type}
                      </span>
                    </div>
                    <Typography
                      variant="caption"
                      color="muted"
                      className="mb-2"
                    >
                      {goal.description}
                    </Typography>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-border-secondary rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <Typography
                        variant="caption"
                        className={getProgressColor(goal.progress)}
                      >
                        {goal.progress}%
                      </Typography>
                    </div>

                    {/* Target Date */}
                    <Typography
                      variant="caption"
                      color="muted"
                      className="mt-1"
                    >
                      Target: {new Date(goal.targetDate).toLocaleDateString()}
                    </Typography>
                  </div>

                  <div className="flex items-center gap-1">
                    {goal.status === "completed" && (
                      <Icon
                        name="check-circle"
                        size="sm"
                        className="text-success"
                      />
                    )}
                    <Icon
                      name="chevron-right"
                      size="xs"
                      className="text-text-muted"
                    />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Team Progress Summary */}
        <div className="border-t border-border-secondary pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Team Progress</span>
            <span className="font-medium">
              {localGoals.filter((g) => g.status === "completed").length} /{" "}
              {localGoals.length} goals completed
            </span>
          </div>
        </div>

        {/* Create Goal Modal Placeholder */}
        {isCreatingGoal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card variant="glass" className="p-6 max-w-md w-full mx-4">
              <Typography variant="headline-sm" className="mb-4">
                Create New Goal
              </Typography>
              <div className="space-y-4">
                <Input placeholder="Goal title..." />
                <TextArea placeholder="Goal description..." />
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={() =>
                      handleCreateGoal({
                        title: "Sample Goal",
                        description: "This is a sample goal",
                        type: "individual",
                        targetDate: "2025-12-31",
                        category: "performance",
                      })
                    }
                  >
                    Create Goal
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setIsCreatingGoal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Card>
    </CollaborativeWidget>
  );
};
