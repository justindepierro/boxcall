import React from "react";
import { Typography } from "../../design-system/Typography";
import { Icon } from "../../ui/Icon";
import type { Play as PlayType } from "../../../types/play";
import { getDisplayName } from "../../../utils/playNameUtils";

interface MobilePlayCardProps {
  play: PlayType;
  onEdit?: (play: PlayType) => void;
  onMore?: (play: PlayType) => void;
  onClick?: (play: PlayType) => void;
  isSelected?: boolean;
  showOneWordCalls?: boolean;
}

/**
 * Mobile-optimized play card component
 * 
 * Design specs:
 * - Height: 88px (2.35x desktop cards)
 * - Touch target: Full width × 88px
 * - Thumbnail: 64x64px
 * - Typography: body-lg (18px) for play name
 * - Actions: Always visible, 44px touch targets
 * 
 * Usage:
 * - Wrap in SwipeActions for swipe gestures
 * - Use in single-column grid on mobile
 * - Larger spacing for comfortable thumb access
 */
export const MobilePlayCard: React.FC<MobilePlayCardProps> = ({
  play,
  onEdit,
  onMore,
  onClick,
  isSelected = false,
  showOneWordCalls = false,
}) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(play);
  };

  const handleMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMore?.(play);
  };

  const handleClick = () => {
    onClick?.(play);
  };

  // Get play display name
  const displayName = getDisplayName(play, showOneWordCalls);

  // Format formation and personnel
  const formation = play.formation || "No Formation";
  const personnel = play.personnel || "11 Personnel";
  const subtitle = `${formation} • ${personnel}`;

  // Play type badge color
  const playTypeColor = {
    Pass: "text-primary-500 bg-primary-50",
    Run: "text-success-500 bg-success-50",
    RPO: "text-warning-500 bg-warning-50",
    "Play Action": "text-info-500 bg-info-50",
  }[play.p_type] || "text-secondary bg-surface-secondary";

  return (
    <div
      className={`
        relative
        flex items-center gap-4
        h-22 w-full
        px-4 py-3
        bg-surface-primary
        border border-transparent
        rounded-lg
        cursor-pointer
        transition-all duration-200
        hover:border-primary-200
        hover:bg-surface-secondary
        active:scale-[0.98]
        ${isSelected ? "border-primary-500 bg-primary-50" : ""}
      `}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Play Thumbnail - 64x64px */}
      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-surface-muted">
        {play.diagram_url ? (
          <img
            src={play.diagram_url}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="file" className="text-muted" size="lg" />
          </div>
        )}
      </div>

      {/* Play Info */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Play Name */}
        <Typography
          variant="body-lg"
          className="text-primary truncate font-semibold"
        >
          {displayName}
        </Typography>

        {/* Formation & Personnel */}
        <Typography variant="body-sm" className="text-secondary truncate">
          {subtitle}
        </Typography>

        {/* Play Type Badge (Optional) */}
        {play.p_type && (
          <div className="flex items-center gap-2">
            <span
              className={`
                inline-flex items-center
                px-2 py-0.5
                text-xs font-medium
                rounded-md
                ${playTypeColor}
              `}
            >
              {play.p_type}
            </span>
          </div>
        )}
      </div>

      {/* Quick Actions - Always visible */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Edit Button - 44px touch target */}
        <button
          type="button"
          onClick={handleEdit}
          className="
            flex items-center justify-center
            w-11 h-11
            rounded-lg
            bg-surface-secondary
            hover:bg-surface-muted
            active:scale-95
            transition-all duration-150
          "
          aria-label="Edit play"
        >
          <Icon name="edit" className="text-primary" size="md" />
        </button>

        {/* More Actions Button - 44px touch target */}
        <button
          type="button"
          onClick={handleMore}
          className="
            flex items-center justify-center
            w-11 h-11
            rounded-lg
            bg-surface-secondary
            hover:bg-surface-muted
            active:scale-95
            transition-all duration-150
          "
          aria-label="More actions"
        >
          <Icon name="settings" className="text-primary" size="md" />
        </button>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-primary-500 rounded-lg pointer-events-none" />
      )}
    </div>
  );
};
