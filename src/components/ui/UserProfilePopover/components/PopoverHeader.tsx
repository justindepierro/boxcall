/**
 * PopoverHeader Component
 *
 * Header section with avatar, name, and badges
 */

import React from "react";
import { Typography } from "../../design-system/Typography";
import { MultiBadgeDisplay } from "../MultiBadgeDisplay";
import { getAvatarFallback, getDisplayName } from "./utils";
import type { PopoverProfile, TeamMemberInfo } from "./types";

interface PopoverHeaderProps {
  profile: PopoverProfile;
  teamMember: TeamMemberInfo | null;
}

export function PopoverHeader({ profile, teamMember }: PopoverHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-4 rounded-t-lg">
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="relative">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name || "User"}
              className="w-16 h-16 rounded-full border-3 border-bg-primary object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full border-3 border-bg-primary bg-primary flex items-center justify-center">
              <Typography
                variant="body-lg"
                className="text-secondary font-semibold"
              >
                {getAvatarFallback(profile.full_name)}
              </Typography>
            </div>
          )}
          {/* Online status indicator */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success-500 rounded-full border-2 border-bg-primary"></div>
        </div>

        {/* Name and role */}
        <div className="flex-1 min-w-0">
          <Typography
            variant="headline-sm"
            className="text-white font-bold truncate"
          >
            {getDisplayName(profile, teamMember)}
          </Typography>
          <div className="mt-1">
            <MultiBadgeDisplay
              isAdmin={profile.is_admin}
              appRole={profile.role}
              subscriptionTier={profile.subscription_tier}
              size="sm"
              layout="wrap"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
