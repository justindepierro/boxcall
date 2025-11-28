import React from "react";
import type { BadgeCustomization } from "../../types/personnel";
import { BADGE_COLOR_PRESETS, BADGE_FONT_OPTIONS } from "../../types/personnel";

interface PersonnelBadgeProps {
  personnel?: string | null;
  size?: "sm" | "md";
  className?: string;
  badgeCustomization?: BadgeCustomization;
}

/**
 * PersonnelBadge Component
 *
 * Displays personnel configuration name (e.g., "Spread", "Pro", "Jumbo")
 *
 * Features:
 * - Shows personnel grouping text
 * - Supports custom badge styling (solid, border, gradient, shiny)
 * - 12 color presets
 * - Font customization
 * - Compact, clean display
 * - Handles null/empty personnel gracefully
 *
 * @example
 * <PersonnelBadge personnel="Spread" />
 * <PersonnelBadge personnel="Pro" size="md" badgeCustomization={customization} />
 */
export const PersonnelBadge: React.FC<PersonnelBadgeProps> = ({
  personnel,
  size = "sm",
  className = "",
  badgeCustomization,
}) => {
  // Don't render if no personnel info
  if (!personnel || personnel.trim() === "") {
    return null;
  }

  // Default styling (electric blue)
  if (!badgeCustomization) {
    const sizeClasses = {
      sm: "text-xs px-2 py-0.5",
      md: "text-sm px-2.5 py-1",
    };

    return (
      <span
        className={`inline-flex items-center justify-center bg-electric-50 text-electric-700 dark:bg-electric-900/20 dark:text-electric-300 border border-electric-200 dark:border-electric-800 rounded-full font-medium ${sizeClasses[size]} ${className}`}
        title={`Personnel: ${personnel}`}
      >
        {personnel}
      </span>
    );
  }

  // Custom styling
  const preset = BADGE_COLOR_PRESETS.find(
    (p) => p.id === badgeCustomization.colorPresetId
  );
  const fontOption = BADGE_FONT_OPTIONS.find(
    (f) => f.id === (badgeCustomization.fontFamily || "default")
  );

  if (!preset) {
    // Fallback to default if preset not found
    return (
      <span
        className={`inline-flex items-center justify-center bg-electric-50 text-electric-700 dark:bg-electric-900/20 dark:text-electric-300 border border-electric-200 dark:border-electric-800 rounded-full font-medium ${className}`}
        title={`Personnel: ${personnel}`}
      >
        {personnel}
      </span>
    );
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };

  // Build style classes based on customization
  let styleClasses = "";
  let borderColorClass = "";

  switch (badgeCustomization.style) {
    case "solid":
      styleClasses = `${preset.background} ${preset.text}`;
      break;
    case "border":
      // Extract the color from border class for text (e.g., border-red-700 -> text-red-700)
      borderColorClass =
        preset.border?.replace("border-", "text-") || preset.text;
      styleClasses = `bg-transparent ${borderColorClass} border-2 ${preset.border}`;
      break;
    case "gradient":
      styleClasses = `bg-gradient-to-r ${preset.gradientFrom} ${preset.gradientTo} ${preset.text}`;
      break;
    case "shiny":
      // Metallic effect: gradient overlay, stronger shadow, and subtle shine
      styleClasses = `${preset.background} ${preset.text} shadow-lg shadow-${preset.background}/50 relative overflow-hidden`;
      break;
    default:
      styleClasses = `${preset.background} ${preset.text}`;
  }

  // Debug logging for badge rendering
  console.log('[PersonnelBadge Render]', {
    personnel,
    presetId: badgeCustomization.colorPresetId,
    presetName: preset.name,
    style: badgeCustomization.style,
    gradientFrom: preset.gradientFrom,
    gradientTo: preset.gradientTo,
    finalClasses: styleClasses,
  });

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-medium ${styleClasses} ${sizeClasses[size]} ${fontOption?.className || ""} ${className}`}
      title={`Personnel: ${personnel}`}
    >
      {badgeCustomization.style === "shiny" && (
        <span
          className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-full"
          style={{
            transform: "translateX(-50%) translateY(-50%) rotate(45deg)",
          }}
        />
      )}
      <span
        className={badgeCustomization.style === "shiny" ? "relative z-10" : ""}
      >
        {personnel}
      </span>
    </span>
  );
};

PersonnelBadge.displayName = "PersonnelBadge";
