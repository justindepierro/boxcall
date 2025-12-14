/**
 * SessionStatsCard Component
 *
 * Card showing real-time session statistics
 *
 * NOTE: This component intentionally uses raw Tailwind colors for:
 * - Gradient effects (jade-*, emerald-*, slate-*)
 * - Visual polish (shadows)
 */

/* eslint-disable boxcall-design/no-raw-tailwind-colors */

import React from "react";
import { Icon } from "../../ui/Icon/Icon";
import type { SessionStatsCardProps } from "./types";

/**
 * Stats card displaying session progress and rep breakdown
 */
export const SessionStatsCard: React.FC<SessionStatsCardProps> = ({
  computedStats,
}) => (
  <div className="rounded-3xl bg-white border border-jade-100 p-6 shadow-xl shadow-jade-500/10 overflow-hidden relative">
    {/* Decorative gradient corner */}
    <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-jade-500/20 to-emerald-500/10 rounded-full blur-2xl" />

    <h3 className="text-primary font-bold text-lg mb-5 flex items-center gap-3 relative z-10">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-jade-500 to-emerald-600 flex items-center justify-center shadow-md shadow-jade-500/25">
        <Icon name="bar-chart-2" size="sm" className="text-white" />
      </div>
      Session Stats
    </h3>

    {/* Main Stats Grid - Enhanced */}
    <div className="grid grid-cols-2 gap-4 mb-5 relative z-10">
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 text-center border border-slate-200">
        <div className="text-3xl font-black text-primary">
          {computedStats.completedReps}
          <span className="text-lg text-secondary font-semibold">
            /{computedStats.totalReps}
          </span>
        </div>
        <div className="text-slate-500 text-xs uppercase tracking-wider mt-1 font-semibold">
          Total Reps
        </div>
      </div>
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 text-center border border-emerald-200">
        <div className="text-3xl font-black text-emerald-600">
          {computedStats.successRate.toFixed(0)}%
        </div>
        <div className="text-emerald-600/70 text-xs uppercase tracking-wider mt-1 font-semibold">
          Success Rate
        </div>
      </div>
    </div>

    {/* Detailed Breakdown - Modernized */}
    <div className="space-y-3 relative z-10">
      <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
        <span className="text-slate-600 text-sm flex items-center gap-3 font-medium">
          <span className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-sm"></span>
          Successful
        </span>
        <span className="text-emerald-600 font-black text-lg">
          {computedStats.successfulReps}
        </span>
      </div>
      <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 border border-red-100">
        <span className="text-slate-600 text-sm flex items-center gap-3 font-medium">
          <span className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-rose-500 shadow-sm"></span>
          Failed
        </span>
        <span className="text-red-600 font-black text-lg">
          {computedStats.failedReps}
        </span>
      </div>
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-200">
        <span className="text-slate-600 text-sm flex items-center gap-3 font-medium">
          <span className="w-3 h-3 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 shadow-sm"></span>
          Neutral
        </span>
        <span className="text-slate-600 font-black text-lg">
          {computedStats.neutralReps}
        </span>
      </div>
    </div>
  </div>
);
