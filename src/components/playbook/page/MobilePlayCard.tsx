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
  // Play type badge color with improved contrast
  const playTypeColor =
    {
      Pass: "text-primary-700 bg-primary-100 border border-primary-200",
      Run: "text-success-700 bg-success-100 border border-success-200",
      RPO: "text-warning-700 bg-warning-100 border border-warning-200",
      "Play Action": "text-info-700 bg-info-100 border border-info-200",
    }[play.p_type] || "text-secondary bg-muted border border-border";

  return (
    <div
      className={`
        relative
        flex items-start gap-4
        w-full
        px-4 py-4
        bg-primary
        border border-transparent
        rounded-xl
        cursor-pointer
        transition-all duration-200
        hover:border-primary-200
        hover:bg-secondary/60
        hover:shadow-md
        active:scale-[0.98]
        min-h-28
        ${isSelected ? "border-primary-500 bg-primary-50/40 shadow-lg" : ""}
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
      {/* Play Thumbnail */}
      <div className="w-18 h-18 flex-shrink-0 rounded-xl overflow-hidden bg-muted shadow-inner">
        {(play.diagram_url || (play as any).diagram_image_url) ? (
          <img
            src={play.diagram_url || (play as any).diagram_image_url}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("[MobilePlayCard] Image load error:", {
                playId: play.id,
                playName: play.play_name,
                diagramUrl: play.diagram_url,
                fallbackUrl: (play as any).diagram_image_url,
                error: e.currentTarget.src,
              });
            }}
            onLoad={() => {
              console.log("[MobilePlayCard] Image loaded:", play.play_name, play.diagram_url);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="file" className="text-muted" size="lg" />
          </div>
        )}
      </div>

      {/* Play Info */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Play Name */}
        <Typography
          variant="body-lg"
          className="text-primary font-semibold leading-tight line-clamp-2"
        >
          {displayName}
        </Typography>

        {/* Formation & Personnel badges */}
        <div className="flex flex-wrap gap-2">
          {formation && (
            <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-secondary">
              {formation}
            </span>
          )}
          {personnel && (
            <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-secondary">
              {personnel}
            </span>
          )}
          {showOneWordCalls && play.one_word_play && (
            <span className="inline-flex items-center rounded-full bg-brand-jade/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-jade">
              {play.one_word_play}
            </span>
          )}
        </div>

        {/* Play Type Badge */}
        {play.p_type && (
          <div className="flex items-center gap-2">
            <span
              className={`
                inline-flex items-center
                px-2.5 py-1.5
                text-xs font-semibold uppercase tracking-wide
                rounded-full
                ${playTypeColor}
              `}
            >
              {play.p_type}
            </span>
          </div>
        )}
      </div>

      {/* Quick Actions - Always visible */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Edit Button */}
        <button
          type="button"
          onClick={handleEdit}
          className="
            flex items-center justify-center
            w-12 h-12
            rounded-xl
            bg-secondary/90
            hover:bg-muted
            active:scale-95
            transition-all duration-150
            "
          aria-label="Edit play"
        >
          <Icon name="edit" className="text-primary" size="md" />
        </button>

        {/* More Actions Button */}
        <button
          type="button"
          onClick={handleMore}
          className="
            flex items-center justify-center
            w-12 h-12
            rounded-xl
            bg-secondary/90
            hover:bg-muted
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
        <div className="absolute inset-0 border-2 border-primary-500 rounded-xl pointer-events-none" />
      )}
    </div>
  );
};
