import React, { useState } from "react";
import { Typography } from "../design-system";
import { Button, Card, Input } from "../ui";

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
    console.log("Saving profile:", editedProfile);
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
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Typography
          variant="headline-md"
          className="text-gray-900 dark:text-white"
        >
          👤 My Profile
        </Typography>
        {isEditable && (
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" onClick={handleSave}>
                  Save
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
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
            className="font-semibold mb-2 text-gray-900 dark:text-white"
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
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                className="font-semibold mb-2 text-gray-900 dark:text-white"
              >
                📊 GPA
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
                className="font-semibold mb-2 text-gray-900 dark:text-white"
              >
                🏈 Favorite Position
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
              className="font-semibold mb-3 text-gray-900 dark:text-white"
            >
              👕 My Gear (Drip)
            </Typography>
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  label="🪖 Helmet"
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
                  label="🧤 Gloves"
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
                  label="👟 Cleats"
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
                  <span className="text-gray-600 dark:text-gray-400">
                    🪖 Helmet:
                  </span>
                  <span className="font-semibold">
                    {editedProfile.gear.helmet || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    🧤 Gloves:
                  </span>
                  <span className="font-semibold">
                    {editedProfile.gear.gloves || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    👟 Cleats:
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
              className="font-semibold mb-3 text-gray-900 dark:text-white"
            >
              🎓 Coaching Background
            </Typography>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Experience:
                </span>
                <span className="font-semibold">15 years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Certifications:
                </span>
                <span className="font-semibold">NFHS, USA Football</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Specialty:
                </span>
                <span className="font-semibold">Offensive Coordinator</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <Typography
          variant="body-sm"
          className="font-semibold mb-3 text-gray-900 dark:text-white"
        >
          📈 Profile Stats
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
