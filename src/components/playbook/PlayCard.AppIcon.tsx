import { memo } from "react";
import type { Play as PlayType } from "../../types/play";
import { Icon } from "../ui/Icon/Icon";

interface PlayCardAppIconProps {
  play: PlayType;
  showOneWordCalls?: boolean;
  onClick?: (play: PlayType) => void;
  isSelected?: boolean;
  onSelectionChange?: (playId: string, selected: boolean) => void;
}

/**
 * iPhone-style app icon for play cards
 * Larger 140x140px tile with centered icon and play name
 * Better text handling with proper wrapping
 */
export const PlayCardAppIcon = memo<PlayCardAppIconProps>(
  ({
    play,
    showOneWordCalls = false,
    onClick,
    isSelected = false,
    onSelectionChange,
  }) => {
    // Display name logic
    const displayName =
      showOneWordCalls && play.one_word_play
        ? play.one_word_play.toUpperCase()
        : `${play.formation || ""} ${play.play_name || ""}`.trim();

    // Truncate long names for display
    const truncatedName =
      displayName.length > 20
        ? displayName.substring(0, 20) + "..."
        : displayName;

    // Play type gradient classes
    const getTypeGradient = (type: string) => {
      switch (type) {
        case "Pass":
          return "from-electric-500 to-purple-500";
        case "Run":
          return "from-jade-500 to-emerald-500";
        case "RPO":
          return "from-navy-600 to-blue-600";
        case "Play Action":
          return "from-amber-500 to-orange-500";
        default:
          return "from-gray-500 to-slate-500";
      }
    };

    // Get icon for play type
    const getPlayIcon = (
      type: string
    ): "zap" | "trending-up" | "activity" | "target" | "circle" => {
      switch (type) {
        case "Pass":
          return "zap";
        case "Run":
          return "trending-up";
        case "RPO":
          return "activity";
        case "Play Action":
          return "target";
        default:
          return "circle";
      }
    };

    // Confidence ring color
    const getConfidenceColor = (confidence: number) => {
      if (confidence >= 85) return "text-jade-600";
      if (confidence >= 70) return "text-emerald-500";
      if (confidence >= 60) return "text-amber-500";
      return "text-red-500";
    };

    return (
      <div className="relative flex flex-col items-center w-full max-w-[180px] mx-auto">
        {/* Selection Checkbox - Top Left Corner */}
        {onSelectionChange && (
          <label
            className="absolute top-0 left-0 z-10 w-7 h-7 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelectionChange(play.id, e.target.checked)}
              className="w-4 h-4 rounded border-0 text-electric-600 focus:ring-2 focus:ring-electric-500/20 cursor-pointer"
            />
          </label>
        )}

        {/* App Icon Container with gradient and shine effect */}
        <button
          onClick={() => onClick?.(play)}
          className={`relative w-[140px] h-[140px] rounded-[32px] bg-gradient-to-br ${getTypeGradient(play.p_type)} shadow-lg hover:shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 before:absolute before:inset-0 before:rounded-[32px] before:bg-gradient-to-tr before:from-transparent before:via-white/20 before:to-transparent before:opacity-50 before:pointer-events-none ${
            isSelected ? "ring-4 ring-electric-500/40" : ""
          }`}
          aria-label={`Open ${displayName}`}
        >
          {/* Icon centered - Dynamic sizing: ~57% of 140px container (80px) */}
          <Icon
            name={getPlayIcon(play.p_type)}
            className="absolute inset-0 m-auto w-[57%] h-[57%] text-white drop-shadow-lg"
            aria-hidden="true"
          />

          {/* Confidence Badge - Top Right - Larger */}
          <div className="absolute -top-2 -right-2 w-11 h-11 rounded-full bg-white dark:bg-slate-900 shadow-lg flex items-center justify-center border-2 border-white dark:border-slate-800">
            {/* SVG Ring */}
            <svg className="absolute w-11 h-11 -rotate-90" viewBox="0 0 44 44">
              {/* Background ring */}
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                className="stroke-slate-200 dark:stroke-slate-700"
                strokeWidth="3"
              />
              {/* Progress ring */}
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                className={getConfidenceColor(play.confidence_base)}
                strokeWidth="3"
                strokeDasharray={`${(play.confidence_base / 100) * 113} 113`}
                strokeLinecap="round"
              />
            </svg>
            {/* Percentage */}
            <span className="relative text-[10px] font-bold text-slate-700 dark:text-slate-300">
              {play.confidence_base}
            </span>
          </div>

          {/* Diagram indicator - Bottom Right */}
          {play.diagram_url && (
            <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-purple-500 shadow-md flex items-center justify-center border-2 border-white dark:border-slate-800">
              <Icon name="image" className="w-4 h-4 text-white" />
            </div>
          )}
        </button>

        {/* Play Name Label - Below Icon with better wrapping and spacing */}
        <div className="mt-3 w-full">
          <p
            className="text-sm font-bold text-slate-900 dark:text-white text-center leading-tight line-clamp-2"
            title={displayName}
          >
            {truncatedName}
          </p>

          {/* Subtitle - One-word call or play type */}
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1 truncate">
            {showOneWordCalls && play.one_word_play
              ? play.formation || play.p_type
              : play.one_word_play
                ? play.one_word_play.toUpperCase()
                : play.p_type}
          </p>
        </div>
      </div>
    );
  }
);

PlayCardAppIcon.displayName = "PlayCardAppIcon";
