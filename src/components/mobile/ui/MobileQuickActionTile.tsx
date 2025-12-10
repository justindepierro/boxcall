import React from "react";
import { Icon, type IconName } from "../../ui/Icon/Icon";
import { Typography } from "../../design-system/Typography";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";

interface MobileQuickActionTileProps {
  icon: IconName;
  title: string;
  subtitle?: string;
  stat?: string | number;
  color: "emerald" | "purple" | "blue" | "orange";
  onPress: () => void;
  disabled?: boolean;
}

/**
 * Mobile-optimized Quick Action Tile
 *
 * A compact, touch-friendly tile for primary actions on mobile.
 * Replaces the complex AuroraTile for mobile contexts.
 */
export const MobileQuickActionTile: React.FC<MobileQuickActionTileProps> = ({
  icon,
  title,
  subtitle,
  stat,
  color,
  onPress,
  disabled = false,
}) => {
  const handlePress = () => {
    if (disabled) return;
    triggerHapticFeedback("light");
    onPress();
  };

  const colorClasses = {
    emerald: {
      bg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      light: "bg-emerald-50 dark:bg-emerald-900/30",
      text: "text-emerald-700 dark:text-emerald-400",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-500 to-purple-600",
      light: "bg-purple-50 dark:bg-purple-900/30",
      text: "text-purple-700 dark:text-purple-400",
    },
    blue: {
      bg: "bg-gradient-to-br from-blue-500 to-blue-600",
      light: "bg-blue-50 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-400",
    },
    orange: {
      bg: "bg-gradient-to-br from-orange-500 to-orange-600",
      light: "bg-orange-50 dark:bg-orange-900/30",
      text: "text-orange-700 dark:text-orange-400",
    },
  };

  const colors = colorClasses[color];

  return (
    <button
      onClick={handlePress}
      disabled={disabled}
      className={`
        w-full flex items-center gap-3 p-4 
        bg-white dark:bg-neutral-900 
        rounded-xl border border-neutral-200 dark:border-neutral-700
        shadow-sm
        active:scale-[0.98] active:shadow-md
        transition-all duration-150
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}
      >
        <Icon name={icon} className="w-6 h-6 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 text-left min-w-0">
        <Typography variant="body-md" className="text-primary font-semibold">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body-sm" className="text-secondary truncate">
            {subtitle}
          </Typography>
        )}
      </div>

      {/* Stat Badge */}
      {stat !== undefined && (
        <div className={`px-3 py-1 rounded-full ${colors.light}`}>
          <Typography variant="body-sm" className={`font-bold ${colors.text}`}>
            {stat}
          </Typography>
        </div>
      )}

      {/* Chevron */}
      <Icon
        name="chevron-right"
        className="w-5 h-5 text-neutral-400 flex-shrink-0"
      />
    </button>
  );
};
