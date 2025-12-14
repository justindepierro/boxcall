/**
 * PlayBadges Component
 *
 * Displays phase label and one-word code badges.
 */

import React from 'react';
import { PlayBadgesProps } from './types';

export const PlayBadges: React.FC<PlayBadgesProps> = ({
  phaseLabel,
  oneWordPlay,
  showOneWordCalls,
}) => {
  const shouldShowOneWordBadge = oneWordPlay && !showOneWordCalls;

  if (!phaseLabel && !shouldShowOneWordBadge) return null;

  return (
    <div className="flex flex-wrap items-center gap-xs">
      {phaseLabel && (
        <span className="px-xs py-xs bg-warning-500 text-primary rounded-full text-2xs font-semibold uppercase border border-warning-600">
          {phaseLabel}
        </span>
      )}
      {shouldShowOneWordBadge && (
        <span className="px-xs py-xs bg-electric-100 text-electric-800 border border-electric-200 rounded-full text-xs font-medium">
          Code: {oneWordPlay?.toUpperCase()}
        </span>
      )}
    </div>
  );
};
