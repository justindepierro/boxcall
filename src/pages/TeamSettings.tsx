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
const TeamSettings: React.FC = () => {
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
    <div className="min-h-screen bg-secondary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-6">
          <Typography variant="headline-lg" className="text-primary mb-1">
            Team Settings
          </Typography>
          <Typography variant="body" className="text-secondary">
            Manage your team configuration and staff
          </Typography>
        </header>

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
          <div className="mb-xl">
            <div className="border-b border-secondary">
              <nav className="-mb-px flex space-x-xl">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-xs px-xs border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-text-info text-info"
                        : "border-transparent text-secondary hover:text-primary hover:border-accent"
                    }`}
                  >
                    <Icon
                      name={tab.icon as any}
                      className="h-4 w-4 mr-xs inline"
                    />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-lg">
              <Card className="p-lg">
                <Typography variant="headline-lg" className="mb-md">
                  Team Overview
                </Typography>
                <Typography variant="body-lg" color="muted" className="mb-lg">
                  Get a high-level view of your team's configuration and
                  performance.
                </Typography>

                <div className="grid-dashboard gap-lg">
                  <div className="text-center p-md bg-secondary rounded-lg">
                    <Typography variant="headline-lg" className="text-info">
                      0
                    </Typography>
                    <Typography variant="body-sm" color="muted">
                      Active Players
                    </Typography>
                  </div>
                  <div className="text-center p-md bg-secondary rounded-lg">
                    <Typography variant="headline-lg" className="text-info">
                      0
                    </Typography>
                    <Typography variant="body-sm" color="muted">
                      Staff Members
                    </Typography>
                  </div>
                  <div className="text-center p-md bg-secondary rounded-lg">
                    <Typography variant="headline-lg" className="text-info">
                      0
                    </Typography>
                    <Typography variant="body-sm" color="muted">
                      Playbooks
                    </Typography>
                  </div>
                </div>
              </Card>

              <Card className="p-lg">
                <Typography variant="headline-md" className="mb-md">
                  Quick Actions
                </Typography>
                <div className="grid-form gap-md">
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-md"
                    onClick={() => window.open("/roster", "_blank")}
                  >
                    <Icon name="users" className="h-5 w-5 mr-sm" />
                    <div className="text-left">
                      <Typography variant="body-md">Manage Roster</Typography>
                      <Typography variant="caption" color="muted">
                        Add, edit, and organize players
                      </Typography>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-md"
                    onClick={() => window.open("/playbook", "_blank")}
                  >
                    <Icon name="book" className="h-5 w-5 mr-sm" />
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
            <div className="space-y-lg">
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
              <Card className="p-lg">
                <Typography variant="headline-lg" className="mb-md">
                  Team Preferences
                </Typography>
                <Typography variant="body-lg" color="muted" className="mb-lg">
                  Configure team-wide settings and preferences.
                </Typography>

                <div className="space-y-md">
                  <div className="flex items-center justify-between p-md border border-secondary rounded-lg">
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

                  <div className="flex items-center justify-between p-md border border-secondary rounded-lg">
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
      </div>
    </div>
  );
};

TeamSettings.displayName = "TeamSettings";

export default React.memo(TeamSettings);
