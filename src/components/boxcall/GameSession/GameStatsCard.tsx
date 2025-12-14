/**
 * GameStatsCard - Overall game statistics
 */

/* eslint-disable boxcall-design/no-raw-tailwind-colors */

import React from "react";
import { Icon } from "../../ui/Icon/Icon";
import type { GameStatsCardProps } from "./types";

export const GameStatsCard: React.FC<GameStatsCardProps> = ({
  successRate,
  totalPlays,
  totalYards,
  totalTouchdowns,
  totalTurnovers,
}) => {
  return (
    <div className="rounded-3xl bg-white border border-emerald-100 p-6 shadow-xl shadow-emerald-500/10">
      <h3 className="text-primary font-bold text-lg mb-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md shadow-teal-500/25">
          <Icon name="bar-chart-2" size="sm" className="text-white" />
        </div>
        Game Stats
      </h3>

      {/* Success Rate - Large Display */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 mb-4 border border-emerald-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-emerald-700">
            Success Rate
          </span>
          <span className="text-3xl font-black text-emerald-600">
            {successRate.toFixed(0)}%
          </span>
        </div>
        <div className="mt-2 h-2 bg-emerald-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${successRate}%` }}
          />
        </div>
      </div>

      {/* Other Stats Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <span className="text-sm text-slate-600">Total Plays</span>
          <span className="font-bold text-slate-800">{totalPlays}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <span className="text-sm text-slate-600">Total Yards</span>
          <span className="font-bold text-blue-600">{totalYards}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <span className="text-sm text-slate-600">Touchdowns</span>
          <span className="font-bold text-emerald-600">{totalTouchdowns}</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-slate-600">Turnovers</span>
          <span className="font-bold text-rose-600">{totalTurnovers}</span>
        </div>
      </div>
    </div>
  );
};
