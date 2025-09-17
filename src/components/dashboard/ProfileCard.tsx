import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileEditModal } from "../profile/ProfileEditModal";
import { DashboardContext } from "../../context/DashboardContextInstance";
import { useRoles } from "../../hooks/useRoles";
import { useAdaptiveWidget } from "../../hooks/useAdaptiveDashboard";

import { Typography } from "../design-system";
import { Card, Button } from "../ui";
import { Icon } from "../ui/Icon";
import type { Profile } from "../../types/database";
import { AchievementService } from "@services/achievementService";
import { DashboardService } from "@services/dashboardService";
import { supabase } from "../../lib/supabase";
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
  const [editMode, setEditMode] = useState<"quick" | "full">("quick");
  const isOwnProfile = !isViewMode; // Only show quick actions for own profile
  const [showFullBio, setShowFullBio] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState<string>(profile?.bio || "");
  const [savingBio, setSavingBio] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
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

  const handleProfileEdit = (mode: "quick" | "full" = "quick") => {
    trackEdit();
    // Lightweight debug signal so users can confirm wiring
    if (import.meta.env.DEV)
      console.info("[ProfileCard] Open quick-edit modal");
    if (onEditClick) {
      onEditClick();
    } else {
      setEditMode(mode);
      setEditModalOpen(true);
    }
  };
  const handleEditBio = () => setEditingBio(true);

  useEffect(() => {
    setBioDraft(profile?.bio || "");
  }, [profile?.bio]);

  const saveBioInline = async () => {
    if (!profile?.id) return;
    setSavingBio(true);
    try {
      const updated = await DashboardService.updateUserProfile(profile.id, {
        bio: bioDraft,
      });
      if (updated) {
        setProfile(updated as unknown as Profile);
        setAuthProfile(updated as unknown as Profile);
        setEditingBio(false);
      }
    } finally {
      setSavingBio(false);
    }
  };

  const onAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };

  const onAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;
    try {
      // Upload to storage (ProfileEditModal uses 'avatars' bucket)
      const { error } = await supabase.storage
        .from("avatars")
        .upload(`${profile.id}/${file.name}`, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(`${profile.id}/${file.name}`);
      const avatarUrl = urlData?.publicUrl;
      if (avatarUrl) {
        const updated = await DashboardService.updateUserProfile(profile.id, {
          avatar_url: avatarUrl,
        });
        if (updated) {
          setProfile(updated as unknown as Profile);
          setAuthProfile(updated as unknown as Profile);
        }
      }
    } catch (err) {
      console.error("Avatar upload failed", err);
    } finally {
      // reset input to allow re-upload same file
      if (fileInputRef.current) fileInputRef.current.value = "";
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
    <Card
      className={`compact-card h-full relative border-0 shadow-[0_1px_2px_rgba(0,0,0,0.06)] ${cardClassName}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <Typography variant="headline-md" className="text-navy-800">
          Profile
        </Typography>
      </div>
      {/* Profile Content */}
      <div className="space-y-3">
        {/* Avatar & Name */}
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16">
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
            {!isViewMode && (
              <Button
                variant="secondary"
                size="xs"
                onClick={onAvatarButtonClick}
                aria-label="Change profile picture"
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full p-0 shadow-sm flex items-center justify-center"
              >
                <Icon name="camera" size={12} />
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onAvatarFileChange}
              className="hidden"
            />
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
            <div className="rounded-md p-2 text-center bg-[var(--semantic-bg-secondary)]">
              <Typography variant="body-xs" className="text-text-muted">
                Stickers
              </Typography>
              <Typography variant="body-sm" className="font-semibold">
                {achievements.stickers}
              </Typography>
            </div>
            <div className="rounded-md p-2 text-center bg-[var(--semantic-bg-secondary)]">
              <Typography variant="body-xs" className="text-text-muted">
                Medals
              </Typography>
              <Typography variant="body-sm" className="font-semibold">
                {achievements.medals}
              </Typography>
            </div>
            <div className="rounded-md p-2 text-center bg-[var(--semantic-bg-secondary)]">
              <Typography variant="body-xs" className="text-text-muted">
                Streak
              </Typography>
              <Typography variant="body-sm" className="font-semibold">
                {achievements.streak}
              </Typography>
            </div>
            <div className="rounded-md p-2 text-center bg-[var(--semantic-bg-secondary)]">
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
              <Icon name="crown" size={14} color="navy" />
              <Typography variant="body-sm" className="text-text-primary">
                Coach
              </Typography>
            </div>
          </div>
        )}
        {isFamily && (
          <div className="flex items-center space-x-2">
            <Icon name="users" size={14} color="primary" />
            <Typography variant="body-sm" className="text-text-primary">
              Family Member
            </Typography>
          </div>
        )}
        {/* Bio */}
        <div className="pt-2">
          {editingBio ? (
            <div className="space-y-2">
              <textarea
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                className="w-full min-h-[80px] rounded bg-[var(--semantic-bg-secondary)] p-2 text-sm"
              />
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setBioDraft(profile?.bio || "");
                    setEditingBio(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={saveBioInline}
                  disabled={savingBio}
                >
                  {savingBio ? "Saving..." : "Done"}
                </Button>
              </div>
            </div>
          ) : profile?.bio ? (
            <>
              <Button
                variant="link"
                size="sm"
                onClick={handleEditBio}
                aria-label="Edit Bio"
                className="text-left w-full"
              >
                <Typography
                  variant="body-sm"
                  className="text-text-secondary leading-relaxed"
                >
                  {showFullBio
                    ? profile.bio
                    : `${profile.bio.slice(0, 80)}${profile.bio.length > 80 ? "..." : ""}`}
                </Typography>
              </Button>
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
              <Button
                variant="link"
                size="sm"
                onClick={handleEditBio}
                aria-label="Add Bio"
                className="text-left w-full"
              >
                <Typography
                  variant="body-sm"
                  className="italic text-text-muted"
                >
                  Add a bio to tell others about yourself...
                </Typography>
              </Button>
            )
          )}
        </div>
        {/* Contact Info */}
        {profile?.phone && !isViewMode && (
          <div className="flex items-center space-x-2 pt-2">
            <Icon name="phone" size={14} color="navy" />
            <Typography variant="body-sm" className="text-text-secondary">
              {profile.phone}
            </Typography>
          </div>
        )}

        {/* Actions - Bottom Left: Quick Edit, Bottom Right: View Profile */}
        <div className="pt-3 flex items-center justify-between">
          {!isViewMode ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleProfileEdit("quick")}
              aria-label="Quick Edit Profile"
            >
              <Icon name="edit" size={14} className="mr-2" /> Quick Edit
            </Button>
          ) : (
            <span />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/profile")}
            aria-label="View full profile"
          >
            <Icon name="user" size={14} className="mr-2" /> View Profile
          </Button>
        </div>
      </div>
      {/* Profile Edit Modal (portal renders at document.body) */}
      {editModalOpen && profile && (
        <ProfileEditModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          userRole={profile.role || "player"}
          currentProfile={
            { ...profile } as { id: string; [key: string]: unknown }
          }
          mode={editMode}
          onProfileUpdate={(updatedProfile) => {
            setProfile(updatedProfile as unknown as typeof profile);
            setAuthProfile(updatedProfile as unknown as typeof profile);
            setEditModalOpen(false);
          }}
        />
      )}
    </Card>
  );
};

export default React.memo(ProfileCard);
