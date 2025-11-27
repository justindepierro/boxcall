/**
 * Progress Sharing Component
 * Phase 2B Sprint 6: Collaborative Planning Tools
 *
 * Features:
 * - Team progress visualization and sharing
 * - Achievement celebration and milestones
 * - Performance insights and analytics
 * - Social recognition and motivation
 */

import React, { useState, useCallback } from "react";
import { CollaborativeWidget } from "./CollaborativeWidget";
import { Button, Card } from "../ui";
import { Typography } from "../design-system/Typography";
import { Icon } from "../ui/Icon/Icon";

interface ProgressMetric {
  id: string;
  name: string;
  type: "individual" | "team";
  category: "skill" | "fitness" | "teamwork" | "attendance" | "custom";
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
  lastUpdated: string;
  updatedBy: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: "milestone" | "streak" | "improvement" | "teamwork";
  earnedBy: string;
  earnedDate: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number;
  shared: boolean;
}

interface TeamInsight {
  id: string;
  title: string;
  description: string;
  type: "strength" | "opportunity" | "trend" | "prediction";
  confidence: number;
  basedOn: string[];
  actionable: boolean;
  priority: "low" | "medium" | "high";
}

export interface ProgressSharingProps {
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
   * Current user's name
   */
  userName: string;

  /**
   * Initial metrics data
   */
  metrics?: ProgressMetric[];

  /**
   * Initial achievements data
   */
  achievements?: Achievement[];

  /**
   * Initial insights data
   */
  insights?: TeamInsight[];

  /**
   * Callback when progress is updated
   */
  onProgressUpdate?: (metrics: ProgressMetric[]) => void;

  /**
   * Callback when achievement is shared
   */
  onAchievementShare?: (achievement: Achievement) => void;

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

export const ProgressSharing: React.FC<ProgressSharingProps> = ({
  widgetId,
  userRole,
  userId,
  userName,
  metrics = [],
  achievements = [],
  insights = [],
  onProgressUpdate,
  onAchievementShare,
  mockCollaboration,
}) => {
  const [localMetrics, setLocalMetrics] = useState<ProgressMetric[]>(metrics);
  const [localAchievements, setLocalAchievements] =
    useState<Achievement[]>(achievements);
  const [localInsights, _setLocalInsights] = useState<TeamInsight[]>(insights);
  const [activeTab, setActiveTab] = useState<
    "progress" | "achievements" | "insights"
  >("progress");
  const [isSharing, setIsSharing] = useState(false);

  /**
   * Handle collaborative data changes
   */
  const handleCollaborativeDataChange = useCallback(
    (newData: Record<string, unknown>) => {
      if (newData.metrics) {
        const updatedMetrics = newData.metrics as ProgressMetric[];
        setLocalMetrics(updatedMetrics);
        onProgressUpdate?.(updatedMetrics);
      }
      if (newData.achievements) {
        setLocalAchievements(newData.achievements as Achievement[]);
      }
    },
    [onProgressUpdate]
  );

  /**
   * Add a sample progress metric
   */
  const handleAddProgress = useCallback(() => {
    const sampleMetrics = [
      {
        id: `metric-${Date.now()}`,
        name: "Practice Attendance",
        type: "individual" as const,
        category: "attendance" as const,
        value: 85,
        target: 90,
        unit: "%",
        trend: "up" as const,
        lastUpdated: new Date().toISOString(),
        updatedBy: userId,
      },
      {
        id: `metric-${Date.now() + 1}`,
        name: "Team Chemistry",
        type: "team" as const,
        category: "teamwork" as const,
        value: 78,
        target: 85,
        unit: "points",
        trend: "up" as const,
        lastUpdated: new Date().toISOString(),
        updatedBy: userId,
      },
    ];

    const newMetric =
      sampleMetrics[Math.floor(Math.random() * sampleMetrics.length)];
    const updatedMetrics = [...localMetrics, newMetric];
    setLocalMetrics(updatedMetrics);
    onProgressUpdate?.(updatedMetrics);
  }, [localMetrics, userId, onProgressUpdate]);

  /**
   * Add a sample achievement
   */
  const handleEarnAchievement = useCallback(() => {
    const sampleAchievements = [
      {
        id: `achievement-${Date.now()}`,
        title: "Perfect Week",
        description: "Attended all practices and meetings this week",
        type: "streak" as const,
        earnedBy: userName,
        earnedDate: new Date().toISOString(),
        icon: "star",
        rarity: "rare" as const,
        points: 50,
        shared: false,
      },
      {
        id: `achievement-${Date.now() + 1}`,
        title: "Team Player",
        description: "Helped 5 teammates improve their performance",
        type: "teamwork" as const,
        earnedBy: userName,
        earnedDate: new Date().toISOString(),
        icon: "users",
        rarity: "epic" as const,
        points: 100,
        shared: false,
      },
    ];

    const newAchievement =
      sampleAchievements[Math.floor(Math.random() * sampleAchievements.length)];
    const updatedAchievements = [...localAchievements, newAchievement];
    setLocalAchievements(updatedAchievements);
  }, [localAchievements, userName]);

  /**
   * Share an achievement
   */
  const handleShareAchievement = useCallback(
    (achievementId: string) => {
      const updatedAchievements = localAchievements.map((achievement) => {
        if (achievement.id === achievementId) {
          const shared = { ...achievement, shared: true };
          onAchievementShare?.(shared);
          return shared;
        }
        return achievement;
      });
      setLocalAchievements(updatedAchievements);
      setIsSharing(false);
    },
    [localAchievements, onAchievementShare]
  );

  /**
   * Get progress percentage
   */
  const getProgressPercentage = (metric: ProgressMetric): number => {
    return Math.min((metric.value / metric.target) * 100, 100);
  };

  /**
   * Get rarity color
   */
  const getRarityColor = (rarity: Achievement["rarity"]) => {
    switch (rarity) {
      case "common":
        return "text-muted";
      case "rare":
        return "text-primary";
      case "epic":
        return "text-secondary";
      case "legendary":
        return "text-warning";
      default:
        return "text-muted";
    }
  };

  /**
   * Get metric category color
   */
  const getCategoryColor = (category: ProgressMetric["category"]) => {
    switch (category) {
      case "skill":
        return "bg-primary/10 text-primary border-primary/20";
      case "fitness":
        return "bg-success/10 text-success border-success/20";
      case "teamwork":
        return "bg-secondary/10 text-secondary border-secondary/20";
      case "attendance":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-text-muted/10 text-muted border-secondary";
    }
  };

  /**
   * Get trend icon
   */
  const getTrendIcon = (trend: ProgressMetric["trend"]) => {
    switch (trend) {
      case "up":
        return "arrow-up";
      case "down":
        return "arrow-down";
      default:
        return "minus";
    }
  };

  const recentAchievements = localAchievements
    .sort(
      (a, b) =>
        new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime()
    )
    .slice(0, 3);

  return (
    <CollaborativeWidget
      widgetId={widgetId}
      onDataChange={handleCollaborativeDataChange}
      className="progress-sharing"
      mockCollaboration={mockCollaboration}
    >
      <Card variant="glass" className="h-full p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Typography variant="headline-sm" as="h3">
            Team Progress
          </Typography>
          <div className="flex gap-2">
            {(userRole === "coach" || userRole === "player") && (
              <>
                <Button variant="ghost" size="sm" onClick={handleAddProgress}>
                  <Icon name="plus" size="xs" />
                  Add Progress
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEarnAchievement}
                >
                  <Icon name="award" size="xs" />
                  Earn Badge
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 p-1 bg-surface-secondary rounded-lg">
          {(["progress", "achievements", "insights"] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className="flex-1"
            >
              {tab === "progress" && <Icon name="arrow-up" size="xs" />}
              {tab === "achievements" && <Icon name="award" size="xs" />}
              {tab === "insights" && <Icon name="info" size="xs" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-3">
          {activeTab === "progress" && (
            <>
              {localMetrics.length === 0 ? (
                <div className="text-center py-8">
                  <Icon
                    name="arrow-up"
                    size="lg"
                    className="text-muted mx-auto mb-2"
                  />
                  <Typography variant="body-sm" color="muted">
                    No progress metrics yet
                  </Typography>
                  <Typography variant="caption" color="muted">
                    Add some metrics to track team progress
                  </Typography>
                </div>
              ) : (
                localMetrics.map((metric) => {
                  const percentage = getProgressPercentage(metric);
                  return (
                    <Card key={metric.id} variant="glass" className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Typography variant="body-sm" className="font-medium">
                            {metric.name}
                          </Typography>
                          <Typography variant="caption" color="muted">
                            {metric.type === "team"
                              ? "Team Metric"
                              : "Individual"}
                          </Typography>
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className={`inline-flex px-2 py-1 rounded-lg text-xs ${getCategoryColor(metric.category)}`}
                          >
                            {metric.category}
                          </span>
                          <Icon
                            name={getTrendIcon(metric.trend)}
                            size="xs"
                            className={
                              metric.trend === "up"
                                ? "text-success"
                                : metric.trend === "down"
                                  ? "text-danger"
                                  : "text-muted"
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>
                            {metric.value} {metric.unit}
                          </span>
                          <span className="text-muted">
                            Target: {metric.target} {metric.unit}
                          </span>
                        </div>

                        <div className="w-full bg-surface-secondary rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <Typography variant="caption" color="muted">
                          Updated{" "}
                          {new Date(metric.lastUpdated).toLocaleDateString()}
                        </Typography>
                      </div>
                    </Card>
                  );
                })
              )}
            </>
          )}

          {activeTab === "achievements" && (
            <>
              {recentAchievements.length === 0 ? (
                <div className="text-center py-8">
                  <Icon
                    name="award"
                    size="lg"
                    className="text-muted mx-auto mb-2"
                  />
                  <Typography variant="body-sm" color="muted">
                    No achievements yet
                  </Typography>
                  <Typography variant="caption" color="muted">
                    Keep working hard to earn your first badge!
                  </Typography>
                </div>
              ) : (
                recentAchievements.map((achievement) => (
                  <Card key={achievement.id} variant="glass" className="p-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg bg-primary/10 ${getRarityColor(achievement.rarity)}`}
                      >
                        <Icon name="star" size="sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <Typography
                              variant="body-sm"
                              className="font-medium"
                            >
                              {achievement.title}
                            </Typography>
                            <Typography variant="caption" color="muted">
                              {achievement.description}
                            </Typography>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs ${getRarityColor(achievement.rarity)}`}
                            >
                              {achievement.rarity}
                            </span>
                            <Typography
                              variant="caption"
                              className="font-medium"
                            >
                              +{achievement.points}pts
                            </Typography>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <Typography variant="caption" color="muted">
                            Earned by {achievement.earnedBy} •{" "}
                            {new Date(
                              achievement.earnedDate
                            ).toLocaleDateString()}
                          </Typography>
                          {!achievement.shared &&
                            achievement.earnedBy === userName && (
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() =>
                                  handleShareAchievement(achievement.id)
                                }
                              >
                                <Icon name="upload" size="xs" />
                                Share
                              </Button>
                            )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </>
          )}

          {activeTab === "insights" && (
            <>
              {localInsights.length === 0 ? (
                <div className="text-center py-8">
                  <Icon
                    name="info"
                    size="lg"
                    className="text-muted mx-auto mb-2"
                  />
                  <Typography variant="body-sm" color="muted">
                    No insights available yet
                  </Typography>
                  <Typography variant="caption" color="muted">
                    Insights will appear as more data is collected
                  </Typography>
                </div>
              ) : (
                localInsights.map((insight) => (
                  <Card key={insight.id} variant="glass" className="p-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          insight.type === "strength"
                            ? "bg-success/10 text-success"
                            : insight.type === "opportunity"
                              ? "bg-warning/10 text-warning"
                              : insight.type === "trend"
                                ? "bg-primary/10 text-primary"
                                : "bg-secondary/10 text-secondary"
                        }`}
                      >
                        <Icon
                          name={
                            insight.type === "strength"
                              ? "check"
                              : insight.type === "opportunity"
                                ? "target"
                                : insight.type === "trend"
                                  ? "arrow-up"
                                  : "search"
                          }
                          size="sm"
                        />
                      </div>
                      <div className="flex-1">
                        <Typography
                          variant="body-sm"
                          className="font-medium mb-1"
                        >
                          {insight.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="muted"
                          className="mb-2"
                        >
                          {insight.description}
                        </Typography>
                        <div className="flex items-center justify-between">
                          <Typography variant="caption" color="muted">
                            {insight.confidence}% confidence
                          </Typography>
                          <span
                            className={`px-2 py-1 rounded-lg text-xs ${
                              insight.priority === "high"
                                ? "bg-danger/10 text-danger"
                                : insight.priority === "medium"
                                  ? "bg-warning/10 text-warning"
                                  : "bg-text-muted/10 text-muted"
                            }`}
                          >
                            {insight.priority} priority
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </>
          )}
        </div>

        {/* Share Modal */}
        {isSharing && (
          <div className="fixed inset-0 bg-text-primary/50 flex items-center justify-center z-50">
            <Card variant="glass" className="p-6 max-w-md w-full mx-4">
              <Typography variant="headline-sm" className="mb-4">
                Share Achievement
              </Typography>
              <Typography variant="body-sm" color="muted" className="mb-4">
                Share this achievement with the team to celebrate success!
              </Typography>
              <div className="flex gap-2">
                <Button variant="primary" onClick={() => setIsSharing(false)}>
                  Share with Team
                </Button>
                <Button variant="ghost" onClick={() => setIsSharing(false)}>
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}
      </Card>
    </CollaborativeWidget>
  );
};
