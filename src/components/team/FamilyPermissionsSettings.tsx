import React, { useState, useEffect } from "react";
import { Card } from "../ui";
import { Typography } from "../design-system";
import { Icon } from "../ui/Icon/Icon";
import { useToast } from "../../hooks/useToast";
import { TeamService } from "../../services/teamService";
import { logError } from "../../utils/logger";

export interface FamilyPermissions {
  canViewRoster: boolean;
  canViewSchedule: boolean;
  canViewStats: boolean;
  canRSVP: boolean;
  canFundraise: boolean;
}

interface FamilyPermissionsSettingsProps {
  teamId: string;
  initialPermissions?: FamilyPermissions;
  onSave?: (permissions: FamilyPermissions) => Promise<void>;
}

interface PermissionToggle {
  key: keyof FamilyPermissions;
  label: string;
  description: string;
  icon: string;
}

const PERMISSION_TOGGLES: PermissionToggle[] = [
  {
    key: "canViewRoster",
    label: "View Roster",
    description:
      "Allow family members to see player names and basic information",
    icon: "users",
  },
  {
    key: "canViewSchedule",
    label: "View Schedule",
    description: "Show game schedule, practice times, and events",
    icon: "calendar",
  },
  {
    key: "canViewStats",
    label: "View Statistics",
    description: "Access player and team performance statistics",
    icon: "trending-up",
  },
  {
    key: "canRSVP",
    label: "RSVP to Events",
    description:
      "Allow family members to confirm attendance for games and events",
    icon: "check-circle",
  },
  {
    key: "canFundraise",
    label: "Fundraising Access",
    description: "Enable participation in team fundraising campaigns",
    icon: "dollar-sign",
  },
];

/**
 * FamilyPermissionsSettings Component
 *
 * Allows coaches to configure what family members (parents/guardians) can access
 * Controls visibility and functionality for non-staff team members
 */
export const FamilyPermissionsSettings: React.FC<
  FamilyPermissionsSettingsProps
> = ({ teamId, initialPermissions, onSave }) => {
  const toast = useToast();
  const [permissions, setPermissions] = useState<FamilyPermissions>(
    initialPermissions || {
      canViewRoster: false,
      canViewSchedule: true,
      canViewStats: false,
      canRSVP: true,
      canFundraise: false,
    }
  );
  const [originalPermissions, setOriginalPermissions] =
    useState<FamilyPermissions>(permissions);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial permissions from database
  useEffect(() => {
    const fetchPermissions = async () => {
      if (initialPermissions) {
        setPermissions(initialPermissions);
        setOriginalPermissions(initialPermissions);
        return;
      }

      setIsLoading(true);
      try {
        const fetchedPermissions =
          await TeamService.getFamilyPermissions(teamId);
        setPermissions(fetchedPermissions);
        setOriginalPermissions(fetchedPermissions);
      } catch (error) {
        logError("Error fetching family permissions:", error);
        toast.error("Failed to load permissions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [teamId, initialPermissions, toast]);

  // Check if permissions have changed from original
  const hasChanges =
    JSON.stringify(permissions) !== JSON.stringify(originalPermissions);

  const handleToggle = (key: keyof FamilyPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(permissions);
      } else {
        // Use default teamService save method
        const result = await TeamService.updateFamilyPermissions(
          teamId,
          permissions
        );
        if (!result.success) {
          throw new Error(result.error || "Failed to save permissions");
        }
      }

      // Update original permissions to reflect successful save
      setOriginalPermissions(permissions);
      toast.success("Family permissions updated successfully");
    } catch (error) {
      logError("Failed to save family permissions:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save permissions. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPermissions(originalPermissions);
  };

  if (isLoading) {
    return (
      <Card className="p-lg">
        <div className="flex items-center justify-center py-xl">
          <Typography variant="body-md" color="muted">
            Loading permissions...
          </Typography>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-lg">
      <div className="mb-lg">
        <Typography variant="headline-lg" className="mb-xs">
          Family Member Permissions
        </Typography>
        <Typography variant="body-md" color="muted">
          Control what family members (parents/guardians) can access when they
          join the team. These settings apply to all family accounts linked to
          players.
        </Typography>
      </div>

      {/* Permission Toggles */}
      <div className="space-y-md mb-xl">
        {PERMISSION_TOGGLES.map((toggle) => (
          <div
            key={toggle.key}
            className="flex items-start justify-between p-md border border-secondary rounded-lg hover:border-accent transition-colors"
          >
            <div className="flex items-start gap-md flex-1">
              <div className="mt-1">
                <Icon
                  name={toggle.icon as any}
                  className={`h-5 w-5 ${
                    permissions[toggle.key]
                      ? "text-jade-600 dark:text-jade-400"
                      : "text-tertiary"
                  }`}
                />
              </div>
              <div className="flex-1">
                <Typography
                  variant="body-md"
                  className="font-medium mb-spacing-2xs"
                >
                  {toggle.label}
                </Typography>
                <Typography variant="caption" color="muted">
                  {toggle.description}
                </Typography>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={permissions[toggle.key]}
              onClick={() => handleToggle(toggle.key)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-jade-500 focus:ring-offset-2 ${
                permissions[toggle.key]
                  ? "bg-jade-600 dark:bg-jade-500"
                  : "bg-neutral-200 dark:bg-navy-700"
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-primary shadow ring-0 transition duration-200 ease-in-out ${
                  permissions[toggle.key] ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="mb-lg p-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-sm">
          <Icon
            name="info"
            className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5"
          />
          <div className="flex-1">
            <Typography
              variant="body-sm"
              className="text-blue-900 dark:text-blue-100"
            >
              <strong>How it works:</strong> Family members receive invitation
              emails and create accounts linked to their player. These
              permissions determine what they can see and do after joining.
            </Typography>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div>
          {hasChanges && (
            <Typography
              variant="caption"
              className="text-warning-600 dark:text-warning-400"
            >
              <Icon name="alert-circle" className="h-4 w-4 inline mr-1" />
              You have unsaved changes
            </Typography>
          )}
        </div>
        <div className="flex gap-sm">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="px-md py-sm text-sm font-medium text-secondary hover:text-primary transition-colors"
              disabled={isSaving}
            >
              Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={`px-lg py-sm rounded-lg text-sm font-semibold transition-all ${
              hasChanges && !isSaving
                ? "bg-jade-600 hover:bg-jade-700 text-white shadow-sm hover:shadow-md"
                : "bg-neutral-200 dark:bg-navy-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed"
            }`}
          >
            {isSaving ? (
              <>
                <Icon
                  name="loader"
                  className="h-4 w-4 inline mr-2 animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <Icon name="check" className="h-4 w-4 inline mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </Card>
  );
};
