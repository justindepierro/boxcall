/**
 * Collaborative Dashboard Demo
 * Phase 2B Sprint 4: Demo dashboard showcasing real-time collaboration features
 *
 * Demonstrates:
 * - Multiple collaborative widgets
 * - Real-time cursor tracking
 * - Participant indicators
 * - Mock collaboration data
 */

import React, { useState } from "react";
import { CollaborativeAdaptiveChart } from "./CollaborativeAdaptiveChart";
import { CollaborativePersonalProfile } from "./CollaborativePersonalProfile";
import { DashboardGrid } from "./DashboardGrid";
import { CollaborationProvider } from "../collaboration/CollaborationProvider";
import { SharedGoalTracker } from "../collaboration/SharedGoalTracker";
import { TeamVoteWidget } from "../collaboration/TeamVoteWidget";
import { CollaborativeCalendar } from "../collaboration/CollaborativeCalendar";
import { ProgressSharing } from "../collaboration/ProgressSharing";
import { Button, Card } from "../ui";
import { Typography } from "../design-system";
import { Icon } from "../ui/Icon";
import type { DataSeries } from "@services/smartDataAnalyzer";

// Mock data for demo
const mockChartData: DataSeries = {
  id: "demo-chart-1",
  name: "Team Performance Trends",
  data: [
    { label: "Jan", value: 65, timestamp: Date.now() },
    { label: "Feb", value: 78, timestamp: Date.now() },
    { label: "Mar", value: 82, timestamp: Date.now() },
    { label: "Apr", value: 75, timestamp: Date.now() },
    { label: "May", value: 88, timestamp: Date.now() },
    { label: "Jun", value: 92, timestamp: Date.now() },
  ],
  type: "performance",
  context: "team",
};

interface DemoProfileData {
  bio: string;
  gpa: string;
  favorite_position: string;
  gear: {
    helmet: string;
    gloves: string;
    cleats: string;
  };
}

const mockProfileData: DemoProfileData = {
  bio: "Passionate quarterback with 3 years of varsity experience. Team captain and honor roll student.",
  gpa: "3.8",
  favorite_position: "Quarterback",
  gear: {
    helmet: "Riddell SpeedFlex",
    gloves: "Nike Vapor Jet",
    cleats: "Under Armour Highlight",
  },
};

const mockCollaborationData = {
  participants: [
    { id: "coach-1", name: "Coach Smith", avatar: undefined },
    { id: "player-1", name: "Alex Johnson", avatar: undefined },
  ],
  cursors: [
    {
      userId: "coach-1",
      userName: "Coach Smith",
      x: 100,
      y: 50,
      widgetId: "chart-1",
      widgetX: 80,
      widgetY: 30,
      action: "hover" as const,
      color: "#3B82F6",
    },
  ],
  isConnected: true,
};

const mockUser = {
  id: "current-user",
  name: "Demo User",
  role: "coach" as const,
  avatar: undefined,
};

export interface CollaborativeDashboardDemoProps {
  teamId?: string;
  dashboardId?: string;
}

export const CollaborativeDashboardDemo: React.FC<
  CollaborativeDashboardDemoProps
> = ({ teamId = "demo-team", dashboardId = "demo-dashboard" }) => {
  const [chartData, setChartData] = useState<DataSeries>(mockChartData);
  const [profileData, setProfileData] =
    useState<DemoProfileData>(mockProfileData);
  const [simulationActive, setSimulationActive] = useState(false);

  /**
   * Handle profile data changes with proper typing
   */
  const handleProfileChange = (newProfile: {
    bio?: string | null;
    gpa?: string;
    favorite_position?: string;
    gear?: { helmet?: string; gloves?: string; cleats?: string };
  }) => {
    setProfileData({
      bio: newProfile.bio || "",
      gpa: newProfile.gpa || "",
      favorite_position: newProfile.favorite_position || "",
      gear: {
        helmet: newProfile.gear?.helmet || "",
        gloves: newProfile.gear?.gloves || "",
        cleats: newProfile.gear?.cleats || "",
      },
    });
  };

  /**
   * Simulate collaborative changes for demo purposes
   */
  const simulateCollaborativeChanges = () => {
    setSimulationActive(true);

    // Simulate chart data changes
    setTimeout(() => {
      setChartData((prev) => ({
        ...prev,
        data: prev.data.map((point) => ({
          ...point,
          value: Math.max(0, point.value + (Math.random() - 0.5) * 20),
        })),
      }));
    }, 1000);

    // Simulate profile changes
    setTimeout(() => {
      setProfileData((prev) => ({
        ...prev,
        bio: prev.bio + " [Updated by Coach Smith]",
      }));
    }, 2000);

    setTimeout(() => {
      setSimulationActive(false);
    }, 3000);
  };

  return (
    <CollaborationProvider
      teamId={teamId}
      dashboardId={dashboardId}
      user={mockUser}
      autoConnect={false} // Use mock data instead
    >
      <div className="p-6 space-y-6">
        {/* Demo Header */}
        <div className="text-center space-y-4">
          <Typography variant="headline-lg" as="h1" className="text-center">
            Real-Time Collaborative Dashboard
          </Typography>
          <p className="text-text-secondary max-w-2xl mx-auto">
            This demo showcases Phase 2B Sprint 4 collaboration features.
            Multiple users can edit widgets simultaneously with live cursor
            tracking and real-time data synchronization.
          </p>

          <Button
            onClick={simulateCollaborativeChanges}
            disabled={simulationActive}
            variant="primary"
            className="mx-auto"
          >
            {simulationActive
              ? "🔄 Simulating Changes..."
              : "🎬 Simulate Collaboration"}
          </Button>
        </div>

        {/* Collaboration Status */}
        <Card className="bg-surface-secondary p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium text-text-primary">
                Connected to Collaboration Session
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">
                {mockCollaborationData.participants.length} participants
              </span>
              <div className="flex -space-x-1">
                {mockCollaborationData.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="w-8 h-8 bg-primary text-text-on-primary rounded-full flex items-center justify-center text-sm font-medium border-2 border-white"
                    title={participant.name}
                  >
                    {participant.name.charAt(0)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Collaborative Widgets Grid */}
        <DashboardGrid>
          {/* Collaborative Chart Widget */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CollaborativeAdaptiveChart
                data={chartData}
                widgetId="chart-1"
                allowDataEditing={true}
                onDataChange={setChartData}
                context="dashboard"
                showInsights={true}
                mockCollaboration={mockCollaborationData}
                className="p-4"
              />
            </Card>
          </div>

          {/* Collaborative Profile Widget */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <div className="p-4">
                <CollaborativePersonalProfile
                  profile={profileData}
                  widgetId="profile-1"
                  isEditable={true}
                  showGPA={true}
                  showGearShowcase={true}
                  onProfileChange={handleProfileChange}
                  mockCollaboration={mockCollaborationData}
                />
              </div>
            </Card>
          </div>

          {/* Phase 2B Sprint 6: Collaborative Planning Tools */}
          <div className="lg:col-span-2">
            <SharedGoalTracker
              widgetId="goals-1"
              userRole="coach"
              userId="user-1"
              teamId="team-1"
              mockCollaboration={mockCollaborationData}
            />
          </div>

          <div className="lg:col-span-2">
            <TeamVoteWidget
              widgetId="votes-1"
              userRole="player"
              userId="user-2"
              userName="Player Johnson"
              isCaptain={true}
              mockCollaboration={mockCollaborationData}
            />
          </div>

          <div className="lg:col-span-2">
            <CollaborativeCalendar
              widgetId="calendar-1"
              userRole="coach"
              userId="user-1"
              userName="Coach Smith"
              canCreateEvents={true}
              mockCollaboration={mockCollaborationData}
            />
          </div>

          <div className="lg:col-span-2">
            <ProgressSharing
              widgetId="progress-1"
              userRole="player"
              userId="user-2"
              userName="Player Johnson"
              mockCollaboration={mockCollaborationData}
            />
          </div>

          {/* Collaboration Features Info */}
          <div className="lg:col-span-2">
            <Card className="h-full p-4 bg-primary/5">
              <Typography variant="headline-sm" as="h3" className="mb-3">
                Active Features
              </Typography>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Live cursor tracking within widgets</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Real-time data synchronization</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Participant indicators</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Conflict resolution (automatic)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span>Widget-level permissions (coming soon)</span>
                </div>
              </div>
            </Card>
          </div>
        </DashboardGrid>

        {/* Technical Details */}
        <Card className="p-4 bg-surface-secondary">
          <details>
            <summary className="cursor-pointer font-medium text-text-primary mb-2 flex items-center gap-2">
              <Icon name="settings" size="sm" />
              Technical Implementation Details
            </summary>
            <div className="text-sm text-text-secondary space-y-2 mt-3">
              <p>
                <strong>CollaborativeWidget:</strong> Higher-order component
                that wraps any dashboard widget with real-time collaboration
                features including cursor tracking, participant indicators, and
                data synchronization.
              </p>
              <p>
                <strong>Conflict Resolution:</strong> Automatic conflict
                detection and resolution using configurable merge strategies
                (last-write-wins, automatic merge, user-decides).
              </p>
              <p>
                <strong>Performance:</strong> Optimized with throttled cursor
                updates, batched data changes, and efficient state management to
                handle multiple simultaneous users.
              </p>
              <p>
                <strong>Integration:</strong> Drop-in replacement for existing
                widgets - simply wrap with CollaborativeWidget and provide a
                unique widgetId.
              </p>
            </div>
          </details>
        </Card>
      </div>
    </CollaborationProvider>
  );
};
