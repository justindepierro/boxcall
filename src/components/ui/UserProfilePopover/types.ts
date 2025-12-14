/**
 * UserProfilePopover Type Definitions
 */

export interface UserProfilePopoverProps {
  userId: string;
  trigger: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right" | "auto";
  showOnHover?: boolean;
  className?: string;
  teamId?: string;
}

export interface PopoverProfile {
  id: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
  is_admin?: boolean | null;
  subscription_tier?: string | null;
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
  created_at: string | null;
}

export interface TeamMemberInfo {
  team_role: string;
  status: string | null;
  assigned_at: string | null;
}

export interface PlayerInfo {
  jersey_number: number | null;
  positions: string[] | null;
  height_inches: number | null;
  weight_lbs: number | null;
}

export interface SocialLink {
  icon: string;
  url: string;
}

export type ComputedPlacement = "top" | "bottom" | "left" | "right";
