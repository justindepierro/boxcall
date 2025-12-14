/**
 * UserProfilePopover Utility Functions
 */

import type { PopoverProfile, TeamMemberInfo, SocialLink } from "./types";

export function formatMemberSince(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

export function getAvatarFallback(name: string | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export function getDisplayName(
  profile: PopoverProfile | null,
  teamMember: TeamMemberInfo | null
): string {
  if (!profile) return "Unknown User";

  // If they're a coach on this team, show "Coach [Last Name]"
  if (
    teamMember &&
    (teamMember.team_role === "head_coach" ||
      teamMember.team_role === "assistant_coach" ||
      teamMember.team_role === "coach")
  ) {
    const fullName = profile.full_name || profile.display_name || "";
    const nameParts = fullName.trim().split(" ");
    const lastName = nameParts[nameParts.length - 1];
    return lastName ? `Coach ${lastName}` : "Coach";
  }

  return profile.display_name || profile.full_name || "Unknown User";
}

export function getPositionDisplay(profile: PopoverProfile | null): string | null {
  if (!profile) return null;

  if (profile.role === "coach" && profile.years_coaching) {
    return `${profile.years_coaching} years coaching`;
  }
  if (profile.position) {
    return profile.jersey_number
      ? `#${profile.jersey_number} ${profile.position}`
      : profile.position;
  }
  return null;
}

export function getSocialLinks(profile: PopoverProfile | null): SocialLink[] {
  if (!profile) return [];

  const links: SocialLink[] = [];
  if (profile.social_twitter)
    links.push({ icon: "twitter", url: profile.social_twitter });
  if (profile.social_instagram)
    links.push({ icon: "instagram", url: profile.social_instagram });
  if (profile.social_linkedin)
    links.push({ icon: "linkedin", url: profile.social_linkedin });
  if (profile.personal_website)
    links.push({ icon: "website", url: profile.personal_website });
  return links;
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case "head_coach":
      return "Head Coach";
    case "assistant_coach":
      return "Assistant Coach";
    case "coach":
      return "Coach";
    case "coordinator":
      return "Coordinator";
    case "manager":
      return "Manager";
    default:
      return role;
  }
}
