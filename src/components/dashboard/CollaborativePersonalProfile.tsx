/**
 * Collaborative Personal Profile Component
 * Phase 2B Sprint 4: Real-time collaborative profile editing
 *
 * Wraps PersonalProfile with real-time collaboration features:
 * - Live editing indicators
 * - Real-time profile updates
 * - Conflict resolution for profile changes
 * - Multi-user editing coordination
 */

import React, { useState, useCallback } from "react";
import { PersonalProfile } from "./PersonalProfile";
import { CollaborativeWidget } from "../collaboration/CollaborativeWidget";
import { Typography } from "../design-system/Typography";

interface ProfileData {
  bio?: string | null;
  gpa?: string;
  favorite_position?: string;
  gear?: {
    helmet?: string;
    gloves?: string;
    cleats?: string;
  };
}

export interface CollaborativePersonalProfileProps {
  /**
   * Profile data - will be synchronized across collaborators
   */
  profile: ProfileData;

  /**
   * Unique identifier for this profile widget
   */
  widgetId: string;

  /**
   * Whether the profile is editable
   */
  isEditable: boolean;

  /**
   * Display options
   */
  showGPA?: boolean;
  showGearShowcase?: boolean;
  showCoachingCredentials?: boolean;

  /**
   * Callback when profile data changes
   */
  onProfileChange?: (newProfile: ProfileData) => void;

  /**
   * Mock collaboration data for development
   */
  mockCollaboration?: {
    participants: Array<{ id: string; name: string; avatar?: string }>;
    cursors: Array<{
      userId: string;
      userName: string;
      x: number;
      y: number;
      widgetId?: string;
      widgetX?: number;
      widgetY?: number;
      action: "hover" | "click" | "typing";
      color: string;
    }>;
    isConnected: boolean;
  };
}

export const CollaborativePersonalProfile: React.FC<
  CollaborativePersonalProfileProps
> = ({
  profile,
  widgetId,
  isEditable,
  showGPA = false,
  showGearShowcase = false,
  showCoachingCredentials = false,
  onProfileChange,
  mockCollaboration,
}) => {
  const [localProfile, setLocalProfile] = useState<ProfileData>(profile);
  const [editingField, setEditingField] = useState<string | null>(null);

  /**
   * Handle collaborative profile changes
   */
  const handleCollaborativeDataChange = useCallback(
    (newData: Record<string, unknown>) => {
      if (newData.profile) {
        const updatedProfile = newData.profile as ProfileData;
        setLocalProfile(updatedProfile);
        onProfileChange?.(updatedProfile);
      }

      if (newData.editingField) {
        setEditingField(newData.editingField as string);
      }
    },
    [onProfileChange]
  );

  return (
    <CollaborativeWidget
      widgetId={widgetId}
      onDataChange={handleCollaborativeDataChange}
      className="collaborative-profile"
      mockCollaboration={mockCollaboration}
    >
      <div className="relative">
        {/* Live editing indicator */}
        {editingField && (
          <div className="absolute top-2 right-12 z-10 bg-primary text-on-primary px-2 py-1 rounded-lg text-xs">
            Someone is editing {editingField}...
          </div>
        )}

        {/* Enhanced PersonalProfile with collaboration features */}
        <div className="space-y-4">
          {/* Profile Header */}
          <div className="flex items-center justify-between">
            <Typography variant="headline-sm" as="h3">
              Personal Profile
            </Typography>
            {isEditable && (
              <div className="text-xs text-muted">
                ✏️ Collaborative editing
              </div>
            )}
          </div>

          {/* Wrapped PersonalProfile Component */}
          <PersonalProfile
            profile={localProfile}
            isEditable={isEditable}
            showGPA={showGPA}
            showGearShowcase={showGearShowcase}
            showCoachingCredentials={showCoachingCredentials}
          />

          {/* Collaboration Status */}
          <div className="text-xs text-muted border-t border-secondary pt-2">
            Last updated: {new Date().toLocaleTimeString()}
            {isEditable && (
              <span className="ml-2 text-primary">
                • Real-time sync enabled
              </span>
            )}
          </div>
        </div>
      </div>
    </CollaborativeWidget>
  );
};
