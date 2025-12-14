/**
 * ProfileContent Component
 *
 * Main content area with profile details
 */

import {
  Activity,
  Trophy,
  Calendar,
  MapPin,
  Link2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { Typography } from "../../../design-system/Typography";
import { TeamRoleSection } from "./TeamRoleSection";
import { PlayerInfoSection } from "./PlayerInfoSection";
import {
  getPositionDisplay,
  getSocialLinks,
  formatMemberSince,
} from "../utils";
import type { PopoverProfile, TeamMemberInfo, PlayerInfo } from "../types";

interface ProfileContentProps {
  profile: PopoverProfile;
  teamMember: TeamMemberInfo | null;
  playerInfo: PlayerInfo | null;
  achievements: any[];
  onViewProfile: () => void;
}

export function ProfileContent({
  profile,
  teamMember,
  playerInfo,
  achievements,
  onViewProfile,
}: ProfileContentProps) {
  const socialLinks = getSocialLinks(profile);
  const positionDisplay = getPositionDisplay(profile);

  return (
    <div className="p-4 space-y-4">
      {/* Team Role */}
      {teamMember && <TeamRoleSection teamMember={teamMember} />}

      {/* Player Information */}
      {playerInfo && <PlayerInfoSection playerInfo={playerInfo} />}

      {/* Position/Experience */}
      {positionDisplay && (
        <div className="flex items-center text-secondary">
          <Activity className="w-4 h-4 mr-2" />
          <Typography variant="body-sm">{positionDisplay}</Typography>
        </div>
      )}

      {/* School/Organization */}
      {profile.current_school && (
        <div className="flex items-center text-secondary">
          <MapPin className="w-4 h-4 mr-2" />
          <Typography variant="body-sm" className="truncate">
            {profile.current_school}
          </Typography>
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <div>
          <Typography variant="body-sm" className="text-primary line-clamp-3">
            {profile.bio}
          </Typography>
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div>
          <div className="flex items-center mb-2">
            <Trophy className="w-4 h-4 mr-2 text-warning-500" />
            <Typography variant="body-sm" className="font-medium text-primary">
              Recent Achievements
            </Typography>
          </div>
          <div className="flex flex-wrap gap-2">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="bg-warning-bg text-warning-600 px-2 py-1 rounded-lg text-xs font-medium"
              >
                {achievement.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social Links */}
      {socialLinks.length > 0 && (
        <div>
          <div className="flex items-center mb-2">
            <Link2 className="w-4 h-4 mr-2 text-muted" />
            <Typography variant="body-sm" className="font-medium text-primary">
              Social Links
            </Typography>
          </div>
          <div className="flex space-x-2">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-blue-500 transition-colors"
              >
                <Link2 className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Contact Info */}
      <div className="border-t pt-3 space-y-2">
        {profile.email && (
          <div className="flex items-center text-secondary">
            <Mail className="w-4 h-4 mr-2" />
            <Typography variant="body-xs" className="truncate">
              {profile.email}
            </Typography>
          </div>
        )}
        {profile.phone && (
          <div className="flex items-center text-secondary">
            <Phone className="w-4 h-4 mr-2" />
            <Typography variant="body-xs">{profile.phone}</Typography>
          </div>
        )}
      </div>

      {/* Member Since */}
      {profile.created_at && (
        <div className="border-t pt-3">
          <div className="flex items-center text-muted">
            <Calendar className="w-4 h-4 mr-2" />
            <Typography variant="body-xs">
              Member since {formatMemberSince(profile.created_at)}
            </Typography>
          </div>
        </div>
      )}

      {/* View Profile Button */}
      <div className="pt-2">
        <button
          onClick={onViewProfile}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <User className="w-4 h-4" />
          View Full Profile
        </button>
      </div>
    </div>
  );
}
