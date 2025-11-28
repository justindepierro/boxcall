// Social Features Demo Page
// Showcases all social features working together

import React, { useState } from "react";
import { ReactionButton } from "../components/social/ReactionButton";
import { FollowButton } from "../components/social/FollowButton";
import { CommentSection } from "../components/social/CommentSection";
import { NotificationsBell } from "../components/social/NotificationsBell";
import { ActivityFeed } from "../components/social/ActivityFeed";
import { Button } from "../components/ui/Button/Button";
import Card from "../components/ui/Card/Card";
import { Badge } from "../components/ui/Badge/Badge";
import { Tooltip } from "../components/ui/Tooltip/Tooltip";

const SocialFeaturesDemo: React.FC = () => {
  // Demo content IDs - in a real app these would come from your data
  const demoPlayId = "demo-play-123";
  const demoTeamId = "demo-team-456";
  const demoUserId = "demo-user-789";

  const [activeTab, setActiveTab] = useState<"feed" | "interactions" | "team">(
    "feed"
  );

  return (
    <div className="container-wide container-padding space-y-8">
      <div className="text-center relative">
        <div className="absolute top-0 right-0">
          <NotificationsBell userId={demoUserId} />
        </div>
        <h1 className="text-3xl font-bold text-primary mb-2">
          🤝 Social Features Demo
        </h1>
        <p className="text-secondary mb-6">
          Experience the complete social interaction system in BoxCall
        </p>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-2 mb-8">
          {[
            { key: "feed", label: "Activity Feed", icon: "📱" },
            { key: "interactions", label: "Interactions", icon: "👍" },
            { key: "team", label: "Team Hub", icon: "👥" },
          ].map(({ key, label, icon }) => (
            <Button
              key={key}
              variant={activeTab === key ? "primary" : "outline"}
              size="sm"
              onClick={() => setActiveTab(key as any)}
            >
              {icon} {label}
            </Button>
          ))}
        </div>
      </div>

      {activeTab === "feed" && (
        <div className="space-y-6">
          {/* Activity Feed */}
          <Card variant="elevated" className="p-6">
            <h2 className="text-2xl font-semibold mb-6 text-primary">
              📱 Live Activity Feed
            </h2>
            <ActivityFeed userId={demoUserId} limit={10} />
          </Card>

          {/* Recent Activity Summary */}
          <div className="grid-dashboard gap-4 md:gap-5">
            <Card variant="glass" className="p-4 text-center">
              <div className="text-2xl mb-2">🔥</div>
              <div className="text-xl font-bold text-primary">24</div>
              <div className="text-sm text-secondary">Active Today</div>
            </Card>
            <Card variant="glass" className="p-4 text-center">
              <div className="text-2xl mb-2">💬</div>
              <div className="text-xl font-bold text-primary">156</div>
              <div className="text-sm text-secondary">Comments This Week</div>
            </Card>
            <Card variant="glass" className="p-4 text-center">
              <div className="text-2xl mb-2">❤️</div>
              <div className="text-xl font-bold text-primary">89</div>
              <div className="text-sm text-secondary">Reactions Given</div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "interactions" && (
        <div className="space-y-6">
          {/* Interactive Play Card */}
          <Card variant="elevated" className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="success">Run Play</Badge>
                  <Badge variant="info">Popular</Badge>
                  <Badge variant="warning">High Success</Badge>
                </div>
                <h2 className="text-xl font-semibold text-primary">
                  Triple Option Play
                </h2>
                <p className="text-secondary mt-1">
                  A classic triple option with multiple read options for the QB.
                  Perfect for keeping defenses honest.
                </p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <ReactionButton
                  contentType="play"
                  contentId={demoPlayId}
                  size="lg"
                  variant="button"
                />
                <Tooltip content="Save to favorites">
                  <Button variant="ghost" size="sm">
                    ⭐
                  </Button>
                </Tooltip>
              </div>
            </div>

            {/* Play visualization placeholder */}
            <div className="bg-aurora-shell rounded-aurora h-48 flex items-center justify-center mb-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 100 100"
                  className="text-electric-500"
                >
                  <defs>
                    <pattern
                      id="play-pattern"
                      x="0"
                      y="0"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M10 2 L18 10 L10 18 L2 10 Z"
                        fill="currentColor"
                        opacity="0.3"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#play-pattern)" />
                </svg>
              </div>
              <div className="text-center z-10">
                <div className="text-4xl mb-2">🏈</div>
                <span className="text-muted font-medium">
                  Interactive Play Diagram
                </span>
                <p className="text-xs text-muted mt-1">
                  Click and drag to explore formations
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-muted">
              <div className="flex gap-6">
                <span>📈 89% Success Rate</span>
                <span>🏈 23 Uses This Season</span>
                <span>⭐ 4.8 Average Rating</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button variant="primary" size="sm">
                  Use in Practice
                </Button>
              </div>
            </div>
          </Card>

          {/* Comments Section */}
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              💬 Discussion
              <Badge variant="neutral">12 comments</Badge>
            </h3>
            <CommentSection
              contentType="play"
              contentId={demoPlayId}
              maxDepth={3}
              showReactions={true}
            />
          </Card>

          {/* Quick Actions */}
          <Card variant="outlined" className="p-4">
            <h4 className="font-semibold text-primary mb-3">Quick Actions</h4>
            <div className="flex flex-wrap gap-3">
              <Button variant="success" size="sm">
                👍 Like This Play
              </Button>
              <Button variant="outline" size="sm">
                📤 Share with Team
              </Button>
              <Button variant="warning" size="sm">
                📝 Add to Practice Plan
              </Button>
              <Button variant="secondary" size="sm">
                📊 View Analytics
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "team" && (
        <div className="space-y-6">
          {/* Team Profile Card */}
          <Card variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-aurora-teal rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold text-inverse">BC</span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-primary">
                    BoxCall High School
                  </h3>
                  <p className="text-secondary">
                    Varsity Football Team • Est. 2024 • 3x Conference Champions
                  </p>
                  <div className="flex gap-4 mt-2 text-sm text-muted">
                    <span>📍 Springfield, IL</span>
                    <span>👔 Coach Johnson</span>
                    <span>🏆 89-23 Record</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <FollowButton
                  followingType="team"
                  followingId={demoTeamId}
                  variant="button"
                  size="lg"
                />
                <Button variant="outline" size="lg">
                  Join Team
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <div className="text-2xl font-bold text-success">24</div>
                <div className="text-sm text-secondary">Active Players</div>
              </div>
              <div className="text-center p-4 bg-info/10 rounded-lg">
                <div className="text-2xl font-bold text-info">156</div>
                <div className="text-sm text-secondary">Total Followers</div>
              </div>
              <div className="text-center p-4 bg-warning/10 rounded-lg">
                <div className="text-2xl font-bold text-warning">89</div>
                <div className="text-sm text-secondary">Plays Created</div>
              </div>
              <div className="text-center p-4 bg-error/10 rounded-lg">
                <div className="text-2xl font-bold text-error">12</div>
                <div className="text-sm text-secondary">Wins This Season</div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="primary">View Roster</Button>
              <Button variant="outline">Team Settings</Button>
              <Button variant="ghost">Export Stats</Button>
            </div>
          </Card>

          {/* Team Members Spotlight */}
          <Card variant="glass" className="p-6">
            <h3 className="text-xl font-semibold text-primary mb-4">
              🌟 Team Spotlight
            </h3>
            <div className="grid-dashboard gap-4">
              {[
                {
                  name: "Jake Thompson",
                  role: "QB",
                  stat: "2,847 pass yards",
                  avatar: "JT",
                },
                {
                  name: "Marcus Johnson",
                  role: "RB",
                  stat: "1,456 rush yards",
                  avatar: "MJ",
                },
                {
                  name: "Tyler Davis",
                  role: "WR",
                  stat: "89 receptions",
                  avatar: "TD",
                },
              ].map((player) => (
                <Card
                  key={player.name}
                  variant="outlined"
                  className="p-4 text-center"
                >
                  <div className="w-12 h-12 bg-aurora-emerald rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-inverse font-bold">
                      {player.avatar}
                    </span>
                  </div>
                  <h4 className="font-semibold text-primary">{player.name}</h4>
                  <p className="text-sm text-secondary mb-2">{player.role}</p>
                  <p className="text-xs text-muted">{player.stat}</p>
                  <div className="mt-3">
                    <FollowButton
                      followingType="user"
                      followingId={`${player.name.toLowerCase().replace(" ", "-")}`}
                      variant="button"
                      size="sm"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Team Activity */}
          <Card variant="elevated" className="p-6">
            <h3 className="text-xl font-semibold text-primary mb-4">
              📊 Team Activity
            </h3>
            <div className="space-y-4">
              {[
                {
                  action: "New play added",
                  user: "Coach Johnson",
                  time: "2 hours ago",
                  type: "play",
                },
                {
                  action: "Practice plan updated",
                  user: "Coach Smith",
                  time: "4 hours ago",
                  type: "practice",
                },
                {
                  action: "Game stats recorded",
                  user: "Coach Johnson",
                  time: "1 day ago",
                  type: "game",
                },
                {
                  action: "Team photo uploaded",
                  user: "Jake Thompson",
                  time: "2 days ago",
                  type: "media",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-electric-500/20 rounded-full flex items-center justify-center">
                    {activity.type === "play" && "🏈"}
                    {activity.type === "practice" && "📋"}
                    {activity.type === "game" && "🏆"}
                    {activity.type === "media" && "📸"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-primary">
                      <span className="font-medium">{activity.user}</span>{" "}
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted">{activity.time}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Demo Controls */}
      <Card variant="glass" className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-primary">Demo Controls</h4>
            <p className="text-sm text-secondary">
              Try all the interactive features above!
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              🔄 Reset Demo
            </Button>
            <Button variant="primary" size="sm">
              🚀 Start Using BoxCall
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SocialFeaturesDemo;
