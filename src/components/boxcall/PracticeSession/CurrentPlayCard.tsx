/**
 * CurrentPlayCard Component
 *
 * Hero card displaying the current play being practiced with badges,
 * navigation, and progress bar
 *
 * NOTE: This component intentionally uses raw Tailwind colors for:
 * - Gradient effects (jade-*, emerald-*, purple-*, amber-*, slate-*)
 * - Visual polish (shadows, badges)
 */

/* eslint-disable boxcall-design/no-raw-tailwind-colors */

import React from "react";
import { Icon } from "../../ui/Icon/Icon";
import { PersonnelBadge } from "../../playbook/PersonnelBadge";
import { getDisplayName, getSubtitleText } from "../../../utils/playNameUtils";
import { MiniDiagram } from "../MiniDiagram";
import type { CurrentPlayCardProps } from "./types";
import type { Play } from "../../../types/play";
import { EditableSchemeBadge } from "../../ui/Badge";
import type { BadgeColorScheme } from "../../../types/badge";

// Hook deleted - using fallback type
const getPlayTypeBadgeScheme = (_overrides: unknown, _playType: string): BadgeColorScheme => "jade";

/**
 * Hero card for displaying current play details
 */
export const CurrentPlayCard: React.FC<CurrentPlayCardProps> = ({
  currentPlay,
  currentPlayIndex,
  totalPlays,
  playProgress,
  isPaused,
  isLastPlay,
  onPrevious,
  onNext,
}) => {
  // Hook deleted - using fallback
  const overrides = null;
  const setPlayTypeScheme = (_playType: string, _scheme: unknown) => Promise.resolve();

  if (!currentPlay || !currentPlay.play) {
    return null;
  }

  const play = currentPlay.play as Play;
  const displayName = getDisplayName(play, false);
  const subtitle = getSubtitleText(play, false);

  const playTypeScheme = getPlayTypeBadgeScheme(overrides, play.p_type);

  return (
    <>
      {/* ===== CURRENT PLAY HERO CARD ===== */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-jade-100 shadow-xl shadow-jade-500/10">
        {/* Decorative gradient top bar */}
        <div className="h-2 bg-gradient-to-r from-jade-500 via-emerald-400 to-jade-500" />

        {/* Header row with play number and navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-jade-50">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-jade-500 to-emerald-600 text-white font-black text-lg shadow-md shadow-jade-500/25">
              {currentPlayIndex + 1}
            </span>
            <div>
              <span className="text-secondary text-xs font-semibold uppercase tracking-wider">
                Current Play
              </span>
              <p className="text-primary font-medium text-sm">
                {currentPlayIndex + 1} of {totalPlays}
              </p>
            </div>
          </div>

          {/* Navigation arrows - Enhanced */}
          <div className="flex gap-2">
            <button
              onClick={onPrevious}
              disabled={currentPlayIndex === 0 || isPaused}
              className="group p-2.5 rounded-xl bg-surface-muted text-secondary hover:bg-jade-100 hover:text-jade-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              <Icon
                name="chevron-left"
                size="sm"
                className="group-hover:-translate-x-0.5 transition-transform"
              />
            </button>
            <button
              onClick={onNext}
              disabled={isLastPlay || isPaused}
              className="group p-2.5 rounded-xl bg-jade-500 text-white hover:bg-jade-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-jade-500/25"
            >
              <Icon
                name="chevron-right"
                size="sm"
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Play Type Badge + Personnel - Modern pills */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {play.p_type && (
              <EditableSchemeBadge
                label={play.p_type}
                scheme={playTypeScheme}
                size="lg"
                onChangeScheme={async (scheme) => {
                  if (!play.p_type) return;
                  await setPlayTypeScheme(play.p_type, scheme);
                }}
                ariaLabel={`Change ${play.p_type} badge color`}
              />
            )}
            {play.personnel && (
              <PersonnelBadge personnel={play.personnel} size="md" />
            )}
            {play.formation && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 border border-purple-200 rounded-full text-sm font-semibold shadow-sm">
                {play.formation}
              </span>
            )}
            {play.pref_hash && (
              <span className="px-2.5 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                {play.pref_hash}
              </span>
            )}
          </div>

          {/* Main Play Name - Extra Large & Bold with gradient underline */}
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-mono font-black text-primary leading-tight">
              {displayName}
            </h2>
            <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-jade-500 to-emerald-400" />
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-secondary text-base italic mt-3">{subtitle}</p>
          )}

          {/* Play Progress Bar - Enhanced */}
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-jade-50 to-emerald-50 border border-jade-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-jade-700 text-sm font-semibold flex items-center gap-2">
                <Icon name="target" size="sm" className="text-jade-500" />
                Play Progress
              </span>
              <span className="text-jade-700 text-lg font-black">
                {Math.round(playProgress)}%
              </span>
            </div>
            <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-emerald-500 via-jade-400 to-emerald-500 rounded-full h-3 transition-all duration-300 relative"
                style={{ width: `${playProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-transparent" />
              </div>
            </div>
          </div>

          {/* Coach Notes - Enhanced styling */}
          {currentPlay.notes && (
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 shadow-sm">
              <p className="text-amber-800 text-sm flex items-start gap-2">
                <span className="text-xl">📋</span>
                <span>
                  <strong className="block text-amber-900 mb-1">
                    Coach Notes
                  </strong>
                  {currentPlay.notes}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mini Diagram (if available) */}
      {play.diagram_data && (
        <div className="rounded-2xl bg-white border border-jade-100 p-5 shadow-md">
          <div className="flex items-center justify-center">
            <MiniDiagram
              players={
                Array.isArray(play.diagram_data) ? play.diagram_data : []
              }
            />
          </div>
        </div>
      )}
    </>
  );
};
