import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/ui/Icon/Icon";
import { Typography } from "../components/design-system";
import { Card } from "../components/ui";
import { Button } from "../components/ui/Button/Button";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { StaffManagement } from "../components/team/StaffManagement";
import { FamilyPermissionsSettings } from "../components/team/FamilyPermissionsSettings";
import type { FamilyPermissions } from "../components/team/FamilyPermissionsSettings";
import { getActiveTeamId } from "../utils/activeTeam";
import { PageLayout } from "../components/layout/PageLayout";
import { Aurora } from "../components/ui/Aurora";

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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "staff" | "settings">(
    "overview"
  );

  // Get the active team ID
  const teamId = getActiveTeamId();

  const tabs = [
    { id: "overview", label: "Overview", icon: "home" },
    { id: "staff", label: "Staff", icon: "users" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  return (
    <Aurora variant="shell" fullHeight>
      <PageLayout
        title="Team Settings"
        subtitle="Manage your team configuration and staff"
      >
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            {
              id: "dashboard",
              label: "Dashboard",
              onClick: () => navigate("/dashboard"),
            },
            { id: "team", label: "Team" },
            { id: "settings", label: "Settings", current: true },
          ]}
          className="mb-4"
        />

        <div className="container-wide">
          {/* Tab Navigation */}
          <div className="mb-spacing-xl">
            <div className="border-b border-border-medium">
              <nav className="-mb-px flex space-x-spacing-xl">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-spacing-xs px-spacing-xs border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-text-info text-text-info"
                        : "border-transparent text-text-secondary hover:text-text-primary hover:border-border-strong"
                    }`}
                  >
                    <Icon
                      name={tab.icon as any}
                      className="h-4 w-4 mr-spacing-xs inline"
                    />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-spacing-lg">
              <Card className="p-spacing-lg">
                <Typography variant="headline-lg" className="mb-spacing-md">
                  Team Overview
                </Typography>
                <Typography
                  variant="body-lg"
                  color="muted"
                  className="mb-spacing-lg"
                >
                  Get a high-level view of your team's configuration and
                  performance.
                </Typography>

                <div className="grid-dashboard gap-spacing-lg">
                  <div className="text-center p-spacing-md bg-surface-subtle rounded-lg">
                    <Typography
                      variant="headline-lg"
                      className="text-text-info"
                    >
                      0
                    </Typography>
                    <Typography variant="body-sm" color="muted">
                      Active Players
                    </Typography>
                  </div>
                  <div className="text-center p-spacing-md bg-surface-subtle rounded-lg">
                    <Typography
                      variant="headline-lg"
                      className="text-text-info"
                    >
                      0
                    </Typography>
                    <Typography variant="body-sm" color="muted">
                      Staff Members
                    </Typography>
                  </div>
                  <div className="text-center p-spacing-md bg-surface-subtle rounded-lg">
                    <Typography
                      variant="headline-lg"
                      className="text-text-info"
                    >
                      0
                    </Typography>
                    <Typography variant="body-sm" color="muted">
                      Playbooks
                    </Typography>
                  </div>
                </div>
              </Card>

              <Card className="p-spacing-lg">
                <Typography variant="headline-md" className="mb-spacing-md">
                  Quick Actions
                </Typography>
                <div className="grid-form gap-spacing-md">
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-spacing-md"
                    onClick={() => window.open("/roster", "_blank")}
                  >
                    <Icon name="users" className="h-5 w-5 mr-spacing-sm" />
                    <div className="text-left">
                      <Typography variant="body-md">Manage Roster</Typography>
                      <Typography variant="caption" color="muted">
                        Add, edit, and organize players
                      </Typography>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-spacing-md"
                    onClick={() => window.open("/playbook", "_blank")}
                  >
                    <Icon name="book" className="h-5 w-5 mr-spacing-sm" />
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
            <div className="space-y-spacing-lg">
              {/* Family Permissions Section */}
              <FamilyPermissionsSettings
                teamId={teamId}
                onSave={async (permissions: FamilyPermissions) => {
                  console.log("Saving family permissions:", permissions);
                  // TODO: Implement API call to save permissions
                  // await teamService.updateFamilyPermissions(teamId, permissions);
                }}
              />

              {/* Team Preferences Section */}
              <Card className="p-spacing-lg">
                <Typography variant="headline-lg" className="mb-spacing-md">
                  Team Preferences
                </Typography>
                <Typography
                  variant="body-lg"
                  color="muted"
                  className="mb-spacing-lg"
                >
                  Configure team-wide settings and preferences.
                </Typography>

                <div className="space-y-spacing-md">
                  <div className="flex items-center justify-between p-spacing-md border border-border-medium rounded-lg">
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

                  <div className="flex items-center justify-between p-spacing-md border border-border-medium rounded-lg">
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
    </Aurora>
  );
};

export default TeamSettings;
