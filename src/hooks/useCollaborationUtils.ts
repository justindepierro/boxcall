/**
 * Collaboration Utilities
 * Helper functions and hooks for collaboration features
 *
 * Phase 2B Sprint 4: Live Dashboard Sharing
 */

import { useMemo } from "react";
import { type CollaborationUser } from "../services/realTimeCollaboration";

/**
 * Hook to create a users map from participants array
 */
export function useUsersMap(
  participants: CollaborationUser[]
): Map<string, CollaborationUser> {
  return useMemo(() => {
    const map = new Map<string, CollaborationUser>();
    participants.forEach((user) => {
      map.set(user.id, user);
    });
    return map;
  }, [participants]);
}

/**
 * Generate a user-friendly color for a user based on their ID
 */
export function getUserColor(
  userId: string,
  role: CollaborationUser["role"]
): string {
  // Use role-based colors with slight variations based on user ID
  const roleColors: Record<CollaborationUser["role"], string[]> = {
    coach: ["orange-500", "orange-600", "orange-400"],
    player: ["blue-500", "blue-600", "blue-400"],
    parent: ["pink-500", "pink-600", "pink-400"],
    admin: ["purple-500", "purple-600", "purple-400"],
  };

  const colors = roleColors[role] || ["gray-500", "gray-600", "gray-400"];
  const hash = userId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = hash % colors.length;

  return colors[colorIndex];
}

/**
 * Check if a dashboard update conflicts with another
 */
export function hasUpdateConflict(
  update1: { widgetId: string; type: string; timestamp: number },
  update2: { widgetId: string; type: string; timestamp: number },
  conflictWindowMs = 1000
): boolean {
  if (update1.widgetId !== update2.widgetId) return false;

  const timeDiff = Math.abs(update1.timestamp - update2.timestamp);
  return timeDiff < conflictWindowMs;
}

/**
 * Get permission level for user in session
 */
export function getPermissionLevel(
  userId: string,
  canEdit: string[],
  canView: string[]
): "none" | "view" | "edit" {
  if (canEdit.includes(userId)) return "edit";
  if (canView.includes(userId)) return "view";
  return "none";
}

/**
 * Format user list for display
 */
export function formatParticipantsList(
  participants: CollaborationUser[]
): string {
  if (participants.length === 0) return "No participants";
  if (participants.length === 1) return participants[0].name;
  if (participants.length === 2)
    return `${participants[0].name} and ${participants[1].name}`;

  const first = participants
    .slice(0, -1)
    .map((p) => p.name)
    .join(", ");
  const last = participants[participants.length - 1].name;
  return `${first}, and ${last}`;
}

/**
 * Debounce function for collaboration events
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func(...args);
    }, waitMs);
  };
}

/**
 * Throttle function for high-frequency events like cursor updates
 */
export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limitMs);
    }
  };
}
