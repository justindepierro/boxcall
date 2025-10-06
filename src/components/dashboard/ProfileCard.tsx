import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileEditModal } from "../profile/ProfileEditModal";
import { DashboardContext } from "../../contexts/DashboardContextInstance";
import { useRoles } from "../../hooks/useRoles";
import { useAdaptiveWidget } from "../../hooks/useAdaptiveDashboard";

import { Typography } from "../design-system";
import { Card, Button } from "../ui";
import { Icon } from "../ui/Icon/Icon";
import { Tooltip } from "../ui/Tooltip/Tooltip";
import { MultiBadgeDisplay } from "../ui/MultiBadgeDisplay";
import type { Profile } from "../../types/database";
import { AchievementService } from "@services/achievementService";
import { useAuth, useAuthProfile } from "../../app/auth-store";
import { supabase } from "../../lib/supabase";
import { Edit2, Save, X, Camera, User } from "lucide-react";

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
  const { fetchUserProfile } = useAuth(); // Get fetchUserProfile from hook

  const { roleContext } = useRoles(); // Use new unified role system
  const [editModalOpen, setEditModalOpen] = useState(false);
  const isOwnProfile = !isViewMode; // Only show quick actions for own profile
  const [showFullBio, setShowFullBio] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(profile?.bio || "");
  const [isSavingBio, setIsSavingBio] = useState(false);
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

  const handleBioSave = async () => {
    if (!profile?.id) return;

    setIsSavingBio(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ bio: bioText.trim() || null })
        .eq("id", profile.id);

      if (error) {
        console.error("Error updating bio:", error);
        return;
      }

      // Refresh profile data using hook
      await fetchUserProfile(profile.id);

      setIsEditingBio(false);
    } catch (error) {
      console.error("Error saving bio:", error);
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleBioCancel = () => {
    setBioText(profile?.bio || "");
    setIsEditingBio(false);
  };

  // Update bioText when profile changes
  useEffect(() => {
    setBioText(profile?.bio || "");
  }, [profile?.bio]);

  // Adaptive styling for high priority widgets
  const cardClassName = isHighPriority
    ? "ring-2 ring-text-primary ring-opacity-50"
    : "";

  // Use unified role system
  const userRole =
    userRoleProp || roleContext?.appRole || profile?.role || "player";
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
    <Card
      variant="glass"
      className={`compact-card h-full relative overflow-hidden ${cardClassName}`}
    >
      {/* Enhanced Header with gradient background */}
      <div className="relative bg-gradient-to-br from-brand-primary/10 via-surface-card to-brand-secondary/10 -mx-spacing-lg -mt-spacing-lg px-spacing-lg pt-spacing-lg pb-spacing-md md:pb-spacing-sm mb-spacing-md">
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full -mr-12 -mt-12"></div>
        <div className="relative flex items-center justify-between min-h-[44px]">
          <div className="flex items-center space-x-spacing-sm">
            <User className="w-5 h-5 md:w-4 md:h-4 text-brand-primary" />
            <Typography
              variant="headline-md"
              className="text-text-primary font-bold text-lg md:text-base"
            >
              Profile
            </Typography>
          </div>
          {!isViewMode && (
            <Tooltip content="Edit profile">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleProfileEdit}
                className="p-spacing-xs min-w-[44px] min-h-[44px] md:min-w-[auto] md:min-h-[auto] hover:bg-surface-secondary/50 rounded-lg backdrop-blur-sm"
                aria-label="Edit profile"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
      {/* Profile Content */}
      <div className="space-y-spacing-sm">
        {/* Enhanced Avatar & Name */}
        <div className="flex items-center space-x-spacing-md">
          <div className="relative">
            {profile?.avatar_url ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/profile")}
                className="w-20 h-20 md:w-16 md:h-16 p-0 rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-brand-primary shadow-lg"
                aria-label="View profile"
              >
                <img
                  src={profile.avatar_url}
                  alt={`${displayName}'s avatar`}
                  className="w-full h-full object-cover"
                />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/profile")}
                className="w-20 h-20 md:w-16 md:h-16 p-0 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-primary shadow-lg"
                aria-label="View profile"
              >
                <Typography
                  variant="body-lg"
                  className="font-bold text-white text-xl md:text-lg"
                >
                  {getInitials(displayName)}
                </Typography>
              </Button>
            )}
            {isOwnProfile && (
              <Tooltip content="Edit profile picture">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 md:p-1.5 shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200 min-w-[36px] min-h-[36px] md:min-w-[auto] md:min-h-[auto]"
                  aria-label="Edit profile picture"
                  onClick={handleProfileEdit}
                >
                  <Camera className="w-4 h-4 md:w-3 md:h-3 text-brand-primary" />
                </Button>
              </Tooltip>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate("/profile")}
              className="text-left w-full p-0"
              aria-label="Open profile page"
            >
              <Typography
                variant="body-lg"
                className="font-bold text-text-primary truncate hover:text-brand-primary transition-colors"
              >
                {displayName}
              </Typography>
            </Button>
            <div className="flex items-center space-x-spacing-xs mt-1">
              <MultiBadgeDisplay
                isAdmin={profile?.is_admin}
                appRole={profile?.app_role || profile?.role || userRole}
                subscriptionTier={profile?.subscription_tier}
                size="sm"
                layout="horizontal"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Achievements Summary */}
        {achievements && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-spacing-xs pt-spacing-sm">
            <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 rounded-lg p-3 md:p-spacing-sm text-center border border-brand-primary/20">
              <Typography
                variant="body-xs"
                className="text-brand-primary font-medium text-xs md:text-[11px]"
              >
                Stickers
              </Typography>
              <Typography
                variant="body-sm"
                className="font-bold text-brand-primary text-xl md:text-lg mt-1"
              >
                {achievements.stickers}
              </Typography>
            </div>
            <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-lg p-3 md:p-spacing-sm text-center border border-success/20">
              <Typography
                variant="body-xs"
                className="text-success font-medium text-xs md:text-[11px]"
              >
                Medals
              </Typography>
              <Typography
                variant="body-sm"
                className="font-bold text-success text-xl md:text-lg mt-1"
              >
                {achievements.medals}
              </Typography>
            </div>
            <div className="bg-gradient-to-br from-warning/10 to-warning/5 rounded-lg p-3 md:p-spacing-sm text-center border border-warning/20">
              <Typography
                variant="body-xs"
                className="text-warning font-medium text-xs md:text-[11px]"
              >
                Streak
              </Typography>
              <Typography
                variant="body-sm"
                className="font-bold text-warning text-xl md:text-lg mt-1"
              >
                {achievements.streak}
              </Typography>
            </div>
            <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/5 rounded-lg p-3 md:p-spacing-sm text-center border border-brand-secondary/20">
              <Typography
                variant="body-xs"
                className="text-brand-secondary font-medium text-xs md:text-[11px]"
              >
                Points
              </Typography>
              <Typography
                variant="body-sm"
                className="font-bold text-brand-secondary text-xl md:text-lg mt-1"
              >
                {achievements.points}
              </Typography>
            </div>
          </div>
        )}
        {achLoading && (
          <div className="flex items-center justify-center py-spacing-md">
            <div className="w-6 h-6 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
            <Typography
              variant="body-xs"
              className="text-text-muted ml-spacing-xs"
            >
              Loading achievements…
            </Typography>
          </div>
        )}
        {/* Enhanced Bio with Inline Editing */}
        <div className="pt-spacing-md relative">
          <div className="bg-gradient-to-br from-brand-secondary/5 to-surface-card rounded-lg p-spacing-sm border border-brand-secondary/20">
            <div className="flex items-center justify-between mb-spacing-xs">
              <Typography
                variant="body-sm"
                className="font-semibold text-brand-secondary"
              >
                About
              </Typography>
              {isOwnProfile && !isEditingBio && (
                <Tooltip content="Edit bio">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingBio(true)}
                    className="p-1 hover:bg-brand-secondary/10 rounded-lg transition-colors"
                    aria-label="Edit bio"
                  >
                    <Edit2 className="w-3 h-3 text-brand-secondary" />
                  </Button>
                </Tooltip>
              )}
            </div>

            {isEditingBio ? (
              <div className="space-y-spacing-xs">
                <textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  placeholder="Tell others about yourself..."
                  className="w-full p-spacing-xs text-sm bg-surface-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent resize-none"
                  rows={3}
                  maxLength={200}
                />
                <div className="flex items-center justify-between">
                  <Typography variant="body-xs" className="text-text-muted">
                    {bioText.length}/200
                  </Typography>
                  <div className="flex items-center space-x-spacing-xs">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBioCancel}
                      disabled={isSavingBio}
                      className="p-1 hover:bg-error/10 rounded-lg"
                    >
                      <X className="w-3 h-3 text-error" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBioSave}
                      disabled={isSavingBio}
                      className="p-1 hover:bg-success/10 rounded-lg"
                    >
                      {isSavingBio ? (
                        <div className="w-3 h-3 border border-success/30 border-t-success rounded-full animate-spin" />
                      ) : (
                        <Save className="w-3 h-3 text-success" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {profile?.bio ? (
                  <>
                    <Typography
                      variant="body-sm"
                      className="text-text-secondary leading-relaxed"
                    >
                      {showFullBio
                        ? profile.bio
                        : `${profile.bio.slice(0, 120)}${profile.bio.length > 120 ? "..." : ""}`}
                    </Typography>
                    {profile.bio.length > 120 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFullBio(!showFullBio)}
                        className="p-0 h-auto text-xs text-brand-secondary hover:text-brand-secondary/80 mt-spacing-xs"
                      >
                        {showFullBio ? "Show less" : "Show more"}
                      </Button>
                    )}
                  </>
                ) : (
                  <Typography
                    variant="body-sm"
                    className="text-text-muted italic"
                  >
                    {isOwnProfile
                      ? "Click the edit icon to add a bio..."
                      : "No bio added yet"}
                  </Typography>
                )}
              </div>
            )}
          </div>

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
              onProfileUpdate={async (_updatedProfile) => {
                // Use the auth store to properly refresh the profile and invalidate cache
                const { fetchUserProfile } = useAuth.getState();
                await fetchUserProfile(profile.id);
                setEditModalOpen(false);
              }}
            />
          )}
        </div>
        {/* Contact Info */}
        {profile?.phone && !isViewMode && (
          <div className="flex items-center space-x-spacing-xs pt-spacing-sm px-spacing-sm py-spacing-xs bg-surface-secondary/50 rounded-lg">
            <Icon name="phone" size="xs" color="navy" />
            <Typography variant="body-sm" className="text-text-secondary">
              {profile.phone}
            </Typography>
          </div>
        )}

        {/* Enhanced Actions */}
        <div className="pt-spacing-md flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-spacing-xs sm:space-x-spacing-xs">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/profile")}
            aria-label="View full profile"
            className="flex-1 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 hover:from-brand-primary/20 hover:to-brand-secondary/20 border-brand-primary/20 min-h-[44px] justify-center"
          >
            <User className="w-4 h-4 mr-spacing-xs" />
            View Profile
          </Button>
          {!isViewMode && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleProfileEdit}
              className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 shadow-md min-h-[44px] min-w-[44px] sm:min-w-[auto] justify-center"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default React.memo(ProfileCard);
