import React, { useState } from "react";
import { Icon } from "../components/ui/Icon/Icon";
import { Typography } from "../components/design-system";
import { Card } from "../components/ui";
import { Button } from "../components/ui/Button/Button";
import { StaffManagement } from "../components/team/StaffManagement";
import { getActiveTeamId } from "../utils/activeTeam";
import { PageLayout } from "../components/layout/PageLayout";

/**
 * TeamSettings - Team configuration and management
 * Available to coaches and managers only
 *
 * Features:
 * - Team overview and statistics
 * - Staff management
 * - Team preferences and settings
 * - Integration configurations
 */
export const TeamSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "staff" | "settings"
  >("overview");

  // Get the active team ID
  const teamId = getActiveTeamId();

  const tabs = [
    { id: "overview", label: "Overview", icon: "home" },
    { id: "staff", label: "Staff", icon: "users" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  return (
    <PageLayout
      title="Team Settings"
      subtitle="Manage your team configuration and staff"
    >
      <div className="max-w-6xl mx-auto">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-border-medium">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-text-info text-text-info"
                      : "border-transparent text-text-secondary hover:text-text-primary hover:border-border-strong"
                  }`}
                >
                  <Icon name={tab.icon as any} className="h-4 w-4 mr-2 inline" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <Card className="p-6">
              <Typography variant="headline-lg" className="mb-4">
                Team Overview
              </Typography>
              <Typography variant="body-lg" color="muted" className="mb-6">
                Get a high-level view of your team's configuration and performance.
              </Typography>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-surface-subtle rounded-lg">
                  <Typography variant="headline-lg" className="text-text-info">
                    0
                  </Typography>
                  <Typography variant="body-sm" color="muted">
                    Active Players
                  </Typography>
                </div>
                <div className="text-center p-4 bg-surface-subtle rounded-lg">
                  <Typography variant="headline-lg" className="text-text-info">
                    0
                  </Typography>
                  <Typography variant="body-sm" color="muted">
                    Staff Members
                  </Typography>
                </div>
                <div className="text-center p-4 bg-surface-subtle rounded-lg">
                  <Typography variant="headline-lg" className="text-text-info">
                    0
                  </Typography>
                  <Typography variant="body-sm" color="muted">
                    Playbooks
                  </Typography>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <Typography variant="headline-md" className="mb-4">
                Quick Actions
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => window.open("/roster", "_blank")}
                >
                  <Icon name="users" className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <Typography variant="body-md">Manage Roster</Typography>
                    <Typography variant="caption" color="muted">
                      Add, edit, and organize players
                    </Typography>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => window.open("/playbook", "_blank")}
                >
                  <Icon name="book" className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <Typography variant="body-md">Edit Playbook</Typography>
                    <Typography variant="caption" color="muted">
                      Create and modify plays
                    </Typography>
                  </div>
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "staff" && <StaffManagement teamId={teamId} />}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <Card className="p-6">
              <Typography variant="headline-lg" className="mb-4">
                Team Preferences
              </Typography>
              <Typography variant="body-lg" color="muted" className="mb-6">
                Configure team-wide settings and preferences.
              </Typography>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border-medium rounded-lg">
                  <div>
                    <Typography variant="body-md">Time Zone</Typography>
                    <Typography variant="caption" color="muted">
                      Current: Eastern Time
                    </Typography>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-border-medium rounded-lg">
                  <div>
                    <Typography variant="body-md">Default Sport</Typography>
                    <Typography variant="caption" color="muted">
                      Current: Football
                    </Typography>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default TeamSettings;
