/**
 * SmartIconSystem - Intelligent Icon Selection
 *
 * Analyzes content to automatically select the most appropriate icon
 * based on keywords, context, and semantic meaning.
 *
 * Separated from main icon system for better tree shaking
 */

// Use the modular icon union to avoid importing legacy lucide-react categories
import type { ModularIconName } from "./ModularIcon";

// Narrowed set used by SmartIconSystem suggestions
type SmartIconName = Extract<
  ModularIconName,
  | "trophy"
  | "award"
  | "star"
  | "crown"
  | "check"
  | "check-circle"
  | "users"
  | "user"
  | "user-plus"
  | "list"
  | "file"
  | "calendar"
  | "clock"
  | "target"
  | "activity"
  | "message"
  | "mail"
  | "alert"
  | "alert-triangle"
  | "info"
  | "trending-up"
  | "database"
  | "plus"
  | "plus-circle"
  | "edit"
  | "delete"
  | "save"
  | "download"
  | "upload"
  | "link"
  | "arrow-left"
  | "chevron-left"
  | "arrow-right"
  | "chevron-right"
  | "arrow-up"
  | "chevron-up"
  | "arrow-down"
  | "chevron-down"
  | "grid"
  | "menu"
  | "home"
  | "team"
  | "play"
  | "close"
  | "phone"
>;

export class SmartIconSystem {
  private static contentPatterns: { [key: string]: SmartIconName[] } = {
    // Achievement & Success patterns
    achievement: ["trophy", "award", "star", "crown"],
    success: ["check", "check-circle", "trophy"],
    victory: ["trophy", "crown", "star"],
    trophy: ["trophy", "crown", "award"],
    winner: ["crown", "trophy", "star"],
    champion: ["crown", "trophy", "award"],

    // Team & People patterns
    team: ["team", "users", "user-plus"],
    player: ["user", "star"],
    coach: ["user", "crown"],
    captain: ["crown", "user", "star"],
    roster: ["users", "list", "file"],
    member: ["user", "user-plus", "team"],

    // Calendar & Time patterns
    schedule: ["calendar", "clock"],
    event: ["calendar", "clock"],
    practice: ["calendar", "target", "activity"],
    game: ["calendar", "trophy", "target"],
    meeting: ["calendar", "users", "message"],
    deadline: ["calendar", "clock", "alert"],
    time: ["clock"],
    date: ["calendar"],

    // Communication patterns
    message: ["message", "mail"],
    chat: ["message", "users"],
    notification: ["alert"],
    announcement: ["message"],
    email: ["mail", "message"],
    call: ["phone", "users"],

    // Sports & Activities patterns
    football: ["target", "activity", "trophy"],
    sport: ["activity", "target", "trophy"],
    exercise: ["activity"],
    training: ["target", "activity", "trending-up"],
    drill: ["target", "activity"],
    play: ["play", "activity", "target"],
    strategy: ["target", "activity"],

    // Performance & Analytics patterns
    stats: ["trending-up", "activity"],
    performance: ["trending-up", "activity"],
    progress: ["trending-up", "activity"],
    analytics: ["trending-up", "database"],
    report: ["file", "trending-up"],
    data: ["database", "trending-up"],

    // Actions & Status patterns
    add: ["plus", "plus-circle", "user-plus"],
    create: ["plus", "edit"],
    edit: ["edit", "save"],
    delete: ["delete", "alert"],
    save: ["save", "check", "download"],
    export: ["download", "link"],
    import: ["upload", "download"],
    share: ["link"],

    // Navigation patterns
    back: ["arrow-left", "chevron-left"],
    forward: ["arrow-right", "chevron-right"],
    up: ["arrow-up", "chevron-up", "trending-up"],
    down: ["arrow-down", "chevron-down"],
    menu: ["menu", "grid", "list"],
    close: ["close", "alert"],

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
      !["trophy", "award", "crown", "star"].includes(smartIcon)
    ) {
      const achievementIcons = this.contentPatterns.achievement || ["trophy"];
      return achievementIcons[0];
    }

    if (context === "calendar" && !["calendar", "clock"].includes(smartIcon)) {
      return "calendar";
    }

    return smartIcon;
  }
}
