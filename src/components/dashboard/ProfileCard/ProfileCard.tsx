import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileEditModal } from "../../profile/ProfileEditModal";
import { DashboardContext } from "../../../contexts/DashboardContextInstance";
import { useRoles } from "../../../hooks/useRoles";
import { useAdaptiveWidget } from "../../../hooks/useAdaptiveDashboard";

import { Typography } from "../../design-system";
import { Card, Button } from "../../ui";
import { Icon } from "../../ui/Icon/Icon";
import { Tooltip } from "../../ui/Tooltip/Tooltip";
import type { Database } from "../../../types/database";
import { AchievementService } from "../../../services/achievementService";

/** Profile type from database schema */
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
import { useAuth, useAuthProfile } from "../../../app/auth-store";
import { Edit2, User } from "lucide-react";

import { AchievementsGrid, AchievementsLoading } from "./AchievementsGrid";
import { BioSection } from "./BioSection";
import { ProfileAvatarSection } from "./ProfileAvatarSection";

interface ProfileCardProps {
  profile?: Profile | null;
  userRole?: string;
  isViewMode?: boolean;
  onEditClick?: () => void;
}

interface AchievementData {
  stickers: number;
  medals: number;
  streak: number;
  points: number;
}

function AchievementsSection({
  achievements,
  loading,
}: {
  achievements: AchievementData | null;
  loading: boolean;
}) {
  return (
    <>
      {achievements ? <AchievementsGrid achievements={achievements} /> : null}
      {loading ? <AchievementsLoading /> : null}
    </>
  );
}

function ProfileEditModalSection({
  isOpen,
  profile,
  onClose,
  onProfileUpdate,
}: {
  isOpen: boolean;
  profile: Profile | null | undefined;
  onClose: () => void;
  onProfileUpdate: () => Promise<void>;
}) {
  if (!isOpen || !profile) return null;

  return (
    <ProfileEditModal
      isOpen={isOpen}
      onClose={onClose}
      userRole={profile.role || "player"}
      currentProfile={{ ...profile } as { id: string; [key: string]: unknown }}
      mode="quick"
      onProfileUpdate={onProfileUpdate}
    />
  );
}

function ProfileContactInfo({
  phone,
  isViewMode,
}: {
  phone: string | null | undefined;
  isViewMode: boolean;
}) {
  if (!phone || isViewMode) return null;

  return (
    <div className="flex items-center space-x-xs pt-sm px-sm py-xs bg-secondary/50 rounded-lg">
      <Icon name="phone" size="xs" color="navy" />
      <Typography variant="body-sm" className="text-secondary">
        {phone}
      </Typography>
    </div>
  );
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
  const ctx = useContext(DashboardContext);
  const authProfile = useAuthProfile();
  const profile = ctx?.profile ?? profileProp ?? authProfile;
  const { fetchUserProfile } = useAuth();

  const { roleContext } = useRoles();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const navigate = useNavigate();

  const [achievements, setAchievements] = useState<AchievementData | null>(
    null
  );
  const [achLoading, setAchLoading] = useState(false);

  const { trackView, trackEdit, isHighPriority } = useAdaptiveWidget(
    "profile-card",
    "profile"
  );

  const isOwnProfile = !isViewMode;
  const userRole =
    userRoleProp || roleContext?.appRole || profile?.role || "player";
  const displayName = profile?.full_name || profile?.display_name || "Player";

  // Track profile views
  useEffect(() => {
    trackView();
  }, [trackView]);

  // Load achievements
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

  const handleBioUpdate = async () => {
    if (profile?.id) {
      await fetchUserProfile(profile.id);
    }
  };

  const cardClassName = isHighPriority
    ? "ring-2 ring-text-primary ring-opacity-50"
    : "";

  return (
    <Card
      variant="default"
      size="lg"
      className={`h-full relative overflow-hidden ${cardClassName}`}
    >
      {/* Header */}
      <ProfileCardHeader
        isViewMode={isViewMode}
        onEditClick={handleProfileEdit}
      />

      {/* Profile Content */}
      <div className="space-y-sm">
        <ProfileAvatarSection
          profile={profile}
          displayName={displayName}
          userRole={userRole}
          isOwnProfile={isOwnProfile}
          onEditClick={handleProfileEdit}
        />

        <AchievementsSection achievements={achievements} loading={achLoading} />

        {/* Bio Section */}
        <BioSection
          bio={profile?.bio}
          profileId={profile?.id}
          isOwnProfile={isOwnProfile}
          onBioUpdate={handleBioUpdate}
        />

        <ProfileEditModalSection
          isOpen={editModalOpen}
          profile={profile}
          onClose={() => setEditModalOpen(false)}
          onProfileUpdate={async () => {
            if (!profile?.id) return;
            await fetchUserProfile(profile.id);
            setEditModalOpen(false);
          }}
        />

        <ProfileContactInfo phone={profile?.phone} isViewMode={isViewMode} />

        {/* Actions */}
        <ProfileCardActions
          isViewMode={isViewMode}
          onViewProfile={() => navigate("/profile")}
          onEdit={handleProfileEdit}
        />
      </div>
    </Card>
  );
};

interface ProfileCardHeaderProps {
  isViewMode: boolean;
  onEditClick: () => void;
}

const ProfileCardHeader: React.FC<ProfileCardHeaderProps> = ({
  isViewMode,
  onEditClick,
}) => (
  <div className="relative bg-secondary -mx-lg -mt-lg px-lg pt-lg pb-md md:pb-sm mb-md border-b border-muted">
    <div className="relative flex items-center justify-between min-h-11">
      <div className="flex items-center space-x-sm">
        <User className="w-5 h-5 md:w-4 md:h-4 text-brand-primary" />
        <Typography
          variant="headline-md"
          className="text-primary font-bold text-lg md:text-base"
        >
          Profile
        </Typography>
      </div>
      {!isViewMode && (
        <Tooltip content="Edit profile">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEditClick}
            className="p-xs min-w-11 min-h-11 md:min-w-auto md:min-h-auto hover:bg-secondary/50 rounded-lg backdrop-blur-sm"
            aria-label="Edit profile"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
        </Tooltip>
      )}
    </div>
  </div>
);

interface ProfileCardActionsProps {
  isViewMode: boolean;
  onViewProfile: () => void;
  onEdit: () => void;
}

const ProfileCardActions: React.FC<ProfileCardActionsProps> = ({
  isViewMode,
  onViewProfile,
  onEdit,
}) => (
  <div className="pt-md flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-xs sm:space-x-xs">
    <Button
      variant="secondary"
      size="sm"
      onClick={onViewProfile}
      aria-label="View full profile"
      className="flex-1 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 hover:from-brand-primary/20 hover:to-brand-secondary/20 border-brand-primary/20 min-h-11 justify-center"
    >
      <User className="w-4 h-4 mr-xs" />
      View Profile
    </Button>
    {!isViewMode && (
      <Button
        variant="primary"
        size="sm"
        onClick={onEdit}
        className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 shadow-md min-h-11 min-w-11 sm:min-w-auto justify-center"
      >
        <Edit2 className="w-4 h-4" />
      </Button>
    )}
  </div>
);

export default React.memo(ProfileCard);
