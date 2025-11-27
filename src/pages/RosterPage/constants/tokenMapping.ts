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
      bg: "bg-[var(--color-jade-500)]",
      text: "text-white",
      border: "",
      hover: "hover:bg-[var(--color-jade-600)]",
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
      bg: "bg-[var(--color-bg-muted)]",
      text: "text-[var(--color-text-primary)]",
      border: "border-[var(--color-border-default)]",
      hover: "hover:bg-[var(--color-bg-surface-hover)]",
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
      bg: "bg-[var(--color-bg-muted)]",
      text: "text-[var(--color-text-muted)]",
      border: "border-[var(--color-border-default)]",
      hover: "hover:bg-[var(--color-bg-surface-hover)]",
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
      bg: "bg-[var(--color-bg-muted)]",
      text: "text-[var(--color-text-primary)]",
      hover: "hover:bg-[var(--color-bg-surface-hover)]",
    },
  },

  // Icon Colors
  icons: {
    // Primary icons (users icon)
    primary: "text-[var(--color-jade-500)]",

    // Success icons (check-circle for active players)
    success: "text-[var(--color-green-500)]",

    // Information icons (filter icon)
    information: "text-[var(--color-text-secondary)]",

    // Selected/Check icons
    selected: "text-[var(--color-jade-500)]",
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
  return `inline-flex items-center gap-xs px-sm py-xs ${chip.bg} ${chip.text} rounded-full text-sm ${chip.hover} transition-colors`.trim();
};
