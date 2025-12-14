/**
 * PracticeSessionHeader Component
 *
 * Top header with practice script name, mode badge, sync status, and controls
 *
 * NOTE: This component intentionally uses raw Tailwind colors for:
 * - Gradient effects (jade-*, emerald-*, amber-*)
 * - Visual polish (shadows, badges)
 */

/* eslint-disable boxcall-design/no-raw-tailwind-colors */

import React from "react";
import { Typography } from "../../design-system";
import { Button } from "../../ui";
import { Icon } from "../../ui/Icon/Icon";
import type { PracticeSessionHeaderProps } from "./types";

/**
 * Header component for active practice session
 */
export const PracticeSessionHeader: React.FC<PracticeSessionHeaderProps> = ({
  practiceScript,
  mode,
  hasPendingSync,
  isPaused,
  onPause,
  onResume,
  onEnd,
}) => (
  <div className="relative mb-8">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-jade-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-jade-500/25">
            <Icon name="clipboard" size="md" className="text-white" />
          </div>
          <div>
            <Typography
              variant="headline-lg"
              className="text-primary leading-tight"
            >
              {practiceScript.name}
            </Typography>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                  mode === "live"
                    ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                    : "bg-gradient-to-r from-amber-400 to-orange-400 text-white"
                }`}
              >
                {mode === "live" ? "● LIVE SESSION" : "◐ RETROACTIVE"}
              </span>
              {hasPendingSync && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                  <Icon name="cloud-off" size="xs" />
                  Syncing...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isPaused ? (
          <Button
            variant="primary"
            size="sm"
            onClick={onResume}
            className="shadow-lg shadow-jade-500/25"
          >
            <Icon name="play" size="sm" />
            Resume
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={onPause}>
            <Icon name="pause" size="sm" />
            Pause
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onEnd}
          className="text-error hover:bg-error/10"
        >
          <Icon name="x" size="sm" />
          End
        </Button>
      </div>
    </div>
  </div>
);
