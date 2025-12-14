/**
 * DriveStatsCard - Current drive statistics
 */

/* eslint-disable boxcall-design/no-raw-tailwind-colors */

import React from "react";
import { Icon } from "../../ui/Icon/Icon";
import type { DriveStatsCardProps } from "./types";

export const DriveStatsCard: React.FC<DriveStatsCardProps> = ({
  plays,
  yards,
  touchdowns,
  turnovers,
}) => {
  return (
    <div className="rounded-3xl bg-white border border-emerald-100 p-6 shadow-xl shadow-emerald-500/10">
      <h3 className="text-primary font-bold text-lg mb-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/25">
          <Icon name="trending-up" size="sm" className="text-white" />
        </div>
        Current Drive
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 text-center border border-slate-200">
          <div className="text-3xl font-black text-slate-700">{plays}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">
            Plays
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 text-center border border-blue-200">
          <div className="text-3xl font-black text-blue-600">{yards}</div>
          <div className="text-xs font-medium text-blue-500 uppercase tracking-wide mt-1">
            Yards
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 text-center border border-emerald-200">
          <div className="text-3xl font-black text-emerald-600">
            {touchdowns}
          </div>
          <div className="text-xs font-medium text-emerald-500 uppercase tracking-wide mt-1">
            TDs
          </div>
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl p-4 text-center border border-rose-200">
          <div className="text-3xl font-black text-rose-600">{turnovers}</div>
          <div className="text-xs font-medium text-rose-500 uppercase tracking-wide mt-1">
            Turnovers
          </div>
        </div>
      </div>
    </div>
  );
};
