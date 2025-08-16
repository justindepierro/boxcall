import React, { useState } from "react";

import { Typography } from "../design-system";
import { Button, Card, Input } from "../ui";
import { Icon } from "../ui/Icon/Icon";

interface PersonalProfileProps {
  profile: {
    bio?: string | null;
    gpa?: string;
    favorite_position?: string;
    gear?: {
      helmet?: string;
      gloves?: string;
      cleats?: string;
    };
  };
  isEditable: boolean;
  showGPA?: boolean;
  showGearShowcase?: boolean;
  showCoachingCredentials?: boolean;
}
/**
 * Personal Profile - MySpace-style editable profile
 *
 * Features:
 * - Editable bio and personal information
 * - GPA display for players
 * - Gear showcase for players (helmet, gloves, cleats)
 * - Coaching credentials for coaches
 * - Personal stats and achievements
 */
export const PersonalProfile: React.FC<PersonalProfileProps> = ({
  profile,
  isEditable,
  showGPA = false,
  showGearShowcase = false,
  showCoachingCredentials = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    bio: profile?.bio || "",
    gpa: profile?.gpa || "",
    favoritePosition: profile?.favorite_position || "",
    gear: {
      helmet: profile?.gear?.helmet || "",
      gloves: profile?.gear?.gloves || "",
      cleats: profile?.gear?.cleats || "",
    },
  });
  const handleSave = () => {
    // TODO: Save to database
    setIsEditing(false);
  };
  const handleCancel = () => {
    setEditedProfile({
      bio: profile?.bio || "",
      gpa: profile?.gpa || "",
      favoritePosition: profile?.favorite_position || "",
      gear: {
        helmet: profile?.gear?.helmet || "",
        gloves: profile?.gear?.gloves || "",
        cleats: profile?.gear?.cleats || "",
      },
    });
    setIsEditing(false);
  };
  return (
    <Card className="p-6 surface-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 mb-6">
          <Icon name="user" size="lg" className="text-text-secondary" />
          <Typography variant="headline-md" className="text-text-primary">
            My Profile
          </Typography>
        </div>
        {isEditable && (
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button size="sm" variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" onClick={handleSave}>
                  Save
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            )}
          </div>
        )}
      </div>
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <Typography
            variant="body-sm"
            className="font-semibold mb-2 text-text-primary"
          >
            About Me
          </Typography>
          {isEditing ? (
            <textarea
              value={editedProfile.bio}
              onChange={(e) =>
                setEditedProfile((prev) => ({ ...prev, bio: e.target.value }))
              }
              placeholder="Tell everyone about yourself..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md surface-card text-text-primary"
              rows={3}
            />
          ) : (
            <Typography variant="body-sm" color="muted">
              {editedProfile.bio || "No bio yet. Click edit to add one!"}
            </Typography>
          )}
        </div>
        {/* Player-specific fields */}
        {showGPA && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Typography
                variant="body-sm"
                className="font-semibold mb-2 text-text-primary"
              >
                <Icon name="bar-chart" className="w-4 h-4 inline" /> GPA
              </Typography>
              {isEditing ? (
                <Input
                  type="number"
                  value={editedProfile.gpa}
                  onChange={(e) =>
                    setEditedProfile((prev) => ({
                      ...prev,
                      gpa: e.target.value,
                    }))
                  }
                  placeholder="3.8"
                  step="0.1"
                  min="0"
                  max="4.0"
                />
              ) : (
                <Typography
                  variant="body-lg"
                  className="font-bold text-jade-600 dark:text-jade-400"
                >
                  {editedProfile.gpa || "Not set"}
                </Typography>
              )}
            </div>
            <div>
              <Typography
                variant="body-sm"
                className="font-semibold mb-2 text-text-primary"
              >
                <Icon name="award" className="w-4 h-4 inline" /> Favorite
                Position
              </Typography>
              {isEditing ? (
                <Input
                  value={editedProfile.favoritePosition}
                  onChange={(e) =>
                    setEditedProfile((prev) => ({
                      ...prev,
                      favoritePosition: e.target.value,
                    }))
                  }
                  placeholder="QB"
                />
              ) : (
                <Typography variant="body-sm" color="muted">
                  {editedProfile.favoritePosition || "Not set"}
                </Typography>
              )}
            </div>
          </div>
        )}
        {/* Gear Showcase for Players */}
        {showGearShowcase && (
          <div>
            <Typography
              variant="body-sm"
              className="font-semibold mb-3 text-text-primary"
            >
              <Icon
                name="shirt"
                className="inline h-4 w-4 align-middle text-current"
              />{" "}
              My Gear (Drip)
            </Typography>
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  label="Helmet"
                  leftIcon={
                    <Icon
                      name="shield"
                      className="inline h-4 w-4 align-middle text-current"
                    />
                  }
                  value={editedProfile.gear.helmet}
                  onChange={(e) =>
                    setEditedProfile((prev) => ({
                      ...prev,
                      gear: { ...prev.gear, helmet: e.target.value },
                    }))
                  }
                  placeholder="Riddell SpeedFlex"
                />
                <Input
                  label="Gloves"
                  leftIcon={
                    <Icon
                      name="hand"
                      className="inline h-4 w-4 align-middle text-current"
                    />
                  }
                  value={editedProfile.gear.gloves}
                  onChange={(e) =>
                    setEditedProfile((prev) => ({
                      ...prev,
                      gear: { ...prev.gear, gloves: e.target.value },
                    }))
                  }
                  placeholder="Nike Vapor Jet 6.0"
                />
                <Input
                  label="Cleats"
                  leftIcon={
                    <Icon
                      name="circle"
                      className="inline h-4 w-4 align-middle text-current"
                    />
                  }
                  value={editedProfile.gear.cleats}
                  onChange={(e) =>
                    setEditedProfile((prev) => ({
                      ...prev,
                      gear: { ...prev.gear, cleats: e.target.value },
                    }))
                  }
                  placeholder="Nike Alpha Menace 3"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary">
                    <Icon
                      name="shield"
                      className="inline h-4 w-4 align-middle text-current"
                    />{" "}
                    Helmet:
                  </span>
                  <span className="font-semibold">
                    {editedProfile.gear.helmet || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">
                    <Icon
                      name="hand"
                      className="inline h-4 w-4 align-middle text-current"
                    />{" "}
                    Gloves:
                  </span>
                  <span className="font-semibold">
                    {editedProfile.gear.gloves || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">
                    <Icon
                      name="circle"
                      className="inline h-4 w-4 align-middle text-current"
                    />{" "}
                    Cleats:
                  </span>
                  <span className="font-semibold">
                    {editedProfile.gear.cleats || "Not set"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Coaching Credentials */}
        {showCoachingCredentials && (
          <div>
            <Typography
              variant="body-sm"
              className="font-semibold mb-3 text-text-primary"
            >
              <Icon
                name="graduation-cap"
                className="inline h-4 w-4 align-middle text-current"
              />{" "}
              Coaching Background
            </Typography>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary">Experience:</span>
                <span className="font-semibold">15 years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Certifications:</span>
                <span className="font-semibold">NFHS, USA Football</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Specialty:</span>
                <span className="font-semibold">Offensive Coordinator</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Profile Stats */}
      <div className="mt-6 pt-4 border-t border-subtle dark:border-gray-600">
        <Typography
          variant="body-sm"
          className="font-semibold mb-3 text-text-primary"
        >
          <Icon name="trending-up" className="w-4 h-4 inline" /> Profile Stats
        </Typography>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Typography
              variant="body-lg"
              className="font-bold text-jade-600 dark:text-jade-400"
            >
              92%
            </Typography>
            <Typography variant="caption" color="muted">
              Complete
            </Typography>
          </div>
          <div>
            <Typography
              variant="body-lg"
              className="font-bold text-blue-600 dark:text-blue-400"
            >
              3
            </Typography>
            <Typography variant="caption" color="muted">
              Teams
            </Typography>
          </div>
          <div>
            <Typography
              variant="body-lg"
              className="font-bold text-purple-600 dark:text-purple-400"
            >
              15
            </Typography>
            <Typography variant="caption" color="muted">
              Days Active
            </Typography>
          </div>
        </div>
      </div>
    </Card>
  );
};
