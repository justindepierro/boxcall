import React, { useState } from "react";
import { Typography } from "../design-system";
import { Card, Button } from "../ui";
import { Icon } from "../ui/Icon/Icon";
import type { Profile } from "../../types/database";
import type { UserRole } from "../../types/phase4-3";
interface ProfileCardProps {
  profile: Profile;
  userRole: UserRole;
  isViewMode?: boolean; // When viewed in modal by other users
  onEditClick?: () => void;
}
/**
 * Profile Card - Compact personal profile display
 *
 * Features:
 * - Essential profile information
 * - Role-specific details
 * - Edit functionality for own profile
 * - Modal-viewable for other users
 */
export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  userRole,
  isViewMode = false,
  onEditClick,
}) => {
  const [showFullBio, setShowFullBio] = useState(false);
  const isPlayer = userRole === "player";
  const isCoach = userRole === "coach";
  const isFamily = userRole === "family";
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  const displayName = profile.full_name || profile.display_name || "Player";
  return (
    <Card className="compact-card h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <Typography variant="headline-md" className="text-navy-800">
          Profile
        </Typography>
        {!isViewMode && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEditClick}
            className="p-1"
          >
            <Icon name="edit" size={14} />
          </Button>
        )}
      </div>
      {/* Profile Content */}
      <div className="space-y-tight">
        {/* Avatar & Name */}
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 rounded-lg bg-jade-100 flex items-center justify-center">
            <Typography variant="body-lg" className="font-bold text-jade-800">
              {getInitials(displayName)}
            </Typography>
          </div>
          <div className="flex-1 min-w-0">
            <Typography
              variant="body-lg"
              className="font-semibold text-gray-800 truncate"
            >
              {displayName}
            </Typography>
            <Typography variant="body-sm" color="muted">
              {userRole.replace("_", " ").toUpperCase()}
            </Typography>
          </div>
        </div>
        {/* Role-Specific Info */}
        {isPlayer && (
          <div className="text-xs text-gray-600">
            <Typography variant="body-sm" color="muted">
              Player Profile
            </Typography>
          </div>
        )}
        {isCoach && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Icon name="crown" size={14} color="navy" />
              <Typography variant="body-sm" className="text-gray-700">
                Coach
              </Typography>
            </div>
          </div>
        )}
        {isFamily && (
          <div className="flex items-center space-x-2">
            <Icon name="users" size={14} color="jade" />
            <Typography variant="body-sm" className="text-gray-700">
              Family Member
            </Typography>
          </div>
        )}
        {/* Bio */}
        {profile.bio && (
          <div className="pt-1 border-t border-gray-100">
            <Typography
              variant="body-sm"
              className="text-gray-600 leading-relaxed"
            >
              {showFullBio
                ? profile.bio
                : `${profile.bio.slice(0, 80)}${profile.bio.length > 80 ? "..." : ""}`}
            </Typography>
            {profile.bio.length > 80 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullBio(!showFullBio)}
                className="p-0 h-auto text-xs text-jade-600 hover:text-jade-700 mt-1"
              >
                {showFullBio ? "Show less" : "Show more"}
              </Button>
            )}
          </div>
        )}
        {/* Contact Info */}
        {profile.phone && !isViewMode && (
          <div className="flex items-center space-x-2 pt-1 border-t border-gray-100">
            <Icon name="phone" size={14} color="slate" />
            <Typography variant="body-sm" className="text-gray-600">
              {profile.phone}
            </Typography>
          </div>
        )}
      </div>
    </Card>
  );
};
