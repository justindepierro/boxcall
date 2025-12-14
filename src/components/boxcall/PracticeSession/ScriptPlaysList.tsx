/**
 * ScriptPlaysList Component
 *
 * Displays list of all plays in the practice script with completion status
 *
 * NOTE: This component intentionally uses raw Tailwind colors for:
 * - Gradient effects (jade-*, emerald-*, purple-*, slate-*)
 * - Visual polish (shadows)
 */

/* eslint-disable boxcall-design/no-raw-tailwind-colors */

import React from "react";
import { Icon } from "../../ui/Icon/Icon";
import { getDisplayName } from "../../../utils/playNameUtils";
import type { ScriptPlaysListProps } from "./types";
import type { Play } from "../../../types/play";

/**
 * List of all plays in the practice script
 */
export const ScriptPlaysList: React.FC<ScriptPlaysListProps> = ({
  scriptPlays,
  currentPlayIndex,
  isPaused,
}) => (
  <div className="rounded-3xl bg-white border border-jade-100 p-6 shadow-xl shadow-jade-500/10">
    <h3 className="text-primary font-bold text-lg mb-5 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-md shadow-purple-500/25">
        <Icon name="list" size="sm" className="text-white" />
      </div>
      Script Plays
    </h3>
    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
      {scriptPlays.map((scriptPlay, index) => {
        const isActive = index === currentPlayIndex;
        const isCompleted = index < currentPlayIndex;
        const displayName = scriptPlay.play
          ? getDisplayName(scriptPlay.play as Play, false)
          : "Unknown Play";

        return (
          <button
            key={scriptPlay.id}
            onClick={() => {
              // TODO: Implement direct play navigation
            }}
            disabled={isPaused}
            className={`
              w-full text-left p-3.5 rounded-2xl border-2 transition-all duration-200 group
              ${(() => {
                if (isActive)
                  return "bg-gradient-to-r from-jade-50 to-emerald-50 border-jade-400 shadow-md shadow-jade-500/15";
                if (isCompleted)
                  return "bg-gradient-to-r from-emerald-50/50 to-green-50/50 border-emerald-200";
                return "bg-white border-slate-200 hover:border-jade-300 hover:shadow-sm";
              })()}
              ${isPaused ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <div className="flex items-center gap-3">
              {/* Number indicator - Enhanced */}
              <span
                className={`
                w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm transition-all
                ${(() => {
                  if (isActive)
                    return "bg-gradient-to-br from-jade-500 to-emerald-600 text-white shadow-jade-500/30 scale-110";
                  if (isCompleted)
                    return "bg-gradient-to-br from-emerald-400 to-green-500 text-white";
                  return "bg-slate-100 text-slate-500 group-hover:bg-jade-100 group-hover:text-jade-600";
                })()}
              `}
              >
                {isCompleted ? "✓" : index + 1}
              </span>

              <div className="flex-1 min-w-0">
                <p
                  className={`font-mono font-bold text-sm truncate transition-colors ${(() => {
                    if (isActive) return "text-jade-700";
                    if (isCompleted) return "text-emerald-700";
                    return "text-primary group-hover:text-jade-600";
                  })()}`}
                >
                  {displayName}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {scriptPlay.repetitions || 10} reps
                </p>
              </div>

              {/* Active indicator */}
              {isActive && (
                <div className="w-2 h-2 rounded-full bg-jade-500 animate-pulse" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  </div>
);
