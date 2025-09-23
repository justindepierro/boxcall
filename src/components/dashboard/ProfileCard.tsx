import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileEditModal } from "../profile/ProfileEditModal";
import { DashboardContext } from "../../contexts/DashboardContextInstance";
import { useRoles } from "../../hooks/useRoles";
import { useAdaptiveWidget } from "../../hooks/useAdaptiveDashboard";

import { Typography } from "../design-system";
import { Card, Button } from "../ui";
import { Icon } from "../ui/Icon/Icon";
import type { Profile } from "../../types/database";
import { AchievementService } from "@services/achievementService";
import { useAuth, useAuthProfile } from "../../app/auth-store";

interface ProfileCardProps {
  profile?: Profile | null;
  userRole?: string;
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
  profile: profileProp = null,
  userRole: userRoleProp,
  isViewMode = false,
  onEditClick,
}) => {
  // Prefer context when available; gracefully fall back to props when not provided
  const ctx = useContext(DashboardContext);
  const authProfile = useAuthProfile();
  const profile = ctx?.profile ?? profileProp ?? authProfile;
  const setProfile = ctx?.setProfile ?? (() => {});
  const setAuthProfile = useAuth((s) => s.setProfile);
  const { roleContext } = useRoles(); // Use new unified role system
  const [editModalOpen, setEditModalOpen] = useState(false);
  const isOwnProfile = !isViewMode; // Only show quick actions for own profile
  const [showFullBio, setShowFullBio] = useState(false);
  const navigate = useNavigate();

  const [achievements, setAchievements] = useState<{
    stickers: number;
    medals: number;
    streak: number;
    points: number;
  } | null>(null);
  const [achLoading, setAchLoading] = useState(false);

  // Phase 2A Sprint 2: Adaptive behavior
  const { trackView, trackEdit, isHighPriority } = useAdaptiveWidget(
    "profile-card",
    "profile"
  );

  // Track profile views and interactions
  useEffect(() => {
    trackView();
  }, [trackView]);

  useEffect(() => {
    const loadAchievements = async () => {
      if (!profile?.id) return;
      setAchLoading(true);
      try {
        const data = await AchievementService.getUserAchievements(profile.id);
        setAchievements({
          stickers: data.helmetStickers.length,
          medals: data.boxcallMedals.length,
          streak: data.weeklyStreak || 0,
          points: data.totalPoints || 0,
        });
      } catch {
        setAchievements(null);
      } finally {
        setAchLoading(false);
      }
    };
    loadAchievements();
  }, [profile?.id]);

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
  const userRole =
    userRoleProp || roleContext?.appRole || profile?.role || "player";
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
    <Card variant="glass" className={`compact-card h-full relative ${cardClassName}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
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
            <Icon name="edit" size="sm" />
          </Button>
        )}
      </div>
      {/* Profile Content */}
      <div className="space-y-3">
        {/* Avatar & Name */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/profile")}
              className="w-16 h-16 p-0 rounded-lg bg-jade-100 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-jade-300"
              aria-label="View profile"
            >
              <Typography variant="body-lg" className="font-bold text-jade-800">
                {getInitials(displayName)}
              </Typography>
            </Button>
            {isOwnProfile && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute -bottom-1 -right-1 bg-surface-primary rounded-full shadow-md p-2 border border-subtle hover:bg-jade-50 hover:border-jade-200 transition-colors"
                aria-label="Edit profile picture"
                onClick={handleProfileEdit}
              >
                <Icon name="plus" size="xs" />
              </Button>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate("/profile")}
              className="text-left w-full"
              aria-label="Open profile page"
            >
              <Typography
                variant="body-lg"
                className="font-semibold text-text-primary truncate hover:underline"
              >
                {displayName}
              </Typography>
            </Button>
            <Typography variant="body-sm" color="muted">
              {userRole.replace("_", " ").toUpperCase()}
            </Typography>
          </div>
        </div>

        {/* Achievements Summary */}
        {achievements && (
          <div className="grid grid-cols-4 gap-3 pt-2">
            <div className="surface-subtle rounded-md p-2 text-center">
              <Typography variant="body-xs" className="text-text-muted">
                Stickers
              </Typography>
              <Typography variant="body-sm" className="font-semibold">
                {achievements.stickers}
              </Typography>
            </div>
            <div className="surface-subtle rounded-md p-2 text-center">
              <Typography variant="body-xs" className="text-text-muted">
                Medals
              </Typography>
              <Typography variant="body-sm" className="font-semibold">
                {achievements.medals}
              </Typography>
            </div>
            <div className="surface-subtle rounded-md p-2 text-center">
              <Typography variant="body-xs" className="text-text-muted">
                Streak
              </Typography>
              <Typography variant="body-sm" className="font-semibold">
                {achievements.streak}
              </Typography>
            </div>
            <div className="surface-subtle rounded-md p-2 text-center">
              <Typography variant="body-xs" className="text-text-muted">
                Points
              </Typography>
              <Typography variant="body-sm" className="font-semibold">
                {achievements.points}
              </Typography>
            </div>
          </div>
        )}
        {achLoading && (
          <Typography variant="body-xs" color="muted">
            Loading achievements…
          </Typography>
        )}
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
              <Icon name="crown" size="xs" color="navy" />
              <Typography variant="body-sm" className="text-text-primary">
                Coach
              </Typography>
            </div>
          </div>
        )}
        {isFamily && (
          <div className="flex items-center space-x-2">
            <Icon name="users" size="xs" color="primary" />
            <Typography variant="body-sm" className="text-text-primary">
              Family Member
            </Typography>
          </div>
        )}
        {/* Bio */}
        <div className="pt-2 relative">
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
              className="absolute -top-1 -right-1 bg-surface-primary rounded-full shadow-md p-2 border border-subtle hover:bg-jade-50 hover:border-jade-200 transition-colors"
              aria-label="Edit bio"
              onClick={handleProfileEdit}
            >
              <Icon name="plus" size="xs" />
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
              mode="quick"
              onProfileUpdate={(updatedProfile) => {
                setProfile(updatedProfile as unknown as typeof profile);
                setAuthProfile(updatedProfile as unknown as typeof profile);
                setEditModalOpen(false);
              }}
            />
          )}
        </div>
        {/* Contact Info */}
        {profile?.phone && !isViewMode && (
          <div className="flex items-center space-x-2 pt-2">
            <Icon name="phone" size="xs" color="navy" />
            <Typography variant="body-sm" className="text-text-secondary">
              {profile.phone}
            </Typography>
          </div>
        )}

        {/* Actions */}
        <div className="pt-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/profile")}
            aria-label="View full profile"
          >
            <Icon name="user" size="xs" className="mr-2" /> View Profile
          </Button>
          {!isViewMode && (
            <Button variant="primary" size="sm" onClick={handleProfileEdit}>
              <Icon name="edit" size="xs" className="mr-2" /> Edit
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default React.memo(ProfileCard);
