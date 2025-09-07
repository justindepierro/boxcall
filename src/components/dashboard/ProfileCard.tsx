import React, { useState, useEffect } from "react";
import { ProfileEditModal } from "../profile/ProfileEditModal";
import { useDashboardContext } from "../../context/useDashboardContext";
import { useRoles } from "../../hooks/useRoles";
import { useAdaptiveWidget } from "../../hooks/useAdaptiveDashboard";

import { Typography } from "../design-system";
import { Card, Button } from "../ui";
import { Icon } from "../ui/Icon/Icon";

interface ProfileCardProps {
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
const ProfileCard: React.FC<ProfileCardProps> = ({
  isViewMode = false,
  onEditClick,
}) => {
  const { profile, setProfile } = useDashboardContext();
  const { roleContext } = useRoles(); // Use new unified role system
  const [editModalOpen, setEditModalOpen] = useState(false);
  const isOwnProfile = !isViewMode; // Only show quick actions for own profile
  const [showFullBio, setShowFullBio] = useState(false);

  // Phase 2A Sprint 2: Adaptive behavior
  const { trackView, trackEdit, isHighPriority } = useAdaptiveWidget(
    "profile-card",
    "profile"
  );

  // Track profile views and interactions
  useEffect(() => {
    trackView();
  }, [trackView]);

  const handleProfileEdit = () => {
    trackEdit();
    if (onEditClick) {
      onEditClick();
    } else {
      setEditModalOpen(true);
    }
  };

  // Adaptive styling for high priority widgets
  const cardClassName = isHighPriority
    ? "ring-2 ring-blue-200 ring-opacity-50"
    : "";

  // Use unified role system
  const userRole = roleContext?.appRole || profile?.role || "player";
  const isPlayer = userRole === "player";
  const isCoach = userRole === "coach" || userRole === "admin";
  const isFamily = userRole === "family";
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  const displayName = profile?.full_name || profile?.display_name || "Player";

  return (
    <Card className={`compact-card h-full relative ${cardClassName}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-subtle pb-2">
        <Typography variant="headline-md" className="text-navy-800">
          Profile
        </Typography>
        {!isViewMode && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleProfileEdit}
            className="p-2 hover:bg-jade-50 rounded-lg"
            aria-label="Edit profile"
          >
            <Icon name="edit" size={16} />
          </Button>
        )}
      </div>
      {/* Profile Content */}
      <div className="space-y-tight">
        {/* Avatar & Name */}
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 rounded-lg bg-jade-100 flex items-center justify-center relative">
            <Typography variant="body-lg" className="font-bold text-jade-800">
              {getInitials(displayName)}
            </Typography>
            {isOwnProfile && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute -bottom-1 -right-1 bg-white rounded-full shadow-md p-2 border border-subtle hover:bg-jade-50 hover:border-jade-200 transition-colors"
                aria-label="Edit profile picture"
                onClick={handleProfileEdit}
              >
                <Icon name="plus" size={14} />
              </Button>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Typography
              variant="body-lg"
              className="font-semibold text-text-primary truncate"
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
          <div className="text-xs text-text-secondary">
            <Typography variant="body-sm" color="muted">
              Player Profile
            </Typography>
          </div>
        )}
        {isCoach && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Icon name="crown" size={14} color="navy" />
              <Typography variant="body-sm" className="text-text-primary">
                Coach
              </Typography>
            </div>
          </div>
        )}
        {isFamily && (
          <div className="flex items-center space-x-2">
            <Icon name="users" size={14} color="jade" />
            <Typography variant="body-sm" className="text-text-primary">
              Family Member
            </Typography>
          </div>
        )}
        {/* Bio */}
        <div className="pt-1 border-t border-subtle relative">
          {profile?.bio ? (
            <>
              <Typography
                variant="body-sm"
                className="text-text-secondary leading-relaxed"
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
            </>
          ) : (
            isOwnProfile && (
              <Typography variant="body-sm" className="text-text-muted italic">
                Add a bio to tell others about yourself...
              </Typography>
            )
          )}
          {isOwnProfile && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-1 -right-1 bg-white rounded-full shadow-md p-2 border border-subtle hover:bg-jade-50 hover:border-jade-200 transition-colors"
              aria-label="Edit bio"
              onClick={handleProfileEdit}
            >
              <Icon name="plus" size={14} />
            </Button>
          )}
          {/* Profile Edit Modal */}
          {editModalOpen && profile && (
            <ProfileEditModal
              isOpen={editModalOpen}
              onClose={() => setEditModalOpen(false)}
              userRole={profile.role || "player"}
              currentProfile={
                { ...profile } as { id: string; [key: string]: unknown }
              }
              onProfileUpdate={(updatedProfile) => {
                setProfile(updatedProfile as unknown as typeof profile);
                setEditModalOpen(false);
              }}
            />
          )}
        </div>
        {/* Contact Info */}
        {profile?.phone && !isViewMode && (
          <div className="flex items-center space-x-2 pt-1 border-t border-subtle">
            <Icon name="phone" size={14} color="navy" />
            <Typography variant="body-sm" className="text-text-secondary">
              {profile.phone}
            </Typography>
          </div>
        )}
      </div>
    </Card>
  );
};

export default React.memo(ProfileCard);
