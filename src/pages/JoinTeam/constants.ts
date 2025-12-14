/**
 * JoinTeam Constants
 *
 * Constant data and mock values for the Join Team wizard
 */

import type { JoinMethod, TeamSearchResult } from "./types";

/**
 * Available methods for joining a team
 */
export const JOIN_METHODS: JoinMethod[] = [
  {
    id: "invite-code",
    title: "Team Invite Code",
    description: "Enter a 6-digit code provided by your coach",
    icon: "key",
    primary: true,
  },
  {
    id: "email-invite",
    title: "Email Invitation",
    description: "Join using a link sent to your email",
    icon: "mail",
  },
  {
    id: "search",
    title: "Find Your Team",
    description: "Search for teams by school or team name",
    icon: "search",
  },
  {
    id: "request",
    title: "Request to Join",
    description: "Send a request to join a private team",
    icon: "user-plus",
  },
];

/**
 * Mock search results for development
 * TODO: Replace with actual API call
 */
export const MOCK_SEARCH_RESULTS: TeamSearchResult[] = [
  {
    id: "team-1",
    name: "Central High Eagles",
    school: "Central High School",
    sport: "Football",
    level: "Varsity",
    memberCount: 45,
    coachName: "Coach Johnson",
    isPublic: true,
    requiresApproval: false,
  },
  {
    id: "team-2",
    name: "North Lions JV",
    school: "North High School",
    sport: "Football",
    level: "Junior Varsity",
    memberCount: 32,
    coachName: "Coach Williams",
    isPublic: false,
    requiresApproval: true,
  },
];

/**
 * Minimum invite code length
 */
export const INVITE_CODE_LENGTH = 6;
