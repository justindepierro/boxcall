/**
 * Date and Time Formatting Utilities
 *
 * Centralized formatting functions to avoid duplication across components.
 * All date/time formatting should use these utilities.
 *
 * @module dateFormatting
 */

/**
 * Format duration in minutes to human-readable string
 * @param minutes - Duration in minutes
 * @returns Formatted string like "45m", "1h 30m", "2h"
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

/**
 * Format duration in milliseconds to human-readable string
 * @param ms - Duration in milliseconds
 * @returns Formatted string like "150ms", "1.5s", "2m 30s"
 */
export const formatDurationMs = (ms: number): string => {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.round((ms % 60000) / 1000);
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
};

/**
 * Format date to localized short format
 * @param date - Date object or string
 * @returns Formatted string like "Dec 9, 2025"
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
};

/**
 * Format date to relative time ago
 * @param date - Date object or string
 * @returns Formatted string like "2 hours ago", "yesterday", "Dec 5"
 */
export const formatTimeAgo = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return "just now";
  }
  if (diffMin < 60) {
    return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  }
  if (diffHour < 24) {
    return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
  }
  if (diffDay === 1) {
    return "yesterday";
  }
  if (diffDay < 7) {
    return `${diffDay} days ago`;
  }
  return formatDate(d);
};

/**
 * Format date to relative display (Today, Yesterday, or date)
 * @param date - Date object or string
 * @returns Formatted string like "Today", "Yesterday", "Dec 5, 2025"
 */
export const formatRelativeDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();

  // Reset time parts for comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diffDays = Math.floor(
    (today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  return formatDate(d);
};

/**
 * Format time string (HH:MM) to 12-hour format
 * @param time - Time string in HH:MM format
 * @returns Formatted string like "2:30 PM"
 */
export const formatTime12Hour = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

/**
 * Format seconds to MM:SS display
 * @param seconds - Duration in seconds
 * @returns Formatted string like "05:30"
 */
export const formatSecondsToMMSS = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Format timestamp to readable date/time
 * @param timestamp - Unix timestamp (ms) or ISO string
 * @returns Formatted string like "Dec 9, 2025 at 2:30 PM"
 */
export const formatTimestamp = (timestamp: number | string): string => {
  const d =
    typeof timestamp === "number" ? new Date(timestamp) : new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
};
