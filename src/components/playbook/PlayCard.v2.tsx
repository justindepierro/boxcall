import { memo, useState } from 'react';
import type { Play as PlayType } from '../../types/play';
import { Icon } from '../ui/Icon/Icon';

interface PlayCardProps {
  play: PlayType;
  showOneWordCalls?: boolean;
  onEdit?: (play: PlayType) => void;
  onDuplicate?: (play: PlayType) => void;
  onCreateDiagram?: (play: PlayType) => void;
  isSelected?: boolean;
  onSelectionChange?: (playId: string, selected: boolean) => void;
}

// Memoized to prevent unnecessary re-renders for fast performance
export const PlayCard = memo<PlayCardProps>(({
  play,
  showOneWordCalls = false,
  onEdit,
  onDuplicate,
  onCreateDiagram,
  isSelected = false,
  onSelectionChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Display name logic - fast inline computation
  const displayName = showOneWordCalls && play.one_word_play
    ? play.one_word_play.toUpperCase()
    : `${play.formation || ''} ${play.play_name || ''}`.trim();

  // Play type gradient classes - pre-computed for speed
  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'Pass':
        return 'bg-gradient-to-r from-electric-500 to-purple-500';
      case 'Run':
        return 'bg-gradient-to-r from-jade-500 to-emerald-500';
      case 'RPO':
        return 'bg-gradient-to-r from-navy-600 to-blue-600';
      case 'Play Action':
        return 'bg-gradient-to-r from-amber-500 to-orange-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500';
    }
  };

  // Confidence ring color - fast lookup
  const getConfidenceRing = (confidence: number) => {
    if (confidence >= 85) return 'text-jade-600';
    if (confidence >= 70) return 'text-emerald-500';
    if (confidence >= 60) return 'text-amber-500';
    if (confidence >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div
      className={`group relative backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-[28px] border-2 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] ${
        isSelected
          ? 'border-electric-500 ring-4 ring-electric-500/20 shadow-lg'
          : 'border-white/20 dark:border-slate-700/20 hover:border-white/40'
      }`}
    >
      {/* Gradient accent bar - Aurora style */}
      <div className={`absolute inset-x-0 top-0 h-1 rounded-t-[28px] ${getTypeStyle(play.p_type)}`} />

      <div className="p-4">
        {/* Header Row */}
        <div className="flex items-start gap-3 mb-3">
          {/* Selection Checkbox */}
          <label className="flex items-center justify-center w-5 h-5 mt-0.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelectionChange?.(play.id, e.target.checked)}
              className="w-4 h-4 rounded border-2 border-slate-300 text-electric-600 focus:ring-2 focus:ring-electric-500/20 focus:ring-offset-0 transition-all cursor-pointer"
            />
          </label>

          {/* Title & Badges */}
          <div className="flex-1 min-w-0">
            {/* Play Name */}
            <h3 className="font-mono font-bold text-lg text-slate-900 dark:text-white truncate mb-2">
              {displayName}
            </h3>

            {/* Compact Badge Row */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Play Type Pill - Gradient */}
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-white text-xs font-semibold shadow-sm ${getTypeStyle(play.p_type)}`}
              >
                {play.p_type}
              </span>

              {/* Formation Type */}
              {play.f_type && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                  {play.f_type}
                </span>
              )}

              {/* Confidence Ring */}
              <div className="relative inline-flex items-center">
                {/* SVG Ring */}
                <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
                  {/* Background ring */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    className="stroke-slate-200 dark:stroke-slate-700"
                    strokeWidth="3"
                  />
                  {/* Progress ring */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    className={getConfidenceRing(play.confidence_base)}
                    strokeWidth="3"
                    strokeDasharray={`${(play.confidence_base / 100) * 88} 88`}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Percentage text */}
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  {play.confidence_base}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons - Icon Capsules */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              <Icon
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                className="w-4 h-4 text-slate-600 dark:text-slate-400"
              />
            </button>

            <button
              onClick={() => onEdit?.(play)}
              className="w-9 h-9 rounded-full bg-electric-100 dark:bg-electric-900/30 hover:bg-electric-200 dark:hover:bg-electric-800/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label="Edit play"
            >
              <Icon name="edit" className="w-4 h-4 text-electric-600 dark:text-electric-400" />
            </button>

            <button
              onClick={() => onDuplicate?.(play)}
              className="w-9 h-9 rounded-full bg-jade-100 dark:bg-jade-900/30 hover:bg-jade-200 dark:hover:bg-jade-800/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label="Duplicate play"
            >
              <Icon name="copy" className="w-4 h-4 text-jade-600 dark:text-jade-400" />
            </button>

            <button
              onClick={() => onCreateDiagram?.(play)}
              className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label="Create diagram"
            >
              <Icon name="image" className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </button>
          </div>
        </div>

        {/* Diagram Preview - Only if exists */}
        {play.diagram_url && (
          <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 mb-3">
            <img
              src={play.diagram_url}
              alt={`${displayName} diagram`}
              className="w-full h-36 object-cover"
              loading="lazy"
              decoding="async"
            />
            {/* Overlay gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {play.personnel && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <Icon name="users" className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {play.personnel} Personnel
                  </span>
                </div>
              )}

              {play.p_dir && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <Icon name="arrow-right" className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {play.p_dir}
                  </span>
                </div>
              )}

              {play.protection && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <Icon name="shield" className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {play.protection}
                  </span>
                </div>
              )}

              {play.one_word_play && !showOneWordCalls && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-electric-50 dark:bg-electric-900/20">
                  <Icon name="zap" className="w-4 h-4 text-electric-500" />
                  <span className="text-sm font-bold text-electric-700 dark:text-electric-400">
                    {play.one_word_play.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            {(play.p_tag1 || play.p_tag2 || play.ftag1 || play.ftag2) && (
              <div className="flex flex-wrap gap-1.5">
                {[play.p_tag1, play.p_tag2, play.ftag1, play.ftag2]
                  .filter(Boolean)
                  .map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

PlayCard.displayName = 'PlayCard';
