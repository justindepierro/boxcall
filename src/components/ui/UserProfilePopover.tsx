import React, { useState, useEffect } from "react";
import {
  Activity,
  Trophy,
  Calendar,
  MapPin,
  Link2,
  Mail,
  Phone,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Typography } from "../design-system/Typography";
import { MultiBadgeDisplay } from "./MultiBadgeDisplay";

interface UserProfilePopoverProps {
  userId: string;
  trigger: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  showOnHover?: boolean;
  className?: string;
}

interface PopoverProfile {
  id: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
  app_role: string | null;
  is_admin: boolean | null;
  subscription_tier: string | null;
  bio: string | null;
  position: string | null;
  jersey_number: number | null;
  years_coaching: number | null;
  current_school: string | null;
  social_twitter: string | null;
  social_instagram: string | null;
  social_linkedin: string | null;
  personal_website: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export const UserProfilePopover: React.FC<UserProfilePopoverProps> = ({
  userId,
  trigger,
  placement = "bottom",
  showOnHover = true,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [profile, setProfile] = useState<PopoverProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [achievements, setAchievements] = useState<any[]>([]);

  // Fetch profile data when popover becomes visible
  useEffect(() => {
    const fetchData = async () => {
      if (isVisible && !profile && !loading) {
        setLoading(true);
        try {
          // Fetch profile data
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select(
              `
              id,
              full_name,
              display_name,
              avatar_url,
              role,
              app_role,
              is_admin,
              subscription_tier,
              bio,
              position,
              jersey_number,
              years_coaching,
              current_school,
              social_twitter,
              social_instagram,
              social_linkedin,
              personal_website,
              phone,
              email,
              created_at
            `
            )
            .eq("id", userId)
            .single();

          if (profileError) {
            console.error("Error fetching profile:", profileError);
            return;
          }

          setProfile(profileData);

          // Fetch achievements (top 3)
          const { data: achievementsData } = await supabase
            .from("achievements")
            .select("title, icon_name, category")
            .eq("user_id", userId)
            .eq("is_public", true)
            .limit(3);

          setAchievements(achievementsData || []);
        } catch (error) {
          console.error("Error fetching profile data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [isVisible, userId, profile, loading]);

  const handleMouseEnter = () => {
    if (showOnHover) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (showOnHover) {
      setIsVisible(false);
    }
  };

  const handleClick = () => {
    if (!showOnHover) {
      setIsVisible(!isVisible);
    }
  };

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const getAvatarFallback = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getPositionDisplay = () => {
    if (profile?.role === "coach" && profile?.years_coaching) {
      return `${profile.years_coaching} years coaching`;
    }
    if (profile?.position) {
      return profile.jersey_number
        ? `#${profile.jersey_number} ${profile.position}`
        : profile.position;
    }
    return null;
  };

  const getSocialLinks = () => {
    const links = [];
    if (profile?.social_twitter)
      links.push({ icon: "twitter", url: profile.social_twitter });
    if (profile?.social_instagram)
      links.push({ icon: "instagram", url: profile.social_instagram });
    if (profile?.social_linkedin)
      links.push({ icon: "linkedin", url: profile.social_linkedin });
    if (profile?.personal_website)
      links.push({ icon: "website", url: profile.personal_website });
    return links;
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {trigger}

      {isVisible && (
        <div
          className={`
            absolute z-50 w-80 bg-white rounded-lg shadow-lg
            transform transition-all duration-200 ease-out
            ${placement === "bottom" ? "top-full mt-2" : ""}
            ${placement === "top" ? "bottom-full mb-2" : ""}
            ${placement === "left" ? "right-full mr-2" : ""}
            ${placement === "right" ? "left-full ml-2" : ""}
          `}
          style={{
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          }}
        >
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <Typography variant="body-sm" className="text-gray-500 mt-2">
                Loading profile...
              </Typography>
            </div>
          ) : profile ? (
            <>
              {/* Header with gradient background */}
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-4 rounded-t-lg">
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || "User"}
                        className="w-16 h-16 rounded-full border-3 border-white object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full border-3 border-white bg-white flex items-center justify-center">
                        <Typography
                          variant="body-lg"
                          className="text-gray-600 font-semibold"
                        >
                          {getAvatarFallback(profile.full_name)}
                        </Typography>
                      </div>
                    )}
                    {/* Online status indicator */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>

                  {/* Name and role */}
                  <div className="flex-1 min-w-0">
                    <Typography
                      variant="headline-sm"
                      className="text-white font-bold truncate"
                    >
                      {profile.display_name ||
                        profile.full_name ||
                        "Unknown User"}
                    </Typography>
                    <div className="mt-1">
                      <MultiBadgeDisplay
                        isAdmin={profile.is_admin}
                        appRole={profile.app_role || profile.role}
                        subscriptionTier={profile.subscription_tier}
                        size="sm"
                        layout="wrap"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Position/Experience */}
                {getPositionDisplay() && (
                  <div className="flex items-center text-gray-600">
                    <Activity className="w-4 h-4 mr-2" />
                    <Typography variant="body-sm">
                      {getPositionDisplay()}
                    </Typography>
                  </div>
                )}

                {/* School/Organization */}
                {profile.current_school && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <Typography variant="body-sm" className="truncate">
                      {profile.current_school}
                    </Typography>
                  </div>
                )}

                {/* Bio */}
                {profile.bio && (
                  <div>
                    <Typography
                      variant="body-sm"
                      className="text-gray-700 line-clamp-3"
                    >
                      {profile.bio}
                    </Typography>
                  </div>
                )}

                {/* Achievements */}
                {achievements.length > 0 && (
                  <div>
                    <div className="flex items-center mb-2">
                      <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                      <Typography
                        variant="body-sm"
                        className="font-medium text-gray-900"
                      >
                        Recent Achievements
                      </Typography>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {achievements.map((achievement, index) => (
                        <div
                          key={index}
                          className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-xs font-medium"
                        >
                          {achievement.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {getSocialLinks().length > 0 && (
                  <div>
                    <div className="flex items-center mb-2">
                      <Link2 className="w-4 h-4 mr-2 text-gray-500" />
                      <Typography
                        variant="body-sm"
                        className="font-medium text-gray-900"
                      >
                        Social Links
                      </Typography>
                    </div>
                    <div className="flex space-x-2">
                      {getSocialLinks().map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-500 transition-colors"
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
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <Typography variant="body-xs" className="truncate">
                        {profile.email}
                      </Typography>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <Typography variant="body-xs">{profile.phone}</Typography>
                    </div>
                  )}
                </div>

                {/* Member Since */}
                <div className="border-t pt-3">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <Typography variant="body-xs">
                      Member since {formatMemberSince(profile.created_at)}
                    </Typography>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center">
              <Typography variant="body-sm" className="text-gray-500">
                Profile not found
              </Typography>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
