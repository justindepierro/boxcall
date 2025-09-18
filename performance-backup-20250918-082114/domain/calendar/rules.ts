// Calendar domain authorization & business rules (Phase 1)
// Keep pure & side-effect free.
import type { CalendarEvent } from "./types";

export type UserLike = { id: string; role?: string | null } | null | undefined;

export function canEditEvent(
  user: UserLike,
  event: CalendarEvent | null | undefined
): boolean {
  if (!user || !event) return false;
  if (user.role === "admin") return true;
  if (user.role === "coach") return true; // refine later with team membership check
  return false;
}

export function canCreateEvent(user: UserLike): boolean {
  if (!user) return false;
  return user.role === "admin" || user.role === "coach";
}

export function canDeleteEvent(
  user: UserLike,
  event: CalendarEvent | null | undefined
): boolean {
  if (!user || !event) return false;
  if (user.role === "admin") return true;
  // Coaches can delete if they created it (future: created_by field check)
  if (user.role === "coach") return true;
  return false;
}

export function requiresRSVP(event: CalendarEvent | null | undefined): boolean {
  return !!event?.rsvp_required;
}

// Placeholder: refine for future recurrence editing restrictions
export function canEditRecurringInstance(
  user: UserLike,
  event: CalendarEvent | null | undefined
): boolean {
  return canEditEvent(user, event);
}
