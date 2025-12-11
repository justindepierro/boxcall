import React from "react";
import { Typography } from "../../design-system/Typography";
import { Icon } from "../../ui/Icon";
import type { Play as PlayType } from "../../../types/play";
import { getDisplayName } from "../../../utils/playNameUtils";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";

interface MobilePlayCardProps {
  play: PlayType;
  onEdit?: (play: PlayType) => void;
  onMore?: (play: PlayType) => void;
  onClick?: (play: PlayType) => void;
  isSelected?: boolean;
  showOneWordCalls?: boolean;
}

/**
 * Mobile-optimized play card component - Redesigned for better UX
 *
 * Design specs (improved):
 * - Height: Auto with comfortable padding (min 100px)
 * - Touch target: Full width, easy to tap
 * - Thumbnail: 72x72px (larger for better visibility)
 * - Typography: Clear hierarchy with play name prominent
 * - Actions: Quick-tap icon buttons with 48px targets
 * - Visual: Card-based design with subtle shadows
 *
 * UX improvements:
 * - Better visual hierarchy (play name first)
 * - Larger, clearer badges for formation/personnel
 * - Play type shown as colored accent bar
 * - One-word call displayed prominently when enabled
 * - Improved touch feedback with haptics
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
    triggerHapticFeedback("light");
    onEdit?.(play);
  };

  const handleMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHapticFeedback("light");
    onMore?.(play);
  };

  const handleClick = () => {
    triggerHapticFeedback("light");
    onClick?.(play);
  };

  // Get play display name
  const displayName = getDisplayName(play, showOneWordCalls);

  // Format formation and personnel
  const formation = play.formation || "No Formation";
  const personnel = play.personnel || "11";

  // Play type accent color (left border indicator)
  const playTypeAccent: Record<string, string> = {
    Pass: "border-l-brand-jade",
    Run: "border-l-success-500",
    RPO: "border-l-warning-500",
    "Play Action": "border-l-info-500",
  };

  const accentClass = playTypeAccent[play.p_type] || "border-l-neutral-300";

  return (
    <div
      className={`
        relative
        flex items-stretch
        w-full
        bg-surface-card
        border border-border
        border-l-4
        ${accentClass}
        rounded-xl
        shadow-sm
        cursor-pointer
        transition-all duration-150
        active:scale-[0.98]
        active:shadow-md
        overflow-hidden
        ${isSelected ? "ring-2 ring-brand-jade ring-offset-2 shadow-md" : ""}
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
      {/* Play Thumbnail - Larger and more prominent */}
      <div className="w-20 h-20 flex-shrink-0 bg-muted flex items-center justify-center overflow-hidden">
        {play.diagram_url || (play as any).diagram_image_url ? (
          <img
            src={play.diagram_url || (play as any).diagram_image_url}
            alt={displayName}
            className="w-full h-full object-cover"
            // iOS Safari compatibility - DO NOT use loading="lazy" (breaks on iOS 12-14)
            // crossOrigin needed for CORS with Supabase storage
            crossOrigin="anonymous"
            decoding="async"
            referrerPolicy="no-referrer-when-downgrade"
            onError={(e) => {
              // Hide broken image and show fallback
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement?.classList.add("image-error");
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
            <Icon name="file" className="text-neutral-400" size="lg" />
          </div>
        )}
      </div>

      {/* Play Content */}
      <div className="flex-1 min-w-0 py-3 pr-2">
        {/* Play Name - Most prominent */}
        <Typography
          variant="body-lg"
          className="text-primary font-semibold leading-tight line-clamp-1 mb-1.5"
        >
          {displayName}
        </Typography>

        {/* One-word call - Show prominently when enabled */}
        {showOneWordCalls && play.one_word_play && (
          <div className="mb-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-brand-jade/10 px-2 py-0.5 text-sm font-bold text-brand-jade">
              <Icon name="zap" size="xs" />
              {play.one_word_play}
            </span>
          </div>
        )}

        {/* Formation & Personnel inline */}
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex min-w-0 max-w-[60%] items-center rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
            <span className="truncate">{formation}</span>
          </span>
          <span className="inline-flex min-w-0 max-w-[30%] items-center rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
            <span className="truncate">{personnel}</span>
          </span>
        </div>

        {/* Play Type - Subtle label */}
        {play.p_type && (
          <span className="text-xs text-secondary uppercase tracking-wide line-clamp-1">
            {play.p_type}
          </span>
        )}
      </div>

      {/* Quick Actions - Stacked vertically for easy thumb access */}
      <div className="flex flex-col items-center justify-center gap-1 px-2 py-2 border-l border-border">
        {/* Edit Button */}
        <button
          type="button"
          onClick={handleEdit}
          className="
            flex items-center justify-center
            w-11 h-11
            rounded-lg
            bg-transparent
            hover:bg-neutral-100
            active:bg-neutral-200
            active:scale-95
            transition-all duration-100
          "
          aria-label="Edit play"
        >
          <Icon name="edit" className="text-neutral-600" size="sm" />
        </button>

        {/* More Actions Button */}
        <button
          type="button"
          onClick={handleMore}
          className="
            flex items-center justify-center
            w-11 h-11
            rounded-lg
            bg-transparent
            hover:bg-neutral-100
            active:bg-neutral-200
            active:scale-95
            transition-all duration-100
          "
          aria-label="More actions"
        >
          <Icon name="grip-vertical" className="text-neutral-600" size="sm" />
        </button>
      </div>
    </div>
  );
};
