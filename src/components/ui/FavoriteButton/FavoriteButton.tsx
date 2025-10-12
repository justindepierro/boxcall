import React from "react";
import { motion } from "framer-motion";
import Icon from "../Icon/Icon";

export interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * FavoriteButton - A star button for marking items as favorites
 *
 * Features:
 * - Animated star icon with scale effect
 * - Filled state for favorited items
 * - Configurable sizes
 * - Optional label text
 * - Accessible with proper ARIA attributes
 * - Prevents event bubbling (stopPropagation)
 *
 * @example
 * ```tsx
 * <FavoriteButton
 *   isFavorite={true}
 *   onToggle={() => toggleFavorite(id)}
 *   size="md"
 * />
 * ```
 */
export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorite,
  onToggle,
  size = "md",
  showLabel = false,
  disabled = false,
  className = "",
}) => {
  const sizeConfig = {
    sm: {
      container: "w-8 h-8",
      icon: "w-4 h-4",
      text: "text-xs",
    },
    md: {
      container: "w-11 h-11",
      icon: "w-5 h-5",
      text: "text-sm",
    },
    lg: {
      container: "w-14 h-14",
      icon: "w-6 h-6",
      text: "text-base",
    },
  };

  const config = sizeConfig[size];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onToggle();
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`${config.container} rounded-full bg-white dark:bg-slate-900 border-2 dark:border-slate-600 shadow-lg flex items-center justify-center transition-colors ${
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:scale-110"
      } ${className}`}
      whileHover={disabled ? {} : { scale: 1.1 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFavorite}
    >
      <Icon
        name="star"
        className={`${config.icon} transition-colors ${
          isFavorite
            ? "text-warning-strong fill-warning-strong"
            : "text-slate-400 dark:text-slate-500"
        }`}
      />
      {showLabel && (
        <span className={`ml-2 ${config.text} font-medium`}>
          {isFavorite ? "Favorited" : "Favorite"}
        </span>
      )}
    </motion.button>
  );
};
