import { memo } from 'react';
import type { Play as PlayType } from '../../types/play';
import { Icon } from '../ui/Icon/Icon';

interface PlayCardAppIconProps {
  play: PlayType;
  showOneWordCalls?: boolean;
  onClick?: (play: PlayType) => void;
  isSelected?: boolean;
  onSelectionChange?: (playId: string, selected: boolean) => void;
}

/**
 * iPhone-style app icon for play cards
 * Compact 120x120px tile with centered icon and play name
 * Expands to full detail modal on click
 */
export const PlayCardAppIcon = memo<PlayCardAppIconProps>(({
  play,
  showOneWordCalls = false,
  onClick,
  isSelected = false,
  onSelectionChange,
}) => {
  // Display name logic
  const displayName = showOneWordCalls && play.one_word_play
    ? play.one_word_play.toUpperCase()
    : `${play.formation || ''} ${play.play_name || ''}`.trim();

  // Play type gradient classes
  const getTypeGradient = (type: string) => {
    switch (type) {
      case 'Pass':
        return 'from-electric-500 to-purple-500';
      case 'Run':
        return 'from-jade-500 to-emerald-500';
      case 'RPO':
        return 'from-navy-600 to-blue-600';
      case 'Play Action':
        return 'from-amber-500 to-orange-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  // Get icon for play type
  const getPlayIcon = (type: string): 'zap' | 'trending-up' | 'activity' | 'target' | 'circle' => {
    switch (type) {
      case 'Pass':
        return 'zap';
      case 'Run':
        return 'trending-up';
      case 'RPO':
        return 'activity'; // Changed from git-branch
      case 'Play Action':
        return 'target';
      default:
        return 'circle';
    }
  };

  // Confidence ring color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-jade-600';
    if (confidence >= 70) return 'text-emerald-500';
    if (confidence >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="relative group flex flex-col items-center">
      {/* Selection Checkbox - Top Left Corner */}
      {onSelectionChange && (
        <label 
          className="absolute -top-2 -left-2 z-10 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 shadow-lg flex items-center justify-center cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelectionChange(play.id, e.target.checked)}
            className="w-3.5 h-3.5 rounded-sm border-0 text-electric-600 focus:ring-2 focus:ring-electric-500/20 cursor-pointer"
          />
        </label>
      )}

      {/* App Icon Container */}
      <button
        onClick={() => onClick?.(play)}
        className={`relative w-[120px] h-[120px] rounded-[28px] bg-gradient-to-br ${getTypeGradient(play.p_type)} shadow-lg hover:shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95 ${
          isSelected ? 'ring-4 ring-electric-500/40' : ''
        }`}
      >
        {/* Shine overlay */}
        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50" />

        {/* Icon centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon 
            name={getPlayIcon(play.p_type)} 
            size="xl"
            className="w-16 h-16 text-white drop-shadow-lg"
          />
        </div>

        {/* Confidence Badge - Top Right */}
        <div className="absolute -top-1.5 -right-1.5 w-10 h-10 rounded-full bg-white dark:bg-slate-900 shadow-lg flex items-center justify-center">
          {/* SVG Ring */}
          <svg className="absolute w-10 h-10 -rotate-90" viewBox="0 0 40 40">
            {/* Background ring */}
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              className="stroke-slate-200 dark:stroke-slate-700"
              strokeWidth="3"
            />
            {/* Progress ring */}
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              className={getConfidenceColor(play.confidence_base)}
              strokeWidth="3"
              strokeDasharray={`${(play.confidence_base / 100) * 100.5} 100.5`}
              strokeLinecap="round"
            />
          </svg>
          {/* Percentage */}
          <span className="relative text-[11px] font-bold text-slate-700 dark:text-slate-300">
            {play.confidence_base}
          </span>
        </div>

        {/* Diagram indicator - Bottom Right */}
        {play.diagram_url && (
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-purple-500 shadow-md flex items-center justify-center">
            <Icon name="image" className="w-4 h-4 text-white" />
          </div>
        )}
      </button>

      {/* Play Name Label - Below Icon */}
      <div className="mt-2 w-[120px] text-center">
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate px-1">
          {displayName}
        </p>
        {/* One-word call badge (if different from display name) */}
        {showOneWordCalls && play.one_word_play && (
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate px-1 mt-0.5">
            {play.formation || play.p_type}
          </p>
        )}
        {!showOneWordCalls && play.one_word_play && (
          <p className="text-xs font-semibold text-electric-600 dark:text-electric-400 truncate px-1 mt-0.5">
            {play.one_word_play.toUpperCase()}
          </p>
        )}
      </div>
    </div>
  );
});

PlayCardAppIcon.displayName = 'PlayCardAppIcon';
