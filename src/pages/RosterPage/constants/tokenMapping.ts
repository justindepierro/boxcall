/**
 * Design Token Mappings for Roster Page
 *
 * Centralized color mappings using semantic tokens from the design system.
 * All colors should use CSS custom properties for theme support.
 */

export const ROSTER_TOKENS = {
  // Badge Colors
  badges: {
    // Jersey Number - Primary Brand (Jade)
    jersey: {
      bg: "bg-[var(--semantic-primary)]",
      text: "text-[var(--semantic-text-inverse)]",
      border: "",
      hover: "hover:bg-[var(--semantic-primary-hover)]",
    },

    // Position - Information (Blue)
    position: {
      bg: "bg-[var(--component-information-background)]",
      text: "text-[var(--component-information-text)]",
      border: "border-[var(--component-information-border)]",
      hover: "hover:bg-[var(--component-information-hover)]",
    },

    // Grade Level - Neutral (Gray/Muted)
    gradeLevel: {
      bg: "bg-[var(--semantic-bg-muted)]",
      text: "text-[var(--semantic-text-primary)]",
      border: "border-[var(--semantic-border)]",
      hover: "hover:bg-[var(--semantic-surface-subtle-hover)]",
    },

    // Status: Active - Achievement (Green)
    statusActive: {
      bg: "bg-[var(--component-achievement-background)]",
      text: "text-[var(--component-achievement-text)]",
      border: "border-[var(--component-achievement-border)]",
      hover: "hover:bg-[var(--component-achievement-hover)]",
    },

    // Status: Inactive - Muted (Gray)
    statusInactive: {
      bg: "bg-[var(--semantic-bg-muted)]",
      text: "text-[var(--semantic-text-muted)]",
      border: "border-[var(--semantic-border)]",
      hover: "hover:bg-[var(--semantic-surface-subtle-hover)]",
    },
  },

  // Filter Chip Colors
  filterChips: {
    // Position filter chips - Information
    position: {
      bg: "bg-[var(--component-information-background)]",
      text: "text-[var(--component-information-text)]",
      hover: "hover:bg-[var(--component-information-hover)]",
    },

    // Grade level filter chips - Neutral
    gradeLevel: {
      bg: "bg-[var(--semantic-bg-muted)]",
      text: "text-[var(--semantic-text-primary)]",
      hover: "hover:bg-[var(--semantic-surface-subtle-hover)]",
    },
  },

  // Icon Colors
  icons: {
    // Primary icons (users icon)
    primary: "text-[var(--semantic-primary)]",

    // Success icons (check-circle for active players)
    success: "text-[var(--semantic-success)]",

    // Information icons (filter icon)
    information: "text-[var(--semantic-text-secondary)]",

    // Selected/Check icons
    selected: "text-[var(--semantic-primary)]",
  },
} as const;

/**
 * Utility function to combine badge classes
 * Usage: getBadgeClasses('position') returns complete className string
 */
export const getBadgeClasses = (
  variant: keyof typeof ROSTER_TOKENS.badges
): string => {
  const badge = ROSTER_TOKENS.badges[variant];
  return `inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text} ${badge.border ? `border ${badge.border}` : ""}`.trim();
};

/**
 * Utility function to get filter chip classes
 */
export const getFilterChipClasses = (
  variant: keyof typeof ROSTER_TOKENS.filterChips
): string => {
  const chip = ROSTER_TOKENS.filterChips[variant];
  return `inline-flex items-center gap-spacing-xs px-spacing-sm py-spacing-xs ${chip.bg} ${chip.text} rounded-full text-sm ${chip.hover} transition-colors`.trim();
};
