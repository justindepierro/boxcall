/**
 * GameSessionHeader - Top bar with title and controls
 */

/* eslint-disable boxcall-design/no-raw-tailwind-colors */

import React from 'react';
import { Typography } from '../../design-system';
import { Icon } from '../../ui/Icon/Icon';
import type { GameSessionHeaderProps } from './types';

export const GameSessionHeader: React.FC<GameSessionHeaderProps> = ({
  gamePlanName,
  mode,
  opponent,
  hasPendingSync,
  isPaused,
  isGoalLine,
  isRedZone,
  onBack,
  onPause,
  onResume,
  onEnd,
}) => {
  return (
    <div className="mb-6">
      {/* Top Bar with Back + Title + Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          >
            <Icon name="arrow-left" size="sm" className="text-slate-600" />
          </button>
          <div>
            <Typography
              variant="headline-lg"
              className="text-slate-800 font-bold"
            >
              {gamePlanName}
            </Typography>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm">
                {mode === 'live' ? '🔴 LIVE GAME' : '📝 RETROACTIVE'}
              </span>
              <Typography variant="body-sm" color="muted">
                vs {opponent}
              </Typography>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasPendingSync && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
              <Icon name="cloud-off" size="sm" />
              <Typography variant="body-xs" className="font-medium">
                Syncing...
              </Typography>
            </div>
          )}
          {isPaused ? (
            <button
              onClick={onResume}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
            >
              <Icon name="play" size="sm" />
              Resume
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-amber-300 text-amber-700 font-semibold hover:bg-amber-50 transition-colors"
            >
              <Icon name="pause" size="sm" />
              Pause
            </button>
          )}
          <button
            onClick={onEnd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-rose-300 text-rose-600 font-semibold hover:bg-rose-50 transition-colors"
          >
            <Icon name="power" size="sm" />
            End
          </button>
        </div>
      </div>

      {/* Field Zone Badge - Enhanced */}
      {(isGoalLine || isRedZone) && (
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm shadow-lg animate-pulse ${
            isGoalLine
              ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-rose-500/30'
              : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-amber-500/30'
          }`}
        >
          <Icon name="target" size="sm" />
          {isGoalLine ? '🎯 GOAL LINE SITUATION' : '🔥 RED ZONE'}
        </div>
      )}
    </div>
  );
};
