import React from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";
import { Typography } from "../../design-system";
import { Button } from "../../ui";
import { Tooltip } from "../../ui/Tooltip/Tooltip";
import { MultiBadgeDisplay } from "../../ui/MultiBadgeDisplay";
import type { Profile } from "../../../types/database";

interface ProfileAvatarSectionProps {
  profile: Profile | null;
  displayName: string;
  userRole: string;
  isOwnProfile: boolean;
  onEditClick: () => void;
}

/** Get initials from a name */
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Avatar & Name Section - Responsive: Vertical on mobile, Horizontal on desktop
 */
export const ProfileAvatarSection: React.FC<ProfileAvatarSectionProps> = ({
  profile,
  displayName,
  userRole,
  isOwnProfile,
  onEditClick,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center space-y-sm md:flex-row md:items-center md:space-y-0 md:space-x-md">
      <div className="relative">
        <AvatarButton
          avatarUrl={profile?.avatar_url}
          displayName={displayName}
          onClick={() => navigate("/profile")}
        />
        {isOwnProfile && (
          <Tooltip content="Edit profile picture">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -bottom-1 -right-1 bg-surface-base rounded-full p-2 md:p-1.5 shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200 min-w-9 min-h-9 md:min-w-auto md:min-h-auto border border-muted"
              aria-label="Edit profile picture"
              onClick={onEditClick}
            >
              <Camera className="w-4 h-4 md:w-3 md:h-3 text-brand-primary" />
            </Button>
          </Tooltip>
        )}
      </div>
      <div className="flex-1 min-w-0 text-center md:text-left w-full">
        <Button
          variant="link"
          size="sm"
          onClick={() => navigate("/profile")}
          className="text-center md:text-left w-full p-0 justify-center md:justify-start"
          aria-label="Open profile page"
        >
          <Typography
            variant="body-lg"
            className="font-bold text-primary truncate hover:text-brand-primary transition-colors"
          >
            {displayName}
          </Typography>
        </Button>
        <div className="flex items-center justify-center md:justify-start space-x-xs mt-1">
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
  );
};

interface AvatarButtonProps {
  avatarUrl: string | null | undefined;
  displayName: string;
  onClick: () => void;
}

const AvatarButton: React.FC<AvatarButtonProps> = ({
  avatarUrl,
  displayName,
  onClick,
}) => {
  if (avatarUrl) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className="w-24 h-24 md:w-16 md:h-16 p-0 rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-brand-primary shadow-lg"
        aria-label="View profile"
      >
        <img
          src={avatarUrl}
          alt={`${displayName}'s avatar`}
          className="w-full h-full object-cover"
        />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="w-24 h-24 md:w-16 md:h-16 p-0 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-primary shadow-lg"
      aria-label="View profile"
    >
      <Typography
        variant="body-lg"
        className="font-bold text-white text-2xl md:text-lg"
      >
        {getInitials(displayName)}
      </Typography>
    </Button>
  );
};
