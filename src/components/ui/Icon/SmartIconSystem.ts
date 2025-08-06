/**
 * SmartIconSystem - Intelligent Icon Selection
 *
 * Analyzes content to automatically select the most appropriate icon
 * based on keywords, context, and semantic meaning.
 *
 * Separated from main icon system for better tree shaking
 */

// Type imports for icon names
import type { NavigationIconName } from "./categories/NavigationIcons";
import type { ActionIconName } from "./categories/ActionIcons";
import type { CalendarIconName } from "./categories/CalendarIcons";
import type { SportsIconName } from "./categories/SportsIcons";
import type { BusinessIconName } from "./categories/BusinessIcons";
import type { MediaIconName } from "./categories/MediaIcons";
import type { SystemIconName } from "./categories/SystemIcons";

// Combined icon type
type SmartIconName =
  | NavigationIconName
  | ActionIconName
  | CalendarIconName
  | SportsIconName
  | BusinessIconName
  | MediaIconName
  | SystemIconName;

export class SmartIconSystem {
  private static contentPatterns: { [key: string]: SmartIconName[] } = {
    // Achievement & Success patterns
    achievement: ["trophy", "medal", "award", "star", "crown"],
    success: ["check", "check-circle", "trophy", "thumbs-up"],
    victory: ["trophy", "crown", "flame", "star"],
    medal: ["medal", "award", "star"],
    trophy: ["trophy", "crown", "award"],
    winner: ["crown", "trophy", "star"],
    champion: ["crown", "trophy", "medal"],

    // Team & People patterns
    team: ["team", "users", "user-plus", "briefcase"],
    player: ["user", "user-check", "star"],
    coach: ["user", "crown", "briefcase"],
    captain: ["crown", "user", "star"],
    roster: ["users", "list", "file"],
    member: ["user", "user-plus", "team"],

    // Calendar & Time patterns
    schedule: ["calendar", "clock", "calendar-clock"],
    event: ["calendar", "calendar-plus", "clock"],
    practice: ["calendar", "target", "activity"],
    game: ["calendar", "trophy", "target"],
    meeting: ["calendar", "users", "message"],
    deadline: ["calendar-x", "clock", "alert"],
    time: ["clock", "timer", "watch"],
    date: ["calendar", "calendar-days"],

    // Communication patterns
    message: ["message", "message-circle", "mail"],
    chat: ["message-circle", "comment", "users"],
    notification: ["bell", "bell-ring", "alert"],
    announcement: ["bell", "bell-ring", "message"],
    email: ["mail", "send", "message"],
    call: ["phone", "mic", "users"],

    // Sports & Activities patterns
    football: ["target", "activity", "trophy"],
    sport: ["activity", "target", "trophy"],
    exercise: ["activity", "heart", "energy"],
    training: ["target", "activity", "trending-up"],
    drill: ["target", "crosshair", "activity"],
    play: ["play", "activity", "target"],
    strategy: ["target", "crosshair", "activity"],

    // Performance & Analytics patterns
    stats: ["bar-chart", "line-chart", "activity"],
    performance: ["trending-up", "bar-chart", "activity"],
    progress: ["trending-up", "bar-chart", "percent"],
    analytics: ["line-chart", "bar-chart", "database"],
    report: ["file", "bar-chart", "line-chart"],
    data: ["database", "bar-chart", "line-chart"],

    // Actions & Status patterns
    add: ["plus", "plus-circle", "user-plus"],
    create: ["plus", "edit", "file-plus"],
    edit: ["edit", "save", "file-edit"],
    delete: ["delete", "x-circle", "minus-circle"],
    save: ["save", "check", "download"],
    export: ["export", "download", "share"],
    import: ["upload", "file-plus", "download"],
    share: ["share", "share-2", "link"],

    // Navigation patterns
    back: ["arrow-left", "chevron-left", "undo"],
    forward: ["arrow-right", "chevron-right", "redo"],
    up: ["arrow-up", "chevron-up", "trending-up"],
    down: ["arrow-down", "chevron-down", "trending-down"],
    menu: ["menu", "grid", "list"],
    close: ["close", "x-circle", "minus-circle"],

    // Default fallbacks for common words
    default: ["star", "info", "activity"],
  };

  /**
   * Analyzes text content and returns the most appropriate icon
   */
  static getSmartIcon(
    content: string,
    fallback: SmartIconName = "star"
  ): SmartIconName {
    if (!content || typeof content !== "string") {
      return fallback;
    }

    const normalizedContent = content.toLowerCase().trim();

    // Direct matches first (highest priority)
    for (const [pattern, icons] of Object.entries(this.contentPatterns)) {
      if (normalizedContent.includes(pattern)) {
        return icons[0]; // Return the primary icon for this pattern
      }
    }

    // Word boundary matches (medium priority)
    const words = normalizedContent.split(/\s+/);
    for (const word of words) {
      for (const [pattern, icons] of Object.entries(this.contentPatterns)) {
        if (word === pattern) {
          return icons[0];
        }
      }
    }

    // Partial matches (lower priority)
    for (const word of words) {
      for (const [pattern, icons] of Object.entries(this.contentPatterns)) {
        if (pattern.includes(word) || word.includes(pattern)) {
          return icons[0];
        }
      }
    }

    return fallback;
  }

  /**
   * Gets multiple icon suggestions for content
   */
  static getIconSuggestions(
    content: string,
    maxSuggestions: number = 3
  ): SmartIconName[] {
    if (!content || typeof content !== "string") {
      return ["star", "info", "activity"];
    }

    const normalizedContent = content.toLowerCase().trim();
    const suggestions: SmartIconName[] = [];

    // Collect all matching patterns
    for (const [pattern, icons] of Object.entries(this.contentPatterns)) {
      if (normalizedContent.includes(pattern)) {
        suggestions.push(...icons.slice(0, 2)); // Take top 2 from each pattern
      }
    }

    // Remove duplicates and limit results
    const uniqueSuggestions = [...new Set(suggestions)];
    return uniqueSuggestions.slice(0, maxSuggestions);
  }

  /**
   * Contextual icon selection for specific components
   */
  static getContextualIcon(
    content: string,
    context:
      | "feed"
      | "calendar"
      | "achievement"
      | "message"
      | "team"
      | "general" = "general",
    fallback: SmartIconName = "star"
  ): SmartIconName {
    const contextualFallbacks: { [key: string]: SmartIconName } = {
      feed: "activity",
      calendar: "calendar",
      achievement: "trophy",
      message: "message",
      team: "users",
      general: fallback,
    };

    const smartIcon = this.getSmartIcon(content, contextualFallbacks[context]);

    // Context-specific overrides
    if (
      context === "achievement" &&
      !["trophy", "medal", "award", "crown", "star"].includes(smartIcon)
    ) {
      const achievementIcons = this.contentPatterns.achievement || ["trophy"];
      return achievementIcons[0];
    }

    if (
      context === "calendar" &&
      !["calendar", "clock", "timer"].includes(smartIcon)
    ) {
      return "calendar";
    }

    return smartIcon;
  }
}
